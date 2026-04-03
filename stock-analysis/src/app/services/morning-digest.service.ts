import { Injectable } from '@angular/core';
import { interval, startWith, Subscription } from 'rxjs';
import { StockAnalysisService } from './stock-analysis.service';
import { WatchlistService } from './watchlist.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class MorningDigestService {
  private runSub?: Subscription;
  private lastWatchScores = new Map<string, number>();

  constructor(
    private readonly analysis: StockAnalysisService,
    private readonly watchlist: WatchlistService,
    private readonly notifications: NotificationService
  ) {}

  start(): void {
    if (this.runSub) return;

    this.runSub = interval(60_000)
      .pipe(startWith(0))
      .subscribe(async () => {
        await this.sendMorningTop5();
        await this.watchlistMajorChangeAlerts();
      });
  }

  stop(): void {
    this.runSub?.unsubscribe();
    this.runSub = undefined;
  }

  private async sendMorningTop5(): Promise<void> {
    const now = new Date();
    const isMorningWindow = now.getHours() === 8 && now.getMinutes() < 5;
    if (!isMorningWindow) return;

    const picks = this.analysis.getTopSuggestions(5);
    const summary = picks.map((p) => `${p.stock.symbol}:${p.action}`).join(', ');

    await this.notifications.notify(100, 'Top 5 Morning Suggestions', summary);
  }

  private async watchlistMajorChangeAlerts(): Promise<void> {
    for (const symbol of this.watchlist.watchlist) {
      const stock = this.analysis.getUniverse().find((item) => item.symbol === symbol);
      if (!stock) continue;

      const result = this.analysis.analyze(stock);
      const prev = this.lastWatchScores.get(symbol);
      this.lastWatchScores.set(symbol, result.score);

      if (prev === undefined) continue;
      const change = Math.abs(result.score - prev);
      if (change >= 8) {
        await this.notifications.notify(
          Date.now(),
          `Major change: ${symbol}`,
          `Score moved from ${prev} to ${result.score}. Suggested action: ${result.action}`
        );
      }
    }
  }
}
