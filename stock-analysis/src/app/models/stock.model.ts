export type Action = 'Buy' | 'Sell' | 'Hold';
export type Outlook = 'Good' | 'Bad' | 'Neutral';

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  peRatio: number;
  epsGrowth: number;
  debtToEquity: number;
  rsi: number;
  momentum: number;
}

export interface StockRecommendation {
  stock: Stock;
  score: number;
  action: Action;
  outlook: Outlook;
  reason: string;
}
