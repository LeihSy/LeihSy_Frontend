import { Component, signal, computed, inject, OnInit, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { InsyImportRequest, ImportStatus } from '../../../models/insy-import.model';
import { AdminInsyImportService } from './services/admin-insy-import.service';

// Sub-Components
import { InsyStatisticsCardsComponent } from './components/insy-statistics-cards/insy-statistics-cards.component';
import { InsyImportTableComponent } from './components/insy-import-table/insy-import-table.component';
import { InsyImportDialogComponent, ImportDialogResult } from './components/insy-import-dialog/insy-import-dialog.component';
import { InsyRejectDialogComponent } from './components/insy-reject-dialog/insy-reject-dialog.component';
import { InsyBatchDialogComponent, BatchImportResult } from './components/insy-batch-dialog/insy-batch-dialog.component';

@Component({
  selector: 'app-admin-insy-import',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    // Sub-Components
    InsyStatisticsCardsComponent,
    InsyImportTableComponent,
    InsyImportDialogComponent,
    InsyRejectDialogComponent,
    InsyBatchDialogComponent
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

  // Dialog State
  showImportDialog = signal(false);
  showRejectDialog = signal(false);
  showBatchDialog = signal(false);
  currentRequest = signal<InsyImportRequest | null>(null);

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
  newRequestsCount = computed(() => {
    const requests = this.allRequests();
    const today = new Date().toISOString().split('T')[0];
    return requests.filter(r =>
      r.status === ImportStatus.PENDING &&
      r.createdAt?.split('T')[0] === today
    ).length;
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

  // Filter Handlers
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onStatusFilterChange(status: ImportStatus | 'ALL'): void {
    this.statusFilter.set(status);
  }

  // Import Dialog
  onOpenImportDialog(request: InsyImportRequest): void {
    this.currentRequest.set(request);
    this.showImportDialog.set(true);
  }

  onImportConfirm(result: ImportDialogResult): void {
    const request = this.currentRequest();
    if (!request) return;

    if (result.type === 'EXISTING_PRODUCT' && result.productId) {
      this.pageService.importToExistingProduct(request, result.productId);
    } else if (result.type === 'NEW_PRODUCT' && result.categoryId && result.locationId) {
      this.pageService.importAsNewProduct(
        request,
        result.categoryId,
        result.locationId,
        {
          price: result.price,
          expiryDate: result.expiryDate
        }
      );
    }

    this.currentRequest.set(null);
  }

  // Reject Dialog
  onOpenRejectDialog(request: InsyImportRequest): void {
    this.currentRequest.set(request);
    this.showRejectDialog.set(true);
  }

  onRejectConfirm(reason: string | undefined): void {
    const request = this.currentRequest();
    if (request) {
      this.pageService.rejectImport(request, reason);
      this.currentRequest.set(null);
    }
  }

  // Batch Dialog
  onOpenBatchDialog(): void {
    this.showBatchDialog.set(true);
  }

  onBatchConfirm(result: BatchImportResult): void {
    const selected = this.pendingSelectedRequests();
    if (selected.length === 0) return;

    this.pageService.batchImportToProduct(
      selected,
      result.productId,
      { invNumberPrefix: result.invNumberPrefix }
    );
  }

  // Bulk Reject
  onBulkReject(): void {
    const selected = this.pendingSelectedRequests();
    if (selected.length === 0) return;
    this.pageService.batchReject(selected);
  }
}
