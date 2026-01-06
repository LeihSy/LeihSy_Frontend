import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondaryButtonComponent } from '../../buttons/secondary-button/secondary-button.component';
import { FilledButtonComponent } from '../../buttons/filled-button/filled-button.component';

@Component({
  selector: 'app-dialog-footer',
  standalone: true,
  imports: [
    CommonModule,
    SecondaryButtonComponent,
    FilledButtonComponent
  ],
  template: `
    <div class="flex justify-end gap-2">
      <app-secondary-button
        [label]="cancelLabel"
        [color]="cancelColor"
        (buttonClick)="onCancel()">
      </app-secondary-button>
      <app-filled-button
        [label]="confirmLabel"
        [icon]="confirmIcon"
        (buttonClick)="onConfirm()">
      </app-filled-button>
    </div>
  `
})
export class DialogFooterComponent {
  @Input() cancelLabel = 'Abbrechen';
  @Input() cancelColor: 'red' | 'blue' | 'gray' = 'red';
  @Input() confirmLabel = 'Bestätigen';
  @Input() confirmIcon = 'pi pi-check';
  @Input() loading = false;
  @Input() disabled = false;

  @Output() cancelDialog = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onCancel(): void {
    this.cancelDialog.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}

