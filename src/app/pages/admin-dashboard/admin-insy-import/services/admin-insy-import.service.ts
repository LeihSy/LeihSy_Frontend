import { Injectable, signal, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { InsyImportService } from '../../../../services/insy-import.service';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { LocationService } from '../../../../services/location.service';
import {
  InsyImportRequest,
  ImportStatus,
  CategoryOption,
  LocationOption,
  ProductOption
} from '../../../../models/insy-import.model';

@Injectable()
export class AdminInsyImportService {
  private readonly insyImportService = inject(InsyImportService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);
  private readonly messageService = inject(MessageService);

  // State Signals
  importRequests = signal<InsyImportRequest[]>([]);
  statistics = signal<{
    totalPending: number;
    totalImported: number;
    totalRejected: number;
  }>({
    totalPending: 0,
    totalImported: 0,
    totalRejected: 0
  });
  isLoading = signal(false);
  selectedRequests = signal<InsyImportRequest[]>([]);

  // Dropdown-Optionen
  categories = signal<CategoryOption[]>([]);
  locations = signal<LocationOption[]>([]);
  products = signal<ProductOption[]>([]);

  /**
   * Laedt alle Import-Requests
   */
  loadImportRequests(statusFilter?: ImportStatus | 'ALL'): void {
    this.isLoading.set(true);
    const filter = statusFilter === 'ALL' ? undefined : statusFilter;

    this.insyImportService.getAllImportRequests(filter).subscribe({
      next: (requests) => {
        this.importRequests.set(requests);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Import-Requests:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Import-Requests konnten nicht geladen werden'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Laedt Statistiken (Anzahl pro Status)
   */
  loadStatistics(): void {
    // Lade alle Requests und zaehle nach Status
    this.insyImportService.getAllImportRequests().subscribe({
      next: (requests) => {
        const stats = {
          totalPending: requests.filter(r => r.status === ImportStatus.PENDING).length,
          totalImported: requests.filter(r => r.status === ImportStatus.IMPORTED).length,
          totalRejected: requests.filter(r => r.status === ImportStatus.REJECTED).length
        };
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Statistiken:', error);
      }
    });
  }

  /**
   * Laedt Dropdown-Optionen fuer Import-Dialog
   */
  loadDropdownOptions(): void {
    forkJoin({
      categories: this.categoryService.getAllCategories(),
      locations: this.locationService.getAllLocations(),
      products: this.productService.getProductsWithItems()
    }).subscribe({
      next: ({ categories, locations, products }) => {
        this.categories.set(categories.map(c => ({ id: c.id, name: c.name })));
        this.locations.set(locations.map(l => ({ id: l.id, roomNr: l.roomNr })));
        this.products.set(products.map(p => ({
          id: p.id,
          name: p.name,
          categoryName: p.category?.name || null
        })));
      },
      error: (error) => {
        console.error('Fehler beim Laden der Dropdown-Optionen:', error);
      }
    });
  }

  /**
   * Importiert als neues Product
   */
  importAsNewProduct(
    request: InsyImportRequest,
    categoryId: number,
    locationId: number,
    options?: { price?: number; expiryDate?: number; lenderId?: number }
  ): void {
    this.insyImportService.importAsNewProduct(request.id, categoryId, locationId, options).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Importiert',
          detail: `"${request.name}" wurde als neues Produkt importiert`
        });
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Import:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: error.error?.message || 'Import fehlgeschlagen'
        });
      }
    });
  }

  /**
   * Importiert zu bestehendem Product
   */
  importToExistingProduct(
    request: InsyImportRequest,
    productId: number,
    options?: { lenderId?: number }
  ): void {
    this.insyImportService.importToExistingProduct(request.id, productId, options).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Importiert',
          detail: `"${request.name}" wurde zum Produkt hinzugefuegt`
        });
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Import:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: error.error?.message || 'Import fehlgeschlagen'
        });
      }
    });
  }

  /**
   * Lehnt einen Import ab
   */
  rejectImport(request: InsyImportRequest, reason?: string): void {
    this.insyImportService.rejectImport(request.id, reason).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Abgelehnt',
          detail: `"${request.name}" wurde abgelehnt`
        });
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Ablehnen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: error.error?.message || 'Ablehnung fehlgeschlagen'
        });
      }
    });
  }

  /**
   * Batch-Import: Mehrere Items zu einem Product
   */
  batchImportToProduct(
    requests: InsyImportRequest[],
    productId: number,
    options?: { lenderId?: number; invNumberPrefix?: string }
  ): void {
    const batchRequest = {
      importItemIds: requests.map(r => r.id),
      productId,
      lenderId: options?.lenderId,
      invNumberPrefix: options?.invNumberPrefix
    };

    this.insyImportService.batchImport(batchRequest).subscribe({
      next: (results) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Batch-Import erfolgreich',
          detail: `${results.length} Items wurden importiert`
        });
        this.selectedRequests.set([]);
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Batch-Import:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: error.error?.message || 'Batch-Import fehlgeschlagen'
        });
      }
    });
  }

  /**
   * Batch-Reject: Mehrere Items ablehnen
   */
  batchReject(requests: InsyImportRequest[], reason?: string): void {
    // Einzeln ablehnen (Backend hat keinen Batch-Reject)
    let completed = 0;
    const total = requests.length;

    requests.forEach(request => {
      this.insyImportService.rejectImport(request.id, reason).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Abgelehnt',
              detail: `${total} Imports wurden abgelehnt`
            });
            this.selectedRequests.set([]);
            this.refreshData();
          }
        },
        error: (error) => {
          console.error('Fehler beim Ablehnen:', error);
        }
      });
    });
  }

  /**
   * Mock-Daten generieren (nur Entwicklung)
   */
  createMockImports(count: number = 5): void {
    this.isLoading.set(true);
    this.insyImportService.createMockImports(count).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Mock-Daten erstellt',
          detail: `${result.created} neue Import-Eintraege erstellt`
        });
        this.refreshData();
      },
      error: (error) => {
        console.error('Fehler beim Erstellen der Mock-Daten:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Mock-Daten konnten nicht erstellt werden'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Daten neu laden
   */
  private refreshData(): void {
    this.loadImportRequests();
    this.loadStatistics();
  }
}
