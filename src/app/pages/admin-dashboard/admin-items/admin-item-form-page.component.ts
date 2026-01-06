import { Component, OnInit, AfterViewInit, signal, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { ItemFormComponent } from '../../../components/form-components/item-form/item-form.component';
import { AdminItemFormPageService } from './page-services/admin-item-form-page.service';
import { AdminItemFormLogicService } from './page-services/admin-item-form-logic.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-item-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    BackButtonComponent,
    ItemFormComponent
  ],
  providers: [MessageService, AdminItemFormPageService, AdminItemFormLogicService],
  templateUrl: './admin-item-form-page.component.html'
})
export class AdminItemFormPageComponent implements OnInit, AfterViewInit {
  @ViewChild(ItemFormComponent) itemFormComponent!: ItemFormComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pageService = inject(AdminItemFormPageService);
  private readonly logicService = inject(AdminItemFormLogicService);
  private readonly authService = inject(AuthService);

  // Use page-services signals directly
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
    } else {
      // Prüfe auf importierte Daten und speichere sie im Service
      const navigation = this.router.getCurrentNavigation();
      const importedData = navigation?.extras?.state?.['importedData'];

      if (importedData) {
        this.pageService.pendingImportData.set(importedData);
      }
    }

    if (productIdParam) {
      this.productId = Number.parseInt(productIdParam, 10);
      this.loadSelectedProduct();
    }

    this.loadProducts();
    this.loadAllItemsIncludingDeleted();

    // Im Private-Modus: Generiere Inventarnummern mit PRV-Präfix
    if (this.isPrivateMode() && !this.isEditMode()) {
      setTimeout(() => {
        this.handleInventoryPrefixChange('PRV');
      }, 500);
    }
  }

  ngAfterViewInit(): void {
    // Lade importierte Daten nach dem View initialisiert wurde
    if (this.pageService.pendingImportData()) {
      setTimeout(() => {
        this.pageService.loadImportedData(this.itemFormComponent);
      }, 200);
    }
  }

  isPrivateMode(): boolean {
    return this.pageService.isPrivateMode();
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
        // Error handling is done in page-page-page-page-services
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
    if (formValue && (formValue.privateMode || this.isPrivateMode())) {
      const currentUser = this.authService.currentUser();
      const userRoles = this.authService.getRoles();

      this.pageService.handlePrivateModeSubmit(
        formValue,
        currentUser,
        userRoles,
        this.generatedInventoryNumbers()
      );
      return;
    }

    if (this.isEditMode() && this.itemId) {
      this.pageService.handleUpdateItem(this.itemId, formValue).subscribe();
    } else {
      this.pageService.createItems(formValue);
    }
  }

  handleInventoryPrefixChange(prefix: string): void {
    if (this.isEditMode()) return;

    // Im Private-Modus immer PRV verwenden
    const finalPrefix = this.isPrivateMode() ? 'PRV' : prefix;

    const quantity = 1;
    if (finalPrefix) {
      // Warte bis Items geladen sind (prüfe ob Signal Daten hat)
      const checkAndGenerate = () => {
        const items = this.allItemsIncludingDeleted();
        if (items.length > 0 || this.pageService.isLoading() === false) {
          const numbers = this.logicService.generateInventoryNumbers(finalPrefix, quantity, items);
          this.generatedInventoryNumbers.set(numbers);
        } else {
          // Warte noch etwas länger und versuche es erneut
          setTimeout(checkAndGenerate, 200);
        }
      };
      checkAndGenerate();
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
    if (this.isPrivateMode()) {
      this.pageService.navigateToPrivateItemList();
    } else {
      this.logicService.navigateToItemList();
    }
  }
}
