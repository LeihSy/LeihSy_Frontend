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
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { BookingHeaderComponent } from '../../../components/admin/booking-header/booking-header.component';
import { InfoCardComponent, InfoItem } from '../../../components/info-card/info-card.component';
import { InfoItemComponent } from '../../../components/admin/info-item/info-item.component';
import { BookingTimelineComponent } from '../../../components/admin/booking-timeline/booking-timeline.component';

interface TimelineEvent {
  status: string;
  date: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-admin-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    TimelineModule,
    ToastModule,
    BackButtonComponent,
    BookingHeaderComponent,
    InfoCardComponent,
    InfoItemComponent,
    BookingTimelineComponent
  ],
  templateUrl: './admin-booking-detail.component.html',
  providers: [MessageService]
})
export class AdminBookingDetailComponent implements OnInit {
  booking = signal<Booking | null>(null);
  isLoading = signal(true);
  timelineEvents = signal<TimelineEvent[]>([]);

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

    this.timelineEvents.set(events);
  }

  getStatusSeverity(status: BookingStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PICKED_UP':
        return 'info';
      case 'RETURNED':
        return 'success';
      case 'PENDING':
        return 'warn';
      case 'REJECTED':
        return 'danger';
      case 'EXPIRED':
        return 'danger';
      case 'CANCELLED':
        return 'secondary';
      default:
        return 'contrast';
    }
  }

  getStatusLabel(status: BookingStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Ausstehend';
      case 'CONFIRMED':
        return 'Bestätigt';
      case 'PICKED_UP':
        return 'Ausgeliehen';
      case 'RETURNED':
        return 'Zurückgegeben';
      case 'REJECTED':
        return 'Abgelehnt';
      case 'EXPIRED':
        return 'Abgelaufen';
      case 'CANCELLED':
        return 'Storniert';
      default:
        return status;
    }
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getUserInfoItems(): InfoItem[] {
    const booking = this.booking();
    if (!booking) return [];

    return [
      { icon: 'pi-user', label: 'Benutzer', value: booking.userName },
      { icon: 'pi-id-card', label: 'Benutzer-ID', value: `#${booking.userId}` }
    ];
  }

  getLoanPeriodInfoItems(): InfoItem[] {
    const booking = this.booking();
    if (!booking) return [];

    return [
      { icon: 'pi-calendar-plus', label: 'Geplante Abholung', value: this.formatDate(booking.startDate) },
      { icon: 'pi-calendar-minus', label: 'Geplante Rückgabe', value: this.formatDate(booking.endDate) }
    ];
  }

  getLenderInfoItems(): InfoItem[] {
    const booking = this.booking();
    if (!booking) return [];

    return [
      { icon: 'pi-user', label: 'Name', value: booking.lenderName },
      { icon: 'pi-id-card', label: 'Verleiher-ID', value: `#${booking.lenderId}` }
    ];
  }

  getItemInfoItems(): InfoItem[] {
    const booking = this.booking();
    if (!booking) return [];

    return [
      { icon: 'pi-box', label: 'Produkt', value: booking.productName },
      { icon: 'pi-hashtag', label: 'Inventarnummer', value: booking.itemInvNumber },
      { icon: 'pi-tag', label: 'Produkt-ID', value: `#${booking.productId}` }
    ];
  }

  goBack(): void {
    this.router.navigate(['/admin/bookings']);
  }
}

