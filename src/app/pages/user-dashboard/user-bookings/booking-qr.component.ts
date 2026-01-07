import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { QRCodeComponent } from 'angularx-qrcode';
import { BookingTransactionService } from '../../../services/booking-transaction.service';

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
            <p>Generiere QR-Code...</p>
          </div>
        }

        @else if (error()) {
          <div class="text-red-600 p-4 bg-red-50 rounded-lg w-full">
            <i class="pi pi-exclamation-triangle block text-2xl mb-2"></i>
            {{ error() }}
            <button pButton label="Erneut versuchen" class="p-button-sm p-button-danger mt-4" (click)="generateToken()"></button>
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
            <p class="text-sm font-semibold" [ngClass]="{'text-red-600': isExpired(), 'text-gray-600': !isExpired()}">
              @if (isExpired()) {
                Code abgelaufen
              } @else {
                Gültig für: <span class="font-mono text-lg ml-1">{{ timeLeft() }}</span>
              }
            </p>

            @if (isExpired()) {
              <button pButton label="Neuen Code generieren" class="p-button-sm p-button-outlined p-button-secondary mt-2" (click)="generateToken()"></button>
            }
          </div>

          <p class="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded text-left w-full">
            <i class="pi pi-info-circle mr-1"></i>
            Zeigen Sie diesen Code dem Verleiher, um die
            <strong>{{ headerTitle() }}</strong> zu bestätigen.
          </p>
        }

        <div class="w-full flex justify-end mt-4 pt-4 border-t border-gray-100">
          <button pButton label="Schließen" class="p-button-outlined" (click)="close()"></button>
        </div>
      </div>
    </p-dialog>
  `
})
export class BookingQrComponent implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() bookingId!: number;
  @Input() bookingStatus!: string;
  @Output() closed = new EventEmitter<void>();

  private readonly transactionService = inject(BookingTransactionService);
  private timerInterval: any = null;

  qrData = signal<string | null>(null);
  currentToken = signal<string>('');
  loading = signal(false);
  error = signal<string | null>(null);
  headerTitle = signal<string>('QR Code');

  // Timer Signals
  timeLeft = signal<string>('15:00');
  isExpired = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.bookingId) {
      this.initTransaction();
    } else if (changes['visible'] && !this.visible) {
      this.stopTimer(); // Timer stoppen wenn Dialog zugeht
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private initTransaction(): void {
    if (this.bookingStatus === 'CONFIRMED') {
      this.headerTitle.set('Abholung bestätigen');
    } else if (this.bookingStatus === 'PICKED_UP') {
      this.headerTitle.set('Rückgabe bestätigen');
    } else {
      this.headerTitle.set('QR Code');
    }

    this.generateToken();
  }

  generateToken(): void {
    this.loading.set(true);
    this.error.set(null);
    this.qrData.set(null);
    this.stopTimer();

    this.transactionService.generateToken(this.bookingId).subscribe({
      next: (response) => {
        this.currentToken.set(response.token);

        // URL bauen
        const url = `${globalThis.location.origin}/qr-action/${response.token}`;
        this.qrData.set(url);

        // Timer starten basierend auf expiresAt vom Server
        this.startTimer(response.expiresAt);

        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Fehler: ' + (err.error?.message || 'Konnte Code nicht generieren'));
        this.loading.set(false);
      }
    });
  }

  private startTimer(expiresAtIso: string): void {
    const expiresAt = new Date(expiresAtIso).getTime();
    this.isExpired.set(false);

    this.updateTime(expiresAt);

    this.timerInterval = setInterval(() => {
      this.updateTime(expiresAt);
    }, 1000);
  }

  private updateTime(expiresAt: number): void {
    const now = Date.now();
    const diff = expiresAt - now;

    if (diff <= 0) {
      this.timeLeft.set('00:00');
      this.isExpired.set(true);
      this.stopTimer();
    } else {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      const secStr = seconds < 10 ? '0' + seconds : seconds;
      this.timeLeft.set(`${minStr}:${secStr}`);
    }
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  close(): void {
    this.visible = false;
    this.stopTimer();
    this.qrData.set(null);
    this.error.set(null);
    this.closed.emit();
  }
}
