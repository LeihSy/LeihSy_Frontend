import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { QRCodeComponent } from 'angularx-qrcode';
import { BookingQrService } from '../../services/booking-qr.service';

@Component({
  selector: 'app-booking-qr',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, QRCodeComponent],
  styles: `
    :host ::ng-deep qrcode img { width: 200px; height: 200px; margin: 0 auto; }
  `,
  template: `
    <p-dialog header="Buchungs-QR-Code" [(visible)]="visible" [modal]="true" [draggable]="false" [style]="{width: '350px'}">
      <div class="flex flex-col items-center text-center gap-4">
        @if (qrData) {
          <qrcode [qrdata]="qrData" [elementType]="'img'" [width]="200" [errorCorrectionLevel]="'M'"></qrcode>
          <p class="text-sm text-gray-600 font-medium">
            Diesen Code beim Verleiher vorzeigen, um die Abholung oder Rückgabe zu bestätigen.
          </p>
        }

        <div class="w-full flex justify-center mt-4">
          <button pButton label="Schließen" icon="pi pi-times" (click)="close()"></button>
        </div>
      </div>
    </p-dialog>
  `
})
export class BookingQrComponent implements OnChanges {
  @Input() visible = false;
  @Input() bookingId!: number;
  @Output() closed = new EventEmitter<void>();

  private qrService = inject(BookingQrService);
  qrData?: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookingId'] && this.bookingId) {
      // Nur noch eine URL nötig, da die Ziel-Seite den Status prüft
      this.qrData = this.qrService.buildActionUrl(this.bookingId);
    }
  }

  close(): void {
    this.visible = false;
    this.closed.emit();
  }
}
