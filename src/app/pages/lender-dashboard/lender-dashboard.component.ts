import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MenuCardComponent } from '../../components/menu-card/menu-card.component';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-lender-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    MenuCardComponent,
    QrScannerComponent
  ],
  templateUrl: './lender-dashboard.component.html',
  styleUrls: ['./lender-dashboard.component.scss']
})
export class LenderDashboardComponent {
  // Logic for managing requests will go here

  scannerVisible = false;

  openScanner() {
    this.scannerVisible = true;
  }

  onScanned(value: string) {
    console.log('QR scanned:', value);
    // Einfaches Verhalten: öffne die URL oder navigiere
    try {
      if (value.startsWith('http')) {
        window.open(value, '_blank');
      } else {
        // Für Aktionen im System könnte hier Routing erfolgen
        alert('Gescannter Wert: ' + value);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
