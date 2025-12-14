import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
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
import { TableComponent, ColumnDef } from '../../shared/table/table.component';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableComponent,
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

  // Spalten-Definition für die Tabelle
  columns: ColumnDef[] = [
    { field: 'productName', header: 'Produkt', sortable: true },
    { field: 'itemInvNumber', header: 'Inventarnummer', sortable: true, width: '150px' },
    { field: 'lenderName', header: 'Verleiher', sortable: true },
    { field: 'statusLabel', header: 'Status', type: 'status', sortable: true, width: '130px' },
    { field: 'startDate', header: 'Abholung', type: 'date', sortable: true, width: '120px' },
    { field: 'endDate', header: 'Rückgabe', type: 'date', sortable: true, width: '120px' },
    { field: 'createdAt', header: 'Erstellt am', type: 'datetime', sortable: true, width: '160px' }
  ];

  filteredBookings = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const bookingsWithStatusLabel = this.bookings().map(booking => ({
      ...booking,
      statusLabel: this.getStatusLabel(booking.status)
    }));

    if (!query) {
      return bookingsWithStatusLabel;
    }

    return bookingsWithStatusLabel.filter(booking =>
      booking.productName.toLowerCase().includes(query) ||
      booking.itemInvNumber.toLowerCase().includes(query) ||
      booking.lenderName.toLowerCase().includes(query) ||
      booking.statusLabel.toLowerCase().includes(query)
    );
  });

  constructor(
    private readonly bookingService: BookingService,
    private readonly messageService: MessageService,
    private readonly router: Router
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

  /**
   * Navigiert zur Detail-Seite der ausgewählten Buchung
   */
  onBookingRowClick(booking: Booking): void {
    this.router.navigate(['/user-dashboard/bookings', booking.id]);
  }
}
