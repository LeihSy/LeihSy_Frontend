import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingHeaderComponent } from '../../booking-components/booking-header/booking-header.component';
import { InfoCardComponent, InfoItem } from '../../info-card/info-card.component';
import { Booking } from '../../../models/booking.model';

interface CardData {
  h: string;
  items: InfoItem[];
}

@Component({
  selector: 'app-booking-grid',
  standalone: true,
  imports: [CommonModule, BookingHeaderComponent, InfoCardComponent],
  template: `
    <div class="lg:col-span-2 space-y-6">
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <app-booking-header
          [bookingId]="booking.id"
          [productName]="booking.productName"
          [itemInvNumber]="booking.itemInvNumber"
          [status]="booking.status"
          [statusLabel]="statusLabel"
          [statusSeverity]="statusSeverity">
        </app-booking-header>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (card of cards; track card.h) {
          <app-info-card
            [header]="card.h"
            [items]="card.items"
            class="h-full">
          </app-info-card>
        }
      </div>

      <ng-content></ng-content>
    </div>
  `
})
export class BookingGridComponent {
  @Input({ required: true }) booking!: Booking;
  @Input({ required: true }) statusLabel!: string;
  @Input({ required: true }) statusSeverity!: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';
  @Input({ required: true }) cards!: CardData[];
}

