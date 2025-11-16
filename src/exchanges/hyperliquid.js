import { ExchangeBase } from './base.js';
import axios from 'axios';

export class HyperliquidExchange extends ExchangeBase {
    constructor(config) {
        super('Hyperliquid', config);
        this.fundingIntervalHours = 1;
    }

    async fetchFundingRates() {
        try {
            return await this.fetchFundingHistory();
        } catch (error) {
            console.error(`❌ Hyperliquid: ${error.message}`);
            return {};
        }
    }

    async fetchFundingHistory() {
        const coins = [
            'BTC', 'ETH', 'SOL', 'ARB', 'BNB', 'XRP', 'DOGE', 'MATIC', 'ADA', 'LTC',
            'AVAX', 'LINK', 'DOT', 'UNI', 'ATOM', 'OP', 'NEAR', 'FIL', 'APT', 'SUI'
        ];
        const rates = {};

        for (const coin of coins) {
            try {
                const response = await axios.post(`${this.config.apiBase}/info`, {
                    type: 'fundingHistory',
                    coin: coin,
                    startTime: Date.now() - 7200000 // 2 часа назад
                }, {
                    timeout: 2000
                });

                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const latest = response.data[response.data.length - 1];
                    const symbol = this.normalizeSymbol(`${coin}USDT`);
                    const rawRate = parseFloat(latest.fundingRate);
                    
                    // Проверяем, что ставка реалистичная
                    if (Math.abs(rawRate) < 0.01) { // Не больше 1%
                        rates[symbol] = {
                            rawRate: rawRate,
                            rate: rawRate,
                            intervalHours: this.fundingIntervalHours,
                            nextFundingTime: Date.now() + 3600000,
                            annualizedRate: this.calculateAnnualizedRate(rawRate, 1)
                        };
                    }
                }
            } catch (error) {
                // Пропускаем ошибки для отдельных монет
            }
        }
        
        console.log(`✅ Hyperliquid: загружено ${Object.keys(rates).length} ставок`);
        return rates;
    }

    normalizeSymbol(symbol) {
        return symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    }
}