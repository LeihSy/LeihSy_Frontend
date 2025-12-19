import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { ItemService } from '../../../services/item.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Item } from '../../../models/item.model';
import { Product } from '../../../models/product.model';

export interface ProductWithItems {
  product: Product;
  items: Item[];
  availableCount: number;
  totalCount: number;
}

@Injectable()
export class AdminAllItemsService {
  private itemService = inject(ItemService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  currentUser = this.authService.currentUser;
  isLoading = signal<boolean>(true);
  products = signal<Product[]>([]);
  items = signal<Item[]>([]);
  searchQuery = signal<string>('');

  // Computed
  productsWithItems = computed<ProductWithItems[]>(() => {
    const productList = this.products();
    const itemList = this.items();
    const query = this.searchQuery().toLowerCase().trim();

    return productList
      .map(product => {
        const productItems = itemList.filter(item => item.productId === product.id);
        const availableCount = productItems.filter(item => item.available).length;

        return {
          product,
          items: productItems,
          availableCount,
          totalCount: productItems.length
        };
      })
      .filter(pwi => {
        if (!query) return pwi.totalCount > 0;

        return (
          pwi.product.name.toLowerCase().includes(query) ||
          pwi.product.description.toLowerCase().includes(query) ||
          pwi.items.some(item =>
            item.invNumber.toLowerCase().includes(query) ||
            item.owner.toLowerCase().includes(query)
          )
        );
      })
      .sort((a, b) => a.product.name.localeCompare(b.product.name));
  });

  totalItems = computed(() =>
    this.items().length
  );

  totalAvailable = computed(() =>
    this.items().filter(item => item.available).length
  );

  totalBorrowed = computed(() =>
    this.items().filter(item => !item.available).length
  );

  totalProducts = computed(() =>
    this.products().length
  );

  initialize(): void {
    this.loadProducts();
    this.loadAllItems();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Fehler beim Laden der Produkte:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadAllItems(): void {
    this.itemService.getAllItems().subscribe({
      next: (items: Item[]) => {
        this.items.set(items);
      },
      error: (err: any) => {
        console.error('Fehler beim Laden der Items:', err);
      }
    });
  }

  updateSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  navigateToItemDetail(itemId: number): void {
    this.router.navigate(['/admin/items/detail', itemId]);
  }

  navigateToEditItem(itemId: number): void {
    this.router.navigate(['/admin/items', itemId, 'edit']);
  }

  navigateToProductDetail(productId: number): void {
    this.router.navigate(['/admin/products', productId, 'edit']);
  }

  navigateToCreateItem(productId: number): void {
    this.router.navigate(['/admin/items/new'], {
      queryParams: { productId }
    });
  }
}

