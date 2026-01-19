import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { FilledButtonComponent } from '../buttons/filled-button/filled-button.component';
import { SecondaryButtonComponent } from '../buttons/secondary-button/secondary-button.component';

@Component({
  selector: 'app-pickup-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    RadioButtonModule,
    TextareaModule,
    FilledButtonComponent,
    SecondaryButtonComponent
  ],
  templateUrl: './pickup-selection-dialog.component.html'
})
export class PickupSelectionDialogComponent {
  @Input() visible = false;
  @Input() proposedPickups: string[] = [];
  @Input() canSelectProposed = true; // Darf User die vorgeschlagenen Termine auswählen?
  @Input() formatDateTime!: (date: string) => string;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() pickupSelected = new EventEmitter<{selectedPickup: string; message: string}>();
  @Output() newPickupsProposed = new EventEmitter<{newPickups: string[]; message: string}>();
  @Output() cancelled = new EventEmitter<void>();

  selectedPickup: string | null = null;
  newPickupDates: (Date | null)[] = [null, null, null];
  minDate = new Date(); // Heute oder später
  message = ''; // Nachricht, die der User hinzufügen kann

  selectExistingPickup(pickup: string): void {
    if (this.selectedPickup === pickup) {
      this.selectedPickup = null;
    } else {
      this.selectedPickup = pickup;
      this.newPickupDates = [null, null, null];
    }
  }

  onNewPickupChange(): void {
    if (this.newPickupDates.some(d => d !== null)) {
      this.selectedPickup = null;
    }
  }

  clearNewPickup(index: number): void {
    this.newPickupDates[index] = null;
  }

  canConfirm(): boolean {
    // Entweder ein vorgeschlagener Termin ausgewählt ODER mindestens ein neuer Termin eingegeben
    return !!this.selectedPickup || this.newPickupDates.some(d => d !== null);
  }

  onConfirm(): void {
    if (this.selectedPickup) {
      // User hat einen vorgeschlagenen Termin ausgewählt
      this.pickupSelected.emit({
        selectedPickup: this.selectedPickup,
        message: this.message.trim()
      });
    } else {
      // User schlägt neue Termine vor
      const newPickups = this.newPickupDates
        .filter((d): d is Date => d !== null)
        .map(d => {
          // Korrigiere Zeitzone: Verwende lokale Zeit statt UTC
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          const seconds = String(d.getSeconds()).padStart(2, '0');

          // ISO-Format ohne Zeitzone-Offset (Backend interpretiert als lokale Zeit)
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        });

      if (newPickups.length > 0) {
        this.newPickupsProposed.emit({
          newPickups,
          message: this.message.trim()
        });
      }
    }

    this.resetDialog();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.resetDialog();
  }

  resetDialog(): void {
    this.selectedPickup = null;
    this.newPickupDates = [null, null, null];
    this.message = '';
    this.visibleChange.emit(false);
  }
}

