import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FilledButtonComponent } from '../../buttons/filled-button/filled-button.component';
import { SecondaryButtonComponent } from '../../buttons/secondary-button/secondary-button.component';

export interface GroupFormModel {
  name: string;
  description?: string;
  budget?: number;
}

@Component({
  selector: 'app-group-form-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    FilledButtonComponent,
    SecondaryButtonComponent
  ],
  template: `
    <p-card [header]="header">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="name" class="font-bold">Name</label>
          <input
            pInputText
            id="name"
            [(ngModel)]="model.name"
            placeholder="z.B. Lerngruppe Informatik" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="desc" class="font-bold">Beschreibung</label>
          <textarea
            pInputTextarea
            id="desc"
            [(ngModel)]="model.description"
            rows="5"
            [autoResize]="true">
          </textarea>
        </div>

        <div class="flex flex-col gap-2">
          <label for="budget" class="font-bold">Budget (€)</label>
          <p-inputNumber
            id="budget"
            [(ngModel)]="model.budget"
            mode="currency"
            currency="EUR"
            locale="de-DE"
            [min]="0"
            [minFractionDigits]="2"
            [maxFractionDigits]="2"
            placeholder="z.B. 1000.00">
          </p-inputNumber>
          <small class="text-gray-500">Optional: Legen Sie ein Budget für diese Gruppe fest</small>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <app-secondary-button
            label="Abbrechen"
            color="red"
            (buttonClick)="onCancel()">
          </app-secondary-button>
          <app-filled-button
            [label]="saveLabel"
            icon="pi pi-check"
            (buttonClick)="onSave()">
          </app-filled-button>
        </div>

        @if (errorMessage) {
          <small class="text-red-500">{{ errorMessage }}</small>
        }
      </div>
    </p-card>
  `
})
export class GroupFormCardComponent {
  @Input() header = 'Neue Studentengruppe erstellen';
  @Input() saveLabel = 'Gruppe speichern';
  @Input() model: GroupFormModel = { name: '', description: '', budget: 0 };
  @Input() errorMessage = '';

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onSave(): void {
    this.save.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

