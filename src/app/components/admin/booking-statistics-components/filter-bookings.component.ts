import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { BookingsDatePickerComponent } from './bookings-date-picker.component';

@Component({
  selector: 'app-filter-bookings',
  standalone: true,
  imports: [CommonModule, CardModule, BookingsDatePickerComponent],
  template: `
    <div class="px-2">
      <p-card class="shadow-sm border border-gray-100">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <i class="pi pi-filter text-[#253359]"></i>
            Filter & Zeitraum wählen
          </h2>
        </div>

        <app-bookings-date-picker
          [dateFilterOptions]="dateFilterOptions"
          [dateFilterPreset]="dateFilterPreset"
          [dateRangeStart]="dateRangeStart"
          [dateRangeEnd]="dateRangeEnd"
          [filteredCount]="filteredCount"
          [totalCount]="totalCount"
          (dateFilterPresetChange)="onPresetChange($event)"
          (dateRangeStartChange)="onStartDateChange($event)"
          (dateRangeEndChange)="onEndDateChange($event)"
          (presetChange)="onDateFilterPresetChange()"
          (clearFilter)="onClearFilter()">
        </app-bookings-date-picker>
      </p-card>
    </div>
  `
})
export class FilterBookingsComponent {
  @Input() dateFilterOptions: any[] = [];
  @Input() dateFilterPreset: string = '';
  @Input() dateRangeStart: Date | null = null;
  @Input() dateRangeEnd: Date | null = null;
  @Input() filteredCount: number = 0;
  @Input() totalCount: number = 0;

  @Input() onDateFilterPresetChange!: () => void;
  @Input() onClearFilter!: () => void;
  @Input() onPresetChange!: (preset: string) => void;
  @Input() onStartDateChange!: (date: Date | null) => void;
  @Input() onEndDateChange!: (date: Date | null) => void;
}

