import { Component, signal, computed, inject, OnInit, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';

import { InsyImportRequest, ImportStatus } from '../../../models/insy-import.model';
import { AdminInsyImportService } from './services/admin-insy-import.service';

@Component({
  selector: 'app-admin-insy-import',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    Select,
    InputTextModule,
    DialogModule,
    ChipModule,
    TooltipModule,
    TextareaModule,
  ],
  templateUrl: './admin-insy-import.component.html',
  styleUrls: ['./admin-insy-import.component.css'],
  providers: [ConfirmationService, MessageService, AdminInsyImportService]
})
export class AdminInsyImportComponent implements OnInit {
  private pageService = inject(AdminInsyImportService);

  // Service Signals
  allRequests = this.pageService.importRequests;
  statistics = this.pageService.statistics;
  isLoading = this.pageService.isLoading;
  selectedRequests = this.pageService.selectedRequests;

  // Filter Signals - BEIDE als WritableSignal für automatische Reaktivität
  statusFilter: WritableSignal<ImportStatus | 'ALL'> = signal('ALL');
  searchQuery: WritableSignal<string> = signal('');

  // Dialog Signals
  showApproveDialog = signal(false);
  showRejectDialog = signal(false);
  currentRequest = signal<InsyImportRequest | null>(null);
  rejectReason: string = '';

  // Status Options für Dropdown
  statusOptions = [
    { label: 'Alle', value: 'ALL' },
    { label: 'Ausstehend', value: ImportStatus.PENDING },
    { label: 'Genehmigt', value: ImportStatus.APPROVED },
    { label: 'Abgelehnt', value: ImportStatus.REJECTED }
  ];

  // Gefilterte Requests - reagiert automatisch auf statusFilter-Änderungen
  filteredRequests = computed(() => {
    const requests = this.allRequests();
    const status = this.statusFilter(); // Signal-Aufruf registriert Abhängigkeit
    const query = this.searchQuery().toLowerCase().trim();

    let filtered = requests;

    // Status-Filter
    if (status !== 'ALL') {
      filtered = filtered.filter(r => r.status === status);
    }

    // Such-Filter
    if (query) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.invNumber.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        r.roomNr.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  // Neue Requests (heute erstellt)
  newRequests = computed(() => {
    const requests = this.allRequests();
    const today = new Date().toISOString().split('T')[0];
    return requests.filter(r =>
      r.status === ImportStatus.PENDING &&
      r.createdAt.split('T')[0] === today
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.pageService.loadImportRequests();
    this.pageService.loadStatistics();
  }

  refreshImports(): void {
    this.pageService.refreshImports();
  }

  // Status-Badge Severity
  getStatusSeverity(status: ImportStatus): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case ImportStatus.PENDING:
        return 'warn';
      case ImportStatus.APPROVED:
        return 'success';
      case ImportStatus.REJECTED:
        return 'danger';
      default:
        return 'info';
    }
  }

  // Status-Badge Label
  getStatusLabel(status: ImportStatus): string {
    switch (status) {
      case ImportStatus.PENDING:
        return 'Ausstehend';
      case ImportStatus.APPROVED:
        return 'Genehmigt';
      case ImportStatus.REJECTED:
        return 'Abgelehnt';
      default:
        return status;
    }
  }

  // Prüft ob Request neu ist (heute erstellt)
  isNewRequest(request: InsyImportRequest): boolean {
    const today = new Date().toISOString().split('T')[0];
    return request.createdAt.split('T')[0] === today;
  }

  // Einzelnen Import genehmigen
  openApproveDialog(request: InsyImportRequest): void {
    this.currentRequest.set(request);
    this.showApproveDialog.set(true);
  }

  confirmApprove(): void {
    const request = this.currentRequest();
    if (request) {
      this.pageService.approveImport(request);
      this.showApproveDialog.set(false);
      this.currentRequest.set(null);
    }
  }

  // Einzelnen Import ablehnen
  openRejectDialog(request: InsyImportRequest): void {
    this.currentRequest.set(request);
    this.rejectReason = '';
    this.showRejectDialog.set(true);
  }

  confirmReject(): void {
    const request = this.currentRequest();
    const reason = this.rejectReason;
    if (request) {
      this.pageService.rejectImport(request, reason || undefined);
      this.showRejectDialog.set(false);
      this.currentRequest.set(null);
      this.rejectReason = '';
    }
  }

  // Bulk-Aktionen
  bulkApprove(): void {
    const selected = this.selectedRequests();
    const pendingOnly = selected.filter(r => r.status === ImportStatus.PENDING);

    if (pendingOnly.length !== selected.length) {
      // Warnung wenn nicht-ausstehende Requests ausgewählt sind
      this.pageService.bulkApprove(pendingOnly);
    } else {
      this.pageService.bulkApprove(selected);
    }
  }

  bulkReject(): void {
    const selected = this.selectedRequests();
    const pendingOnly = selected.filter(r => r.status === ImportStatus.PENDING);

    if (pendingOnly.length !== selected.length) {
      this.pageService.bulkReject(pendingOnly);
    } else {
      this.pageService.bulkReject(selected);
    }
  }

  // Import löschen
  deleteImport(request: InsyImportRequest): void {
    this.pageService.deleteImport(request);
  }

  // Formatiert Datum
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
