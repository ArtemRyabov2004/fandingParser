import { BinanceExchange } from './exchanges/binance.js';
import { BybitExchange } from './exchanges/bybit.js';
import { MEXCExchange } from './src/exchanges/mexc.js';
import { GateExchange } from './src/exchanges/gate.js';
import { HyperliquidExchange } from './src/exchanges/hyperliquid.js';
import { FundingService } from './services/fundingService.js';
import { ArbitrageService } from './src/services/arbitrageService.js';
import { NotificationService } from './src/services/notificationService.js';
import config from './index.js';
import cron from 'node-cron';

class FundingRateMonitor {
  constructor() {
    this.setupExchanges();
    this.fundingService = new FundingService(this.exchanges);
    this.arbitrageService = new ArbitrageService(config.threshold);
    this.notificationService = new NotificationService();
  }

  setupExchanges() {
    this.exchanges = [
      new BinanceExchange(config.exchanges.binance),
      new BybitExchange(config.exchanges.bybit),
      new MEXCExchange(config.exchanges.mexc),
      new GateExchange(config.exchanges.gate),
      new HyperliquidExchange(config.exchanges.hyperliquid),
    ].filter(exchange => exchange.config.enabled);
  }

  async run() {
    console.log('🚀 Starting Funding Rate Monitor...');
    
    try {
      const fundingRates = await this.fundingService.updateAllFundingRates();
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
      this.run();
    });

    console.log(`✅ Monitor started. Checking every ${config.updateInterval} seconds`);
  }
}

// Запуск приложения
const monitor = new FundingRateMonitor();
monitor.start();