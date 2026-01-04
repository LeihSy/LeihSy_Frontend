import {Component, inject, OnInit} from '@angular/core';
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

import { Booking } from '../../../models/booking.model';
import { BookingService } from '../../../services/booking.service';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { BookingStatsCardsComponent } from '../../../components/booking-components/booking-stats-cards/booking-stats-cards.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { BookingsHeaderComponent } from '../../../components/admin/booking-list-components/bookings-header.component';
import { BookingsSearchFilterComponent } from '../../../components/admin/booking-list-components/bookings-search-filter.component';
import { BookingsTableViewComponent } from '../../../components/admin/booking-list-components/bookings-table-view.component';
import { AdminBookingsPageService } from './page-services/admin-bookings-page.service';

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
    BookingsHeaderComponent,
    BookingsSearchFilterComponent,
    BookingsTableViewComponent,
    RouterLink
  ],
  providers: [MessageService, AdminBookingsPageService],
  templateUrl: './admin-bookings.component.html'
})
export class AdminBookingsComponent implements OnInit {
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

    private readonly pageService = inject(AdminBookingsPageService);


  // Delegiere alle Signals und Computed an den Service
  get bookings() { return this.pageService.bookings; }
  get overdueBookings() { return this.pageService.overdueBookings; }
  get searchQuery() { return this.pageService.searchQuery; }
  get isLoading() { return this.pageService.isLoading; }
  get selectedView() { return this.pageService.selectedView; }
  get currentLoans() { return this.pageService.currentLoans; }
  get openRequests() { return this.pageService.openRequests; }
  get confirmedNotPickedUp() { return this.pageService.confirmedNotPickedUp; }
  get futureBookings() { return this.pageService.futureBookings; }
  get filteredBookings() { return this.pageService.filteredBookings; }

  ngOnInit(): void {
    this.pageService.loadAllBookings();
    this.pageService.loadOverdueBookings();
  }

  refreshData(): void {
    this.pageService.refreshData();
  }

  setView(view: 'all' | 'current' | 'overdue' | 'pending' | 'confirmed' | 'future'): void {
    this.pageService.setView(view);
  }

  getStatusSeverity(status: any) {
    return this.pageService.getStatusSeverity(status);
  }

  getStatusLabel(status: any) {
    return this.pageService.getStatusLabel(status);
  }

  onBookingRowClick(booking: Booking): void {
    this.pageService.onBookingRowClick(booking);
  }
}

