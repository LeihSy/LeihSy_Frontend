import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FilledButtonComponent } from '../../components/buttons/filled-button/filled-button.component';
import { MenuCardComponent } from '../../components/menu-card/menu-card.component';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { BookingTransactionService } from '../../services/booking-transaction.service';

@Component({
  selector: 'app-lender-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ToastModule,
    FilledButtonComponent,
    MenuCardComponent,
    QrScannerComponent,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './lender-dashboard.component.html',
  styleUrls: ['./lender-dashboard.component.scss']
})
export class LenderDashboardComponent {
  private readonly transactionService = inject(BookingTransactionService);
  private readonly messageService = inject(MessageService);

  scannerVisible = false;
  isProcessing = false;

  openScanner() {
    this.scannerVisible = true;
    this.isProcessing = false;
  }

  // Diese Methode wird aufgerufen, wenn gescannt ODER getippt wurde
  onScanned(rawValue: string) {
    // 1. Verhindern, dass doppelt gesendet wird
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('Empfangener Code:', rawValue);

    // 2. Scanner sofort schließen
    this.scannerVisible = false;

    // 3. Token extrahieren
    // Falls eine ganze URL gescannt wurde (http://.../qr-action/TOKEN), nehmen wir nur den hinteren Teil
    let token = rawValue;
    if (rawValue.includes('/qr-action/')) {
      const parts = rawValue.split('/qr-action/');
      // Nimmt den Teil nach dem letzten slash
      token = parts.at(-1) ?? token;
    }
    // Falls Query-Parameter dranhängen sollten (z.B. ?foo=bar), entfernen
    if (token.includes('?')) {
      token = token.split('?')[0];
    }

    // 4. User Feedback geben ("Lade...")
    this.messageService.add({
      severity: 'info',
      summary: 'Verarbeite...',
      detail: 'Prüfe Token und Status',
      life: 2000
    });

    // 5. Backend aufrufen
    this.transactionService.executeTransaction(token).subscribe({
      next: (booking) => {
        const action = booking.status === 'PICKED_UP' ? 'ausgegeben' : 'zurückgenommen';

        this.messageService.add({
          severity: 'success',
          summary: 'Erfolgreich',
          detail: `Artikel ${booking.itemInvNumber} wurde erfolgreich ${action}.`,
          life: 5000
        });
        this.isProcessing = false;
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Unbekannter Fehler';

        // Übersetze häufige Fehler für den User
        let userMsg = msg;
        if (msg.includes('expired')) userMsg = 'Dieser Token ist abgelaufen.';
        if (msg.includes('used')) userMsg = 'Dieser Token wurde bereits verwendet.';
        if (msg.includes('found')) userMsg = 'Token ungültig oder nicht gefunden.';

        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: userMsg,
          life: 5000
        });
        this.isProcessing = false;
      }
    });
  }
}
