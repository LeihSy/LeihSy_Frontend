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
import { ConfirmationService, MessageService } from 'primeng/api';

import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { Item } from '../../models/item.model';
import { Product } from '../../models/product.model';

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
    TooltipModule
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
        p.product.categoryName.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly itemService: ItemService,
    private readonly productService: ProductService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      invNumber: ['', Validators.required],
      owner: ['', Validators.required],
      productId: [null, Validators.required],
      available: [true]
    });

    this.loadProducts();
    this.loadItems();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Produkte.'
        });
        this.isLoading.set(false);
      }
    });
  }

  loadItems() {
    this.isLoading.set(true);
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        console.log('Items loaded:', items);
        this.allItems.set(items);
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

    const payload = this.itemForm.value;
    const editId = this.editingItemId();

    if (editId !== null) {
      // Update
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
    } else {
      // Create
      this.itemService.createItem(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Gegenstand wurde erstellt!'
          });
          this.resetForm();
          this.loadItems();
        },
        error: err => {
          console.error('Error creating item:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Fehler beim Erstellen des Gegenstands.'
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
      productId: item.productId,
      available: item.available
    });


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
}
