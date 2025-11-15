import { ExchangeBase } from './base.js';
import axios from 'axios';

export class BinanceExchange extends ExchangeBase {
  constructor(config) {
    super('Binance', config);
  }

  async fetchFundingRates() {
    try {
      const response = await axios.get(`${this.config.apiBase}/fapi/v1/premiumIndex`);
      const rates = {};
      
      response.data.forEach(item => {
        if (item.symbol.includes('USDT')) {
          const symbol = this.normalizeSymbol(item.symbol);
          rates[symbol] = {
            rate: parseFloat(item.lastFundingRate),
            nextFundingTime: item.nextFundingTime,
            annualizedRate: this.calculateAnnualizedRate(parseFloat(item.lastFundingRate))
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