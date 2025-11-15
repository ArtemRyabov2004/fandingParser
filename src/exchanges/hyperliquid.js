import { ExchangeBase } from './base.js';
import axios from 'axios';

export class HyperliquidExchange extends ExchangeBase {
  constructor(config) {
    super('Hyperliquid', config);
    this.fundingIntervalHours = 1;
  }

  async fetchFundingRates() {
    try {
      // Упрощенная версия - возвращаем тестовые данные
      const rates = {};
      const testSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ARBUSDT', 'BNBUSDT'];
      
      testSymbols.forEach(symbol => {
        // Тестовые данные - Hyperliquid обычно имеет низкие ставки
        const rawRate = 0.0001; // 0.01%
        const hourlyRate = this.calculateHourlyRate(rawRate, 1);
        
        rates[symbol] = {
          rawRate: rawRate,
          rate: hourlyRate,
          intervalHours: this.fundingIntervalHours,
          nextFundingTime: Date.now() + 3600000,
          annualizedRate: this.calculateAnnualizedRate(rawRate, 1)
        };
      });
      
      this.fundingRates = new Map(Object.entries(rates));
      console.log(`✅ Hyperliquid: loaded ${Object.keys(rates).length} test rates`);
      return rates;
    } catch (error) {
      console.error(`❌ Hyperliquid error:`, error.message);
      return {};
    }
  }
}