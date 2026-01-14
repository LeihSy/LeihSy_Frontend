import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ItemService } from '../../../../services/item.service';
import { ProductService } from '../../../../services/product.service';
import { UserService } from '../../../../services/user.service';
import { Item } from '../../../../models/item.model';
import { Product } from '../../../../models/product.model';

@Injectable()
export class AdminItemInstanceDashboardService {
  private itemService = inject(ItemService);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // Signals for state management
  products = signal<Product[]>([]);
  items = signal<Item[]>([]);
  isLoading = signal(false);
  userIdToNameMap = signal<Map<number, string>>(new Map());

  loadProducts(): void {
    this.isLoading.set(true);

    this.productService.getProductsWithItems().pipe(
      catchError((err: any) => {
        console.error('Fehler beim Laden der Produkte (Fallback):', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Produkte.'
        });
        return of([]);
      })
    ).subscribe({
      next: (products: Product[]) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadItems(): void {
    this.isLoading.set(true);

    this.itemService.getAllItems().pipe(
      catchError((err) => {
        console.error('Fehler beim Laden der Items:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Gegenstände.'
        });
        return of([]);
      })
    ).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loadLenderNames(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private loadLenderNames(items: Item[]): void {
    // Sammle alle eindeutigen Lender-IDs
    const lenderIds = [...new Set(items.map(item => item.lenderId).filter(id => id !== undefined))] as number[];

    if (lenderIds.length === 0) {
      return;
    }

    // Lade alle Lender-Namen parallel
    const userRequests = lenderIds.map(lenderId =>
      this.userService.getUserById(lenderId).pipe(
        map(user => ({ id: lenderId, name: user.name })),
        catchError(err => {
          console.error(`Fehler beim Laden von User ${lenderId}:`, err);
          return of({ id: lenderId, name: `ID: ${lenderId}` });
        })
      )
    );

    forkJoin(userRequests).subscribe({
      next: (users) => {
        const newMap = new Map(this.userIdToNameMap());
        users.forEach(user => {
          newMap.set(user.id, user.name);
        });
        this.userIdToNameMap.set(newMap);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Verleiher-Namen:', err);
      }
    });
  }

  confirmDeleteItem(item: Item, onConfirm: () => void): void {
    this.confirmationService.confirm({
      message: `Möchten Sie den Gegenstand "${item.productName}" (${item.invNumber}) wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: onConfirm
    });
  }

  deleteItem(itemId: number): Observable<void> {
    return this.itemService.deleteItem(itemId).pipe(
      tap(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Gelöscht',
          detail: 'Gegenstand wurde gelöscht.'
        });
      }),
      catchError((err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Gegenstand konnte nicht gelöscht werden.'
        });
        throw err;
      })
    );
  }

  navigateToAddItem(product: Product): void {
    this.router.navigate(['/admin/items/new'], {
      queryParams: { productId: product.id }
    });
  }

  navigateToEditItem(itemId: number): void {
    this.router.navigate(['/admin', 'items', itemId, 'edit']);
  }
}

