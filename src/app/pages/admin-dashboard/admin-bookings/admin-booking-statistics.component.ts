import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { BookingService } from '../../../services/booking.service';
import { Booking } from '../../../models/booking.model';
import { StatisticsHeaderComponent } from '../../../components/admin/statistics-header/statistics-header.component';
import { OverviewStatCardComponent } from '../../../components/admin/overview-stat-card/overview-stat-card.component';
import { StatsTableComponent, StatusStat } from '../../../components/admin/stats-table/stats-table.component';
import { RankingListComponent, ProductRanking } from '../../../components/admin/ranking-list/ranking-list.component';
import { BookingStatisticsExportService } from './services/booking-statistics-export.service';
import { ExportButtonsComponent } from './components/export-buttons/export-buttons.component';

@Component({
  selector: 'app-admin-booking-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    ToastModule,
    BackButtonComponent,
    ButtonModule,
    RouterLink,
    TooltipModule,
    DatePicker,
    Select,
    StatisticsHeaderComponent,
    OverviewStatCardComponent,
    StatsTableComponent,
    RankingListComponent,
    ExportButtonsComponent
  ],
  providers: [MessageService],
  templateUrl: './admin-booking-statistics.component.html'
})
export class AdminBookingStatisticsComponent implements OnInit {
  isLoading = signal<boolean>(true);
  bookings = signal<Booking[]>([]);

  // Zeitraum-Filter
  dateRangeStart = signal<Date | null>(null);
  dateRangeEnd = signal<Date | null>(null);
  dateFilterPreset = signal<string>('all');

  dateFilterOptions = [
    { label: 'Alle Buchungen', value: 'all' },
    { label: 'Letzten 7 Tage', value: 'last7days' },
    { label: 'Letzten 30 Tage', value: 'last30days' },
    { label: 'Diesen Monat', value: 'thisMonth' },
    { label: 'Letzten Monat', value: 'lastMonth' },
    { label: 'Dieses Jahr', value: 'thisYear' },
    { label: 'Benutzerdefiniert', value: 'custom' }
  ];

