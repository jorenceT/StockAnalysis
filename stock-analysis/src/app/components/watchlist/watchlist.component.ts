import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Stock, StockRecommendation } from '../../models/stock.model';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card">
      <h2>Watchlist</h2>
      <div class="row">
        <div class="input-wrap">
          <input
            [(ngModel)]="symbolQuery"
            (ngModelChange)="onQueryChange()"
            (keydown.enter)="onAdd()"
            placeholder="Search symbol or company (e.g. Tata, SBIN)"
          />
          <div *ngIf="filteredUniverse.length > 0" class="suggestions">
            <button
              *ngFor="let stock of filteredUniverse"
              type="button"
              class="suggestion-item"
              (click)="selectSuggestion(stock)"
            >
              <strong>{{ stock.symbol }}</strong>
              <span>{{ stock.name }}</span>
            </button>
          </div>
        </div>
        <button (click)="onAdd()">Add</button>
      </div>
      <small *ngIf="showInvalidMessage" class="error">
        Please select a valid stock from the suggestions.
      </small>

      <div *ngFor="let item of watchlistData" class="item">
        <div>
          <strong>{{ item.stock.symbol }}</strong> - {{ item.outlook }}
          <small> ({{ item.action }}, score {{ item.score }})</small>
        </div>
        <button (click)="remove.emit(item.stock.symbol)">Remove</button>
      </div>
    </section>
  `,
  styles: [`
    .row{display:flex;gap:.5rem;margin-bottom:.5rem;align-items:flex-start}
    .input-wrap{position:relative;flex:1}
    input{width:100%;padding:.5rem}
    .suggestions{position:absolute;top:calc(100% + 2px);left:0;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:.375rem;box-shadow:0 6px 18px rgba(0,0,0,.08);max-height:220px;overflow:auto;z-index:10}
    .suggestion-item{display:flex;gap:.5rem;justify-content:flex-start;width:100%;padding:.5rem .625rem;border:0;border-bottom:1px solid #f3f4f6;background:#fff;cursor:pointer}
    .suggestion-item:last-child{border-bottom:none}
    .suggestion-item:hover{background:#f9fafb}
    .error{display:block;color:#b91c1c;margin-bottom:.5rem}
    .item{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid #eee}
  `]
})
export class WatchlistComponent {
  @Input() watchlistData: StockRecommendation[] = [];
  @Input() universe: Stock[] = [];
  @Output() add = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  symbolQuery = '';
  filteredUniverse: Stock[] = [];
  showInvalidMessage = false;

  onQueryChange(): void {
    const query = this.symbolQuery.trim().toLowerCase();
    this.showInvalidMessage = false;
    if (!query) {
      this.filteredUniverse = [];
      return;
    }

    this.filteredUniverse = this.universe
      .filter((stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }

  selectSuggestion(stock: Stock): void {
    this.symbolQuery = stock.symbol;
    this.filteredUniverse = [];
    this.showInvalidMessage = false;
  }

  onAdd(): void {
    const query = this.symbolQuery.trim().toLowerCase();
    if (!query) return;

    const exactMatch = this.universe.find(
      (stock) =>
        stock.symbol.toLowerCase() === query ||
        stock.name.toLowerCase() === query
    );

    if (!exactMatch) {
      this.showInvalidMessage = true;
      this.onQueryChange();
      return;
    }

    this.add.emit(exactMatch.symbol);
    this.symbolQuery = '';
    this.filteredUniverse = [];
    this.showInvalidMessage = false;
  }
}
