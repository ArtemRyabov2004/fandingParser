export class FundingService {
  constructor(exchanges) {
    this.exchanges = exchanges;
    this.allFundingRates = new Map();
  }

  async updateAllFundingRates() {
    console.log('🔄 Updating funding rates from all exchanges...');
    
    const updates = this.exchanges.map(async exchange => {
      if (!exchange.config.enabled) {
        return null;
      }

      try {
        console.log(`📡 Fetching from ${exchange.name}...`);
        const startTime = Date.now();
        const rates = await exchange.fetchFundingRates();
        const loadTime = Date.now() - startTime;
        
        this.allFundingRates.set(exchange.name, rates);
        
        const rateCount = Object.keys(rates).length;
        if (rateCount > 0) {
          const sampleSymbol = Object.keys(rates)[0];
          console.log(`✅ ${exchange.name}: ${rateCount} rates (${loadTime}ms)`);
          console.log(`   📊 Sample: ${sampleSymbol} = ${(rates[sampleSymbol].rate * 100).toFixed(6)}%/hour`);
        } else {
          console.log(`⚠️ ${exchange.name}: no rates loaded`);
        }
        
        return { exchange: exchange.name, rates };
      } catch (error) {
        console.error(`❌ ${exchange.name}: ${error.message}`);
        return null;
      }
    });

    const results = await Promise.allSettled(updates);
    
    // Статистика
    let successCount = 0;
    let totalRates = 0;
    
    this.allFundingRates.forEach((rates, name) => {
      const count = Object.keys(rates).length;
      if (count > 0) {
        successCount++;
        totalRates += count;
      }
    });
    
    console.log(`📊 Итог: ${totalRates} ставок с ${successCount}/${this.exchanges.length} бирж`);
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
    // После загрузки всех ставок добавьте:
console.log('🔍 Анализ данных по биржам:');
this.allFundingRates.forEach((rates, exchangeName) => {
    const count = Object.keys(rates).length;
    if (count > 0) {
        const sampleSymbols = Object.keys(rates).slice(0, 3);
        console.log(`   ${exchangeName}: ${count} ставок, примеры: ${sampleSymbols.join(', ')}`);
    }
});

    return Array.from(symbolMap.entries())
      .filter(([_, exchanges]) => exchanges.length >= 2)
      .map(([symbol, exchanges]) => ({ symbol, exchanges }));

      
  }
}