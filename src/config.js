import dotenv from 'dotenv';
dotenv.config();

export const config = {
  updateInterval: 300, // 5 минут для production
  threshold: 0.01, // 1% разница
  exchanges: {
    binance: {
      enabled: true,
      apiBase: 'https://fapi.binance.com'
    },
    bybit: {
      enabled: true,
      apiBase: 'https://api.bybit.com'
    },
    mexc: {
      enabled: true,
      apiBase: 'https://contract.mexc.com'
    },
    gate: {
      enabled: true,
      apiBase: 'https://api.gateio.ws'
    },
    hyperliquid: {
      enabled: true,
      apiBase: 'https://api.hyperliquid.xyz'
    }
  },
  notifications: {
    telegram: {
      enabled: process.env.TELEGRAM_BOT_TOKEN ? true : false,
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID
    },
    console: {
      enabled: true
    }
  }
};