import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { SecondaryButtonComponent } from '../../../components/buttons/secondary-button/secondary-button.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { Booking, BookingStatus } from '../../../models/booking.model';
import { BookingService } from '../../../services/booking.service';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { BookingStatsCardsComponent } from '../../../components/admin/booking-stats-cards/booking-stats-cards.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableComponent,
    SecondaryButtonComponent,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    ToastModule,
    TooltipModule,
    BackButtonComponent,
    BookingStatsCardsComponent,
    PageHeaderComponent,
    RouterLink
  ],
  providers: [MessageService],
  templateUrl: './admin-bookings.component.html'
})
export class AdminBookingsComponent implements OnInit {
  bookings = signal<Booking[]>([]);
  overdueBookings = signal<Booking[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);
  selectedView = signal<'all' | 'current' | 'overdue' | 'pending' | 'confirmed' | 'future'>('all');

  columns: ColumnDef[] = [
    { field: 'userName', header: 'Ausleiher', sortable: true },
    { field: 'productName', header: 'Produkt', sortable: true },
    { field: 'itemInvNumber', header: 'Inventarnummer', sortable: true, width: '150px' },
    { field: 'lenderName', header: 'Verleiher', sortable: true },
    { field: 'statusLabel', header: 'Status', type: 'status', sortable: true, width: '130px' },
    { field: 'startDate', header: 'Abholung', type: 'date', sortable: true, width: '120px' },
    { field: 'endDate', header: 'Rückgabe', type: 'date', sortable: true, width: '120px' },
    { field: 'createdAt', header: 'Erstellt am', type: 'datetime', sortable: true, width: '160px' }
  ];

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

  constructor(
    private readonly bookingService: BookingService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllBookings();
    this.loadOverdueBookings();
  }

  private loadAllBookings(): void {
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

  private loadOverdueBookings(): void {
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
    this.searchQuery.set(''); // Reset search when changing view
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

