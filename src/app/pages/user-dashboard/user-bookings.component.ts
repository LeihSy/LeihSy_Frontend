import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { Booking, BookingStatus } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.scss']
})
export class UserBookingsComponent implements OnInit {
  bookings = signal<Booking[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);

  filteredBookings = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.bookings();
    }

    return this.bookings().filter(booking =>
      booking.productName.toLowerCase().includes(query) ||
      booking.itemInvNumber.toLowerCase().includes(query) ||
      booking.lenderName.toLowerCase().includes(query) ||
      this.getStatusLabel(booking.status).toLowerCase().includes(query)
    );
  });

  constructor(
    private readonly bookingService: BookingService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUserBookings();
  }

  /**
   * Lädt die Buchungen des aktuellen Users (aktive + gelöschte)
   */
  private loadUserBookings(): void {
    this.isLoading.set(true);

    // Lade sowohl aktive als auch gelöschte Buchungen parallel
    forkJoin({
      activeBookings: this.bookingService.getMyBookings(),
      deletedBookings: this.bookingService.getMyDeletedBookings()
    }).subscribe({
      next: ({ activeBookings, deletedBookings }) => {
        // Setze bei allen gelöschten Buchungen den Status explizit auf CANCELLED
        const deletedWithStatus = deletedBookings.map(booking => ({
          ...booking,
          status: 'CANCELLED' as BookingStatus
        }));

        // Kombiniere beide Arrays
        const allBookings = [...activeBookings, ...deletedWithStatus];
        this.bookings.set(allBookings);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Buchungen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Die Buchungen konnten nicht geladen werden.'
        });
        this.isLoading.set(false);
      }
    });
  }


  /**
   * Gibt das Severity-Level für den Status-Tag zurück
   */
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

  /**
   * Gibt das deutsche Label für den Status zurück
   */
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

  /**
   * Gibt das passende Icon für den Status zurück
   */
  getStatusIcon(status: BookingStatus): string {
    switch (status) {
      case 'PENDING':
        return 'pi pi-clock';
      case 'CONFIRMED':
        return 'pi pi-check-circle';
      case 'PICKED_UP':
        return 'pi pi-shopping-bag';
      case 'RETURNED':
        return 'pi pi-check';
      case 'REJECTED':
        return 'pi pi-times-circle';
      case 'EXPIRED':
        return 'pi pi-exclamation-triangle';
      case 'CANCELLED':
        return 'pi pi-ban';
      default:
        return 'pi pi-info-circle';
    }
  }

  /**
   * Formatiert ein Datum in ein kurzes Format (DD.MM.YYYY)
   */
  formatDateShort(dateString: string): string {
    if (!dateString) return '-';

    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Formatiert ein Datum mit Uhrzeit (DD.MM.YYYY HH:MM)
   */
  formatDateTimeShort(dateString: string): string {
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
}

