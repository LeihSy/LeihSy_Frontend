import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-bookings-table-view',
  standalone: true,
  imports: [CommonModule, CardModule, TableComponent],
  template: `
    <p-card class="shadow-md border border-gray-100">
      @if (isLoading) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="relative flex items-center justify-center">
            <i class="pi pi-spin pi-spinner text-5xl text-blue-600 opacity-20"></i>
            <i class="pi pi-spin pi-spinner-dotted text-5xl text-blue-600 absolute"></i>
          </div>
          <p class="mt-6 text-gray-500 font-medium animate-pulse">Lade Buchungsdaten...</p>
        </div>
      } @else if (filteredBookings.length === 0) {
        <div class="flex flex-col items-center justify-center py-24 text-center">
          <div class="bg-gray-100 p-6 rounded-full mb-4">
            <i class="pi pi-inbox text-5xl text-gray-400"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-800">Keine Buchungen gefunden</h3>
          <p class="text-gray-500 mt-2">
            @if (searchQuery) {
              Keine Treffer für "<span class="italic font-medium">{{searchQuery}}</span>".
            } @else {
              In dieser Kategorie liegen derzeit keine Buchungen vor.
            }
          </p>
        </div>
      } @else {
        <div class="rounded-lg overflow-hidden border border-gray-100">
          <app-table
            [columns]="columns"
            [data]="filteredBookings"
            [loading]="isLoading"
            [rows]="10"
            [paginator]="true"
            [scrollable]="true"
            [scrollHeight]="'600px'"
            [rowClickable]="true"
            (rowSelect)="onRowSelect($event)"
            emptyMessage="Keine Buchungen vorhanden">
          </app-table>
        </div>
      }
    </p-card>
  `
})
export class BookingsTableViewComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() filteredBookings: Booking[] = [];
  @Input() isLoading: boolean = false;
  @Input() searchQuery: string = '';

  @Output() rowSelect = new EventEmitter<any>();

  onRowSelect(event: any): void {
    this.rowSelect.emit(event);
  }
}

