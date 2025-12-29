import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-qr-action',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <div class="p-8 max-w-xl mx-auto text-center card shadow-lg mt-10 bg-white rounded-xl">
      <h2 class="text-2xl font-bold mb-4">QR-Code Verarbeitung</h2>

      @if (loading()) {
        <div class="flex flex-col items-center gap-2">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
          <p>Prüfe Berechtigung und Status...</p>
        </div>
      }

      @if (error()) {
        <div class="p-4 bg-red-50 text-red-700 rounded-lg mb-4 border border-red-200">
          <i class="pi pi-exclamation-triangle mr-2"></i> {{ error() }}
        </div>
      }

      @if (success()) {
        <div class="p-4 bg-green-50 text-green-700 rounded-lg mb-4 border border-green-200">
          <i class="pi pi-check-circle mr-2"></i> {{ success() }}
        </div>
      }

      <button pButton label="Zurück zum Dashboard" icon="pi pi-home"
              class="p-button-outlined mt-4" (click)="goHome()"></button>
    </div>
  `,
  providers: [MessageService]
})
export class QrActionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error.set('Ungültige Buchungs-ID.');
      return;
    }

    this.loading.set(true);

    // Reaktive Kette: User laden -> Buchung laden -> Status prüfen -> Aktion ausführen
    this.userService.getCurrentUser().pipe(
      switchMap(user => this.bookingService.getBookingById(id).pipe(
        switchMap(booking => {
          // 1. Berechtigung prüfen (Nur der Verleiher darf scannen)
          if (booking.lenderId !== user.id) {
            throw new Error('Nur der Verleiher kann diesen Code scannen.');
          }

          // 2. Status-Logik (Automatischer Wechsel)
          if (booking.status === 'CONFIRMED') {
            return this.bookingService.recordPickup(id);
          } else if (booking.status === 'PICKED_UP') {
            return this.bookingService.recordReturn(id);
          } else {
            throw new Error(`Aktion nicht möglich. Aktueller Status: ${booking.status}`);
          }
        })
      )),
      catchError(err => {
        const msg = err.message || 'Ein Fehler ist aufgetreten.';
        this.error.set(msg);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: msg });
        return of(null);
      })
    ).subscribe(result => {
      this.loading.set(false);
      if (result) {
        const msg = result.status === 'PICKED_UP' ? 'Abholung erfolgreich dokumentiert!' : 'Rückgabe erfolgreich dokumentiert!';
        this.success.set(msg);
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: msg });
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
