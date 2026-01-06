import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableComponent, ColumnDef } from '../../table/table.component';

@Component({
  selector: 'app-groups-table-card',
  standalone: true,
  imports: [CommonModule, CardModule, TableComponent],
  template: `
    <p-card>
      @if (loading) {
        <div class="text-center py-8">
          <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
          <p class="mt-2 text-gray-600">{{ loadingMessage }}</p>
        </div>
      } @else if (groups.length === 0 && !error) {
        <div class="text-center py-8">
          <i class="pi pi-users text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-600 text-lg">{{ emptyTitle }}</p>
          <p class="text-gray-500 text-sm mt-2">{{ emptyMessage }}</p>
        </div>
      } @else {
        <app-table
          [columns]="columns"
          [data]="groups"
          [loading]="loading"
          [paginator]="paginator"
          [rows]="rows"
          [rowClickable]="rowClickable"
          (rowSelect)="onRowSelect($event)">
        </app-table>
      }
    </p-card>
  `
})
export class GroupsTableCardComponent {
  @Input() groups: any[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() loading = false;
  @Input() error = false;
  @Input() paginator = true;
  @Input() rows = 10;
  @Input() rowClickable = true;
  @Input() loadingMessage = 'Lade Gruppen...';
  @Input() emptyTitle = 'Sie sind noch in keiner Gruppe';
  @Input() emptyMessage = 'Sobald Sie einer Gruppe beitreten, wird diese hier angezeigt.';

  @Output() rowSelect = new EventEmitter<any>();

  onRowSelect(event: any): void {
    this.rowSelect.emit(event);
  }
}

