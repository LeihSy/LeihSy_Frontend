import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Injectable()
export class AdminProductDashboardService {
  private productService = inject(ProductService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // Signals for state management
  products = signal<Product[]>([]);
  isLoading = signal(false);

  loadProducts(): void {
    this.isLoading.set(true);

    this.productService.getProductsWithCategories().pipe(
      catchError((err) => {
        console.error('Fehler beim Laden der Produkte:', err);
        return this.productService.getProducts().pipe(
          catchError((fallbackErr) => {
            console.error('Fehler beim Laden der Produkte (Fallback):', fallbackErr);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Fehler beim Laden der Produkte.'
            });
            return of([]);
          })
        );
      })
    ).subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  confirmDeleteProduct(product: Product, onConfirm: () => void): void {
    this.confirmationService.confirm({
      message: `Möchten Sie das Produkt "${product.name}" wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: onConfirm
    });
  }

  deleteProduct(productId: number): Observable<void> {
    return this.productService.deleteProduct(productId).pipe(
      tap(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Gelöscht',
          detail: 'Produkt wurde gelöscht.'
        });
      }),
      catchError((err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Produkt konnte nicht gelöscht werden.'
        });
        throw err;
      })
    );
  }

  navigateToNewProduct(): void {
    this.router.navigate(['/admin/products/new']);
  }

  navigateToEditProduct(productId: number): void {
    this.router.navigate([`/admin/products/edit/${productId}`]);
  }
}

