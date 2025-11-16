import axios from 'axios';

export class ExchangeBase {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.fundingRates = new Map();
    this.fundingIntervalHours = 8; // По умолчанию 8 часов
  }

  async fetchFundingRates() {
    throw new Error('Method not implemented');
  }


  normalizeSymbol(symbol) {
    return symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  // Новая функция: конвертация ставки в часовую
  calculateHourlyRate(rate, intervalHours = null) {
    const interval = intervalHours || this.fundingIntervalHours;
    // Если ставка уже часовая - возвращаем как есть
    if (interval === 1) return rate;
    
    // Конвертируем ставку за N часов в часовую
    // Формула: (1 + rate)^(1/interval) - 1
    return Math.pow(1 + rate, 1/interval) - 1;
  }

  // Годовая ставка для информации
  calculateAnnualizedRate(rate, intervalHours = null) {
    const hourlyRate = this.calculateHourlyRate(rate, intervalHours);
    return Math.pow(1 + hourlyRate, 365 * 24) - 1;
  }

  logError(error) {
    console.error(`[${this.name}] Error:`, error.message);
  }
}