import { ExchangeBase } from './base.js';
import axios from 'axios';

export class BybitExchange extends ExchangeBase {
  constructor(config) {
    super('Bybit', config);
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
            rates[symbol] = {
              rate: parseFloat(item.fundingRate),
              nextFundingTime: parseInt(item.nextFundingTime),
              annualizedRate: this.calculateAnnualizedRate(parseFloat(item.fundingRate))
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