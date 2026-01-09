import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { CardModule } from 'primeng/card';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { SecondaryButtonComponent } from '../../../components/buttons/secondary-button/secondary-button.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { BookingQrComponent } from './booking-qr.component';
import { PickupSelectionDialogComponent } from '../../../components/booking-pickup-selection/pickup-selection-dialog.component';
import { BookingHeaderComponent } from '../../../components/booking-components/booking-header/booking-header.component';
import { BookingProgressComponent } from '../../../components/admin/booking-components/booking-progress.component';
import { BookingMessageComponent } from '../../../components/admin/booking-components/booking-message.component';
import { InfoCardComponent } from '../../../components/info-card/info-card.component';
import { BookingDetailService } from './page-services/booking-detail.service';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    FilledButtonComponent,
    SecondaryButtonComponent,
    BackButtonComponent,
    ButtonModule,
    TagModule,
    DividerModule,
    TimelineModule,
    ToastModule,
    ConfirmDialogModule,
    BookingQrComponent,
    PickupSelectionDialogComponent,
    BookingHeaderComponent,
    BookingProgressComponent,
    BookingMessageComponent,
    InfoCardComponent
  ],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss'],
  providers: [MessageService, ConfirmationService, BookingDetailService]
})
export class BookingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  readonly pageService = inject(BookingDetailService);

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

  openQrDialog(): void {
    this.pageService.openQrDialog();
  }

  onQrClosed(): void {
    this.pageService.closeQrDialog();
  }

  openPickupDialog(): void {
    this.pageService.openPickupDialog();
  }

  onPickupDialogVisibleChange(visible: boolean): void {
    this.pageService.showPickupDialog.set(visible);
  }

  onPickupSelected(event: {selectedPickup: string; message: string}): void {
    this.pageService.selectPickupDate(event.selectedPickup, event.message);
  }

  onNewPickupsProposed(event: {newPickups: string[]; message: string}): void {
    this.pageService.proposeNewPickups(event.newPickups, event.message);
  }

  onPickupDialogCancelled(): void {
    this.pageService.closePickupDialog();
  }

  goBack(): void {
    this.pageService.goBack();
  }

  exportToPdf(): void {
    this.pageService.exportToPdf();
  }

  cancelBooking(): void {
    this.pageService.cancelBooking();
  }
}

