import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { QRCodeComponent } from 'angularx-qrcode';
import { BookingTransactionService, TransactionType } from '../../../services/booking-transaction.service';

@Component({
  selector: 'app-booking-qr',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, QRCodeComponent],
  styles: `
    :host ::ng-deep qrcode img { margin: 0 auto; display: block; }
  `,
  template: `
    <p-dialog [header]="headerTitle()"
              [(visible)]="visible"
              [modal]="true"
              [draggable]="false"
              [style]="{width: '400px'}"
              (onHide)="close()">

      <div class="flex flex-col items-center text-center gap-4 py-2">

        @if (loading()) {
          <div class="py-12">
            <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
            <p>Generiere sicheren Token...</p>
          </div>
        }

        @else if (error()) {
          <div class="text-red-600 p-4 bg-red-50 rounded-lg w-full">
            <i class="pi pi-exclamation-triangle block text-2xl mb-2"></i>
            {{ error() }}
            <button pButton label="Erneut versuchen"
                    class="p-button-sm p-button-danger mt-4"
                    (click)="generateToken()"></button>
          </div>
        }

        @else if (qrData()) {
          <div class="bg-white p-2 rounded">
            <qrcode [qrdata]="qrData()!" [elementType]="'img'" [width]="220" [errorCorrectionLevel]="'M'"></qrcode>
          </div>

          <div class="text-3xl font-mono font-bold tracking-widest text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            {{ currentToken() }}
          </div>

          <div class="space-y-1">
            <p class="text-sm font-semibold">Gültig für 15 Minuten</p>
            <p class="text-xs text-gray-500">Einmalige Nutzung.</p>
          </div>

          <p class="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded text-left w-full">
            <i class="pi pi-info-circle mr-1"></i>
            Der Entleiher muss diesen Code scannen, um die
            <strong>{{ transactionType() === 'PICKUP' ? 'Abholung' : 'Rückgabe' }}</strong>
            zu bestätigen.
          </p>
        }

        <div class="w-full flex justify-end mt-4 pt-4 border-t border-gray-100">
          <button pButton label="Schließen" class="p-button-outlined" (click)="close()"></button>
        </div>
      </div>
    </p-dialog>
  `
})
export class BookingQrComponent implements OnChanges {
  @Input() visible = false;
  @Input() bookingId!: number;
  // Wir nutzen einen Setter oder Input Transformation, aber simple Input reicht hier
  @Input() bookingStatus!: string;
  @Output() closed = new EventEmitter<void>();

  private readonly transactionService = inject(BookingTransactionService);

  // State Signals
  qrData = signal<string | null>(null);
  currentToken = signal<string>('');
  loading = signal(false);
  error = signal<string | null>(null);
  transactionType = signal<TransactionType>('PICKUP');
  headerTitle = signal<string>('QR Code');

  ngOnChanges(changes: SimpleChanges): void {
    // Wenn der Dialog geöffnet wird, Prozess starten
    if (changes['visible'] && this.visible && this.bookingId) {
      this.initTransaction();
    }
  }

  private initTransaction(): void {
    // Logik: Welcher Transaktionstyp ist es?
    if (this.bookingStatus === 'CONFIRMED') {
      this.transactionType.set('PICKUP');
      this.headerTitle.set('Ausgabe bestätigen');
    } else if (this.bookingStatus === 'PICKED_UP') {
      this.transactionType.set('RETURN');
      this.headerTitle.set('Rückgabe bestätigen');
    } else {
      // Fallback
      this.transactionType.set('PICKUP');
      this.headerTitle.set('QR Code');
    }

    this.generateToken();
  }

  generateToken(): void {
    this.loading.set(true);
    this.error.set(null);
    this.qrData.set(null);

    this.transactionService.generateToken(this.bookingId, this.transactionType()).subscribe({
      next: (response) => {
        this.currentToken.set(response.token);
        // URL bauen: Origin + Route + Token
        const url = `${globalThis.location.origin}/qr-action/${response.token}`;
        this.qrData.set(url);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Fehler beim Generieren: ' + (err.error?.message || 'Unbekannt'));
        this.loading.set(false);
      }
    });
  }

  close(): void {
    this.visible = false;
    // Reset State
    this.qrData.set(null);
    this.error.set(null);
    this.closed.emit();
  }
}
