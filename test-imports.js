console.log('Testing imports...');

try {
  const { BinanceExchange } = await import('./src/exchanges/binance.js');
  console.log('✅ BinanceExchange import successful');
} catch (e) {
  console.log('❌ BinanceExchange import failed:', e.message);
}

try {
  const { BybitExchange } = await import('./src/exchanges/bybit.js');
  console.log('✅ BybitExchange import successful');
} catch (e) {
  console.log('❌ BybitExchange import failed:', e.message);
}

try {
  const { FundingService } = await import('./src/services/fundingService.js');
  console.log('✅ FundingService import successful');
} catch (e) {
  console.log('❌ FundingService import failed:', e.message);
}