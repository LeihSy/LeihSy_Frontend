import { Component, input, Output, EventEmitter, model, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';

import {InsyImportRequest, ProductOption} from '../../../../../models/insy-import.model';

export interface Category {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  roomNr: string;
}

export interface Product {
  id: number;
  name: string;
  categoryName?: string;
}

export interface ImportDialogResult {
  type: 'NEW_PRODUCT' | 'EXISTING_PRODUCT';
  productId?: number;
  categoryId?: number;
  locationId?: number;
  price?: number;
  expiryDate?: number;
}

@Component({
  selector: 'app-insy-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DialogModule,
    ButtonModule,
    SelectModule,
    InputNumberModule,
    RadioButtonModule
  ],
  templateUrl: './insy-import-dialog.component.html'
})
export class InsyImportDialogComponent {
  // Inputs
  visible = model<boolean>(false);
  request = input<InsyImportRequest | null>(null);
  categories = input<Category[]>([]);
  locations = input<Location[]>([]);
  products = input<ProductOption[]>([]);

  // Output
  @Output() confirm = new EventEmitter<ImportDialogResult>();

  // Local state
  importType = signal<'NEW_PRODUCT' | 'EXISTING_PRODUCT'>('NEW_PRODUCT');
  selectedProductId: number | null = null;
  selectedCategoryId: number | null = null;
  selectedLocationId: number | null = null;
  importPrice: number | null = null;
  importExpiryDate: number | null = 14;

  // Computed: Ist Formular valide?
  isValid = computed(() => {
    if (this.importType() === 'EXISTING_PRODUCT') {
      return this.selectedProductId !== null;
    } else {
      return this.selectedCategoryId !== null && this.selectedLocationId !== null;
    }
  });

  // Reset wenn Dialog geoeffnet wird
  onShow(): void {
    const req = this.request();
    if (req?.hasMatchingProduct && req?.matchingProductId) {
      this.importType.set('EXISTING_PRODUCT');
      this.selectedProductId = req.matchingProductId;
    } else {
      this.importType.set('NEW_PRODUCT');
      this.selectedProductId = null;
    }
    this.selectedCategoryId = null;
    this.selectedLocationId = null;
    this.importPrice = null;
    this.importExpiryDate = 14;
  }

  onConfirm(): void {
    if (!this.isValid()) return;

    const result: ImportDialogResult = {
      type: this.importType()
    };

    if (this.importType() === 'EXISTING_PRODUCT') {
      result.productId = this.selectedProductId!;
    } else {
      result.categoryId = this.selectedCategoryId!;
      result.locationId = this.selectedLocationId!;
      result.price = this.importPrice || undefined;
      result.expiryDate = this.importExpiryDate || undefined;
    }

    this.confirm.emit(result);
    this.visible.set(false);
  }

  onCancel(): void {
    this.visible.set(false);
  }
}
