import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';
import { ExportButtonsComponent } from '../../../components/buttons/export-buttons/export-buttons.component';
import { FilterBookingsComponent } from '../../../components/admin/booking-statistics-components/filter-bookings.component';
import { BookingStatisticsOverviewComponent } from '../../../components/admin/booking-statistics-components/booking-statistics-overview.component';
import { BookingPieChartComponent } from '../../../components/admin/booking-statistics-components/booking-pie-chart.component';
import { BookingColumnChartComponent } from '../../../components/admin/booking-statistics-components/booking-column-chart.component';
import { AdminBookingStatisticsPageService } from './page-services/admin-booking-statistics-page.service';

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
    PageHeaderComponent,
    ButtonModule,
    RouterLink,
    TooltipModule,
    ExportButtonsComponent,
    FilterBookingsComponent,
    BookingStatisticsOverviewComponent,
    BookingPieChartComponent,
    BookingColumnChartComponent
  ],
  providers: [MessageService, AdminBookingStatisticsPageService],
  templateUrl: './admin-booking-statistics.component.html'
})
export class AdminBookingStatisticsComponent implements OnInit {
    private readonly pageService = inject(AdminBookingStatisticsPageService);

  get isLoading() { return this.pageService.isLoading; }
  get bookings() { return this.pageService.bookings; }
  get dateRangeStart() { return this.pageService.dateRangeStart; }
  get dateRangeEnd() { return this.pageService.dateRangeEnd; }
  get dateFilterPreset() { return this.pageService.dateFilterPreset; }
  get dateFilterOptions() { return this.pageService.dateFilterOptions; }
  get filteredBookings() { return this.pageService.filteredBookings; }
  get chartOptions() { return this.pageService.chartOptions; }
  get statusStats() { return this.pageService.statusStats; }
  get topProducts() { return this.pageService.topProducts; }
  get statusChartData() { return this.pageService.statusChartData; }
  get topProductsChartData() { return this.pageService.topProductsChartData; }

  ngOnInit(): void {
    this.pageService.loadData();
  }

  refreshData() {
    this.pageService.refreshData();
  }

  exportStatistics() {
    this.pageService.exportStatistics();
  }

  exportStatisticsAsPdf() {
    this.pageService.exportStatisticsAsPdf();
  }

  onDateFilterPresetChange() {
    this.pageService.onDateFilterPresetChange();
  }

  clearDateFilter() {
    this.pageService.clearDateFilter();
  }

  handlePresetChange(preset: string) {
    this.pageService.handlePresetChange(preset);
  }

  handleStartDateChange(date: Date | null) {
    this.pageService.handleStartDateChange(date);
  }

  handleEndDateChange(date: Date | null) {
    this.pageService.handleEndDateChange(date);
  }
}

