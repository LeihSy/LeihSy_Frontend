import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Booking, BookingStatus } from '../../../models/booking.model';
import { BookingService } from '../../../services/booking.service';
import { BookingQrComponent } from './booking-qr.component';

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    TimelineModule,
    ToastModule,
    BookingQrComponent
  ],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss'],
  providers: [MessageService]
})
export class BookingDetailComponent implements OnInit {
  booking = signal<Booking | null>(null);
  isLoading = signal(true);
  timelineEvents = signal<TimelineEvent[]>([]);

  // dialog state for QR
  showQrDialog = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly bookingService: BookingService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBookingDetails(Number.parseInt(id, 10));
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Keine Buchungs-ID gefunden.'
      });
      this.goBack();
    }
  }

  loadBookingDetails(id: number): void {
    this.isLoading.set(true);

    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.generateTimeline(booking);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Buchung:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Buchung konnte nicht geladen werden.'
        });
        this.isLoading.set(false);
        this.goBack();
      }
    });
  }

  openQrDialog(): void {
    this.showQrDialog.set(true);
  }

  onQrClosed(): void {
    this.showQrDialog.set(false);
  }

  generateTimeline(booking: Booking): void {
    const events: TimelineEvent[] = [];

    if (booking.createdAt) {
      events.push({
        status: 'Buchung erstellt',
        date: booking.createdAt,
        icon: 'pi pi-plus-circle',
        color: '#3b82f6',
        description: `Buchungsanfrage von ${booking.userName}`
      });
    }

    if (booking.status === 'CONFIRMED' || booking.status === 'PICKED_UP' || booking.status === 'RETURNED') {
      events.push({
        status: 'Bestätigt',
        date: booking.updatedAt,
        icon: 'pi pi-check-circle',
        color: '#10b981',
        description: `Von ${booking.lenderName} bestätigt`
      });
    }

    if (booking.status === 'PICKED_UP' || booking.status === 'RETURNED') {
      if (booking.distributionDate) {
        events.push({
          status: 'Ausgegeben',
          date: booking.distributionDate,
          icon: 'pi pi-sign-out',
          color: '#f59e0b',
          description: 'Gegenstand abgeholt'
        });
      }
    }

    if (booking.status === 'RETURNED') {
      if (booking.returnDate) {
        events.push({
          status: 'Zurückgegeben',
          date: booking.returnDate,
          icon: 'pi pi-sign-in',
          color: '#10b981',
          description: 'Gegenstand zurückgegeben'
        });
      }
    }

    if (booking.status === 'REJECTED') {
      events.push({
        status: 'Abgelehnt',
        date: booking.updatedAt,
        icon: 'pi pi-times-circle',
        color: '#ef4444',
        description: `Von ${booking.lenderName} abgelehnt`
      });
    }

    if (booking.status === 'CANCELLED') {
      events.push({
        status: 'Storniert',
        date: booking.updatedAt,
        icon: 'pi pi-ban',
        color: '#6b7280',
        description: 'Buchung storniert'
      });
    }

    if (booking.status === 'EXPIRED') {
      events.push({
        status: 'Abgelaufen',
        date: booking.updatedAt,
        icon: 'pi pi-exclamation-triangle',
        color: '#f59e0b',
        description: 'Nicht rechtzeitig abgeholt'
      });
    }

    this.timelineEvents.set(events);
  }

  getStatusSeverity(status: BookingStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severityMap: Record<BookingStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'PENDING': 'info',
      'CONFIRMED': 'success',
      'PICKED_UP': 'warn',
      'RETURNED': 'success',
      'REJECTED': 'danger',
      'EXPIRED': 'warn',
      'CANCELLED': 'secondary'
    };
    return severityMap[status] || 'info';
  }

  getStatusLabel(status: BookingStatus): string {
    const labelMap: Record<BookingStatus, string> = {
      'PENDING': 'Ausstehend',
      'CONFIRMED': 'Bestätigt',
      'PICKED_UP': 'Ausgeliehen',
      'RETURNED': 'Zurückgegeben',
      'REJECTED': 'Abgelehnt',
      'EXPIRED': 'Abgelaufen',
      'CANCELLED': 'Storniert'
    };
    return labelMap[status] || status;
  }

  formatDate(date: string | null): string {
    if (!date) return '-';

    try {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return '-';

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
      return '-';
    }
  }

  formatDateOnly(date: string | null): string {
    if (!date) return '-';

    try {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return '-';

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      return `${day}.${month}.${year}`;
    } catch {
      return '-';
    }
  }

  goBack(): void {
    this.router.navigate(['/user-dashboard/bookings']);
  }
}

