import axios from 'axios';

export class ExchangeBase {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.fundingRates = new Map();
  }

  async fetchFundingRates() {
    throw new Error('Method not implemented');
  }

  normalizeSymbol(symbol) {
    // Базовая нормализация символа
    return symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  calculateAnnualizedRate(rate, intervalHours = 8) {
    return (1 + rate) ** (365 * 24 / intervalHours) - 1;
  }

  logError(error) {
    console.error(`[${this.name}] Error:`, error.message);
  }
}