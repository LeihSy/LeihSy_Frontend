import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewStatCardComponent } from '../../stat-components/overview-stat-card/overview-stat-card.component';

@Component({
  selector: 'app-booking-statistics-overview',
  standalone: true,
  imports: [CommonModule, OverviewStatCardComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 px-2 mb-4">
      <app-overview-stat-card
        icon="pi pi-chart-bar"
        iconColor="#253359"
        [value]="totalBookings"
        label="Gesamt Buchungen">
      </app-overview-stat-card>

      <app-overview-stat-card
        icon="pi pi-box"
        iconColor="#0080ff"
        [value]="differentProducts"
        label="Verschiedene Produkte">
      </app-overview-stat-card>

      <app-overview-stat-card
        icon="pi pi-star-fill"
        iconColor="#ffd700"
        [value]="topProductCount"
        label="Top Produkt Ausleihen">
      </app-overview-stat-card>
    </div>
  `
})
export class BookingStatisticsOverviewComponent {
  @Input() totalBookings: number = 0;
  @Input() differentProducts: number = 0;
  @Input() topProductCount: number = 0;
}

