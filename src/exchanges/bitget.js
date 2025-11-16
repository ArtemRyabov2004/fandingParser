import { ExchangeBase } from './base.js';
import axios from 'axios';

export class BitgetExchange extends ExchangeBase {
    constructor(config) {
        super('Bitget', config);
        this.fundingIntervalHours = 8;
    }

    async fetchFundingRates() {
        try {
            // Получаем текущие ставки финансирования
            const response = await axios.get(`${this.config.apiBase}/api/mix/v1/market/current-fund-rate`, {
                params: {
                    productType: 'umcbl' // USDT-M perpetual
                },
                timeout: 10000
            });
            
            const rates = {};
            
            if (response.data && response.data.data) {
                response.data.data.forEach(item => {
                    if (item.symbol && item.fundingRate !== undefined) {
                        const symbol = this.normalizeSymbol(item.symbol);
                        const rawRate = parseFloat(item.fundingRate);
                        const hourlyRate = this.calculateHourlyRate(rawRate);
                        
                        rates[symbol] = {
                            rawRate: rawRate,
                            rate: hourlyRate,
                            intervalHours: this.fundingIntervalHours,
                            nextFundingTime: Date.now() + 8 * 3600000,
                            annualizedRate: this.calculateAnnualizedRate(rawRate)
                        };
                    }
                });
            }
            
            console.log(`✅ Bitget: загружено ${Object.keys(rates).length} ставок`);
            return rates;
        } catch (error) {
            console.error(`❌ Bitget: ${error.response?.data?.msg || error.message}`);
            
            // Fallback: получаем predicted funding rates
            try {
                return await this.fetchPredictedRates();
            } catch (fallbackError) {
                console.error(`❌ Bitget fallback: ${fallbackError.message}`);
                return {};
            }
        }
    }

    async fetchPredictedRates() {
        const response = await axios.get(`${this.config.apiBase}/api/mix/v1/market/tickers`, {
            params: {
                productType: 'umcbl'
            },
            timeout: 10000
        });
        
        const rates = {};
        
        if (response.data && response.data.data) {
            response.data.data.forEach(ticker => {
                if (ticker.symbol && ticker.symbol.endsWith('USDT') && ticker.predictFundRate) {
                    const symbol = this.normalizeSymbol(ticker.symbol);
                    const rawRate = parseFloat(ticker.predictFundRate);
                    const hourlyRate = this.calculateHourlyRate(rawRate);
                    
                    rates[symbol] = {
                        rawRate: rawRate,
                        rate: hourlyRate,
                        intervalHours: this.fundingIntervalHours,
                        nextFundingTime: Date.now() + 8 * 3600000,
                        annualizedRate: this.calculateAnnualizedRate(rawRate)
                    };
                }
            });
        }
        
        console.log(`✅ Bitget (predicted): загружено ${Object.keys(rates).length} ставок`);
        return rates;
    }

    normalizeSymbol(symbol) {
        return symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    }
}