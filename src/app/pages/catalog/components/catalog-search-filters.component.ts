import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { BadgeModule } from 'primeng/badge';

export interface CatalogFilters {
  searchQuery: string;
  selectedCategory: string;
  selectedCampus: string;
  availabilityFilter: string;
  dateRange: Date[];
}

@Component({
  selector: 'app-catalog-search-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    FilledButtonComponent,
    BadgeModule
  ],
  templateUrl: './catalog-search-filters.component.html',
  styleUrls: ['./catalog-search-filters.component.scss']
})
export class CatalogSearchFiltersComponent {
  @Input() searchQuery = '';
  @Input() selectedCategory = '';
  @Input() selectedCampus = '';
  @Input() availabilityFilter = '';
  @Input() dateRange: Date[] = [];
  @Input() categories: string[] = [];
  @Input() campuses: string[] = [];
  @Input() availabilityOptions: any[] = [];
  @Input() tomorrow: Date = new Date();
  @Input() monthsToShow = 1;
  @Input() resultCount = 0;
  @Input() formattedDateRange = '';

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedCategoryChange = new EventEmitter<string>();
  @Output() selectedCampusChange = new EventEmitter<string>();
  @Output() availabilityFilterChange = new EventEmitter<string>();
  @Output() dateRangeChange = new EventEmitter<Date[]>();
  @Output() applyFilters = new EventEmitter<void>();

  onSearchQueryChange(value: string): void {
    this.searchQueryChange.emit(value);
    this.applyFilters.emit();
  }

  onCategoryChange(): void {
    this.selectedCategoryChange.emit(this.selectedCategory);
    this.applyFilters.emit();
  }

  onCampusChange(): void {
    this.selectedCampusChange.emit(this.selectedCampus);
    this.applyFilters.emit();
  }

  onAvailabilityChange(): void {
    this.availabilityFilterChange.emit(this.availabilityFilter);
    this.applyFilters.emit();
  }

  onDateRangeChange(): void {
    this.dateRangeChange.emit(this.dateRange);
    this.applyFilters.emit();
  }

  onDateClear(): void {
    this.applyFilters.emit();
  }
}

