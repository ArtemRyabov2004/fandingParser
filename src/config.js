import dotenv from 'dotenv';
dotenv.config();

export const config = {
  updateInterval: 300,
  hourlyThreshold: 0.00004, // 0.004% в час
  exchanges: {
    binance: { enabled: true, apiBase: 'https://fapi.binance.com' },
    bybit: { enabled: true, apiBase: 'https://api.bybit.com' },
    mexc: { enabled: true, apiBase: 'https://contract.mexc.com' },
    gate: { enabled: true, apiBase: 'https://api.gateio.ws' },
    hyperliquid: { enabled: true, apiBase: 'https://api.hyperliquid.xyz' }
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