  // Gefilterte Buchungen basierend auf Zeitraum
  filteredBookings = computed(() => {
    const start = this.dateRangeStart();
    const end = this.dateRangeEnd();
    const allBookings = this.bookings();

    if (!start && !end) {
      return allBookings;
    }

    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);

      if (start && bookingDate < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (bookingDate > endOfDay) return false;
      }

      return true;
    });
  });

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12
          },
          color: '#000080'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 128, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#000080',
        borderWidth: 1
      }
    }
  };

  statusStats = computed(() => {
    const stats = new Map<string, number>();

    this.filteredBookings().forEach(booking => {
      const status = this.getStatusLabel(booking.status);
      stats.set(status, (stats.get(status) || 0) + 1);
    });

    const statusColors: Record<string, string> = {
      'Ausstehend': '#fbbf24',
      'Bestätigt': '#10b981',
      'Ausgeliehen': '#3b82f6',
      'Zurückgegeben': '#6366f1',
      'Abgelehnt': '#ef4444',
      'Abgelaufen': '#f97316',
      'Storniert': '#6b7280'
    };

    const result: StatusStat[] = Array.from(stats.entries()).map(([status, count]) => ({
      statusName: status,
      count,
      color: statusColors[status] || '#000080'
    }));

    return result.sort((a, b) => b.count - a.count);
  });

  topProducts = computed(() => {
    const productMap = new Map<number, { name: string; count: number }>();

    this.filteredBookings().forEach(booking => {
      if (!booking.productId || !booking.productName) return;

      const existing = productMap.get(booking.productId);
      if (existing) {
        existing.count++;
      } else {
        productMap.set(booking.productId, {
          name: booking.productName,
          count: 1
        });
      }
    });

    const products: ProductRanking[] = Array.from(productMap.entries()).map(([id, data]) => ({
      productId: id,
      productName: data.name,
      count: data.count
    }));

    return products.sort((a, b) => b.count - a.count).slice(0, 10);
  });

  statusChartData = computed(() => {
    const stats = this.statusStats();

    return {
      labels: stats.map(s => s.statusName),
      datasets: [
        {
          label: 'Anzahl Buchungen',
          data: stats.map(s => s.count),
          backgroundColor: stats.map(s => s.color),
          borderColor: '#000080',
          borderWidth: 2
        }
      ]
    };
  });

  topProductsChartData = computed(() => {
    const products = this.topProducts();

    return {
      labels: products.map(p => p.productName),
      datasets: [
        {
          label: 'Anzahl Ausleihen',
          data: products.map(p => p.count),
          backgroundColor: [
            'rgba(0, 0, 128, 0.8)',
            'rgba(0, 0, 160, 0.8)',
            'rgba(0, 64, 192, 0.8)',
            'rgba(0, 96, 224, 0.8)',
            'rgba(64, 128, 255, 0.8)',
            'rgba(96, 160, 255, 0.8)',
            'rgba(128, 192, 255, 0.8)',
            'rgba(160, 208, 255, 0.8)',
            'rgba(192, 224, 255, 0.8)',
            'rgba(224, 240, 255, 0.8)'
          ],
          borderColor: '#000080',
          borderWidth: 2
        }
      ]
    };
  });

  constructor(
    private readonly bookingService: BookingService,
    private readonly messageService: MessageService,
    private readonly exportService: BookingStatisticsExportService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);

    this.bookingService.getBookings().subscribe({
      next: (bookings: Booking[]) => {
        this.bookings.set(bookings);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Fehler beim Laden der Daten:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Die Statistiken konnten nicht geladen werden.'
        });
        this.isLoading.set(false);
      }
    });
  }

  refreshData(): void {
    this.loadData();
  }

  exportStatistics(): void {
    const dateRange = this.dateRangeStart() && this.dateRangeEnd()
      ? { start: this.dateRangeStart()!, end: this.dateRangeEnd()! }
      : undefined;

    this.exportService.exportAsHtml({
      totalBookings: this.filteredBookings().length,
      statusStats: this.statusStats(),
      topProducts: this.topProducts(),
      exportDate: new Date(),
      dateRange
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Export erfolgreich',
      detail: 'Die Statistiken wurden als HTML-Datei exportiert.'
    });
  }

  exportStatisticsAsPdf(): void {
    const dateRange = this.dateRangeStart() && this.dateRangeEnd()
      ? { start: this.dateRangeStart()!, end: this.dateRangeEnd()! }
      : undefined;

    this.exportService.exportAsPdf({
      totalBookings: this.filteredBookings().length,
      statusStats: this.statusStats(),
      topProducts: this.topProducts(),
      exportDate: new Date(),
      dateRange
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Export erfolgreich',
      detail: 'Die Statistiken wurden als PDF-Datei exportiert.'
    });
  }

  onDateFilterPresetChange(): void {
    const preset = this.dateFilterPreset();
    const now = new Date();

    switch (preset) {
      case 'all':
        this.dateRangeStart.set(null);
        this.dateRangeEnd.set(null);
        break;
      case 'last7days':
        this.dateRangeStart.set(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        this.dateRangeEnd.set(now);
        break;
      case 'last30days':
        this.dateRangeStart.set(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
        this.dateRangeEnd.set(now);
        break;
      case 'thisMonth':
        this.dateRangeStart.set(new Date(now.getFullYear(), now.getMonth(), 1));
        this.dateRangeEnd.set(now);
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        this.dateRangeStart.set(lastMonth);
        this.dateRangeEnd.set(lastMonthEnd);
        break;
      case 'thisYear':
        this.dateRangeStart.set(new Date(now.getFullYear(), 0, 1));
        this.dateRangeEnd.set(now);
        break;
      case 'custom':
        // Benutzer kann manuell Daten wählen
        break;
    }
  }

  clearDateFilter(): void {
    this.dateRangeStart.set(null);
    this.dateRangeEnd.set(null);
    this.dateFilterPreset.set('all');
  }

  private getStatusLabel(status: string | null): string {
    if (status === null || status === undefined) {
      return 'Storniert';
    }

    const statusMap: Record<string, string> = {
      'PENDING': 'Ausstehend',
      'CONFIRMED': 'Bestätigt',
      'PICKED_UP': 'Ausgeliehen',
      'RETURNED': 'Zurückgegeben',
      'REJECTED': 'Abgelehnt',
      'EXPIRED': 'Abgelaufen',
      'CANCELLED': 'Storniert'
    };
    return statusMap[status] || status;
  }
}

