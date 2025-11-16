import { ExchangeBase } from './base.js';
import axios from 'axios';

export class KuCoinExchange extends ExchangeBase {
  constructor(config) {
    super('KuCoin', config);
    this.fundingIntervalHours = 8;
  }

  async fetchFundingRates() {
    try {
      // Упрощенный подход - используем базовый эндпоинт
      const response = await axios.get(`https://api-futures.kucoin.com/api/v1/contracts/active`);
      const rates = {};
      
      if (response.data && response.data.data) {
        response.data.data.forEach(contract => {
          if (contract.symbol && contract.symbol.includes('USDT')) {
            const symbol = this.normalizeSymbol(contract.symbol);
            // Используем predicted funding rate или fallback
            const rawRate = parseFloat(contract.fundingFeeRate) || 0.0001;
            const hourlyRate = this.calculateHourlyRate(rawRate);
            
            rates[symbol] = {
              rawRate: rawRate,
              rate: hourlyRate,
              intervalHours: this.fundingIntervalHours,
              nextFundingTime: Date.now() + 8 * 3600000,
              annualizedRate: this.calculateAnnualizedRate(rawRate)
            };
          }
        });
      }
      
      return rates;
    } catch (error) {
      console.error(`❌ KuCoin: ${error.message}`);
      return {};
    }
  }
}