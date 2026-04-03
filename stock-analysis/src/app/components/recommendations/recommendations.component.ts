import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockRecommendation } from '../../models/stock.model';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <h2>Top Suggestions</h2>
      <table>
        <thead>
          <tr><th>Symbol</th><th>Score</th><th>Outlook</th><th>Action</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of recommendations">
            <td>{{ item.stock.symbol }}</td>
            <td>{{ item.score }}</td>
            <td>{{ item.outlook }}</td>
            <td><strong>{{ item.action }}</strong></td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [`table{width:100%;border-collapse:collapse}th,td{padding:.5rem;border-bottom:1px solid #e5e7eb;text-align:left}`]
})
export class RecommendationsComponent {
  @Input() recommendations: StockRecommendation[] = [];
}
