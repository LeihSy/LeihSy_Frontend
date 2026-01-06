import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, ColumnDef } from '../../table/table.component';

@Component({
  selector: 'app-loan-history',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent
  ],
  template: `
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h2 class="text-xl font-semibold text-[#253359] mb-4">{{ header }}</h2>

      @if (loanHistory.length > 0) {
        <app-table
          [columns]="columns"
          [data]="loanHistory"
          [showActions]="false"
          [rows]="rows"
          [paginator]="paginator"
          [scrollable]="false"
          [emptyMessage]="emptyMessage">
        </app-table>
      } @else {
        <div class="text-center py-8 text-gray-500">
          <i class="pi pi-info-circle text-3xl mb-2 block"></i>
          <p>{{ emptyStateMessage }}</p>
        </div>
      }
    </div>
  `
})
export class LoanHistoryComponent {
  @Input() header = 'Ausleihverlauf';
  @Input() loanHistory: any[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() rows = 10;
  @Input() paginator = true;
  @Input() emptyMessage = 'Keine Ausleihvorgänge vorhanden';
  @Input() emptyStateMessage = 'Noch keine Ausleihvorgänge vorhanden';
}

