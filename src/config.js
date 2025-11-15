import dotenv from 'dotenv';
dotenv.config();

export const config = {
  updateInterval: 60,
  threshold: 0.05,
  exchanges: {
    binance: {
      enabled: true,
      apiBase: 'https://fapi.binance.com'
    },
    bybit: {
      enabled: false,  // временно отключим
      apiBase: 'https://api.bybit.com'
    },
    mexc: {
      enabled: false,
      apiBase: 'https://contract.mexc.com'
    },
    gate: {
      enabled: false,
      apiBase: 'https://api.gateio.ws'
    },
    hyperliquid: {
      enabled: false,
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