import { ExchangeBase } from './base.js';
import axios from 'axios';

export class GateExchange extends ExchangeBase {
  constructor(config) {
    super('Gate.io', config);
    this.fundingIntervalHours = 8; // Gate.io каждые 8 часов
  }

  async fetchFundingRates() {
    try {
      const response = await axios.get(`${this.config.apiBase}/api/v4/futures/usdt/contracts`);
      const rates = {};
      
      response.data.forEach(contract => {
        if (contract.name && contract.name.includes('USDT') && contract.funding_rate) {
          const symbol = this.normalizeSymbol(contract.name);
          const rawRate = parseFloat(contract.funding_rate);
          const hourlyRate = this.calculateHourlyRate(rawRate);
          
          rates[symbol] = {
            rawRate: rawRate,
            rate: hourlyRate,
            intervalHours: this.fundingIntervalHours,
            nextFundingTime: Math.floor(Date.now() / 1000) + 8 * 3600,
            annualizedRate: this.calculateAnnualizedRate(rawRate)
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