import { Component, input, Output, EventEmitter, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

import { InsyImportRequest } from '../../../../../models/insy-import.model';

@Component({
  selector: 'app-insy-reject-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TextareaModule
  ],
  templateUrl: './insy-reject-dialog.component.html'
})
export class InsyRejectDialogComponent {
  // Inputs
  visible = model<boolean>(false);
  request = input<InsyImportRequest | null>(null);

  // Output
  @Output() confirm = new EventEmitter<string | undefined>();

  // Local state
  rejectReason = '';

  onShow(): void {
    this.rejectReason = '';
  }

  onConfirm(): void {
    this.confirm.emit(this.rejectReason || undefined);
    this.visible.set(false);
    this.rejectReason = '';
  }

  onCancel(): void {
    this.visible.set(false);
    this.rejectReason = '';
  }
}
