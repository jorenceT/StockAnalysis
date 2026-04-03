import { Injectable } from '@angular/core';
import { Stock, StockRecommendation } from '../models/stock.model';

@Injectable({ providedIn: 'root' })
export class StockAnalysisService {
  private readonly universe: Stock[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', price: 2980, peRatio: 23, epsGrowth: 13, debtToEquity: 0.41, rsi: 58, momentum: 0.72 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', price: 4080, peRatio: 30, epsGrowth: 11, debtToEquity: 0.09, rsi: 64, momentum: 0.61 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', price: 1685, peRatio: 19, epsGrowth: 14, debtToEquity: 0.95, rsi: 52, momentum: 0.67 },
    { symbol: 'INFY', name: 'Infosys', sector: 'IT', price: 1510, peRatio: 27, epsGrowth: 10, debtToEquity: 0.12, rsi: 46, momentum: 0.45 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', price: 1218, peRatio: 18, epsGrowth: 16, debtToEquity: 0.82, rsi: 56, momentum: 0.73 },
    { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Infrastructure', price: 3560, peRatio: 35, epsGrowth: 18, debtToEquity: 1.06, rsi: 68, momentum: 0.69 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto', price: 1050, peRatio: 13, epsGrowth: 21, debtToEquity: 0.67, rsi: 63, momentum: 0.76 },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', price: 840, peRatio: 11, epsGrowth: 17, debtToEquity: 1.11, rsi: 57, momentum: 0.7 }
  ];

  getUniverse(): Stock[] {
    return this.universe;
  }

  getTopSuggestions(limit = 5): StockRecommendation[] {
    return this.universe
      .map((stock) => this.analyze(stock))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  analyze(stock: Stock): StockRecommendation {
    let score = 50;

    score += Math.min(stock.epsGrowth, 25) * 1.1;
    score += (1 - Math.min(stock.debtToEquity, 2) / 2) * 15;
    score += stock.momentum * 20;

    if (stock.rsi > 70) score -= 10;
    if (stock.rsi < 35) score += 6;
    if (stock.peRatio > 35) score -= 8;
    if (stock.peRatio < 15) score += 6;

    score = Math.max(0, Math.min(100, score));

    const action = score >= 72 ? 'Buy' : score <= 40 ? 'Sell' : 'Hold';
    const outlook = score >= 65 ? 'Good' : score <= 45 ? 'Bad' : 'Neutral';

    const reason = `EPS growth ${stock.epsGrowth}% with RSI ${stock.rsi} and momentum ${Math.round(stock.momentum * 100)}.`;

    return { stock, score: Math.round(score), action, outlook, reason };
  }
}
