import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingTransactionService } from '../../../services/booking-transaction.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-qr-action',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule],
  template: `
    <p-toast position="bottom-right"></p-toast>

    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">

        <div class="bg-blue-600 p-6 text-center">
          <h2 class="text-2xl font-bold text-white">QR-Code Scanner</h2>
          <p class="text-blue-100 text-sm mt-1">LeihSy Transaktion</p>
        </div>

        <div class="p-8 text-center">

          @if (loading()) {
            <div class="flex flex-col items-center gap-4 py-4">
              <i class="pi pi-spin pi-spinner text-5xl text-blue-500"></i>
              <p class="text-gray-600 font-medium">Prüfe Token & Berechtigung...</p>
            </div>
          }

          @if (error()) {
            <div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
              <div class="flex justify-center mb-3">
                <div class="bg-red-100 p-3 rounded-full">
                  <i class="pi pi-times text-xl text-red-600"></i>
                </div>
              </div>
              <h3 class="text-lg font-bold text-red-800 mb-2">Fehler</h3>
              <p class="text-red-600 text-sm leading-relaxed">{{ error() }}</p>
            </div>
          }

          @if (success()) {
            <div class="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
              <div class="flex justify-center mb-3">
                <div class="bg-green-100 p-3 rounded-full">
                  <i class="pi pi-check text-xl text-green-600"></i>
                </div>
              </div>
              <h3 class="text-lg font-bold text-green-800 mb-2">Erfolgreich!</h3>
              <p class="text-green-700 mb-2">{{ success() }}</p>

              @if (bookingInfo(); as b) {
                <div class="mt-4 pt-4 border-t border-green-200 text-sm text-green-800">
                  <p><strong>Item:</strong> {{ b.itemInvNumber }}</p>
                  <p><strong>Status:</strong> {{ b.status }}</p>
                </div>
              }
            </div>
          }

          <button pButton label="Zum Dashboard"
                  icon="pi pi-home"
                  class="w-full p-button-outlined"
                  (click)="goHome()"></button>
        </div>
      </div>
    </div>
  `,
  providers: [MessageService]
})
export class QrActionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transactionService = inject(BookingTransactionService);
  private readonly messageService = inject(MessageService);

  // State Signals
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  bookingInfo = signal<any>(null);

  ngOnInit(): void {
    // Token aus URL Parameter 'id' lesen (Routing Konfiguration bleibt gleich)
    const token = this.route.snapshot.paramMap.get('id');

    if (!token) {
      this.error.set('Ungültiger Link. Kein Token in der URL gefunden.');
      return;
    }

    this.redeemToken(token);
  }

  private redeemToken(token: string) {
    this.loading.set(true);
    this.error.set(null);

    // Aufruf des neuen Service (PATCH)
    this.transactionService.executeTransaction(token).pipe(
      catchError(err => {
        const friendlyMsg = this.mapBackendError(err);
        this.error.set(friendlyMsg);
        // Toast optional, da wir die Error-Box haben
        // this.messageService.add({ severity: 'error', summary: 'Fehler', detail: friendlyMsg });
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(booking => {
      if (booking) {
        this.bookingInfo.set(booking);
        const actionText = booking.status === 'PICKED_UP' ? 'abgeholt' : 'zurückgegeben';
        const msg = `Der Artikel wurde erfolgreich ${actionText}.`;

        this.success.set(msg);
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: msg });
      }
    });
  }

  // Hilfsmethode für user-freundliche Fehlermeldungen
  private mapBackendError(err: any): string {
    const backendMsg = err.error?.message?.toLowerCase() || '';

    if (err.status === 404) return 'Dieser QR-Code existiert nicht.';
    if (backendMsg.includes('expired')) return 'Der QR-Code ist abgelaufen (Zeitlimit: 15 Min).';
    if (backendMsg.includes('used')) return 'Dieser QR-Code wurde bereits verwendet.';
    if (backendMsg.includes('authorized')) return 'Keine Berechtigung. Nur der Entleiher darf diesen Code scannen.';
    if (err.status === 409 || backendMsg.includes('status')) return 'Buchungsstatus erlaubt diese Aktion nicht.';

    return 'Ein unbekannter Fehler ist aufgetreten.';
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
