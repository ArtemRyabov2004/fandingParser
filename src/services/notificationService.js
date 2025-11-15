import config from '../../index.js';

export class NotificationService {
  constructor() {
    this.telegramBot = null;
    if (config.notifications.telegram.enabled) {
      // Инициализация Telegram бота будет позже
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

    // Telegram уведомление (упрощенная версия)
    if (config.notifications.telegram.enabled) {
      await this.sendTelegramNotification(message, opportunities);
    }
  }

  async sendTelegramNotification(message, opportunities) {
    // Заглушка для Telegram - реализуем позже
    console.log('📱 Telegram notification would be sent:', message);
  }
}