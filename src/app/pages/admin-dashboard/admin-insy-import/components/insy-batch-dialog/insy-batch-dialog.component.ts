import { Component, input, Output, EventEmitter, model, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

export interface Product {
  id: number;
  name: string;
}

export interface BatchImportResult {
  productId: number;
  invNumberPrefix?: string;
}

@Component({
  selector: 'app-insy-batch-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    InputTextModule
  ],
  templateUrl: './insy-batch-dialog.component.html'
})
export class InsyBatchDialogComponent {
  // Inputs
  visible = model<boolean>(false);
  selectedCount = input<number>(0);
  products = input<Product[]>([]);

  // Output
  @Output() confirm = new EventEmitter<BatchImportResult>();

  // Local state
  selectedProductId = signal<number | null>(null);
  invNumberPrefix = signal('');

  isValid = computed(() => this.selectedProductId() !== null);

  onShow(): void {
    this.selectedProductId.set(null);
    this.invNumberPrefix.set('');
  }

  onConfirm(): void {
    const productId = this.selectedProductId();
    if (!productId) return;

    this.confirm.emit({
      productId: productId,
      invNumberPrefix: this.invNumberPrefix() || undefined
    });
    this.visible.set(false);
  }

  onCancel(): void {
    this.visible.set(false);
  }
}
