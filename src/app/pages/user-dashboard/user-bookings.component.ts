import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Booking, BookingStatus } from '../../models/booking.model';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class UserBookingsComponent implements OnInit {

  bookings = signal<Booking[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');

  filteredBookings = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const bookings = this.bookings();

    if (!query) {
      return bookings;
    }

    return bookings.filter(booking =>
      booking.productName.toLowerCase().includes(query) ||
      booking.itemInvNumber.toLowerCase().includes(query) ||
      booking.receiverName.toLowerCase().includes(query) ||
      booking.status.toLowerCase().includes(query)
    );
  });

  constructor(
    private readonly bookingService: BookingService,
    private readonly authService: AuthService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    // Direkt die User-ID vom AuthService holen (aus dem CurrentUser Signal)
    const userId = this.authService.getUserId();

    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Keine Benutzer-ID gefunden. Bitte melden Sie sich erneut an.'
      });
      this.isLoading.set(false);
      return;
    }

    // Buchungen mit der User-ID laden
    this.loadBookings(userId);
  }

  loadBookings(userId: number): void {
    this.isLoading.set(true);
    this.bookingService.getBookingsByUserId(userId).subscribe({
      next: (bookings: Booking[]) => {
        this.bookings.set(bookings);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading bookings:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Buchungen konnten nicht geladen werden.'
        });
        this.isLoading.set(false);
      }
    });
  }

  cancelBooking(booking: Booking): void {
    this.confirmationService.confirm({
      message: `Möchten Sie die Buchung für "${booking.productName}" wirklich stornieren?`,
      header: 'Stornierung bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, stornieren',
      rejectLabel: 'Abbrechen',
      accept: () => {
        this.bookingService.cancelBooking(booking.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Erfolg',
              detail: 'Buchung wurde storniert.'
            });
            const userId = this.authService.getUserId();
            if (userId) {
              this.loadBookings(userId);
            }
          },
          error: (err: unknown) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Buchung konnte nicht storniert werden.'
            });
          }
        });
      }
    });
  }

  getStatusSeverity(status: BookingStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severityMap: Record<BookingStatus, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'PENDING': 'warn',
      'CONFIRMED': 'info',
      'PICKED_UP': 'success',
      'RETURNED': 'secondary',
      'REJECTED': 'danger',
      'EXPIRED': 'danger',
      'CANCELLED': 'contrast'
    };
    return severityMap[status];
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
    return labelMap[status];
  }

  canCancelBooking(booking: Booking): boolean {
    return booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}

