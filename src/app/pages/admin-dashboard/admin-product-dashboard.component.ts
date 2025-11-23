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
import { ConfirmationService, MessageService } from 'primeng/api';

import { CommonModule } from '@angular/common';
import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

// Temporäres Category Interface für Mock-Daten
interface MockCategory {
  id: number;
  name: string;
  description?: string;
}

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
    TooltipModule
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

  // Mock-Kategorien bis Backend fertig ist
  categories: MockCategory[] = [
    { id: 1, name: 'Kamera', description: 'Foto- und Videokameras' },
    { id: 2, name: 'Audio', description: 'Mikrofone und Audio-Equipment' },
    { id: 3, name: 'Licht', description: 'Beleuchtung und Lichttechnik' },
    { id: 4, name: 'Stativ', description: 'Kamera- und Lichtstative' },
    { id: 5, name: 'Objektiv', description: 'Wechselobjektive' },
    { id: 6, name: 'Zubehör', description: 'Diverses Zubehör' }
  ];

  // Status-Optionen
  statusOptions = [
    { label: 'Verfügbar', value: 'AVAILABLE' },
    { label: 'Ausgeliehen', value: 'BORROWED' },
    { label: 'Wartung', value: 'MAINTENANCE' }
  ];

  // Gefilterte Produkte basierend auf Suche
  filteredProducts = computed(() => {
    const products = this.allProducts();
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) return products;

    return products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.categoryName.toLowerCase().includes(query) ||
      p.inventoryNumber.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query)
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
      locationId: [null],
      locationRoomNr: [''],
      lenderId: [null],
      lenderName: [''],
      availableItems: [0, Validators.min(0)],
      totalItems: [0, Validators.min(0)]
    });

    this.loadProducts();
  }

  // Lade alle Produkte
  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
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

  // Produkt erstellen oder aktualisieren
  submitForm() {
    if (!this.itemForm.valid) return;

    const product = this.itemForm.value;
    const editId = this.editingProductId();

    if (editId !== null) {
      // Update
      this.productService.updateProduct(editId, product).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Produkt wurde aktualisiert!'
          });
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Produkt konnte nicht aktualisiert werden.'
          });
        }
      });
    } else {
      // Create
      this.productService.createProduct(product).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Produkt wurde erstellt!'
          });
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
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

  // Produkt zum Bearbeiten auswählen
  editProduct(product: Product): void {
    this.isEditMode.set(true);
    this.editingProductId.set(product.id);

    this.itemForm.patchValue({
      inventoryNumber: product.inventoryNumber,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      location: product.location,
      imageUrl: product.imageUrl,
      accessories: product.accessories,
      status: product.status
    });

    // Scroll zum Formular
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Produkt löschen mit Bestätigung
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
          error: (err) => {
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

  // Formular zurücksetzen
  resetForm(): void {
    this.itemForm.reset({
      status: 'AVAILABLE'
    });
    this.isEditMode.set(false);
    this.editingProductId.set(null);
  }

  // Suche aktualisieren
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }
}

