import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { ItemFormComponent } from './components/item-form.component';
import { AdminItemFormPageService } from './services/admin-item-form-page.service';
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
  providers: [MessageService, AdminItemFormPageService],
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

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pageService = inject(AdminItemFormPageService);

  // Use service signals directly
  item = this.pageService.item;
  allProducts = this.pageService.products;
  allItemsIncludingDeleted = this.pageService.allItems;

  // Local component signals
  selectedProduct = signal<Product | null>(null);
  generatedInventoryNumbers = signal<string[]>([]);
  isEditMode = signal(false);
  itemId: number | null = null;
  productId: number | null = null;


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
    this.pageService.loadItem(this.itemId);
  }

  loadSelectedProduct(): void {
    if (!this.productId) return;

    this.pageService.loadProduct(this.productId).subscribe({
      next: (product) => {
        this.selectedProduct.set(product);
      },
      error: () => {
        // Error handling is done in service
      }
    });
  }

  loadProducts(): void {
    this.pageService.loadProducts();
  }

  loadAllItemsIncludingDeleted(): void {
    this.pageService.loadAllItems();
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

      this.pageService.updateItem(this.itemId, payload).subscribe({
        next: () => {
          // Success handling is done in service
        },
        error: () => {
          // Error handling is done in service
        }
      });
    } else {
      this.pageService.createItems(formValue);
    }
  }

  handleInventoryPrefixChange(prefix: string): void {
    if (this.isEditMode()) return;

    const quantity = 1;
    if (prefix) {
      const numbers = this.pageService.generateInventoryNumbers(prefix, quantity, this.allItemsIncludingDeleted());
      this.generatedInventoryNumbers.set(numbers);
    } else {
      this.generatedInventoryNumbers.set([]);
    }
  }

  handleOwnerIdChange(ownerId: number): void {
    this.pageService.user.getUserById(ownerId).subscribe({
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
    this.pageService.user.getUserByName(ownerName).subscribe({
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
    this.pageService.user.getUserById(lenderId).subscribe({
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
    this.pageService.user.getUserByName(lenderName).subscribe({
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

  goBack(): void {
    this.pageService.navigateToItemList();
  }
}
