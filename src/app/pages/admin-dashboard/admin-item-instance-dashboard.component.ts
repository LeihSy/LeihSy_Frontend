import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { Item } from '../../models/item.model';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-item-instance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    SelectModule,
    ToggleButtonModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    InputNumberModule
  ],
  templateUrl: './admin-item-instance-dashboard.component.html',
  styleUrls: ['./admin-item-instance-dashboard.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class AdminItemInstanceComponent implements OnInit {

  itemForm!: FormGroup;


  allItems = signal<Item[]>([]);
  allItemsIncludingDeleted = signal<Item[]>([]); // Für Inventarnummern-Prüfung
  allProducts = signal<Product[]>([]);
  selectedProductForNewItem = signal<Product | null>(null);
  isLoading = signal(true);
  isEditMode = signal(false);
  editingItemId = signal<number | null>(null);
  searchQuery = signal('');
  showItemForm = signal(false);
  expandedProductIds = signal<Set<number>>(new Set());
  generatedInventoryNumbers = signal<string[]>([]);
  userIdToNameMap = signal<Map<number, string>>(new Map());
  ownerIdDisplayValue = signal<string>('');
  ownerNameDisplayValue = signal<string>('');
  isLoadingOwnerId = signal<boolean>(false);
  isLoadingOwnerName = signal<boolean>(false);
  ownerFound = signal<boolean>(false);
  lenderDisplayValue = signal<string>('');
  isLoadingLender = signal<boolean>(false);
  lenderFound = signal<boolean>(false);


  productsWithItems = computed(() => {
    const products = this.allProducts();
    const items = this.allItems();
    const query = this.searchQuery().toLowerCase().trim();

    let filtered = products.map(product => {
      const productItems = items.filter(item => item.productId === product.id);
      return {
        product,
        items: productItems,
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
    private readonly fb: FormBuilder,
    private readonly itemService: ItemService,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      invNumber: ['', Validators.required],
      ownerId: [null],
      ownerName: ['', Validators.required],
      lenderId: [null, Validators.required],
      lenderName: [''],
      productId: [null, Validators.required],
      available: [true],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    this.loadProducts();
    this.loadItems();
    this.loadAllItemsIncludingDeleted();
  }

  loadProducts() {
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

  loadItems() {
    this.isLoading.set(true);
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.allItems.set(items);
        this.loadUserNamesForItems();
        this.loadLenderNamesForItems();
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

  loadAllItemsIncludingDeleted(): void {
    // Lade alle aktiven Items
    this.itemService.getAllItems().subscribe({
      next: (activeItems) => {
        // Lade alle gelöschten Items
        this.itemService.getDeletedItems().subscribe({
          next: (deletedItems: Item[]) => {
            // Kombiniere aktive und gelöschte Items
            const allItems = [...activeItems, ...deletedItems];
            this.allItemsIncludingDeleted.set(allItems);
          },
          error: (err: any) => {
            console.error('Fehler beim Laden der gelöschten Items:', err);
            // Fallback: Verwende nur aktive Items
            this.allItemsIncludingDeleted.set(activeItems);
          }
        });
      },
      error: (err: any) => {
        console.error('Fehler beim Laden aller Items:', err);
        this.allItemsIncludingDeleted.set([]);
      }
    });
  }

  submitForm() {
    if (!this.itemForm.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validierungsfehler',
        detail: 'Bitte füllen Sie alle Pflichtfelder aus.'
      });
      return;
    }

    // Validiere dass Owner gefunden wurde
    const ownerName = this.itemForm.get('ownerName')?.value;
    if (ownerName && !this.ownerFound()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validierungsfehler',
        detail: 'Der angegebene Besitzer konnte nicht gefunden werden. Bitte geben Sie eine gültige User ID oder Username ein.'
      });
      return;
    }

    // Validiere dass Lender gefunden wurde
    const lenderId = this.itemForm.get('lenderId')?.value;
    if (lenderId && !this.lenderFound()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validierungsfehler',
        detail: 'Der angegebene Verleiher konnte nicht gefunden werden. Bitte geben Sie eine gültige User ID oder Username ein.'
      });
      return;
    }

    const formValue = this.itemForm.value;
    const editId = this.editingItemId();

    if (editId === null) {
      const quantity = formValue.quantity || 1;
      const invNumbers = this.generateInventoryNumbers(formValue.invNumber, quantity);

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
            this.resetForm();
            this.loadItems();
            this.loadAllItemsIncludingDeleted();
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

        const payload = {
          invNumber: invNumbers[index],
          owner: formValue.ownerName, // Nur der Name wird weitergegeben
          lenderId: formValue.lenderId,
          productId: formValue.productId,
          available: formValue.available
        };

        this.itemService.createItem(payload).subscribe({
          next: () => {
            successCount++;
            createNextItem(index + 1);
          },
          error: err => {
            console.error('Error creating item:', err);
            errorCount++;
            createNextItem(index + 1);
          }
        });
      };

      createNextItem(0);
    } else {
      // Update existing item
      const payload = {
        invNumber: formValue.invNumber,
        owner: formValue.ownerName, // Nur der Name wird weitergegeben
        lenderId: formValue.lenderId,
        productId: formValue.productId,
        available: formValue.available
      };

      this.itemService.updateItem(editId, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Gegenstand wurde aktualisiert!'
          });
          this.resetForm();
          this.loadItems();
          this.loadAllItemsIncludingDeleted();
        },
        error: err => {
          console.error('Error updating item:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Fehler beim Aktualisieren des Gegenstands.'
          });
        }
      });
    }
  }


  editItem(item: Item): void {
    this.isEditMode.set(true);
    this.editingItemId.set(item.id);
    this.showItemForm.set(true);

    // Hole den Lender-Namen aus der Map
    const lenderName = item.lenderId ? this.userIdToNameMap().get(item.lenderId) : '';

    // Owner ist jetzt nur der Name, versuche ID zu finden
    let ownerId = null;
    for (const [id, name] of this.userIdToNameMap()) {
      if (name === item.owner) {
        ownerId = id;
        break;
      }
    }

    this.itemForm.patchValue({
      invNumber: item.invNumber,
      ownerId: ownerId,
      ownerName: item.owner,
      lenderId: item.lenderId,
      lenderName: lenderName || '',
      productId: item.productId,
      available: item.available
    });

    // Setze Display-Werte und Found-Status
    if (ownerId) {
      this.ownerIdDisplayValue.set(`Gefunden: ${item.owner}`);
    }
    this.ownerFound.set(true); // Im Edit-Modus ist der Owner bereits validiert

    if (item.lenderId && lenderName) {
      this.lenderDisplayValue.set(`Gefunden: ${lenderName}`);
      this.lenderFound.set(true); // Im Edit-Modus ist der Lender bereits validiert
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  resetForm(): void {
    this.itemForm.reset({ available: true });
    this.isEditMode.set(false);
    this.editingItemId.set(null);
    this.showItemForm.set(false);
    this.selectedProductForNewItem.set(null);
    this.ownerIdDisplayValue.set('');
    this.ownerNameDisplayValue.set('');
    this.isLoadingOwnerId.set(false);
    this.isLoadingOwnerName.set(false);
    this.ownerFound.set(false);
    this.lenderDisplayValue.set('');
    this.isLoadingLender.set(false);
    this.lenderFound.set(false);
  }

  addItemForProduct(product: Product): void {
    this.selectedProductForNewItem.set(product);
    this.showItemForm.set(true);
    this.isEditMode.set(false);
    this.editingItemId.set(null);

    this.itemForm.reset({
      productId: product.id,
      available: true
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
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


  generateInventoryNumbers(prefix: string, quantity: number): string[] {
    if (!prefix || quantity < 1) return [];

    // Verwende allItemsIncludingDeleted um auch gelöschte Items zu berücksichtigen
    const allItems = this.allItemsIncludingDeleted();

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


  onInventoryPrefixChange(): void {
    if (this.isEditMode()) return;

    const prefix = this.itemForm.get('invNumber')?.value || '';
    const quantity = this.itemForm.get('quantity')?.value || 1;

    if (prefix) {
      const numbers = this.generateInventoryNumbers(prefix, quantity);
      this.generatedInventoryNumbers.set(numbers);
    } else {
      this.generatedInventoryNumbers.set([]);
    }
  }


  onQuantityChange(): void {
    if (this.isEditMode()) return;

    const prefix = this.itemForm.get('invNumber')?.value || '';
    const quantity = this.itemForm.get('quantity')?.value || 1;

    if (prefix) {
      const numbers = this.generateInventoryNumbers(prefix, quantity);
      this.generatedInventoryNumbers.set(numbers);
    }
  }

  /**
   * Behandelt Änderungen im Owner ID Feld
   * Lädt den Benutzernamen und füllt das Name-Feld aus
   */
  onOwnerIdChange(): void {
    const ownerId = this.itemForm.get('ownerId')?.value;
    if (!ownerId) {
      this.ownerIdDisplayValue.set('');
      this.ownerFound.set(false);
      this.itemForm.patchValue({ ownerName: '' }, { emitEvent: false });
      return;
    }

    this.isLoadingOwnerId.set(true);

    const userId = Number(ownerId);
    if (!Number.isNaN(userId) && Number.isInteger(userId)) {
      this.userService.getUserById(userId).subscribe({
        next: (user: User) => {
          this.ownerIdDisplayValue.set(`Gefunden: ${user.name}`);
          this.ownerFound.set(true);
          this.itemForm.patchValue({ ownerName: user.name }, { emitEvent: false });
          this.userIdToNameMap.update(map => {
            const newMap = new Map(map);
            newMap.set(user.id, user.name);
            return newMap;
          });
          this.isLoadingOwnerId.set(false);
        },
        error: () => {
          this.ownerIdDisplayValue.set('Benutzer mit dieser ID nicht gefunden');
          this.ownerFound.set(false);
          this.itemForm.patchValue({ ownerName: '' }, { emitEvent: false });
          this.isLoadingOwnerId.set(false);
        }
      });
    } else {
      this.ownerIdDisplayValue.set('Ungültige ID');
      this.ownerFound.set(false);
      this.isLoadingOwnerId.set(false);
    }
  }

  /**
   * Behandelt Änderungen im Owner Name Feld
   * Lädt die User ID und füllt das ID-Feld aus
   */
  onOwnerNameChange(): void {
    const ownerName = this.itemForm.get('ownerName')?.value?.trim();
    if (!ownerName) {
      this.ownerNameDisplayValue.set('');
      this.ownerFound.set(false);
      this.itemForm.patchValue({ ownerId: null }, { emitEvent: false });
      return;
    }

    this.isLoadingOwnerName.set(true);

    this.userService.getUserByName(ownerName).subscribe({
      next: (user: User) => {
        this.ownerNameDisplayValue.set(`Gefunden: ID ${user.id}`);
        this.ownerFound.set(true);
        this.itemForm.patchValue({ ownerId: user.id }, { emitEvent: false });
        this.userIdToNameMap.update(map => {
          const newMap = new Map(map);
          newMap.set(user.id, user.name);
          return newMap;
        });
        this.isLoadingOwnerName.set(false);
      },
      error: () => {
        this.ownerNameDisplayValue.set('Benutzer mit diesem Namen nicht gefunden');
        this.ownerFound.set(false);
        this.itemForm.patchValue({ ownerId: null }, { emitEvent: false });
        this.isLoadingOwnerName.set(false);
      }
    });
  }

  /**
   * Gibt den Anzeigenamen für einen Owner zurück
   */
  getOwnerDisplay(owner: string): string {
    // Owner ist jetzt nur der Name, direkt zurückgeben
    return owner || 'N/A';
  }

  /**
   * Lädt User-Namen für alle Items
   */
  loadUserNamesForItems(): void {
    const items = this.allItems();
    const userIds = new Set<number>();

    items.forEach(item => {
      const userId = Number(item.owner);
      if (!Number.isNaN(userId) && Number.isInteger(userId)) {
        userIds.add(userId);
      }
    });

    userIds.forEach(userId => {
      if (!this.userIdToNameMap().has(userId)) {
        this.userService.getUserById(userId).subscribe({
          next: (user: User) => {
            this.userIdToNameMap.update(map => {
              const newMap = new Map(map);
              newMap.set(user.id, user.name);
              return newMap;
            });
          },
          error: () => {
            // Fehler beim Laden des Users - stillschweigend ignorieren
          }
        });
      }
    });
  }

  /**
   * Behandelt Änderungen im Lender ID Feld
   * Lädt den Benutzernamen und füllt das Name-Feld aus
   */
  onLenderIdChange(): void {
    const lenderId = this.itemForm.get('lenderId')?.value;
    if (!lenderId) {
      this.lenderDisplayValue.set('');
      this.lenderFound.set(false);
      this.itemForm.patchValue({ lenderName: '' }, { emitEvent: false });
      return;
    }

    this.isLoadingLender.set(true);

    const userId = Number(lenderId);
    if (!Number.isNaN(userId) && Number.isInteger(userId)) {
      // Hole User anhand der ID
      this.userService.getUserById(userId).subscribe({
        next: (user: User) => {
          this.lenderDisplayValue.set(`Gefunden: ${user.name}`);
          this.lenderFound.set(true);
          this.itemForm.patchValue({ lenderName: user.name }, { emitEvent: false });
          this.userIdToNameMap.update(map => {
            const newMap = new Map(map);
            newMap.set(user.id, user.name);
            return newMap;
          });
          this.isLoadingLender.set(false);
        },
        error: () => {
          this.lenderDisplayValue.set('Benutzer mit dieser ID nicht gefunden');
          this.lenderFound.set(false);
          this.itemForm.patchValue({ lenderName: '' }, { emitEvent: false });
          this.isLoadingLender.set(false);
        }
      });
    } else {
      this.lenderDisplayValue.set('Ungültige ID');
      this.lenderFound.set(false);
      this.isLoadingLender.set(false);
    }
  }

  /**
   * Behandelt Änderungen im Lender Name Feld
   * Lädt die User ID und füllt das ID-Feld aus
   */
  onLenderNameChange(): void {
    const lenderName = this.itemForm.get('lenderName')?.value?.trim();
    if (!lenderName) {
      this.lenderDisplayValue.set('');
      this.lenderFound.set(false);
      this.itemForm.patchValue({ lenderId: null }, { emitEvent: false });
      return;
    }

    this.isLoadingLender.set(true);

    // Hole User anhand des Namens
    this.userService.getUserByName(lenderName).subscribe({
      next: (user: User) => {
        this.lenderDisplayValue.set(`Gefunden: ID ${user.id}`);
        this.lenderFound.set(true);
        this.itemForm.patchValue({ lenderId: user.id }, { emitEvent: false });
        this.userIdToNameMap.update(map => {
          const newMap = new Map(map);
          newMap.set(user.id, user.name);
          return newMap;
        });
        this.isLoadingLender.set(false);
      },
      error: () => {
        this.lenderDisplayValue.set('Benutzer mit diesem Namen nicht gefunden');
        this.lenderFound.set(false);
        this.itemForm.patchValue({ lenderId: null }, { emitEvent: false });
        this.isLoadingLender.set(false);
      }
    });
  }

  /**
   * Gibt den Anzeigenamen für einen Lender zurück
   */
  getLenderDisplay(lenderId: number | undefined): string {
    if (!lenderId) return 'N/A';
    const userName = this.userIdToNameMap().get(lenderId);
    return userName ? `${userName} (ID: ${lenderId})` : lenderId.toString();
  }

  /**
   * Lädt Lender-Namen für alle Items
   */
  loadLenderNamesForItems(): void {
    const items = this.allItems();
    const lenderIds = new Set<number>();

    items.forEach(item => {
      if (item.lenderId) {
        lenderIds.add(item.lenderId);
      }
    });

    lenderIds.forEach(lenderId => {
      if (!this.userIdToNameMap().has(lenderId)) {
        this.userService.getUserById(lenderId).subscribe({
          next: (user: User) => {
            this.userIdToNameMap.update(map => {
              const newMap = new Map(map);
              newMap.set(user.id, user.name);
              return newMap;
            });
          },
          error: () => {
            // Fehler beim Laden des Lenders - stillschweigend ignorieren
          }
        });
      }
    });
  }
}
