import { ExchangeBase } from './base.js';
import axios from 'axios';

export class HyperliquidExchange extends ExchangeBase {
  constructor(config) {
    super('Hyperliquid', config);
  }

  async fetchFundingRates() {
    try {
      const response = await axios.post(`${this.config.apiBase}/info`, {
        type: 'perpFunding'
      });
      
      const rates = {};
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(item => {
          if (item.coin && item.fundingRate) {
            const symbol = this.normalizeSymbol(`${item.coin}USDT`);
            rates[symbol] = {
              rate: parseFloat(item.fundingRate),
              nextFundingTime: Date.now() + 3600000, // Hyperliquid funding каждый час
              annualizedRate: this.calculateAnnualizedRate(parseFloat(item.fundingRate), 1)
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