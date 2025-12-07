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
  ownerDisplayValue = signal<string>('');
  isLoadingOwner = signal<boolean>(false);
  lenderDisplayValue = signal<string>('');
  isLoadingLender = signal<boolean>(false);


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
      owner: ['', Validators.required],
      lenderId: [null, Validators.required],
      productId: [null, Validators.required],
      available: [true],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    this.loadProducts();
    this.loadItems();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProductsWithCategories().subscribe({
      next: (products) => {
        console.log('✅ Products with categories loaded:', products);
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading products with categories:', err);
        console.log('⚠️ Versuche Fallback ohne Kategorien...');

        // Fallback ohne expandierte Kategorien
        this.productService.getProducts().subscribe({
          next: (products) => {
            console.log('✅ Products loaded (fallback):', products);
            this.allProducts.set(products);
            this.isLoading.set(false);
          },
          error: (fallbackErr) => {
            console.error('❌ Auch Fallback fehlgeschlagen:', fallbackErr);
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
        console.log('Items loaded:', items);
        this.allItems.set(items);
        this.loadUserNamesForItems();
        this.loadLenderNamesForItems();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Gegenstände.'
        });
        this.isLoading.set(false);
      }
    });
  }

  submitForm() {
    if (!this.itemForm.valid) return;

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
          owner: formValue.owner,
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
        owner: formValue.owner,
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

    this.itemForm.patchValue({
      invNumber: item.invNumber,
      owner: item.owner,
      lenderId: item.lenderId,
      productId: item.productId,
      available: item.available
    });

    // Setze Display-Werte
    this.ownerDisplayValue.set(this.getOwnerDisplay(item.owner));
    this.lenderDisplayValue.set(this.getLenderDisplay(item.lenderId));

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
    this.ownerDisplayValue.set('');
    this.isLoadingOwner.set(false);
    this.lenderDisplayValue.set('');
    this.isLoadingLender.set(false);
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

    const allItems = this.allItems();


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
   * Behandelt Änderungen im Owner-Feld
   * Akzeptiert sowohl User ID (Zahl) als auch Username (String)
   */
  onOwnerChange(): void {
    const ownerValue = this.itemForm.get('owner')?.value?.trim();
    if (!ownerValue) {
      this.ownerDisplayValue.set('');
      return;
    }

    this.isLoadingOwner.set(true);

    // Prüfe ob es eine Zahl ist (User ID)
    const userId = Number(ownerValue);
    if (!Number.isNaN(userId) && Number.isInteger(userId)) {
      // User ID eingegeben - hole Username
      this.userService.getUserById(userId).subscribe({
        next: (user: User) => {
          this.ownerDisplayValue.set(`${user.name} (ID: ${user.id})`);
          this.userIdToNameMap.update(map => {
            const newMap = new Map(map);
            newMap.set(user.id, user.name);
            return newMap;
          });
          this.isLoadingOwner.set(false);
        },
        error: () => {
          this.ownerDisplayValue.set('Benutzer nicht gefunden');
          this.isLoadingOwner.set(false);
        }
      });
    } else {
      // Username eingegeben - hole User ID
      this.userService.getUserByName(ownerValue).subscribe({
        next: (user: User) => {
          this.ownerDisplayValue.set(`${user.name} (ID: ${user.id})`);
          this.itemForm.patchValue({ owner: user.id.toString() }, { emitEvent: false });
          this.userIdToNameMap.update(map => {
            const newMap = new Map(map);
            newMap.set(user.id, user.name);
            return newMap;
          });
          this.isLoadingOwner.set(false);
        },
        error: () => {
          this.ownerDisplayValue.set('Benutzer nicht gefunden');
          this.isLoadingOwner.set(false);
        }
      });
    }
  }

  /**
   * Gibt den Anzeigenamen für einen Owner zurück
   * Wenn owner eine User ID ist, wird der Username angezeigt
   */
  getOwnerDisplay(owner: string): string {
    const userId = Number(owner);
    if (!Number.isNaN(userId) && Number.isInteger(userId)) {
      const userName = this.userIdToNameMap().get(userId);
      return userName ? `${userName} (ID: ${userId})` : owner;
    }
    return owner;
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
            console.warn(`Could not load user with ID ${userId}`);
          }
        });
      }
    });
  }

  /**
   * Behandelt Änderungen im Lender-Feld
   * Akzeptiert sowohl User ID (Zahl) als auch Username (String)
   */
  onLenderChange(): void {
    const lenderValue = this.itemForm.get('lenderId')?.value;
    if (!lenderValue) {
      this.lenderDisplayValue.set('');
      return;
    }

    this.isLoadingLender.set(true);

    // Prüfe ob es eine Zahl ist (User ID)
    const userId = Number(lenderValue);
    if (!Number.isNaN(userId) && Number.isInteger(userId)) {
      // User ID eingegeben - hole Username
      this.userService.getUserById(userId).subscribe({
        next: (user: User) => {
          this.lenderDisplayValue.set(`${user.name} (ID: ${user.id})`);
          this.userIdToNameMap.update(map => {
            const newMap = new Map(map);
            newMap.set(user.id, user.name);
            return newMap;
          });
          this.isLoadingLender.set(false);
        },
        error: () => {
          this.lenderDisplayValue.set('Benutzer nicht gefunden');
          this.isLoadingLender.set(false);
        }
      });
    } else {
      // Username eingegeben - hole User ID
      const usernameStr = String(lenderValue).trim();
      this.userService.getUserByName(usernameStr).subscribe({
        next: (user: User) => {
          this.lenderDisplayValue.set(`${user.name} (ID: ${user.id})`);
          this.itemForm.patchValue({ lenderId: user.id }, { emitEvent: false });
          this.userIdToNameMap.update(map => {
            const newMap = new Map(map);
            newMap.set(user.id, user.name);
            return newMap;
          });
          this.isLoadingLender.set(false);
        },
        error: () => {
          this.lenderDisplayValue.set('Benutzer nicht gefunden');
          this.isLoadingLender.set(false);
        }
      });
    }
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
            console.warn(`Could not load lender with ID ${lenderId}`);
          }
        });
      }
    });
  }
}
