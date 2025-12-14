import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { ItemFormComponent } from './components/item-form.component';
import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { Item } from '../../models/item.model';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-item-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    BackButtonComponent,
    ItemFormComponent
  ],
  providers: [MessageService],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      <p-toast position="bottom-right"></p-toast>

      <app-back-button (backClick)="goBack()"></app-back-button>

      <app-item-form
        [item]="item()"
        [products]="allProducts()"
        [selectedProduct]="selectedProduct()"
        [isEditMode]="isEditMode()"
        [generatedInventoryNumbers]="generatedInventoryNumbers()"
        (formSubmit)="handleFormSubmit($event)"
        (formCancel)="goBack()"
        (inventoryPrefixChange)="handleInventoryPrefixChange($event)"
        (ownerIdChange)="handleOwnerIdChange($event)"
        (ownerNameChange)="handleOwnerNameChange($event)"
        (lenderIdChange)="handleLenderIdChange($event)"
        (lenderNameChange)="handleLenderNameChange($event)">
      </app-item-form>
    </div>
  `
})
export class AdminItemFormPageComponent implements OnInit {
  @ViewChild(ItemFormComponent) itemFormComponent!: ItemFormComponent;

  item = signal<Item | null>(null);
  allProducts = signal<Product[]>([]);
  allItemsIncludingDeleted = signal<Item[]>([]);
  selectedProduct = signal<Product | null>(null);
  generatedInventoryNumbers = signal<string[]>([]);
  isEditMode = signal(false);
  itemId: number | null = null;
  productId: number | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly itemService: ItemService,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const productIdParam = this.route.snapshot.queryParamMap.get('productId');

    if (id) {
      this.itemId = Number.parseInt(id, 10);
      this.isEditMode.set(true);
      this.loadItem();
    }

    if (productIdParam) {
      this.productId = Number.parseInt(productIdParam, 10);
      this.loadSelectedProduct();
    }

    this.loadProducts();
    this.loadAllItemsIncludingDeleted();
  }

  loadItem(): void {
    if (!this.itemId) return;

    this.itemService.getItemById(this.itemId).subscribe({
      next: (item) => {
        this.item.set(item);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Items:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Item konnte nicht geladen werden.'
        });
        this.goBack();
      }
    });
  }

  loadSelectedProduct(): void {
    if (!this.productId) return;

    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.selectedProduct.set(product);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Produkts:', err);
      }
    });
  }

  loadProducts(): void {
    this.productService.getProductsWithCategories().subscribe({
      next: (products) => {
        this.allProducts.set(products);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Produkte:', err);
        this.productService.getProducts().subscribe({
          next: (products) => {
            this.allProducts.set(products);
          }
        });
      }
    });
  }

  loadAllItemsIncludingDeleted(): void {
    this.itemService.getAllItems().subscribe({
      next: (activeItems) => {
        this.allItemsIncludingDeleted.set(activeItems);
      },
      error: () => {
        this.allItemsIncludingDeleted.set([]);
      }
    });
  }

  handleFormSubmit(formValue: any): void {
    if (this.isEditMode() && this.itemId) {
      const payload = {
        invNumber: formValue.invNumber,
        owner: formValue.ownerName,
        lenderId: formValue.lenderId,
        productId: formValue.productId,
        available: formValue.available
      };

      this.itemService.updateItem(this.itemId, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Gegenstand wurde aktualisiert!'
          });
          this.goBack();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Gegenstand konnte nicht aktualisiert werden.'
          });
        }
      });
    } else {
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
            this.goBack();
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
  }

  handleInventoryPrefixChange(prefix: string): void {
    if (this.isEditMode()) return;

    const quantity = 1;
    if (prefix) {
      const numbers = this.generateInventoryNumbers(prefix, quantity);
      this.generatedInventoryNumbers.set(numbers);
    } else {
      this.generatedInventoryNumbers.set([]);
    }
  }


  handleOwnerIdChange(ownerId: number): void {
    this.userService.getUserById(ownerId).subscribe({
      next: (user: User) => {
        this.itemFormComponent?.patchOwnerName(user.name);
        this.itemFormComponent?.setOwnerIdDisplayValue(`Gefunden: ${user.name}`);
        this.itemFormComponent?.setOwnerFound(true);
      },
      error: () => {
        this.itemFormComponent?.setOwnerIdDisplayValue('Benutzer mit dieser ID nicht gefunden');
        this.itemFormComponent?.patchOwnerName('');
        this.itemFormComponent?.setOwnerFound(false);
      }
    });
  }

  handleOwnerNameChange(ownerName: string): void {
    this.userService.getUserByName(ownerName).subscribe({
      next: (user: User) => {
        this.itemFormComponent?.patchOwnerId(user.id);
        this.itemFormComponent?.setOwnerNameDisplayValue(`Gefunden: ID ${user.id}`);
        this.itemFormComponent?.setOwnerFound(true);
      },
      error: () => {
        this.itemFormComponent?.setOwnerNameDisplayValue('Benutzer mit diesem Namen nicht gefunden');
        this.itemFormComponent?.patchOwnerId(0);
        this.itemFormComponent?.setOwnerFound(false);
      }
    });
  }

  handleLenderIdChange(lenderId: number): void {
    this.userService.getUserById(lenderId).subscribe({
      next: (user: User) => {
        this.itemFormComponent?.patchLenderName(user.name);
        this.itemFormComponent?.setLenderDisplayValue(`Gefunden: ${user.name}`);
        this.itemFormComponent?.setLenderFound(true);
      },
      error: () => {
        this.itemFormComponent?.setLenderDisplayValue('Benutzer mit dieser ID nicht gefunden');
        this.itemFormComponent?.patchLenderName('');
        this.itemFormComponent?.setLenderFound(false);
      }
    });
  }

  handleLenderNameChange(lenderName: string): void {
    this.userService.getUserByName(lenderName).subscribe({
      next: (user: User) => {
        this.itemFormComponent?.patchLenderId(user.id);
        this.itemFormComponent?.setLenderDisplayValue(`Gefunden: ID ${user.id}`);
        this.itemFormComponent?.setLenderFound(true);
      },
      error: () => {
        this.itemFormComponent?.setLenderDisplayValue('Benutzer mit diesem Namen nicht gefunden');
        this.itemFormComponent?.patchLenderId(0);
        this.itemFormComponent?.setLenderFound(false);
      }
    });
  }

  private generateInventoryNumbers(prefix: string, quantity: number): string[] {
    if (!prefix || quantity < 1) return [];

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

  goBack(): void {
    this.router.navigate(['/admin/items']);
  }
}

