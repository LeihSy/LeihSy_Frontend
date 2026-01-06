import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { StatCardComponent } from '../../stat-components/stat-card/stat-card.component';

export type BookingView = 'all' | 'current' | 'overdue' | 'pending' | 'confirmed' | 'future';

@Component({
  selector: 'app-booking-stats-cards',
  standalone: true,
  imports: [CommonModule, CardModule, StatCardComponent],
  templateUrl: './booking-stats-cards.component.html'
})
export class BookingStatsCardsComponent {
  @Input() currentLoansCount: number = 0;
  @Input() overdueCount: number = 0;
  @Input() openRequestsCount: number = 0;
  @Input() confirmedNotPickedUpCount: number = 0;
  @Input() futureBookingsCount: number = 0;
  @Input() totalCount: number = 0;
  @Input() selectedView: BookingView = 'all';

  @Output() viewChange = new EventEmitter<BookingView>();

  onViewClick(view: BookingView): void {
    this.viewChange.emit(view);
  }
}

