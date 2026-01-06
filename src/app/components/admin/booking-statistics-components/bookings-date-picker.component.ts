import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { SecondaryButtonComponent } from '../../buttons/secondary-button/secondary-button.component';

@Component({
  selector: 'app-bookings-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DatePicker, SecondaryButtonComponent],
  template: `
    <div class="flex flex-wrap items-end gap-6">
      <div class="flex flex-col gap-2">
        <label for="datePreset" class="text-sm font-medium text-gray-600">Zeitraum</label>
        <p-select
          inputId="datePreset"
          [options]="dateFilterOptions"
          [(ngModel)]="dateFilterPreset"
          (onChange)="onPresetChange()"
          optionLabel="label"
          optionValue="value"
          placeholder="Zeitraum wählen"
          class="w-64">
        </p-select>
      </div>

      @if (dateFilterPreset === 'custom') {
        <div class="flex flex-wrap gap-6 items-end">
          <div class="flex flex-col gap-2">
            <label for="dateStart" class="text-sm font-medium text-gray-600">Von</label>
            <p-datepicker
              inputId="dateStart"
              [(ngModel)]="dateRangeStart"
              (ngModelChange)="onDateChange()"
              dateFormat="dd.mm.yy"
              [showIcon]="true"
              placeholder="Startdatum">
            </p-datepicker>
          </div>

          <div class="flex flex-col gap-2">
            <label for="dateEnd" class="text-sm font-medium text-gray-600">Bis</label>
            <p-datepicker
              inputId="dateEnd"
              [(ngModel)]="dateRangeEnd"
              (ngModelChange)="onDateChange()"
              dateFormat="dd.mm.yy"
              [showIcon]="true"
              placeholder="Enddatum">
            </p-datepicker>
          </div>
        </div>
      }

      @if (dateRangeStart || dateRangeEnd) {
        <app-secondary-button
          icon="pi pi-times"
          label="Zurücksetzen"
          color="gray"
          (buttonClick)="onClear()">
        </app-secondary-button>
      }

      <div class="flex items-center gap-2 text-sm text-gray-500 mb-2 ml-auto">
        <i class="pi pi-info-circle"></i>
        <span>{{ filteredCount }} von {{ totalCount }} Buchungen</span>
      </div>
    </div>
  `
})
export class BookingsDatePickerComponent {
  @Input() dateFilterOptions: any[] = [];
  @Input() dateFilterPreset: string = '';
  @Input() dateRangeStart: Date | null = null;
  @Input() dateRangeEnd: Date | null = null;
  @Input() filteredCount: number = 0;
  @Input() totalCount: number = 0;

  @Output() dateFilterPresetChange = new EventEmitter<string>();
  @Output() dateRangeStartChange = new EventEmitter<Date | null>();
  @Output() dateRangeEndChange = new EventEmitter<Date | null>();
  @Output() presetChange = new EventEmitter<void>();
  @Output() clearFilter = new EventEmitter<void>();

  onPresetChange(): void {
    this.dateFilterPresetChange.emit(this.dateFilterPreset);
    this.presetChange.emit();
  }

  onDateChange(): void {
    this.dateRangeStartChange.emit(this.dateRangeStart);
    this.dateRangeEndChange.emit(this.dateRangeEnd);
  }

  onClear(): void {
    this.clearFilter.emit();
  }
}

