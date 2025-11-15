export class ArbitrageService {
  constructor(hourlyThreshold = 0.00004) {
    this.hourlyThreshold = hourlyThreshold;
  }

  findArbitrageOpportunities(fundingRates) {
    console.log('🔍 Analyzing arbitrage opportunities...');
    
    const opportunities = [];
    const commonSymbols = this.getCommonSymbols(fundingRates);

    commonSymbols.forEach(({ symbol, exchanges }) => {
      const rates = [];
      
      exchanges.forEach(exchangeName => {
        const exchangeRates = fundingRates.get(exchangeName);
        if (exchangeRates && exchangeRates[symbol]) {
          const data = exchangeRates[symbol];
          rates.push({
            exchange: exchangeName,
            rate: data.rate, // часовая ставка
            rawRate: data.rawRate,
            interval: data.intervalHours
          });
        }
      });

      if (rates.length >= 2) {
        rates.sort((a, b) => a.rate - b.rate);
        
        const minRate = rates[0].rate;
        const maxRate = rates[rates.length - 1].rate;
        const diff = maxRate - minRate;

        if (Math.abs(diff) >= this.hourlyThreshold) {
          // Форматируем данные для отображения
          const formattedRates = rates.map(r => ({
            exchange: r.exchange,
            hourlyRate: (r.rate * 100).toFixed(6) + '%',
            rawRate: (r.rawRate * 100).toFixed(6) + '%',
            interval: r.interval + 'h'
          }));

          opportunities.push({
            symbol: symbol,
            hourlyDiff: (diff * 100).toFixed(6) + '%',
            rates: formattedRates,
            bestLong: rates[0].exchange,
            bestShort: rates[rates.length - 1].exchange
          });
        }
      }
    });

    console.log(`🎯 Found ${opportunities.length} opportunities`);
    return opportunities;
  }

  getCommonSymbols(fundingRates) {
    const symbolMap = new Map();
    
    fundingRates.forEach((rates, exchangeName) => {
      Object.keys(rates).forEach(symbol => {
        if (!symbolMap.has(symbol)) {
          symbolMap.set(symbol, []);
        }
        symbolMap.get(symbol).push(exchangeName);
      });
    });

    return Array.from(symbolMap.entries())
      .filter(([_, exchanges]) => exchanges.length >= 2)
      .map(([symbol, exchanges]) => ({ symbol, exchanges }));
  }
}