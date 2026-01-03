import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { BookingLoadingScreenComponent } from '../../../components/admin/booking-components/booking-loading-screen.component';
import { BookingGridComponent } from '../../../components/admin/booking-components/booking-grid.component';
import { BookingMessageComponent } from '../../../components/admin/booking-components/booking-message.component';
import { AppointmentsAndDataComponent } from '../../../components/admin/booking-components/appointments-and-data.component';
import { BookingProgressComponent } from '../../../components/admin/booking-components/booking-progress.component';
import { AdminBookingDetailPageService } from './page-services/admin-booking-detail-page.service';

@Component({
  selector: 'app-admin-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    TimelineModule,
    ToastModule,
    BackButtonComponent,
    BookingLoadingScreenComponent,
    BookingGridComponent,
    BookingMessageComponent,
    AppointmentsAndDataComponent,
    BookingProgressComponent
  ],
  templateUrl: './admin-booking-detail.component.html',
  providers: [MessageService, AdminBookingDetailPageService]
})
export class AdminBookingDetailComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly pageService: AdminBookingDetailPageService,
    private readonly messageService: MessageService
  ) {}

  // Delegiere alle Signals an den Service
  get booking() { return this.pageService.booking; }
  get isLoading() { return this.pageService.isLoading; }
  get timelineEvents() { return this.pageService.timelineEvents; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pageService.loadBookingDetails(Number.parseInt(id, 10));
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Keine Buchungs-ID gefunden.'
      });
      this.pageService.goBack();
    }
  }

  getStatusSeverity(status: any) {
    return this.pageService.getStatusSeverity(status);
  }

  getStatusLabel(status: any) {
    return this.pageService.getStatusLabel(status);
  }

  formatDateTime(date: any) {
    return this.pageService.formatDateTime(date);
  }

  formatDate(dateString: string) {
    return this.pageService.formatDate(dateString);
  }

  getCardData() {
    return this.pageService.getCardData();
  }

  goBack() {
    this.pageService.goBack();
  }
}

