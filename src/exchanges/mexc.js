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
      
      // Для MEXC получаем список всех символов
      const symbols = await this.getSymbols();
      
      for (const symbol of symbols.slice(0, 10)) { // Ограничим для теста
        try {
          const symbolResponse = await axios.get(
            `${this.config.apiBase}/api/v1/contract/funding_rate/${symbol}`
          );
          
          if (symbolResponse.data && symbolResponse.data.data) {
            const data = symbolResponse.data.data;
            const normalizedSymbol = this.normalizeSymbol(symbol);
            rates[normalizedSymbol] = {
              rate: parseFloat(data.fundingRate),
              nextFundingTime: data.collectTime,
              annualizedRate: this.calculateAnnualizedRate(parseFloat(data.fundingRate))
            };
          }
        } catch (error) {
          // Пропускаем ошибки для отдельных символов
        }
      }
      
      this.fundingRates = new Map(Object.entries(rates));
      return rates;
    } catch (error) {
      this.logError(error);
      return {};
    }
  }

  async getSymbols() {
    try {
      const response = await axios.get(`${this.config.apiBase}/api/v1/contract/detail`);
      return response.data.data
        .filter(contract => contract.symbol.endsWith('USDT'))
        .map(contract => contract.symbol);
    } catch (error) {
      // Fallback symbols
      return ['BTC_USDT', 'ETH_USDT', 'ADA_USDT', 'DOT_USDT', 'LINK_USDT'];
    }
  }
}