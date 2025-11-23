import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';

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
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    SelectModule,
    ToggleButtonModule
  ],
  templateUrl: './admin-item-instance-dashboard.component.html',
  styleUrls: ['./admin-item-instance-dashboard.component.scss']
})
export class AdminItemInstanceComponent implements OnInit {

  itemForm!: FormGroup;

  // Signals für State Management
  allItems = signal<Item[]>([]);
  allProducts = signal<Product[]>([]);
  selectedProductId = signal<number | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

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

    if (!productId) {
      return items;
    }

    const selectedProduct = this.allProducts().find(p => p.id === productId);
    if (!selectedProduct) {
      return items;
    }

    return items.filter(item =>
      item.name === selectedProduct.name
    );
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly itemService: ItemService,
    private readonly productService: ProductService
  ) {
    effect(() => {
      const formValue = this.itemForm?.value;
      if (formValue?.productId) {
        this.selectedProductId.set(formValue.productId);
      }
    });
  }

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      invNumber: ['', Validators.required],
      owner: ['', Validators.required],
      productId: [null, Validators.required],
      available: [true]
    });

    this.itemForm.get('productId')?.valueChanges.subscribe(value => {
      this.selectedProductId.set(value);
    });

    this.loadProducts();
    this.loadItems();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errorMessage.set('Fehler beim Laden der Produkte.');
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
        this.errorMessage.set('Fehler beim Laden der Gegenstände.');
        this.isLoading.set(false);
      }
    });
  }

  submitForm() {
    if (!this.itemForm.valid) return;

    const payload = this.itemForm.value;

    this.itemService.createItem(payload).subscribe({
      next: () => {
        this.itemForm.reset({ available: true });
        this.loadItems();
      },
      error: err => {
        console.error('Error creating item:', err);
        this.errorMessage.set('Fehler beim Erstellen der Instanz.');
      }
    });
  }

  resetFilter() {
    this.selectedProductId.set(null);
    this.itemForm.patchValue({ productId: null });
  }
}
