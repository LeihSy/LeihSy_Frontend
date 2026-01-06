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

  // Dialog state
  showJsonDialog = signal(false);
  jsonString = signal('');
  copySuccess = signal(false);
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

  // Private Mode Detection
  isPrivateMode(): boolean {
    const url = (globalThis as any).location?.pathname || '';
    return url.includes('/user-dashboard/private-lend');
  }

  // JSON Dialog Methods
  createJsonPayload(formValue: any, currentUser: any, userRoles: string[], generatedInventoryNumbers: string[]): string {
    const payload = { ...formValue };

    // Verwende die erste generierte Inventarnummer, falls vorhanden
    if (generatedInventoryNumbers.length > 0) {
      payload.invNumber = generatedInventoryNumbers[0];
    } else {
      payload.invNumber = 'PRV-' + Date.now();
    }

    // Setze Location ID fest auf 7 (privat)
    payload.locationId = 7;

    // Füge User-IDs hinzu
    payload.ownerId = currentUser.id;
    payload.ownerName = payload.ownerName || currentUser.name;
    payload.lenderId = currentUser.id;
    payload.lenderName = payload.lenderName || currentUser.name;

    // Füge User-Rollen hinzu
    payload.userRoles = userRoles;

    // Erstelle JSON-String
    const jsonData = {
      type: 'item',
      timestamp: new Date().toISOString(),
      payload: payload
    };

    return JSON.stringify(jsonData, null, 2);
  }

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
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

    // Erstelle JSON und zeige Dialog
    const jsonString = this.createJsonPayload(formValue, currentUser, userRoles, generatedInventoryNumbers);

    this.jsonString.set(jsonString);
    this.showJsonDialog.set(true);
    this.copySuccess.set(false);

    this.messageService.add({
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Gegenstand-Daten als JSON vorbereitet.'
    });

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

  // Dialog Management
  closeJsonDialog(): void {
    this.showJsonDialog.set(false);
    this.copySuccess.set(false);
  }

  // Clipboard with Success Handling
  copyToClipboardWithFeedback(text: string): Promise<void> {
    return this.copyToClipboard(text).then(() => {
      this.copySuccess.set(true);
      this.messageService.add({
        severity: 'success',
        summary: 'Kopiert',
        detail: 'JSON wurde in die Zwischenablage kopiert!'
      });

      setTimeout(() => this.copySuccess.set(false), 3000);
    }).catch(err => {
      console.error('Fehler beim Kopieren:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Konnte nicht in Zwischenablage kopieren.'
      });
      throw err;
    });
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

