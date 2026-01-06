import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { QrScannerComponent } from '../../../components/qr-scanner/qr-scanner.component';
import { PrivateLendService } from './private-lend.service';
import { MenuCardComponent } from '../../../components/menu-card/menu-card.component';

@Component({
  selector: 'app-private-lend',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CardModule, MenuCardComponent],
  templateUrl: './private-lend.component.html',
  styleUrls: []
})
export class PrivateLendComponent {
  productName = '';
  description = '';
  brand = '';
  model = '';
  serialNumber = '';
  itemCondition = 'GOOD';
  inventoryNumber = '';

  jsonPreview = '';

  private svc = inject(PrivateLendService);

  buildJson() {
    const item = {
      productName: this.productName,
      description: this.description,
      brand: this.brand || null,
      model: this.model || null,
      serialNumber: this.serialNumber || null,
      condition: this.itemCondition,
      locationId: 'privat',
      inventoryNumber: this.inventoryNumber ? `PRV-${this.inventoryNumber}` : `PRV-${Date.now()}`
    };

    const payload = {
      createdBy: 'current-user',
      type: 'private-lend-offer',
      item
    };

    this.jsonPreview = JSON.stringify(payload, null, 2);
    return payload;
  }

  sendByEmail() {
    const payload = this.buildJson();
    this.svc.sendAsEmail(JSON.stringify(payload, null, 2));
  }
}

