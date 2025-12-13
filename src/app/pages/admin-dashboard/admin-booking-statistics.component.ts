import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

interface ProductStats {
  productName: string;
  productId: number;
  count: number;
}

interface StatusStats {
  statusName: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-admin-booking-statistics',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    ToastModule,
    BackButtonComponent,
    ButtonModule,
    RouterLink,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './admin-booking-statistics.component.html',
  styleUrls: ['./admin-booking-statistics.component.scss']
})
export class AdminBookingStatisticsComponent implements OnInit {
  isLoading = signal<boolean>(true);
  bookings = signal<Booking[]>([]);

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

    this.bookings().forEach(booking => {
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

    const result: StatusStats[] = Array.from(stats.entries()).map(([status, count]) => ({
      statusName: status,
      count,
      color: statusColors[status] || '#000080'
    }));

    return result.sort((a, b) => b.count - a.count);
  });

  topProducts = computed(() => {
    const productMap = new Map<number, { name: string; count: number }>();

    this.bookings().forEach(booking => {
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

    const products: ProductStats[] = Array.from(productMap.entries()).map(([id, data]) => ({
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
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);

    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.isLoading.set(false);
      },
      error: (error) => {
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

