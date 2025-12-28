import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { BookingService } from '../../../services/booking.service';
import { Booking, BookingStatus } from '../../../models/booking.model';
import { UserService } from '../../../services/user.service';

@Injectable()
export class UserBookingsService {
  private bookingService = inject(BookingService);
  private messageService = inject(MessageService);
  private UserService = inject(UserService);
  private router = inject(Router);

  // Signals for state management
  bookings = signal<Booking[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  // Computed: filtered bookings with status labels
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

  // Computed stats
  totalBookings = computed(() => this.bookings().length);
  activeBookings = computed(() =>
    this.bookings().filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'PICKED_UP').length
  );
  completedBookings = computed(() =>
    this.bookings().filter(b => b.status === 'RETURNED').length
  );

  loadUserBookings(): void {
    this.isLoading.set(true);

    // Zuerst den aktuellen User laden, um die User-ID zu erhalten
    this.UserService.getCurrentUser().subscribe({
      next: (currentUser) => {
        // Mit der User-ID die Buchungen abrufen
        this.UserService.getUserBookings(currentUser.id).subscribe({
          next: (bookings) => {
            this.bookings.set(bookings);
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
      },
      error: (error) => {
        console.error('Fehler beim Laden des Benutzers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Der Benutzer konnte nicht geladen werden.'
        });
        this.isLoading.set(false);
      }
    });
  }

  updateSearchQuery(query: string): void {
    this.searchQuery.set(query);
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
      case 'REJECTED':
        return 'Abgelehnt';
      case 'PICKED_UP':
        return 'Abgeholt';
      case 'RETURNED':
        return 'Zurückgegeben';
      case 'EXPIRED':
        return 'Abgelaufen';
      case 'CANCELLED':
        return 'Storniert';
      default:
        return status;
    }
  }

  navigateToBookingDetail(bookingId: number): void {
    this.router.navigate(['/user/bookings', bookingId]);
  }
}

