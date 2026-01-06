import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-bookings-search-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    TooltipModule
  ],
  template: `
    <p-card class="shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex flex-col space-y-4">
        <div class="flex items-center gap-3">
          <p-iconfield iconPosition="left" class="flex-1">
            <p-inputicon class="pi pi-search text-gray-400"></p-inputicon>
            <input
              type="text"
              pInputText
              placeholder="Suche nach Benutzer, Produkt, Inventarnummer..."
              [value]="searchQuery"
              (input)="onSearchChange($event)"
              class="w-full !border-gray-200 focus:!ring-blue-500/20" />
          </p-iconfield>

          @if (searchQuery) {
            <button
              pButton
              icon="pi pi-times"
              class="p-button-text p-button-rounded p-button-secondary"
              (click)="onClearSearch()"
              pTooltip="Suche zurücksetzen">
            </button>
          }
        </div>

        @if (selectedView !== 'all') {
          <div class="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl animate-in fade-in duration-300">
            <div class="flex items-center gap-3">
              <div class="bg-blue-600 p-1.5 rounded-lg">
                <i class="pi pi-filter text-white text-xs"></i>
              </div>
              <span class="text-sm text-blue-900">
                Ansicht gefiltert nach:
                @switch (selectedView) {
                  @case ('current') { <strong class="font-semibold text-blue-700">Aktuelle Ausleihen</strong> }
                  @case ('overdue') { <strong class="font-semibold text-red-600">Überfällige Ausleihen</strong> }
                  @case ('pending') { <strong class="font-semibold text-amber-600">Offene Anfragen</strong> }
                  @case ('confirmed') { <strong class="font-semibold text-emerald-600">Bestätigt, nicht abgeholt</strong> }
                  @case ('future') { <strong class="font-semibold text-indigo-600">Zukünftige Ausleihen</strong> }
                }
              </span>
            </div>
            <button
              pButton
              label="Filter aufheben"
              icon="pi pi-filter-slash"
              class="p-button-text p-button-sm !text-blue-600 font-medium"
              (click)="onClearFilter()">
            </button>
          </div>
        }
      </div>
    </p-card>
  `
})
export class BookingsSearchFilterComponent {
  @Input() searchQuery: string = '';
  @Input() selectedView: string = 'all';

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() clearFilter = new EventEmitter<void>();

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQueryChange.emit(value);
  }

  onClearSearch(): void {
    this.searchQueryChange.emit('');
  }

  onClearFilter(): void {
    this.clearFilter.emit();
  }
}

