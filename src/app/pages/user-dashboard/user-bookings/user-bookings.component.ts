import { Component, OnInit, signal, computed, inject } from '@angular/core';
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

import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { UserBookingsService } from './page-services/user-bookings.service';
import { UserStatsCardsComponent, UserStatCard } from '../components/user-stats-cards.component';
import { SearchBarComponent } from '../../../components/search-bar/search-bar.component';
import { Booking } from '../../../models/booking.model';

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
    TooltipModule,
    UserStatsCardsComponent,
    SearchBarComponent
  ],
  providers: [MessageService, UserBookingsService],
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.scss']
})
export class UserBookingsComponent implements OnInit {
  private userBookingsService = inject(UserBookingsService);

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

  // Use page-page-page-page-services signals
  isLoading = this.userBookingsService.isLoading;
  filteredBookings = this.userBookingsService.filteredBookings;

  // Computed stats cards
  statsCards = computed<UserStatCard[]>(() => [
    {
      label: 'Gesamt Buchungen',
      value: this.userBookingsService.totalBookings(),
      icon: 'pi-calendar',
      color: 'text-[#000080]'
    },
    {
      label: 'Aktive Buchungen',
      value: this.userBookingsService.activeBookings(),
      icon: 'pi-clock',
      color: 'text-blue-600'
    },
    {
      label: 'Abgeschlossen',
      value: this.userBookingsService.completedBookings(),
      icon: 'pi-check-circle',
      color: 'text-green-600'
    }
  ]);

  ngOnInit(): void {
    this.userBookingsService.loadUserBookings();
  }

  onSearchChange(value: string): void {
    this.userBookingsService.updateSearchQuery(value);
  }

  viewBookingDetail(booking: Booking): void {
    this.userBookingsService.navigateToBookingDetail(booking.id);
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    return this.userBookingsService.getStatusSeverity(status as any);
  }
}

