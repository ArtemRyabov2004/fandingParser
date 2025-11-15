import { ExchangeBase } from './base.js';
import axios from 'axios';

export class MEXCExchange extends ExchangeBase {
  constructor(config) {
    super('MEXC', config);
  }

  async fetchFundingRates() {
    try {
      const response = await axios.get(`${this.config.apiBase}/api/v1/contract/funding_rate/BTC_USDT`);
      const rates = {};
      
      // MEXC API может возвращать один символ, нужно получить все
      const allSymbols = await this.getAllSymbols();
      
      for (const symbol of allSymbols) {
        try {
          const symbolResponse = await axios.get(
            `${this.config.apiBase}/api/v1/contract/funding_rate/${symbol}`
          );
          const data = symbolResponse.data;
          
          if (data && data.fundingRate) {
            const normalizedSymbol = this.normalizeSymbol(symbol);
            rates[normalizedSymbol] = {
              rate: parseFloat(data.fundingRate),
              nextFundingTime: data.fundingTime,
              annualizedRate: this.calculateAnnualizedRate(parseFloat(data.fundingRate))
            };
          }
        } catch (error) {
          console.log(`MEXC: Error fetching ${symbol}`, error.message);
        }
      }
      
      this.fundingRates = new Map(Object.entries(rates));
      return rates;
    } catch (error) {
      this.logError(error);
      return {};
    }
  }

  async getAllSymbols() {
    try {
      const response = await axios.get(`${this.config.apiBase}/api/v1/contract/detail`);
      return response.data.data
        .filter(contract => contract.symbol.includes('USDT'))
        .map(contract => contract.symbol);
    } catch (error) {
      return ['BTC_USDT', 'ETH_USDT']; // Fallback
    }
  }
}