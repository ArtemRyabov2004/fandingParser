import { config } from '../config.js';  // ✅ правильный импорт

export class NotificationService {
  constructor() {
    this.telegramBot = null;
    if (config.notifications.telegram.enabled) {
      console.log('Telegram notifications enabled');
    }
  }

  async sendNotification(message, opportunities = []) {
    // Консольное уведомление
    if (config.notifications.console.enabled) {
      console.log('🔔 Funding Rate Arbitrage Alert:', message);
      opportunities.forEach(opp => {
        console.log(`📊 ${opp.symbol}: ${opp.diffPercentage}% difference`);
        opp.rates.forEach(r => {
          console.log(`   ${r.exchange}: ${r.rate}% (${r.annualized}% annualized)`);
        });
      });
    }

    // Telegram уведомление
    if (config.notifications.telegram.enabled) {
      await this.sendTelegramNotification(message, opportunities);
    }
  }

  async sendTelegramNotification(message, opportunities) {
    console.log('📱 Telegram notification would be sent:', message);
  }
}