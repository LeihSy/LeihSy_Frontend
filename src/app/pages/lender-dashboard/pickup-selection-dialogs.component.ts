import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker'; 
import { TextareaModule } from 'primeng/textarea';

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
    TextareaModule   
  ],
  
  templateUrl: './pickup-selection-dialogs.component.html'
})
export class PickupSelectionDialogComponent {
  @Input() visible = false;
  @Input() proposedPickups: any[] = []; 
  @Input() canSelectProposed = true; 

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() pickupSelected = new EventEmitter<{selectedPickup: string; message: string}>();
  @Output() newPickupsProposed = new EventEmitter<{newPickups: string[]; message: string}>();
  @Output() cancelled = new EventEmitter<void>();

  selectedPickup: any = null; 
  newPickupDates: (Date | null)[] = [null, null, null];
  minDate = new Date(); 
  message = '';

  
  private parseToDate(dateInput: any): Date | null {
    if (!dateInput) return null;
    
    
    if (Array.isArray(dateInput)) {
      const year = dateInput[0];
      const month = dateInput[1] - 1; 
      const day = dateInput[2];
      const hour = dateInput[3] || 0;
      const minute = dateInput[4] || 0;
      return new Date(year, month, day, hour, minute);
    }
    
  
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }

 
  private toLocalIsoString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':00';
  }


  selectExistingPickup(pickup: any): void {
    this.selectedPickup = pickup;
    this.newPickupDates = [null, null, null];
  }

  clearNewPickup(index: number): void {
    this.newPickupDates[index] = null;
  }

  canConfirm(): boolean {
    return !!this.selectedPickup || this.newPickupDates.some(d => d !== null);
  }

  formatDateTime(dateInput: any): string {
    const date = this.parseToDate(dateInput); 
    
    if (!date) return 'Ungültiges Datum';

    return date.toLocaleString('de-DE', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute:'2-digit' 
    }) + ' Uhr';
  }

  onConfirm(): void {
    // Bestehenden Termin auswählen
    if (this.selectedPickup) {
      const dateObj = this.parseToDate(this.selectedPickup);
      
      if (dateObj) {
        const isoString = this.toLocalIsoString(dateObj);
        
        this.pickupSelected.emit({
          selectedPickup: isoString,
          message: this.message.trim()
        });
      } else {
        console.error('Ungültiges Datum ausgewählt:', this.selectedPickup);
      }
    } 
    // Neue Termine vorschlagen
    else {
      const newPickups = this.newPickupDates
        .filter((d): d is Date => d !== null)
        .map(d => this.toLocalIsoString(d!));

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