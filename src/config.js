import dotenv from 'dotenv';
dotenv.config();

export const config = {
  updateInterval: 300,
  hourlyThreshold: 0.000005, // Уменьшили до 0.0005% разницы
  minProfitThreshold: 0.00002, // Уменьшили до 0.002% прибыли
  
  exchanges: {
    binance: { enabled: true, apiBase: 'https://fapi.binance.com' },
    bybit: { enabled: true, apiBase: 'https://api.bybit.com' },
    mexc: { enabled: true, apiBase: 'https://contract.mexc.com' },
    gate: { enabled: true, apiBase: 'https://api.gateio.ws' },
    hyperliquid: { enabled: true, apiBase: 'https://api.hyperliquid.xyz' },
    kucoin: { enabled: true, apiBase: 'https://api-futures.kucoin.com' },
    bitget: { enabled: false, apiBase: 'https://api.bitget.com' }
  },
  
  notifications: {
    telegram: {
      enabled: process.env.TELEGRAM_BOT_TOKEN ? true : false,
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID
    },
    console: { enabled: true }
  }
};