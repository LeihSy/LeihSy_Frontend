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
import { CategoryService } from '../../services/category.service';
import { LocationService } from '../../services/location.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Location } from '../../models/location.model';

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
  allCategories = signal<Category[]>([]);
  allLocations = signal<Location[]>([]);
  isLoading = signal(false);
  isEditMode = signal(false);
  editingProductId = signal<number | null>(null);
  searchQuery = signal('');
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  locationDisplayValue = signal<string>('');
  isLoadingLocation = signal<boolean>(false);
  locationExists = signal<boolean>(false);

  filteredProducts = computed(() => {
    const products = this.allProducts();
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) return products;

    return products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.category?.name || '').toLowerCase().includes(query)
    );
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly itemService: ItemService,
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly locationService: LocationService,
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
      locationRoomNr: ['', Validators.required]
    });

    this.loadCategories();
    this.loadLocations();
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);

    this.productService.getProductsWithCategories().subscribe({
      next: (products: Product[]) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Fehler beim Laden der Produkte:', err);

        this.productService.getProducts().subscribe({
          next: (products: Product[]) => {
            this.allProducts.set(products);
            this.isLoading.set(false);
          },
          error: (fallbackErr: any) => {
            console.error('Fehler beim Laden der Produkte (Fallback):', fallbackErr);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Produkte konnten nicht geladen werden.'
            });
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories: Category[]) => {
        this.allCategories.set(categories);

        if (categories.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Keine Kategorien',
            detail: 'Es wurden keine Kategorien in der Datenbank gefunden.',
            life: 5000
          });
        }
      },
      error: (err: any) => {
        console.error('Fehler beim Laden der Kategorien:', err);

        let errorMessage = 'Kategorien konnten nicht geladen werden.';

        if (err.status === 404) {
          errorMessage = 'API-Endpunkt /api/categories nicht gefunden.';
        } else if (err.status === 0) {
          errorMessage = 'Keine Verbindung zum Backend möglich. Ist das Backend gestartet?';
        } else if (err.status === 401 || err.status === 403) {
          errorMessage = 'Keine Berechtigung zum Laden der Kategorien.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Fehler beim Laden der Kategorien',
          detail: errorMessage,
          life: 10000
        });

        this.allCategories.set([]);
      }
    });
  }

  loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (locations: Location[]) => {
        this.allLocations.set(locations);

        if (locations.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Keine Locations',
            detail: 'Es wurden keine Locations in der Datenbank gefunden.',
            life: 5000
          });
        }
      },
      error: (err: any) => {
        console.error('Fehler beim Laden der Locations:', err);

        let errorMessage = 'Locations konnten nicht geladen werden.';

        if (err.status === 404) {
          errorMessage = 'API-Endpunkt /api/locations nicht gefunden.';
        } else if (err.status === 0) {
          errorMessage = 'Keine Verbindung zum Backend möglich. Ist das Backend gestartet?';
        } else if (err.status === 401 || err.status === 403) {
          errorMessage = 'Keine Berechtigung zum Laden der Locations.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Fehler beim Laden der Locations',
          detail: errorMessage,
          life: 10000
        });

        this.allLocations.set([]);
      }
    });
  }

  submitForm(): void {
    if (!this.itemForm.valid) return;

    const dto = this.itemForm.value;
    const editId = this.editingProductId();
    const imageFile = this.selectedFile();

    if (editId === null) {
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
    } else {
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
      locationRoomNr: product.location?.roomNr || ''
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



   //Prüft ob Location existiert oder neue ID vorgeschlagen wird

  onLocationRoomNrChange(): void {
    const roomNr = this.itemForm.get('locationRoomNr')?.value?.trim();
    if (!roomNr) {
      this.locationDisplayValue.set('');
      this.locationExists.set(false);
      this.itemForm.patchValue({ locationId: null }, { emitEvent: false });
      return;
    }

    this.isLoadingLocation.set(true);

    // Suche in bereits geladenen Locations
    const existingLocation = this.allLocations().find(
      loc => loc.roomNr.toLowerCase() === roomNr.toLowerCase()
    );

    if (existingLocation) {
      // Location existiert bereits
      this.locationDisplayValue.set(`ID: ${existingLocation.id}`);
      this.locationExists.set(true);
      this.itemForm.patchValue({ locationId: existingLocation.id }, { emitEvent: false });
      this.isLoadingLocation.set(false);
    } else {
      // Location existiert noch nicht - generiere neue ID
      const maxId = this.allLocations().length > 0
        ? Math.max(...this.allLocations().map(loc => loc.id))
        : 0;
      const newId = maxId + 1;

      this.locationDisplayValue.set(`Neue ID: ${newId}`);
      this.locationExists.set(false);
      this.itemForm.patchValue({ locationId: newId }, { emitEvent: false });
      this.isLoadingLocation.set(false);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {

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
