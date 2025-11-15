export class FundingService {
  constructor(exchanges) {
    this.exchanges = exchanges;
    this.allFundingRates = new Map();
  }

  async updateAllFundingRates() {
    console.log('🔄 Updating funding rates from all exchanges...');
    
    const updates = this.exchanges.map(async exchange => {
      if (exchange.config.enabled) {
        try {
          console.log(`📡 Fetching from ${exchange.name}...`);
          const rates = await exchange.fetchFundingRates();
          this.allFundingRates.set(exchange.name, rates);
          console.log(`✅ ${exchange.name}: loaded ${Object.keys(rates).length} rates`);
          return { exchange: exchange.name, rates };
        } catch (error) {
          console.error(`❌ ${exchange.name}: failed to load rates - ${error.message}`);
          return null;
        }
      }
      return null;
    });

    const results = await Promise.allSettled(updates);
    
    // Логируем результаты
    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successCount++;
      }
    });
    
    console.log(`🎯 Successfully updated ${successCount}/${this.exchanges.length} exchanges`);
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

    const commonSymbols = Array.from(symbolMap.entries())
      .filter(([_, exchanges]) => exchanges.length >= 2)
      .map(([symbol, exchanges]) => ({ symbol, exchanges }));

    console.log(`🔗 Found ${commonSymbols.length} common symbols across exchanges`);
    return commonSymbols;
  }
}