import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableComponent, ColumnDef } from '../../table/table.component';

@Component({
  selector: 'app-group-members-card',
  standalone: true,
  imports: [CommonModule, CardModule, TableComponent],
  template: `
    <p-card [header]="header">
      @if (members.length === 0) {
        <div class="text-center py-8">
          <i class="pi pi-users text-4xl text-gray-300 mb-2"></i>
          <p class="text-gray-500">{{ emptyMessage }}</p>
        </div>
      } @else {
        <app-table
          [columns]="columns"
          [data]="members"
          [paginator]="paginator"
          [rows]="rows"
          [showActions]="showActions">
        </app-table>
      }
    </p-card>
  `
})
export class GroupMembersCardComponent {
  @Input() header = 'Mitglieder';
  @Input() members: any[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() paginator = true;
  @Input() rows = 10;
  @Input() showActions = false;
  @Input() emptyMessage = 'Keine Mitglieder in dieser Gruppe';
}

