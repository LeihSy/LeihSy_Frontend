import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { TableComponent, ColumnDef } from '../../shared/table/table.component';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableComponent,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule,
    SearchBarComponent
  ],
  templateUrl: './admin-product-dashboard.component.html',
  styleUrls: ['./admin-product-dashboard.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class AdminProductDashboardComponent {

  // Spalten-Definition für die Produkt-Tabelle
  columns: ColumnDef[] = [
    { field: 'id', header: 'ID', sortable: true, width: '80px' },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'categoryName', header: 'Kategorie', sortable: true, width: '150px' },
    { field: 'locationRoomNr', header: 'Standort', sortable: true, width: '120px' },
    { field: 'price', header: 'Preis/Tag', type: 'currency', sortable: true, width: '120px' }
  ];

  // Signals
  allProducts = signal<Product[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  filteredProducts = computed(() => {
    const products = this.allProducts();
    const query = this.searchQuery().toLowerCase().trim();

    // Füge zusätzliche Felder für die Tabelle hinzu
    const productsWithDisplayFields = products.map(p => ({
      ...p,
      categoryName: p.category?.name || 'N/A',
      locationRoomNr: p.location?.roomNr || '-'
    }));

    if (!query) return productsWithDisplayFields;

    return productsWithDisplayFields.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.category?.name || '').toLowerCase().includes(query)
    );
  });

  constructor(
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {
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

  navigateToNewProduct(): void {
    this.router.navigate(['/admin/products/new']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/admin/products', product.id, 'edit']);
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

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }
}
