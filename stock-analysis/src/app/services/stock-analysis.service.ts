import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Stock, StockRecommendation, StockSearchResult } from '../models/stock.model';

interface YahooSearchResponse {
  quotes?: Array<{
    symbol?: string;
    shortname?: string;
    longname?: string;
    exchDisp?: string;
    quoteType?: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class StockAnalysisService {
  constructor(private readonly http: HttpClient) {}

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

  searchStocks(query: string): Observable<StockSearchResult[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return of([]);

    const localMatches = this.searchLocalUniverse(trimmedQuery);
    const yahooUrl = 'https://query1.finance.yahoo.com/v1/finance/search';

    return this.http
      .get<YahooSearchResponse>(yahooUrl, {
        params: { q: trimmedQuery, quotesCount: '10', newsCount: '0' }
      })
      .pipe(
        map((response) => this.normalizeYahooResults(response)),
        map((internetMatches) => this.mergeResults(localMatches, internetMatches)),
        catchError(() => of(localMatches))
      );
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

  private searchLocalUniverse(query: string): StockSearchResult[] {
    const lower = query.toLowerCase();
    return this.universe
      .filter((stock) =>
        stock.symbol.toLowerCase().includes(lower) ||
        stock.name.toLowerCase().includes(lower)
      )
      .slice(0, 8)
      .map((stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        supportedSymbol: stock.symbol
      }));
  }

  private normalizeYahooResults(response: YahooSearchResponse): StockSearchResult[] {
    return (response.quotes ?? [])
      .filter((quote) => !!quote.symbol && quote.quoteType?.toLowerCase() === 'equity')
      .map((quote) => {
        const symbol = quote.symbol ?? '';
        const supportedSymbol = this.resolveSupportedSymbol(symbol);

        return {
          symbol,
          name: quote.shortname || quote.longname || symbol,
          exchange: quote.exchDisp,
          supportedSymbol
        };
      })
      .slice(0, 10);
  }

  private mergeResults(localMatches: StockSearchResult[], internetMatches: StockSearchResult[]): StockSearchResult[] {
    const seen = new Set<string>();
    const merged = [...localMatches, ...internetMatches].filter((item) => {
      const dedupeKey = (item.supportedSymbol || item.symbol).toUpperCase();
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });

    return merged.slice(0, 10);
  }

  private resolveSupportedSymbol(rawSymbol: string): string | undefined {
    const normalized = rawSymbol.toUpperCase().split('.')[0];
    return this.universe.find((stock) => stock.symbol === normalized)?.symbol;
  }
}
