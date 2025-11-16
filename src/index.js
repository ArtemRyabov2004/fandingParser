import { BinanceExchange } from './exchanges/binance.js';
import { BybitExchange } from './exchanges/bybit.js';
import { MEXCExchange } from './exchanges/mexc.js';
import { GateExchange } from './exchanges/gate.js';
import { HyperliquidExchange } from './exchanges/hyperliquid.js';
import { KuCoinExchange } from './exchanges/kucoin.js';
import { BitgetExchange } from './exchanges/bitget.js';
import { FundingService } from './services/fundingService.js';
import { ArbitrageService } from './services/arbitrageService.js';
import { NotificationService } from './services/notificationService.js';
import { config } from './config.js';
import cron from 'node-cron';

class FundingRateMonitor {
  constructor() {
    this.exchanges = [];
    this.setupExchanges();
    
    if (this.exchanges.length === 0) {
      console.error('❌ No exchanges configured! Check your config.js');
      process.exit(1);
    }
    
    this.fundingService = new FundingService(this.exchanges);
    this.arbitrageService = new ArbitrageService(config.hourlyThreshold, config.minProfitThreshold);
    this.notificationService = new NotificationService();
  }

  setupExchanges() {
    try {
      const exchangeInstances = [
        { class: BinanceExchange, config: config.exchanges.binance, name: 'Binance' },
        { class: BybitExchange, config: config.exchanges.bybit, name: 'Bybit' },
        { class: MEXCExchange, config: config.exchanges.mexc, name: 'MEXC' },
        { class: GateExchange, config: config.exchanges.gate, name: 'Gate.io' },
        { class: HyperliquidExchange, config: config.exchanges.hyperliquid, name: 'Hyperliquid' },
        { class: KuCoinExchange, config: config.exchanges.kucoin, name: 'KuCoin' },
        { class: BitgetExchange, config: config.exchanges.bitget, name: 'Bitget' }
      ];

      this.exchanges = exchangeInstances
        .map(({ class: ExchangeClass, config: exchangeConfig, name }) => {
          if (!exchangeConfig) {
            console.error(`❌ Config missing for ${name}`);
            return null;
          }
          if (!exchangeConfig.enabled) {
            console.log(`⏭️ ${name} is disabled`);
            return null;
          }
          try {
            return new ExchangeClass(exchangeConfig);
          } catch (error) {
            console.error(`❌ Failed to create ${name}:`, error.message);
            return null;
          }
        })
        .filter(exchange => exchange !== null);

      console.log(`✅ Configured ${this.exchanges.length} exchanges`);
      
    } catch (error) {
      console.error('❌ Error setting up exchanges:', error);
      this.exchanges = [];
    }
  }

  async run() {
    console.log('🚀 Starting Funding Rate Monitor...');
    
    try {
      const fundingRates = await this.fundingService.updateAllFundingRates();
      
      if (fundingRates.size === 0) {
        console.log('⏳ No funding rates loaded');
        return;
      }

      const opportunities = this.arbitrageService.findArbitrageOpportunities(fundingRates);
      
      if (opportunities.length > 0) {
        await this.notificationService.sendNotification(
          `Found ${opportunities.length} arbitrage opportunities`,
          opportunities
        );
      } else {
        console.log('⏳ No arbitrage opportunities found');
      }
    } catch (error) {
      console.error('Monitor error:', error);
    }
  }

  start() {
    // Запускаем сразу
    this.run();
    
    // Затем по расписанию
    cron.schedule(`*/${config.updateInterval} * * * *`, () => {
      console.log('\n🔄 Scheduled update...');
      this.run();
    });

    console.log(`✅ Monitor started. Checking every ${config.updateInterval} seconds`);
  }
}

// Запуск приложения
const monitor = new FundingRateMonitor();
monitor.start();