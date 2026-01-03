import { Component, signal, computed, inject, OnInit, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';

import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { InsyImportRequest, ImportStatus} from '../../../models/insy-import.model';
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
    SelectModule,
    DialogModule,
    ChipModule,
    TooltipModule,
    TextareaModule,
    InputNumberModule,
    RadioButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
  ],
  templateUrl: './admin-insy-import.component.html',
  styleUrls: ['./admin-insy-import.component.css'],
  providers: [ConfirmationService, MessageService, AdminInsyImportService]
})
export class AdminInsyImportComponent implements OnInit {
  private readonly pageService = inject(AdminInsyImportService);

  // Service Signals
  allRequests = this.pageService.importRequests;
  statistics = this.pageService.statistics;
  isLoading = this.pageService.isLoading;
  selectedRequests = this.pageService.selectedRequests;

  // Dropdown-Optionen
  categories = this.pageService.categories;
  locations = this.pageService.locations;
  products = this.pageService.products;

  // Filter Signals
  statusFilter: WritableSignal<ImportStatus | 'ALL'> = signal('ALL');
  searchQuery: WritableSignal<string> = signal('');

  // Fuer ngModel Binding
  statusFilterValue: ImportStatus | 'ALL' = 'ALL';

  // Import Dialog State
  showImportDialog = signal(false);
  currentRequest = signal<InsyImportRequest | null>(null);
  importType = signal<'NEW_PRODUCT' | 'EXISTING_PRODUCT'>('NEW_PRODUCT');

  // Import Dialog Form Values
  selectedCategoryId: number | null = null;
  selectedLocationId: number | null = null;
  selectedProductId: number | null = null;
  importPrice: number | null = null;
  importExpiryDate: number | null = 14;

  // Reject Dialog State
  showRejectDialog = signal(false);
  rejectReason: string = '';

  // Batch Import Dialog State
  showBatchDialog = signal(false);
  batchProductId: number | null = null;
  batchInvPrefix: string = '';

  // Status Options fuer Dropdown
  statusOptions = [
    { label: 'Alle', value: 'ALL' },
    { label: 'Ausstehend', value: ImportStatus.PENDING },
    { label: 'Importiert', value: ImportStatus.IMPORTED },
    { label: 'Abgelehnt', value: ImportStatus.REJECTED }
  ];

  // Gefilterte Requests
  filteredRequests = computed(() => {
    const requests = this.allRequests();
    const status = this.statusFilter();
    const query = this.searchQuery().toLowerCase().trim();

    let filtered = requests;

    if (status !== 'ALL') {
      filtered = filtered.filter(r => r.status === status);
    }

    if (query) {
      filtered = filtered.filter(r =>
        r.name?.toLowerCase().includes(query) ||
        r.invNumber?.toLowerCase().includes(query) ||
        r.location?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
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
      r.createdAt?.split('T')[0] === today
    );
  });

  // Pending Requests aus Selektion
  pendingSelectedRequests = computed(() => {
    return this.selectedRequests().filter(r => r.status === ImportStatus.PENDING);
  });

  ngOnInit(): void {
    this.loadData();
    this.pageService.loadDropdownOptions();
  }

  loadData(): void {
    this.pageService.loadImportRequests();
    this.pageService.loadStatistics();
  }

  refreshImports(): void {
    this.pageService.createMockImports(5);
  }

  onStatusFilterChange(value: ImportStatus | 'ALL'): void {
    this.statusFilter.set(value);
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

  // Import Dialog oeffnen
  openImportDialog(request: InsyImportRequest): void {
    this.currentRequest.set(request);

    // Wenn Matching-Product vorhanden, vorauswählen
    if (request.hasMatchingProduct && request.matchingProductId) {
      this.importType.set('EXISTING_PRODUCT');
      this.selectedProductId = request.matchingProductId;
    } else {
      this.importType.set('NEW_PRODUCT');
      this.selectedProductId = null;
    }

    // Reset andere Felder
    this.selectedCategoryId = null;
    this.selectedLocationId = null;
    this.importPrice = null;
    this.importExpiryDate = 14;

    this.showImportDialog.set(true);
  }

  confirmImport(): void {
    const request = this.currentRequest();
    if (!request) return;

    if (this.importType() === 'EXISTING_PRODUCT') {
      if (!this.selectedProductId) {
        return; // Validierung
      }
      this.pageService.importToExistingProduct(request, this.selectedProductId);
    } else {
      if (!this.selectedCategoryId || !this.selectedLocationId) {
        return; // Validierung
      }
      this.pageService.importAsNewProduct(
        request,
        this.selectedCategoryId,
        this.selectedLocationId,
        {
          price: this.importPrice || undefined,
          expiryDate: this.importExpiryDate || undefined
        }
      );
    }

    this.showImportDialog.set(false);
    this.currentRequest.set(null);
  }

  // Reject Dialog oeffnen
  openRejectDialog(request: InsyImportRequest): void {
    this.currentRequest.set(request);
    this.rejectReason = '';
    this.showRejectDialog.set(true);
  }

  confirmReject(): void {
    const request = this.currentRequest();
    if (request) {
      this.pageService.rejectImport(request, this.rejectReason || undefined);
      this.showRejectDialog.set(false);
      this.currentRequest.set(null);
      this.rejectReason = '';
    }
  }

  // Batch Dialog oeffnen
  openBatchDialog(): void {
    this.batchProductId = null;
    this.batchInvPrefix = '';
    this.showBatchDialog.set(true);
  }

  confirmBatchImport(): void {
    const selected = this.pendingSelectedRequests();
    if (selected.length === 0 || !this.batchProductId) return;

    this.pageService.batchImportToProduct(
      selected,
      this.batchProductId,
      { invNumberPrefix: this.batchInvPrefix || undefined }
    );
    this.showBatchDialog.set(false);
  }

  // Bulk Reject
  bulkReject(): void {
    const selected = this.pendingSelectedRequests();
    if (selected.length === 0) return;
    this.pageService.batchReject(selected);
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
