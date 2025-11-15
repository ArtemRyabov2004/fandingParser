import { config } from '../config.js';

export class NotificationService {
  constructor() {
    this.telegramBot = null;
  }

  async sendNotification(message, opportunities = []) {
    if (config.notifications.console.enabled) {
      console.log('🔔 Funding Rate Arbitrage Alert:', message);
      
      if (opportunities.length === 0) {
        console.log('⏳ No opportunities found');
        return;
      }

      opportunities.forEach(opp => {
        console.log(`📊 ${opp.symbol}: ${opp.hourlyDiff} hourly difference`);
        
        opp.rates.forEach(r => {
          console.log(`   ${r.exchange}: ${r.hourlyRate} (raw: ${r.rawRate} per ${r.interval})`);
        });
        
        console.log(`   📈 Best LONG: ${opp.bestLong}`);
        console.log(`   📉 Best SHORT: ${opp.bestShort}`);
        console.log('   ─────────────────────────');
      });
    }

    if (config.notifications.telegram.enabled) {
      await this.sendTelegramNotification(message, opportunities);
    }
  }

  async sendTelegramNotification(message, opportunities) {
    console.log('📱 Telegram:', message);
  }
}