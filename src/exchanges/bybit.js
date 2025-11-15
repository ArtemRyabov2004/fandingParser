import { ExchangeBase } from './base.js';
import axios from 'axios';

export class BybitExchange extends ExchangeBase {
  constructor(config) {
    super('Bybit', config);
  }

  async fetchFundingRates() {
    try {
      const response = await axios.get(`${this.config.apiBase}/v2/public/tickers`);
      const rates = {};
      
      response.data.result.forEach(item => {
        if (item.symbol.includes('USDT') && item.funding_rate) {
          const symbol = this.normalizeSymbol(item.symbol);
          rates[symbol] = {
            rate: parseFloat(item.funding_rate),
            nextFundingTime: item.next_funding_time,
            annualizedRate: this.calculateAnnualizedRate(parseFloat(item.funding_rate))
          };
        }
      });
      
      this.fundingRates = new Map(Object.entries(rates));
      return rates;
    } catch (error) {
      this.logError(error);
      return {};
    }
  }
}