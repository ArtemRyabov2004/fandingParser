import { ExchangeBase } from './base.js';
import axios from 'axios';

export class MEXCExchange extends ExchangeBase {
  constructor(config) {
    super('MEXC', config);
    this.fundingIntervalHours = 8; // MEXC каждые 8 часов
  }

  async fetchFundingRates() {
    try {
      const rates = {};
      const symbols = await this.getSymbols();
      
      for (const symbol of symbols.slice(0, 20)) { // Увеличим лимит
        try {
          const symbolResponse = await axios.get(
            `${this.config.apiBase}/api/v1/contract/funding_rate/${symbol}`
          );
          
          if (symbolResponse.data && symbolResponse.data.data) {
            const data = symbolResponse.data.data;
            const normalizedSymbol = this.normalizeSymbol(symbol);
            const rawRate = parseFloat(data.fundingRate);
            const hourlyRate = this.calculateHourlyRate(rawRate);
            
            rates[normalizedSymbol] = {
              rawRate: rawRate,
              rate: hourlyRate,
              intervalHours: this.fundingIntervalHours,
              nextFundingTime: data.collectTime,
              annualizedRate: this.calculateAnnualizedRate(rawRate)
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
      return ['BTC_USDT', 'ETH_USDT', 'ADA_USDT', 'DOT_USDT', 'LINK_USDT', 'SOL_USDT', 'MATIC_USDT'];
    }
  }
}