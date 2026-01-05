import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';

export interface InsyStatistics {
  totalPending: number;
  totalImported: number;
  totalRejected: number;
}

@Component({
  selector: 'app-insy-statistics-cards',
  standalone: true,
  imports: [CardModule],
  templateUrl: './insy-statistics-cards.component.html'
})
export class InsyStatisticsCardsComponent {
  statistics = input.required<InsyStatistics>();
  newTodayCount = input<number>(0);
}
