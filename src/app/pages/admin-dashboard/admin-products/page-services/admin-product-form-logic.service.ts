import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { ProductService } from '../../../../services/product.service';
import { LocationService } from '../../../../services/location.service';
import { Product } from '../../../../models/product.model';
import { Location } from '../../../../models/location.model';

export interface ProductFormHandler {
  setLocationDisplayValue(value: string): void;
  setLocationExists(exists: boolean): void;
  patchLocationId(id: number | null): void;
}

@Injectable()
export class AdminProductFormLogicService {
  private productService = inject(ProductService);
  private locationService = inject(LocationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  handleLocationRoomNrChange(roomNr: string, formHandler: ProductFormHandler): void {
    if (!roomNr) {
      formHandler.setLocationDisplayValue('');
      formHandler.patchLocationId(null);
      return;
    }

    this.locationService.getAllLocations().subscribe({
      next: (locations: Location[]) => {
        const existingLocation = locations.find(
          loc => loc.roomNr.toLowerCase() === roomNr.toLowerCase()
        );

        if (existingLocation) {
          formHandler.setLocationDisplayValue(`${existingLocation.roomNr}`);
          formHandler.setLocationExists(true);
          formHandler.patchLocationId(existingLocation.id);
        } else {
          formHandler.setLocationDisplayValue(`${roomNr}`);
          formHandler.setLocationExists(false);
          formHandler.patchLocationId(null);
        }
      },
      error: () => {
        formHandler.setLocationDisplayValue(`${roomNr}`);
        formHandler.setLocationExists(false);
        formHandler.patchLocationId(null);
      }
    });
  }

  createProduct(formValue: any, imageFile: File | null): void {
    this.productService.createProduct(formValue, imageFile).subscribe({
      next: (createdProduct: Product) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Produkt erfolgreich erstellt'
        });
        this.navigateToProductList();
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: err?.error?.message || 'Fehler beim Erstellen des Produkts'
        });
      }
    });
  }

  updateProduct(productId: number, formValue: any, imageFile: File | null): void {
    this.productService.updateProduct(productId, formValue, imageFile).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Produkt erfolgreich aktualisiert'
        });
        this.navigateToProductList();
      },
      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: err?.error?.message || 'Fehler beim Aktualisieren des Produkts'
        });
      }
    });
  }


  navigateToProductList(): void {
    this.router.navigate(['/admin/products']);
  }
}

