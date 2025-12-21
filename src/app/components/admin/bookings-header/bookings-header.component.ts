import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bookings-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule],
  templateUrl: './bookings-header.component.html'
})
export class BookingsHeaderComponent {
  @Input() title: string = 'Alle Buchungen verwalten';
  @Input() subtitle: string = 'Übersicht über alle Buchungen und Ausleihen im System';
  @Input() showStatisticsButton: boolean = true;
  @Input() showRefreshButton: boolean = true;
  @Input() statisticsRoute: string = '/admin/bookings/statistics';
  @Output() refresh = new EventEmitter<void>();

  onRefresh(): void {
    this.refresh.emit();
  }
}
