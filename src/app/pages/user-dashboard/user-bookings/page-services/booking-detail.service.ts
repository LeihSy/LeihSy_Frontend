import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Booking, BookingStatus } from '../../../../models/booking.model';
import { BookingService } from '../../../../services/booking.service';
import { UserBookingExportService } from './user-booking-export.service';
import { TimelineEvent } from '../../../../components/booking-components/booking-timeline/booking-timeline.component';
import { InfoItem } from '../../../../components/info-card/info-card.component';

@Injectable()
export class BookingDetailService {
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly messageService = inject(MessageService);
  private readonly exportService = inject(UserBookingExportService);

  booking = signal<Booking | null>(null);
  isLoading = signal(true);
  timelineEvents = signal<TimelineEvent[]>([]);
  showQrDialog = signal(false);

  // Computed InfoItems for cards
  rentalPeriodItems = computed<InfoItem[]>(() => {
    const booking = this.booking();
    if (!booking) return [];
    return [
      { icon: 'pi-calendar-plus', label: 'Geplante Abholung', value: this.formatDateOnly(booking.startDate) },
      { icon: 'pi-calendar-minus', label: 'Geplante Rückgabe', value: this.formatDateOnly(booking.endDate) }
    ];
  });

  lenderItems = computed<InfoItem[]>(() => {
    const booking = this.booking();
    if (!booking) return [];
    return [
      { icon: 'pi-user', label: 'Name', value: booking.lenderName },
      { icon: 'pi-id-card', label: 'Verleiher-ID', value: `#${booking.lenderId}` }
    ];
  });

  itemItems = computed<InfoItem[]>(() => {
    const booking = this.booking();
    if (!booking) return [];
    return [
      { icon: 'pi-box', label: 'Produkt', value: booking.productName },
      { icon: 'pi-hashtag', label: 'Inventarnummer', value: booking.itemInvNumber },
      { icon: 'pi-tag', label: 'Produkt-ID', value: `#${booking.productId}` }
    ];
  });

  datesItems = computed<InfoItem[]>(() => {
    const booking = this.booking();
    if (!booking) return [];
    const items: InfoItem[] = [];

    if (booking.proposedPickups) {
      items.push({ icon: 'pi-calendar', label: 'Vorgeschlagene Abholtermine', value: booking.proposedPickups });
    }
    if (booking.confirmedPickup) {
      items.push({ icon: 'pi-check-circle', label: 'Bestätigter Abholtermin', value: this.formatDate(booking.confirmedPickup) });
    }
    if (booking.distributionDate) {
      items.push({ icon: 'pi-sign-out', label: 'Tatsächliche Ausgabe', value: this.formatDate(booking.distributionDate) });
    }
    if (booking.returnDate) {
      items.push({ icon: 'pi-sign-in', label: 'Tatsächliche Rückgabe', value: this.formatDate(booking.returnDate) });
    }

    items.push({ icon: 'pi-clock', label: 'Erstellt am', value: this.formatDate(booking.createdAt) });
    items.push({ icon: 'pi-history', label: 'Zuletzt aktualisiert', value: this.formatDate(booking.updatedAt) });

    return items;
  });

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

  closeQrDialog(): void {
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

  formatDate(date: Date | string | null): string {
    if (!date) return '-';

    try {
      const d = typeof date === 'string' ? new Date(date) : date;
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

  exportToPdf(): void {
    const booking = this.booking();
    if (!booking) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warnung',
        detail: 'Keine Buchungsdaten verfügbar zum Exportieren.'
      });
      return;
    }

    try {
      this.exportService.exportBookingAsPdf(booking);
      this.messageService.add({
        severity: 'success',
        summary: 'Erfolg',
        detail: 'PDF wurde erfolgreich heruntergeladen.'
      });
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'PDF konnte nicht erstellt werden.'
      });
    }
  }
}

