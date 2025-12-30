import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { ItemFormComponent } from '../../../components/admin/forms/item-form/item-form.component';
import { PrivateLendService } from '../../user-dashboard/private-lend.service';
import { AdminItemFormPageService } from './services/admin-item-form-page.service';
import { AdminItemFormLogicService } from './services/admin-item-form-logic.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-item-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    BackButtonComponent,
    ItemFormComponent
  ],
  providers: [MessageService, AdminItemFormPageService, AdminItemFormLogicService],
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
        [mode]="isPrivateMode() ? 'private' : 'admin'"
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

  private readonly route = inject(ActivatedRoute);
  private readonly pageService = inject(AdminItemFormPageService);
  private readonly logicService = inject(AdminItemFormLogicService);
  private readonly messageService = inject(MessageService);
  private readonly privateLendService = inject(PrivateLendService);

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

  isPrivateMode(): boolean {
    const url = (globalThis as any).location?.pathname || '';
    return url.includes('/user-dashboard/private-lend');
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
    if (formValue && (formValue as any).privateMode) {
      // private flow -> create JSON and send via PrivateLendService
      const payload = { ...formValue };
      payload.locationId = 'privat';
      this.privateLendService.sendAsEmail(JSON.stringify({ type: 'item', payload }, null, 2));
      this.messageService.add({ severity: 'success', summary: 'Vorschau', detail: 'Item-JSON erzeugt und Mail-Client geöffnet.' });
      this.goBack();
      return;
    }

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
      const numbers = this.logicService.generateInventoryNumbers(prefix, quantity, this.allItemsIncludingDeleted());
      this.generatedInventoryNumbers.set(numbers);
    } else {
      this.generatedInventoryNumbers.set([]);
    }
  }

  handleOwnerIdChange(ownerId: number): void {
    if (this.itemFormComponent) {
      this.logicService.handleOwnerIdChange(ownerId, this.itemFormComponent);
    }
  }

  handleOwnerNameChange(ownerName: string): void {
    if (this.itemFormComponent) {
      this.logicService.handleOwnerNameChange(ownerName, this.itemFormComponent);
    }
  }

  handleLenderIdChange(lenderId: number): void {
    if (this.itemFormComponent) {
      this.logicService.handleLenderIdChange(lenderId, this.itemFormComponent);
    }
  }

  handleLenderNameChange(lenderName: string): void {
    if (this.itemFormComponent) {
      this.logicService.handleLenderNameChange(lenderName, this.itemFormComponent);
    }
  }

  goBack(): void {
    this.logicService.navigateToItemList();
  }
}
