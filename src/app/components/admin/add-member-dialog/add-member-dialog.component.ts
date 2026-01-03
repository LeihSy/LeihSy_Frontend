import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SecondaryButtonComponent } from '../../buttons/secondary-button/secondary-button.component';
import { FilledButtonComponent } from '../../buttons/filled-button/filled-button.component';

export interface UserPreview {
  name: string;
  email: string;
}

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputNumberModule,
    SecondaryButtonComponent,
    FilledButtonComponent
  ],
  template: `
    <p-dialog
      [header]="header"
      [(visible)]="visible"
      [modal]="true"
      [style]="{width: '500px'}"
      (onHide)="onHide()">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label [for]="inputId" class="font-bold">{{ inputLabel }}</label>
          <p-inputNumber
            [id]="inputId"
            [(ngModel)]="memberId"
            (ngModelChange)="onMemberIdChange($event)"
            [min]="0"
            [useGrouping]="false"
            [placeholder]="inputPlaceholder"
            class="w-full">
          </p-inputNumber>
          <small class="text-gray-500">{{ inputHint }}</small>
        </div>

        @if (loadingPreview) {
          <div class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
            <i class="pi pi-spin pi-spinner text-blue-600"></i>
            <span class="text-sm text-blue-700">{{ loadingMessage }}</span>
          </div>
        }

        @if (userPreview && !loadingPreview) {
          <div class="p-3 bg-green-50 border border-green-200 rounded">
            <div class="flex items-center gap-2 mb-2">
              <i class="pi pi-check-circle text-green-600"></i>
              <span class="font-bold text-green-700">{{ successMessage }}</span>
            </div>
            <div class="text-sm">
              <p><strong>Name:</strong> {{ userPreview.name }}</p>
              <p><strong>Unique ID:</strong> {{ userPreview.email }}</p>
            </div>
          </div>
        }

        @if (errorMessage) {
          <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            {{ errorMessage }}
          </div>
        }
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <app-secondary-button
            [label]="cancelLabel"
            color="red"
            (buttonClick)="onCancel()">
          </app-secondary-button>
          @if (userPreview && !loadingPreview && !adding) {
            <app-filled-button
              [label]="confirmLabel"
              icon="pi pi-check"
              (buttonClick)="onConfirm()">
            </app-filled-button>
          }
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class AddMemberDialogComponent {
  @Input() visible = false;
  @Input() header = 'Mitglied hinzufügen';
  @Input() inputId = 'newMemberId';
  @Input() inputLabel = 'User ID';
  @Input() inputPlaceholder = 'z.B. 5';
  @Input() inputHint = 'Geben Sie die User-ID des hinzuzufügenden Mitglieds ein';
  @Input() loadingMessage = 'Lade Benutzer-Vorschau...';
  @Input() successMessage = 'Benutzer gefunden';
  @Input() cancelLabel = 'Abbrechen';
  @Input() confirmLabel = 'Hinzufügen';
  @Input() memberId: number | null = null;
  @Input() userPreview: UserPreview | null = null;
  @Input() loadingPreview = false;
  @Input() adding = false;
  @Input() errorMessage = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() memberIdChange = new EventEmitter<number | null>();
  @Output() cancelDialog = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onMemberIdChange(value: number | null): void {
    this.memberIdChange.emit(value);
  }

  onCancel(): void {
    this.cancelDialog.emit();
    this.onHide();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}

