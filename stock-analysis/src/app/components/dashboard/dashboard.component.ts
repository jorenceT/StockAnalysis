import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map, Subscription } from 'rxjs';
import { WatchlistComponent } from '../watchlist/watchlist.component';
import { StockAnalysisService } from '../../services/stock-analysis.service';
import { WatchlistService } from '../../services/watchlist.service';
import { MorningDigestService } from '../../services/morning-digest.service';
import { NotificationService } from '../../services/notification.service';
import { Stock, StockRecommendation } from '../../models/stock.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, WatchlistComponent],
  template: `
    <main class="page grid">
      <h1>Indian Stock Advisor</h1>
      <app-watchlist
        [watchlistData]="watchlistData"
        (add)="addToWatchlist($event)"
        (remove)="removeFromWatchlist($event)">
      </app-watchlist>
    </main>
  `,
  styles: ['.page{max-width:920px;margin:0 auto;padding:1rem}']
})
export class DashboardComponent implements OnInit, OnDestroy {
  universe: Stock[] = [];
  watchlistData: StockRecommendation[] = [];

  private sub?: Subscription;

  constructor(
    private readonly analysis: StockAnalysisService,
    private readonly watchlist: WatchlistService,
    private readonly digest: MorningDigestService,
    private readonly notifications: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.universe = this.analysis.getUniverse();
    await this.notifications.initPermissions();
    this.digest.start();

    this.sub = combineLatest([this.watchlist.watchlist$])
      .pipe(
        map(([symbols]) =>
          symbols
            .map((symbol) => this.universe.find((item) => item.symbol === symbol))
            .filter((stock): stock is NonNullable<typeof stock> => !!stock)
            .map((stock) => this.analysis.analyze(stock))
        )
      )
      .subscribe((items) => {
        this.watchlistData = items;
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.digest.stop();
  }

  addToWatchlist(symbol: string): void {
    this.watchlist.add(symbol);
  }

  removeFromWatchlist(symbol: string): void {
    this.watchlist.remove(symbol);
  }
}
