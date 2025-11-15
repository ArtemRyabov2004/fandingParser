import { ExchangeBase } from './base.js';
import axios from 'axios';

export class BinanceExchange extends ExchangeBase {
  constructor(config) {
    super('Binance', config);
    this.fundingIntervalHours = 8; // Binance каждые 8 часов
  }

  async fetchFundingRates() {
    try {
      const response = await axios.get(`${this.config.apiBase}/fapi/v1/premiumIndex`);
      const rates = {};
      
      response.data.forEach(item => {
        if (item.symbol.includes('USDT')) {
          const symbol = this.normalizeSymbol(item.symbol);
          const rawRate = parseFloat(item.lastFundingRate);
          const hourlyRate = this.calculateHourlyRate(rawRate);
          
          rates[symbol] = {
            rawRate: rawRate, // оригинальная ставка
            rate: hourlyRate, // нормализованная часовая ставка
            intervalHours: this.fundingIntervalHours,
            nextFundingTime: item.nextFundingTime,
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