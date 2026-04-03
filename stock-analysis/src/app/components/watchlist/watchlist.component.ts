import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockRecommendation } from '../../models/stock.model';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card">
      <h2>Watchlist</h2>
      <div class="row">
        <input [(ngModel)]="symbol" placeholder="Add symbol e.g. SBIN" />
        <button (click)="onAdd()">Add</button>
      </div>

      <div *ngFor="let item of watchlistData" class="item">
        <div>
          <strong>{{ item.stock.symbol }}</strong> - {{ item.outlook }}
          <small> ({{ item.action }}, score {{ item.score }})</small>
        </div>
        <button (click)="remove.emit(item.stock.symbol)">Remove</button>
      </div>
    </section>
  `,
  styles: [`.row{display:flex;gap:.5rem;margin-bottom:.75rem}input{flex:1;padding:.5rem}.item{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid #eee}`]
})
export class WatchlistComponent {
  @Input() watchlistData: StockRecommendation[] = [];
  @Output() add = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  symbol = '';

  onAdd(): void {
    if (!this.symbol.trim()) return;
    this.add.emit(this.symbol.trim().toUpperCase());
    this.symbol = '';
  }
}
