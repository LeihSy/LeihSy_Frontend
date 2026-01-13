import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../../../services/item.service';
import { ProductService } from '../../../../services/product.service';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { Item } from '../../../../models/item.model';
import { Product } from '../../../../models/product.model';
import { User } from '../../../../models/user.model';

export interface ProductWithItems {
  product: Product;
  items: Item[];
  availableCount: number;
  totalCount: number;
}

@Injectable()
export class LenderItemsService {
  private itemService = inject(ItemService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  items = signal<Item[]>([]);
  products = signal<Product[]>([]);
  currentUser = signal<User | null>(null);
  isLoading = signal(false);
  searchQuery = signal('');

  productsWithItems = computed(() => {
    const products = this.products();
    const items = this.items();
    const currentUser = this.currentUser();
    const query = this.searchQuery().toLowerCase().trim();

    let filteredItems = items;
    if (currentUser) {
      filteredItems = items.filter(item => item.lenderId === currentUser.id);
    }

    let productGroups = products
      .map(product => {
        const productItems = filteredItems.filter(item => item.productId === product.id);
        const itemsWithDisplayFields = productItems.map(item => ({
          ...item,
          availableLabel: item.isAvailable ? 'Verfügbar' : 'Ausgeliehen'
        }));

        return {
          product,
          items: itemsWithDisplayFields,
          availableCount: productItems.filter(i => i.isAvailable).length,
          totalCount: productItems.length
        };
      })
      .filter(pg => pg.totalCount > 0);

    if (query) {
      productGroups = productGroups.filter(pg =>
        pg.product.name.toLowerCase().includes(query) ||
        (pg.product.category?.name || '').toLowerCase().includes(query) ||
        pg.items.some(item => item.invNumber.toLowerCase().includes(query))
      );
    }

    return productGroups;
  });

  totalItems = computed(() => {
    return this.productsWithItems().reduce((sum, pg) => sum + pg.totalCount, 0);
  });

  totalAvailable = computed(() => {
    return this.productsWithItems().reduce((sum, pg) => sum + pg.availableCount, 0);
  });

  totalBorrowed = computed(() => {
    return this.totalItems() - this.totalAvailable();
  });

  initialize(): void {
    this.loadCurrentUser();
    this.loadProducts();
    this.loadItems();
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.messageService.add({
          severity: 'success',
          summary: 'Angemeldet',
          detail: `Angemeldet als ${user.name} (Verleiher) (ID: ${user.id})`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Fehler beim Laden des aktuellen Users:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Benutzer konnte nicht geladen werden.'
        });
      }
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProductsWithItems().subscribe({
      next: (products: Product[]) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Fehler beim Laden der Produkte:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Produkte konnten nicht geladen werden.'
        });
        this.isLoading.set(false);
      }
    });
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Items:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Gegenstände konnten nicht geladen werden.'
        });
        this.isLoading.set(false);
      }
    });
  }

  updateSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  navigateToItemDetail(itemId: number): void {
    this.router.navigate(['/admin/items/detail', itemId]);
  }
}

