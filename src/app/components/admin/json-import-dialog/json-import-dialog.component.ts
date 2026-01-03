import { Component, Input, Output, EventEmitter, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { FilledButtonComponent } from '../../buttons/filled-button/filled-button.component';
import { SecondaryButtonComponent } from '../../buttons/secondary-button/secondary-button.component';

@Component({
  selector: 'app-json-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TextareaModule,
    FormsModule,
    FilledButtonComponent,
    SecondaryButtonComponent
  ],
  template: `
    <p-dialog
      [header]="header"
      [visible]="visible"
      [modal]="true"
      [style]="{width: '800px', maxHeight: '80vh'}"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onClose()">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-gray-600">
          Fügen Sie den JSON-String ein, den Sie vom Benutzer erhalten haben:
        </p>

        <div class="flex flex-col gap-2">
          <label [for]="inputId" class="font-bold">JSON-Daten</label>
          <textarea
            pInputTextarea
            [id]="inputId"
            [ngModel]="jsonInput()"
            (ngModelChange)="onJsonChange($event)"
            rows="15"
            class="w-full font-mono text-sm"
            [placeholder]="placeholder"
            [autoResize]="true">
          </textarea>
          <small class="text-gray-500">
            {{ helperText }}
          </small>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <app-secondary-button
          label="Abbrechen"
          color="red"
          (buttonClick)="onCancel()">
        </app-secondary-button>
        <app-filled-button
          [label]="submitButtonLabel"
          icon="pi pi-check"
          (buttonClick)="onSubmit()">
        </app-filled-button>
      </ng-template>
    </p-dialog>
  `
})
export class JsonImportDialogComponent {
  @Input() header = '';
  @Input() visible = false;
  @Input() inputId = 'jsonInput';
  @Input() placeholder = '{"type": "...", "timestamp": "...", "payload": {...}}';
  @Input() helperText = 'Erwartetes Format: JSON mit "payload" Objekt';
  @Input() submitButtonLabel = 'Erstellen';
  @Input() jsonInput!: WritableSignal<string>;

  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  onClose(): void {
    // Dialog wird geschlossen
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    this.submit.emit();
  }

  onJsonChange(value: string): void {
    this.jsonInput.set(value);
  }
}

