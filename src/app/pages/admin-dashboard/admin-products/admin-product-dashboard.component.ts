import { Component, signal, computed, inject, OnInit } from '@angular/core';
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
import { Product } from '../../../models/product.model';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { SearchBarComponent } from '../../../components/search-bar/search-bar.component';
import { AdminProductDashboardService } from './services/admin-product-dashboard.service';
import { PageHeaderComponent } from '../../../components/page-header/page-header.component';

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
    SearchBarComponent,
    PageHeaderComponent
  ],
  templateUrl: './admin-product-dashboard.component.html',
  providers: [ConfirmationService, MessageService, AdminProductDashboardService]
})
export class AdminProductDashboardComponent implements OnInit {

  private pageService = inject(AdminProductDashboardService);

  // Spalten-Definition für die Produkt-Tabelle
  columns: ColumnDef[] = [
    { field: 'id', header: 'ID', sortable: true, width: '80px' },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'categoryName', header: 'Kategorie', sortable: true, width: '150px' },
    { field: 'locationRoomNr', header: 'Standort', sortable: true, width: '120px' },
    { field: 'price', header: 'Preis/Tag', type: 'currency', sortable: true, width: '120px' }
  ];

  // Use service signals
  allProducts = this.pageService.products;
  isLoading = this.pageService.isLoading;
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

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.pageService.loadProducts();
  }

  navigateToNewProduct(): void {
    this.pageService.navigateToNewProduct();
  }

  editProduct(product: Product): void {
    this.pageService.navigateToEditProduct(product.id);
  }

  deleteProduct(product: Product): void {
    this.pageService.confirmDeleteProduct(product, () => {
      this.pageService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: () => {
          // Error handling is done in service
        }
      });
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }
}
