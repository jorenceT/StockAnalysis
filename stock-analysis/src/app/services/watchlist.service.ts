import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'stock-watchlist';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly watchlistSubject = new BehaviorSubject<string[]>(this.load());
  readonly watchlist$ = this.watchlistSubject.asObservable();

  get watchlist(): string[] {
    return this.watchlistSubject.value;
  }

  add(symbol: string): void {
    const next = Array.from(new Set([...this.watchlistSubject.value, symbol]));
    this.update(next);
  }

  remove(symbol: string): void {
    this.update(this.watchlistSubject.value.filter((item) => item !== symbol));
  }

  private update(next: string[]): void {
    this.watchlistSubject.next(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private load(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return ['RELIANCE', 'TCS'];
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return ['RELIANCE', 'TCS'];
    }
  }
}
