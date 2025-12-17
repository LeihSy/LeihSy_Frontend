import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../../services/item.service';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { Item } from '../../../models/item.model';
import { Product } from '../../../models/product.model';
import { User } from '../../../models/user.model';

export interface ItemFormData {
  invNumber: string;
  ownerName: string;
  lenderId: number;
  productId: number;
  available: boolean;
  quantity?: number;
}

export interface UserLookupResult {
  found: boolean;
  user?: User;
  displayValue: string;
}

@Injectable()
export class AdminItemFormPageService {
  private itemService = inject(ItemService);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // Signals for state management
  item = signal<Item | null>(null);
  products = signal<Product[]>([]);
  allItems = signal<Item[]>([]);
  isLoading = signal(false);

  // Expose userService for direct use in component
  get user() {
    return this.userService;
  }

  loadItem(itemId: number): void {
    this.isLoading.set(true);
    this.itemService.getItemById(itemId).subscribe({
      next: (item) => {
        this.item.set(item);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Items:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Item konnte nicht geladen werden.'
        });
        this.isLoading.set(false);
        this.navigateToItemList();
      }
    });
  }

  loadProduct(productId: number): Observable<Product> {
    return this.productService.getProductById(productId).pipe(
      catchError((err) => {
        console.error('Fehler beim Laden des Produkts:', err);
        throw err;
      })
    );
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProductsWithCategories().pipe(
      catchError((err) => {
        console.error('Fehler beim Laden der Produkte:', err);
        return this.productService.getProducts();
      })
    ).subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadAllItems(): void {
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.allItems.set(items);
      },
      error: () => {
        this.allItems.set([]);
      }
    });
  }

  updateItem(itemId: number, payload: any): Observable<Item> {
    return this.itemService.updateItem(itemId, payload).pipe(
      tap(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Gegenstand wurde aktualisiert!'
        });
        this.navigateToItemList();
      }),
      catchError((err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Gegenstand konnte nicht aktualisiert werden.'
        });
        throw err;
      })
    );
  }

  createItems(formValue: ItemFormData): void {
    const quantity = formValue.quantity || 1;
    const invNumbers = this.generateInventoryNumbers(formValue.invNumber, quantity, this.allItems());

    let successCount = 0;
    let errorCount = 0;

    const createNextItem = (index: number) => {
      if (index >= invNumbers.length) {
        if (successCount > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: `${successCount} Gegenstand/Gegenstände wurde(n) erstellt!`
          });
          this.navigateToItemList();
        }
        if (errorCount > 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warnung',
            detail: `${errorCount} Gegenstand/Gegenstände konnte(n) nicht erstellt werden.`
          });
        }
        return;
      }

      const payload: any = {
        invNumber: invNumbers[index],
        owner: formValue.ownerName,
        lenderId: formValue.lenderId,
        productId: formValue.productId,
        available: formValue.available
      };

      this.itemService.createItem(payload).subscribe({
        next: () => {
          successCount++;
          createNextItem(index + 1);
        },
        error: () => {
          errorCount++;
          createNextItem(index + 1);
        }
      });
    };

    createNextItem(0);
  }

  lookupUserById(userId: number): Observable<UserLookupResult> {
    return this.userService.getUserById(userId).pipe(
      map((user: User) => ({
        found: true,
        user,
        displayValue: `Gefunden: ${user.name}`
      })),
      catchError(() => of({
        found: false,
        displayValue: 'Benutzer mit dieser ID nicht gefunden'
      }))
    );
  }

  lookupUserByName(userName: string): Observable<UserLookupResult> {
    return this.userService.getUserByName(userName).pipe(
      map((user: User) => ({
        found: true,
        user,
        displayValue: `Gefunden: ID ${user.id}`
      })),
      catchError(() => of({
        found: false,
        displayValue: 'Benutzer mit diesem Namen nicht gefunden'
      }))
    );
  }

  generateInventoryNumbers(prefix: string, quantity: number, allItems: Item[]): string[] {
    if (!prefix || quantity < 1) return [];

    const existingNumbers = allItems
      .filter(item => item.invNumber.startsWith(prefix))
      .map(item => {
        const match = /(\d+)$/.exec(item.invNumber);
        return match ? Number.parseInt(match[1], 10) : 0;
      })
      .filter(num => !Number.isNaN(num));

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    let nextNumber = maxNumber + 1;

    const inventoryNumbers: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const paddedNumber = String(nextNumber).padStart(3, '0');
      inventoryNumbers.push(`${prefix}-${paddedNumber}`);
      nextNumber++;
    }

    return inventoryNumbers;
  }

  navigateToItemList(): void {
    this.router.navigate(['/admin/items']);
  }
}

