import {Injectable, signal, computed, inject} from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Booking, BookingStatus } from '../../../../models/booking.model';
import { BookingService } from '../../../../services/booking.service';

@Injectable()
export class AdminBookingsPageService {
  bookings = signal<Booking[]>([]);
  overdueBookings = signal<Booking[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);
  selectedView = signal<'all' | 'current' | 'overdue' | 'pending' | 'confirmed' | 'future'>('all');

  currentLoans = computed(() => {
    return this.bookings().filter(booking => booking.status === 'PICKED_UP');
  });

  openRequests = computed(() => {
    return this.bookings().filter(booking => booking.status === 'PENDING');
  });

  confirmedNotPickedUp = computed(() => {
    return this.bookings().filter(booking => booking.status === 'CONFIRMED');
  });

  futureBookings = computed(() => {
    const now = new Date();
    return this.bookings().filter(booking => {
      if (!booking.confirmedPickup && !booking.startDate) return false;
      const pickupDate = new Date(booking.confirmedPickup || booking.startDate);
      return pickupDate > now && (booking.status === 'CONFIRMED' || booking.status === 'PENDING');
    });
  });

  filteredBookings = computed(() => {
    let bookingsToFilter: Booking[] = [];

    switch (this.selectedView()) {
      case 'current':
        bookingsToFilter = this.currentLoans();
        break;
      case 'overdue':
        bookingsToFilter = this.overdueBookings();
        break;
      case 'pending':
        bookingsToFilter = this.openRequests();
        break;
      case 'confirmed':
        bookingsToFilter = this.confirmedNotPickedUp();
        break;
      case 'future':
        bookingsToFilter = this.futureBookings();
        break;
      default:
        bookingsToFilter = this.bookings();
    }

    const query = this.searchQuery().toLowerCase().trim();
    const bookingsWithStatusLabel = bookingsToFilter.map(booking => ({
      ...booking,
      statusLabel: this.getStatusLabel(booking.status)
    }));

    if (!query) {
      return bookingsWithStatusLabel;
    }

    return bookingsWithStatusLabel.filter(booking =>
      booking.userName.toLowerCase().includes(query) ||
      booking.productName.toLowerCase().includes(query) ||
      booking.itemInvNumber.toLowerCase().includes(query) ||
      booking.lenderName.toLowerCase().includes(query) ||
      booking.statusLabel.toLowerCase().includes(query)
    );
  });

    private readonly bookingService = inject(BookingService);
    private readonly messageService = inject(MessageService);
    private readonly router = inject(Router);


  loadAllBookings(): void {
    this.isLoading.set(true);

    this.bookingService.getBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.bookings.set(bookings);
        this.isLoading.set(false);
      },
      error: (error: any) => {
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

  loadOverdueBookings(): void {
    this.bookingService.getBookings('overdue').subscribe({
      next: (bookings: Booking[]) => {
        this.overdueBookings.set(bookings);
      },
      error: (error: any) => {
        console.error('Fehler beim Laden der überfälligen Buchungen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Die überfälligen Buchungen konnten nicht geladen werden.'
        });
      }
    });
  }

  refreshData(): void {
    this.loadAllBookings();
    this.loadOverdueBookings();
  }

  setView(view: 'all' | 'current' | 'overdue' | 'pending' | 'confirmed' | 'future'): void {
    this.selectedView.set(view);
    this.searchQuery.set('');
  }

  getStatusSeverity(status: BookingStatus | null): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    if (status === null || status === undefined) {
      return 'secondary';
    }

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

  getStatusLabel(status: BookingStatus | null): string {
    if (status === null || status === undefined) {
      return 'Storniert';
    }

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

  onBookingRowClick(booking: Booking): void {
    this.router.navigate(['/admin/bookings', booking.id]);
  }
}

