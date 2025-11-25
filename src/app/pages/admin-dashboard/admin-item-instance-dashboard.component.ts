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

  // Signals für State Management
  allItems = signal<Item[]>([]);
  allProducts = signal<Product[]>([]);
  selectedProductId = signal<number | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  isEditMode = signal(false);
  editingItemId = signal<number | null>(null);
  searchQuery = signal('');

  // Computed Properties
  products = computed(() => {
    return this.allProducts().map(p => ({
      label: p.name,
      value: p.id
    }));
  });

  selectedProductName = computed(() => {
    const productId = this.selectedProductId();
    if (!productId) return '';
    const product = this.allProducts().find(p => p.id === productId);
    return product?.name || '';
  });

  filteredItems = computed(() => {
    const items = this.allItems();
    const productId = this.selectedProductId();
    const query = this.searchQuery().toLowerCase().trim();

    let filtered = items;

    // Filter nach Produktname
    if (productId) {
      const selectedProduct = this.allProducts().find(p => p.id === productId);
      if (selectedProduct) {
        filtered = filtered.filter(item => item.name === selectedProduct.name);
      }
    }

    // Filter nach Suchbegriff
    if (query) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.inventoryNumber.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
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
      inventoryNumber: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      categoryId: [null, Validators.required],
      location: [''],
      imageUrl: [''],
      accessories: [''],
      status: ['AVAILABLE']
    });

    this.itemForm.get('name')?.valueChanges.subscribe(value => {
      // Wenn ein Name eingegeben wird, versuche das entsprechende Produkt zu finden
      const product = this.allProducts().find(p => p.name === value);
      if (product) {
        this.selectedProductId.set(product.id);
      }
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

  // Item zum Bearbeiten auswählen
  editItem(item: Item): void {
    this.isEditMode.set(true);
    this.editingItemId.set(item.id);

    this.itemForm.patchValue({
      inventoryNumber: item.inventoryNumber,
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      location: item.location,
      imageUrl: item.imageUrl,
      accessories: item.accessories,
      status: item.status
    });

    // Setze das ausgewählte Produkt
    const product = this.allProducts().find(p => p.name === item.name);
    if (product) {
      this.selectedProductId.set(product.id);
    }

    // Scroll zum Formular
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Item löschen mit Bestätigung
  deleteItem(item: Item): void {
    this.confirmationService.confirm({
      message: `Möchten Sie den Gegenstand "${item.name}" (${item.inventoryNumber}) wirklich löschen?`,
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

  // Formular zurücksetzen
  resetForm(): void {
    this.itemForm.reset({ status: 'AVAILABLE' });
    this.isEditMode.set(false);
    this.editingItemId.set(null);
  }

  // Filter zurücksetzen (nur Produktfilter)
  resetFilter() {
    this.selectedProductId.set(null);
  }

  // Suche aktualisieren
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }
}
