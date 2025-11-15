export class FundingService {
  constructor(exchanges) {
    this.exchanges = exchanges;
    this.allFundingRates = new Map();
  }

  async updateAllFundingRates() {
    const updates = this.exchanges.map(async exchange => {
      if (exchange.config.enabled) {
        try {
          const rates = await exchange.fetchFundingRates();
          this.allFundingRates.set(exchange.name, rates);
          console.log(`✅ ${exchange.name}: loaded ${Object.keys(rates).length} rates`);
          return { exchange: exchange.name, rates };
        } catch (error) {
          console.error(`❌ ${exchange.name}: failed to load rates`, error.message);
          return null;
        }
      }
      return null;
    });

    const results = await Promise.allSettled(updates);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to update ${this.exchanges[index]?.name}:`, result.reason);
      }
    });

    return this.allFundingRates;
  }

  getCommonSymbols() {
    const symbolMap = new Map();
    
    this.allFundingRates.forEach((rates, exchangeName) => {
      Object.keys(rates).forEach(symbol => {
        if (!symbolMap.has(symbol)) {
          symbolMap.set(symbol, []);
        }
        symbolMap.get(symbol).push(exchangeName);
      });
    });

    // Фильтруем символы, которые есть минимум на 2 биржах
    return Array.from(symbolMap.entries())
      .filter(([_, exchanges]) => exchanges.length >= 2)
      .map(([symbol, exchanges]) => ({ symbol, exchanges }));
  }
}