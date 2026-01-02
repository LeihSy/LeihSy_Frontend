import { Component, OnInit, signal, computed, inject } from '@angular/core';
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

import { Item } from '../../../models/item.model';
import { Product } from '../../../models/product.model';
import { ColumnDef } from '../../../components/table/table.component';
import { ProductListItemComponent } from '../../../components/admin/product-list-item/product-list-item.component';
import { SearchBarComponent } from '../../../components/search-bar/search-bar.component';
import { AdminItemInstanceDashboardService } from './services/admin-item-instance-dashboard.service';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';

@Component({
  selector: 'app-admin-item-instance',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    ProductListItemComponent,
    SearchBarComponent,
    PageHeaderComponent
  ],
  templateUrl: './admin-item-instance-dashboard.component.html',
  providers: [ConfirmationService, MessageService, AdminItemInstanceDashboardService]
})
export class AdminItemInstanceComponent implements OnInit {
  private router = inject(Router);
  private pageService = inject(AdminItemInstanceDashboardService);

  itemColumns: ColumnDef[] = [
    { field: 'invNumber', header: 'Inventarnummer', sortable: true, width: '150px' },
    { field: 'owner', header: 'Besitzer', sortable: true },
    { field: 'lenderDisplay', header: 'Verleiher', sortable: true },
    { field: 'availableLabel', header: 'Status', type: 'status', sortable: true, width: '120px' }
  ];

  // Use service signals
  allItems = this.pageService.items;
  allProducts = this.pageService.products;
  isLoading = this.pageService.isLoading;

  // Local component signals
  searchQuery = signal('');
  expandedProductIds = signal<Set<number>>(new Set());
  userIdToNameMap = signal<Map<number, string>>(new Map());

  ngOnInit(): void {
    this.loadProducts();
    this.loadItems();
  }

  productsWithItems = computed(() => {
    const products = this.allProducts();
    const items = this.allItems();
    const query = this.searchQuery().toLowerCase().trim();

    let filtered = products.map(product => {
      const productItems = items.filter(item => item.productId === product.id);
      const itemsWithDisplayFields = productItems.map(item => ({
        ...item,
        lenderDisplay: this.getLenderDisplay(item.lenderId),
        availableLabel: item.isAvailable ? 'Verfügbar' : 'Ausgeliehen'
      }));

      return {
        product,
        items: itemsWithDisplayFields,
        availableCount: productItems.filter(i => i.isAvailable).length,
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

  loadProducts(): void {
    this.pageService.loadProducts();
  }

  loadItems(): void {
    this.pageService.loadItems();
  }

  getLenderDisplay(lenderId: number | undefined): string {
    if (!lenderId) return 'N/A';
    const userName = this.userIdToNameMap().get(lenderId);
    return userName ? `${userName}` : lenderId.toString();
  }

  deleteItem(item: Item): void {
    this.pageService.confirmDeleteItem(item, () => {
      this.pageService.deleteItem(item.id).subscribe({
        next: () => {
          this.loadItems();
        },
        error: () => {
          // Error handling is done in service
        }
      });
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

  addItemForProduct(product: Product): void {
    this.pageService.navigateToAddItem(product);
  }

  editItem(item: Item): void {
    this.pageService.navigateToEditItem(item.id);
  }

}
