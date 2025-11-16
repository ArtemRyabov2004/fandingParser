import { ExchangeBase } from './base.js';

export class LBankExchange extends ExchangeBase {
  constructor(config) {
    super('LBank', config);
  }

  async fetchFundingRates() {
    console.log('⚠️ LBank: временно отключен (сложный API)');
    return {};
  }
}