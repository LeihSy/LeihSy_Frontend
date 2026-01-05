import { Component, input, Output, EventEmitter, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { InsyImportRequest, ImportStatus } from '../../../../../models/insy-import.model';

@Component({
  selector: 'app-insy-import-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    SelectModule,
    ChipModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './insy-import-table.component.html'
})
export class InsyImportTableComponent {
  // Inputs
  requests = input.required<InsyImportRequest[]>();
  isLoading = input<boolean>(false);
  selectedRequests = model<InsyImportRequest[]>([]);

  // Outputs
  @Output() importRequest = new EventEmitter<InsyImportRequest>();
  @Output() rejectRequest = new EventEmitter<InsyImportRequest>();
  @Output() batchImport = new EventEmitter<void>();
  @Output() batchReject = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<ImportStatus | 'ALL'>();

  // Local state
  searchQuery = '';
  statusFilterValue: ImportStatus | 'ALL' = 'ALL';

  statusOptions = [
    { label: 'Alle', value: 'ALL' },
    { label: 'Ausstehend', value: ImportStatus.PENDING },
    { label: 'Importiert', value: ImportStatus.IMPORTED },
    { label: 'Abgelehnt', value: ImportStatus.REJECTED }
  ];

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.searchChange.emit(value);
  }

  onStatusFilterChange(value: ImportStatus | 'ALL'): void {
    this.statusFilterChange.emit(value);
  }

  get pendingSelectedCount(): number {
    return this.selectedRequests().filter(r => r.status === ImportStatus.PENDING).length;
  }

  getStatusSeverity(status: ImportStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case ImportStatus.PENDING:
        return 'warn';
      case ImportStatus.IMPORTED:
        return 'success';
      case ImportStatus.REJECTED:
        return 'danger';
      case ImportStatus.UPDATED:
        return 'info';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: ImportStatus): string {
    switch (status) {
      case ImportStatus.PENDING:
        return 'Ausstehend';
      case ImportStatus.IMPORTED:
        return 'Importiert';
      case ImportStatus.REJECTED:
        return 'Abgelehnt';
      case ImportStatus.UPDATED:
        return 'Aktualisiert';
      default:
        return status;
    }
  }

  isNewRequest(request: InsyImportRequest): boolean {
    if (!request.createdAt) return false;
    const today = new Date().toISOString().split('T')[0];
    return request.createdAt.split('T')[0] === today;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
