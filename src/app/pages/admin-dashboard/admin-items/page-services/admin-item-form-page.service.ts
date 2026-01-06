import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../../../services/item.service';
import { ProductService } from '../../../../services/product.service';
import { UserService } from '../../../../services/user.service';
import { Item } from '../../../../models/item.model';
import { Product } from '../../../../models/product.model';
import { User } from '../../../../models/user.model';

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
  pendingImportData = signal<any>(null);

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
    this.productService.getProductsWithItems().pipe(
      catchError((err: any) => {
        console.error('Fehler beim Laden der Produkte:', err);
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

  loadAllItems(): void {
    this.itemService.getAllItemsIncludingDeleted().subscribe({
      next: (items) => {
        this.allItems.set(items);
      },
      error: (err) => {
        console.error('Fehler beim Laden aller Items:', err);
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

    console.log(`[PageService.generateInventoryNumbers] Prefix: ${prefix}, Anzahl Items: ${allItems.length}`);

    // Filtere existierende Items mit dem gleichen Präfix
    const itemsWithPrefix = allItems.filter(item => item.invNumber?.startsWith(prefix + '-'));
    console.log(`[PageService.generateInventoryNumbers] Items mit Präfix ${prefix}: ${itemsWithPrefix.length}`,
      itemsWithPrefix.map(i => i.invNumber));

    const existingNumbers = itemsWithPrefix
      .map(item => {
        // Extrahiere die Nummer nach dem Präfix (z.B. "PRV-001" -> 1)
        const parts = item.invNumber.split('-');
        if (parts.length >= 2) {
          const numberPart = parts.at(-1); // Letzter Teil nach dem letzten "-"
          const num = Number.parseInt(numberPart || '0', 10);
          return Number.isNaN(num) ? 0 : num;
        }
        return 0;
      })
      .filter(num => num > 0);

    console.log(`[PageService.generateInventoryNumbers] Extrahierte Nummern:`, existingNumbers);

    // Finde die höchste existierende Nummer
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    let nextNumber = maxNumber + 1;

    console.log(`[PageService.generateInventoryNumbers] Höchste Nummer: ${maxNumber}, Nächste Nummer: ${nextNumber}`);

    // Generiere neue Inventarnummern
    const inventoryNumbers: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const paddedNumber = String(nextNumber).padStart(3, '0');
      inventoryNumbers.push(`${prefix}-${paddedNumber}`);
      nextNumber++;
    }

    console.log(`[PageService.generateInventoryNumbers] Generierte Nummern:`, inventoryNumbers);
    return inventoryNumbers;
  }

  navigateToItemList(): void {
    this.router.navigate(['/admin/items']);
  }

  navigateToPrivateItemList(): void {
    this.router.navigate(['/lender/private-lend/overview']);
  }

  // Private Mode Detection
  isPrivateMode(): boolean {
    const url = (globalThis as any).location?.pathname || '';
    return url.includes('/lender/private-lend');
  }


  // Handle Private Mode Submission
  handlePrivateModeSubmit(formValue: any, currentUser: any, userRoles: string[], generatedInventoryNumbers: string[]): boolean {
    const isLenderOrAdmin = userRoles.includes('lender') || userRoles.includes('admin');

    if (!isLenderOrAdmin) {
      this.showPermissionWarning();
      return false;
    }

    if (!currentUser?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Kein Benutzer eingeloggt'
      });
      return false;
    }

    // Im Private-Modus: Erstelle den Gegenstand direkt mit POST
    const quantity = formValue.quantity || 1;
    const invNumbers = generatedInventoryNumbers.length > 0
      ? generatedInventoryNumbers
      : this.generateInventoryNumbers(formValue.invNumber || 'PRV', quantity, this.allItems());

    let successCount = 0;
    let errorCount = 0;

    const createNextItem = (index: number) => {
      if (index >= invNumbers.length) {
        if (successCount > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: `${successCount} privater Gegenstand/Gegenstände wurde(n) erstellt!`
          });
          this.navigateToPrivateItemList();
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
        owner: formValue.ownerName || currentUser.name,
        lenderId: formValue.lenderId || currentUser.id,
        productId: formValue.productId,
        available: formValue.available !== undefined ? formValue.available : true
      };

      this.itemService.createItem(payload).subscribe({
        next: () => {
          successCount++;
          createNextItem(index + 1);
        },
        error: (err) => {
          console.error('Fehler beim Erstellen:', err);
          errorCount++;
          createNextItem(index + 1);
        }
      });
    };

    createNextItem(0);
    return true;
  }

  // Show Permission Warning
  showPermissionWarning(): void {
    const keycloakUrl = 'http://localhost:8081/admin/master/console/#/LeihSy/users';

    this.messageService.add({
      severity: 'warn',
      summary: 'Fehlende Berechtigung',
      detail: 'Sie benötigen die "Lender" oder "Admin" Rolle um Gegenstände zu erstellen.'
    });

    if (confirm('Sie benötigen die "Lender" oder "Admin" Rolle um Gegenstände zu erstellen.\n\nMöchten Sie zur Keycloak-Admin-Konsole weitergeleitet werden, um die Rolle zu erhalten?')) {
      window.open(keycloakUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // Handle Update Item
  handleUpdateItem(itemId: number, formValue: any): Observable<any> {
    const payload = {
      invNumber: formValue.invNumber,
      owner: formValue.ownerName,
      lenderId: formValue.lenderId,
      productId: formValue.productId,
      available: formValue.available
    };

    return this.updateItem(itemId, payload);
  }


  // Load Imported Data
  loadImportedData(itemFormComponent: any): void {
    const importedData = this.pendingImportData();

    if (!importedData || !itemFormComponent?.itemForm) {
      return;
    }

    // Befülle das Formular mit den importierten Daten
    itemFormComponent.itemForm.patchValue({
      invNumber: importedData.invNumber || 'PRV',
      ownerName: importedData.ownerName || '',
      lenderName: importedData.lenderName || '',
      productId: importedData.productId || null,
      available: importedData.available !== undefined ? importedData.available : true,
      quantity: importedData.quantity || 1
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Daten geladen',
      detail: 'Die JSON-Daten wurden erfolgreich in das Formular geladen.'
    });

    // Lösche die gespeicherten Daten
    this.pendingImportData.set(null);
  }
}

