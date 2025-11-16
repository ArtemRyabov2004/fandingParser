export class ArbitrageService {
  constructor(hourlyThreshold = 0.000005, minProfitThreshold = 0.00002) {
    this.hourlyThreshold = hourlyThreshold;
    this.minProfitThreshold = minProfitThreshold;
  }

  findArbitrageOpportunities(fundingRates) {
    console.log(`🔍 Ищем арбитраж (мин: ${(this.hourlyThreshold * 100).toFixed(4)}% разница, ${(this.minProfitThreshold * 100).toFixed(4)}% прибыль)...`);
    
    const opportunities = [];
    const commonSymbols = this.getCommonSymbols(fundingRates);

    console.log(`📊 Проверяем ${commonSymbols.length} общих символов...`);

    commonSymbols.forEach(({ symbol, exchanges }) => {
      const rates = [];
      
      exchanges.forEach(exchangeName => {
        const exchangeRates = fundingRates.get(exchangeName);
        if (exchangeRates && exchangeRates[symbol]) {
          const data = exchangeRates[symbol];
          rates.push({
            exchange: exchangeName,
            rate: data.rate,
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

        // Упрощенная проверка - только базовая фильтрация
        const tradingFees = 0.0004; // 0.04% комиссии
        const netProfit = Math.abs(diff) - tradingFees;

        // Основные проверки (убрали сложные фильтры)
        if (Math.abs(diff) >= this.hourlyThreshold && 
            netProfit >= this.minProfitThreshold) {
          
          const formattedRates = rates.map(r => ({
            exchange: r.exchange,
            hourlyRate: (r.rate * 100).toFixed(6) + '%',
            rawRate: (r.rawRate * 100).toFixed(6) + '%',
            interval: r.interval + 'h'
          }));

          opportunities.push({
    symbol: symbol,
    hourlyDiff: (diff * 100).toFixed(6) + '%',
    netProfit: (netProfit * 100).toFixed(6) + '%',
    rates: formattedRates,
    bestLong: rates[0].exchange,    // Только имя биржи
    bestShort: rates[rates.length - 1].exchange, // Только имя биржи
    score: netProfit
});
        }
      }
    });

    // Сортируем по прибыльности и берем топ-15
    opportunities.sort((a, b) => parseFloat(b.netProfit) - parseFloat(a.netProfit));
    const topOpportunities = opportunities.slice(0, 15);
    
    console.log(`🎯 Найдено ${opportunities.length} возможностей, показываем топ ${topOpportunities.length}`);
    
    if (topOpportunities.length > 0) {
      console.log(`🏆 Лучшая возможность: ${topOpportunities[0].symbol} - ${topOpportunities[0].netProfit} чистой прибыли/час`);
    } else {
      console.log('❌ Возможности не найдены. Возможно:');
      console.log('   - Слишком высокие пороги фильтрации');
      console.log('   - Нет общих символов между биржами');
      console.log('   - Рынок в состоянии равновесия');
    }
    
    return topOpportunities;
  }

  getCommonSymbols(fundingRates) {
    const symbolMap = new Map();
    
    fundingRates.forEach((rates, exchangeName) => {
      if (rates && typeof rates === 'object') {
        Object.keys(rates).forEach(symbol => {
          if (!symbolMap.has(symbol)) {
            symbolMap.set(symbol, []);
          }
          symbolMap.get(symbol).push(exchangeName);
        });
      }
    });

    return Array.from(symbolMap.entries())
      .filter(([_, exchanges]) => exchanges.length >= 2)
      .map(([symbol, exchanges]) => ({ symbol, exchanges }));
  }
}