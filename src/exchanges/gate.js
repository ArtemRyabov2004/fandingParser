import { ExchangeBase } from './base.js';
import axios from 'axios';

export class GateExchange extends ExchangeBase {
  constructor(config) {
    super('Gate.io', config);
  }

  async fetchFundingRates() {
    try {
      const response = await axios.get(`${this.config.apiBase}/api/v4/futures/usdt/contracts`);
      const rates = {};
      
      response.data.forEach(contract => {
        if (contract.name.includes('USDT')) {
          const symbol = this.normalizeSymbol(contract.name);
          rates[symbol] = {
            rate: parseFloat(contract.funding_rate),
            nextFundingTime: contract.funding_next_apply,
            annualizedRate: this.calculateAnnualizedRate(parseFloat(contract.funding_rate))
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