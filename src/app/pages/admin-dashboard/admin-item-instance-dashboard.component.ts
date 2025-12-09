import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { Item } from '../../models/item.model';
import { Product } from '../../models/product.model';
import { TabelleComponent, ColumnDef } from '../../shared/tabelle/tabelle.component';

@Component({
  selector: 'app-admin-item-instance',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TabelleComponent,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './admin-item-instance-dashboard.component.html',
  styleUrls: ['./admin-item-instance-dashboard.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class AdminItemInstanceComponent implements OnInit {

  // Spalten-Definition für die Item-Tabelle
  itemColumns: ColumnDef[] = [
    { field: 'invNumber', header: 'Inventarnummer', sortable: true, width: '150px' },
    { field: 'owner', header: 'Besitzer', sortable: true },
    { field: 'lenderDisplay', header: 'Verleiher', sortable: true },
    { field: 'availableLabel', header: 'Status', type: 'status', sortable: true, width: '120px' }
  ];

  allItems = signal<Item[]>([]);
  allProducts = signal<Product[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  expandedProductIds = signal<Set<number>>(new Set());
  userIdToNameMap = signal<Map<number, string>>(new Map());

  productsWithItems = computed(() => {
    const products = this.allProducts();
    const items = this.allItems();
    const query = this.searchQuery().toLowerCase().trim();

    let filtered = products.map(product => {
      const productItems = items.filter(item => item.productId === product.id);
      // Füge zusätzliche Felder für die Tabelle hinzu
      const itemsWithDisplayFields = productItems.map(item => ({
        ...item,
        lenderDisplay: this.getLenderDisplay(item.lenderId),
        availableLabel: item.available ? 'Verfügbar' : 'Ausgeliehen'
      }));

      return {
        product,
        items: itemsWithDisplayFields,
        availableCount: productItems.filter(i => i.available).length,
        totalCount: productItems.length
      };
    });

    if (query) {
      filtered = filtered.filter(p =>
        p.product.name.toLowerCase().includes(query) ||
        (p.product.category?.name || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  constructor(
    private readonly router: Router,
    private readonly itemService: ItemService,
    private readonly productService: ProductService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadItems();
  }

  loadProducts(): void {
    this.isLoading.set(true);

    this.productService.getProductsWithCategories().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Produkte:', err);

        this.productService.getProducts().subscribe({
          next: (products) => {
            this.allProducts.set(products);
            this.isLoading.set(false);
          },
          error: (fallbackErr) => {
            console.error('Fehler beim Laden der Produkte (Fallback):', fallbackErr);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Fehler beim Laden der Produkte.'
            });
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.allItems.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Items:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Gegenstände.'
        });
        this.isLoading.set(false);
      }
    });
  }

  getLenderDisplay(lenderId: number | undefined): string {
    if (!lenderId) return 'N/A';
    const userName = this.userIdToNameMap().get(lenderId);
    return userName ? `${userName} (ID: ${lenderId})` : lenderId.toString();
  }

  addItemForProduct(product: Product): void {
    this.router.navigate(['/admin/items/new'], {
      queryParams: { productId: product.id }
    });
  }

  editItem(item: Item): void {
    this.router.navigate(['/admin/items', item.id, 'edit']);
  }

  deleteItem(item: Item): void {
    this.confirmationService.confirm({
      message: `Möchten Sie den Gegenstand "${item.productName}" (${item.invNumber}) wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: () => {
        this.itemService.deleteItem(item.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Gelöscht',
              detail: 'Gegenstand wurde gelöscht.'
            });
            this.loadItems();
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Gegenstand konnte nicht gelöscht werden.'
            });
          }
        });
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  toggleProductExpansion(productId: number): void {
    const expanded = this.expandedProductIds();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }

    this.expandedProductIds.set(newExpanded);
  }

  isProductExpanded(productId: number): boolean {
    return this.expandedProductIds().has(productId);
  }
}

