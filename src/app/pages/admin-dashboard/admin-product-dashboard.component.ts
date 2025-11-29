import { Component, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CommonModule } from '@angular/common';
import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TabsModule,
    InputNumberModule
  ],
  templateUrl: './admin-product-dashboard.component.html',
  styleUrls: ['./admin-product-dashboard.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class AdminProductDashboardComponent {

  itemForm: FormGroup;

  // Signals
  allProducts = signal<Product[]>([]);
  isLoading = signal(false);
  isEditMode = signal(false);
  editingProductId = signal<number | null>(null);
  searchQuery = signal('');
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  categories = [
    { id: 1, name: 'Kamera' },
    { id: 2, name: 'Audio' },
    { id: 3, name: 'Licht' },
    { id: 4, name: 'Stativ' },
    { id: 5, name: 'Objektiv' },
    { id: 6, name: 'Zubehör' }
  ];

  filteredProducts = computed(() => {
    const products = this.allProducts();
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) return products;

    return products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.categoryName.toLowerCase().includes(query)
    );
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly itemService: ItemService,
    private readonly productService: ProductService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {

    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      expiryDate: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      accessories: [''],
      categoryId: [null, Validators.required],
      locationId: [null, Validators.required],
      locationRoomNr: ['', Validators.required],
      lenderId: [null],
      lenderName: [''],
      availableItems: [0, Validators.min(0)],
      totalItems: [0, Validators.min(1)]
    });

    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Fehler beim Laden der Produkte:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Produkte konnten nicht geladen werden.'
        });
        this.isLoading.set(false);
      }
    });
  }

  submitForm(): void {
    if (!this.itemForm.valid) return;

    const dto = this.itemForm.value;
    const editId = this.editingProductId();
    const imageFile = this.selectedFile();

    if (editId !== null) {
      this.productService.updateProduct(editId, dto, imageFile).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Produkt wurde aktualisiert!'
          });
          this.resetForm();
          this.loadProducts();
        },
        error: (err: any) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Produkt konnte nicht aktualisiert werden.'
          });
        }
      });

    } else {
      this.productService.createProduct(dto, imageFile).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Produkt wurde erstellt!'
          });
          this.resetForm();
          this.loadProducts();
        },
        error: (err: any) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Produkt konnte nicht erstellt werden.'
          });
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);

    this.isEditMode.set(true);
    this.editingProductId.set(product.id);

    this.itemForm.patchValue({
      name: product.name,
      description: product.description,
      expiryDate: product.expiryDate,
      price: product.price,
      imageUrl: product.imageUrl,
      accessories: product.accessories,
      categoryId: product.categoryId,
      locationId: product.locationId,
      locationRoomNr: product.locationRoomNr,
      lenderId: product.lenderId,
      lenderName: product.lenderName,
      availableItems: product.availableItems,
      totalItems: product.totalItems
    });

    if (product.imageUrl) {
      this.imagePreview.set('http://localhost:8080' + product.imageUrl);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: `Möchten Sie das Produkt "${product.name}" wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: () => {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Gelöscht',
              detail: 'Produkt wurde gelöscht.'
            });
            this.loadProducts();
          },
          error: (err: any) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Produkt konnte nicht gelöscht werden.'
            });
          }
        });
      }
    });
  }

  resetForm(): void {
    this.itemForm.reset();
    this.isEditMode.set(false);
    this.editingProductId.set(null);
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Nur JPG, PNG und WebP Dateien erlaubt'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Datei zu groß (max. 5MB)'
        });
        return;
      }

      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.itemForm.patchValue({ imageUrl: null });
  }
}
