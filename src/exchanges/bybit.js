import { ExchangeBase } from './base.js';
import axios from 'axios';

export class BybitExchange extends ExchangeBase {
  constructor(config) {
    super('Bybit', config);
    this.fundingIntervalHours = 8; // Bybit каждые 8 часов
  }

  async fetchFundingRates() {
    try {
      const response = await axios.get(`${this.config.apiBase}/v5/market/tickers`, {
        params: {
          category: 'linear'
        }
      });
      
      const rates = {};
      
      if (response.data && response.data.result && response.data.result.list) {
        response.data.result.list.forEach(item => {
          if (item.symbol && item.symbol.includes('USDT') && item.fundingRate) {
            const symbol = this.normalizeSymbol(item.symbol);
            const rawRate = parseFloat(item.fundingRate);
            const hourlyRate = this.calculateHourlyRate(rawRate);
            
            rates[symbol] = {
              rawRate: rawRate,
              rate: hourlyRate,
              intervalHours: this.fundingIntervalHours,
              nextFundingTime: parseInt(item.nextFundingTime),
              annualizedRate: this.calculateAnnualizedRate(rawRate)
            };
          }
        });
      }
      
      this.fundingRates = new Map(Object.entries(rates));
      return rates;
    } catch (error) {
      this.logError(error);
      return {};
    }
  }
}