export class ArbitrageService {
  constructor(threshold = 0.05) {
    this.threshold = threshold;
  }

  findArbitrageOpportunities(fundingRates) {
    const opportunities = [];
    const commonSymbols = this.getCommonSymbols(fundingRates);

    commonSymbols.forEach(({ symbol, exchanges }) => {
      const rates = [];
      
      exchanges.forEach(exchangeName => {
        const exchangeRates = fundingRates.get(exchangeName);
        if (exchangeRates && exchangeRates[symbol]) {
          rates.push({
            exchange: exchangeName,
            rate: exchangeRates[symbol].rate,
            annualized: exchangeRates[symbol].annualizedRate
          });
        }
      });

      if (rates.length >= 2) {
        rates.sort((a, b) => a.rate - b.rate);
        
        const maxDiff = rates[rates.length - 1].rate - rates[0].rate;
        const diffPercentage = (maxDiff / Math.abs(rates[0].rate)) * 100;

        if (Math.abs(diffPercentage) >= this.threshold) {
          opportunities.push({
            symbol,
            diffPercentage: parseFloat(diffPercentage.toFixed(4)),
            rates: rates.map(r => ({
              exchange: r.exchange,
              rate: parseFloat((r.rate * 100).toFixed(6)),
              annualized: parseFloat((r.annualized * 100).toFixed(4))
            })),
            bestLong: rates[0], // Самая низкая ставка - лучше для long
            bestShort: rates[rates.length - 1] // Самая высокая ставка - лучше для short
          });
        }
      }
    });

    return opportunities.sort((a, b) => Math.abs(b.diffPercentage) - Math.abs(a.diffPercentage));
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