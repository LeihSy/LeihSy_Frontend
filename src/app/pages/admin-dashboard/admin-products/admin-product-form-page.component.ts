import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { ProductFormComponent } from '../../../components/form-components/product-form/product-form.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { LocationService } from '../../../services/location.service';
import { AdminProductFormLogicService } from './page-services/admin-product-form-logic.service';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { Location } from '../../../models/location.model';

@Component({
  selector: 'app-admin-product-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    ProductFormComponent,
    BackButtonComponent
  ],
  providers: [MessageService, AdminProductFormLogicService],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      <p-toast position="bottom-right"></p-toast>

      <div class="mb-6">
        <app-back-button (backClick)="goBack()" label="Zurück zur Übersicht"></app-back-button>
      </div>

      <app-product-form
        [product]="product()"
        [categories]="allCategories()"
        [locations]="allLocations()"
        [products]="availableProducts()"
        [isEditMode]="isEditMode()"
        [mode]="isPrivateMode() ? 'private' : 'admin'"
        (formSubmit)="handleFormSubmit($event)"
        (formCancel)="goBack()">
      </app-product-form>
    </div>
  `
})
export class AdminProductFormPageComponent implements OnInit {
  @ViewChild(ProductFormComponent) productFormComponent!: ProductFormComponent;

  product = signal<Product | null>(null);
  allCategories = signal<Category[]>([]);
  allLocations = signal<Location[]>([]);
  isEditMode = signal(false);
  productId: number | null = null;
  availableProducts = signal<Product[]>([]);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);
  private readonly messageService = inject(MessageService);
  private readonly logicService = inject(AdminProductFormLogicService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId = Number.parseInt(id, 10);
      this.isEditMode.set(true);
      this.loadProduct();
    }

    this.loadCategories();
    this.loadLocations();
    this.loadAllProducts();
  }
  loadAllProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {

        if (this.productId) {
          const filtered = products.filter(p => p.id !== this.productId);
          this.availableProducts.set(filtered);
        } else {
          this.availableProducts.set(products);
        }
      },
      error: (err) => console.error('Fehler beim Laden der Produkte für Relationen', err)
    });
  }


  loadProduct(): void {
    if (!this.productId) return;

    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        // Lade Category und Location parallel, falls IDs vorhanden sind
        forkJoin({
          category: product.categoryId
            ? this.categoryService.getCategoryById(product.categoryId).pipe(catchError(() => of(null)))
            : of(null),
          location: product.locationId
            ? this.locationService.getLocationById(product.locationId).pipe(catchError(() => of(null)))
            : of(null)
        }).subscribe({
          next: ({ category, location }) => {
            // Erweitere Produkt mit Category und Location Daten
            const enrichedProduct: Product = {
              ...product,
              category: category || undefined,
              location: location || undefined
            };

            this.product.set(enrichedProduct);
            this.loadAllProducts();
          },
          error: (err) => {
            console.error('Fehler beim Laden zusätzlicher Produktdaten:', err);
            // Fallback: Verwende Produkt ohne erweiterte Daten
            this.product.set(product);
          }
        });
      },
      error: (err) => {
        console.error('Fehler beim Laden des Produkts:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Produkt konnte nicht geladen werden.'
        });
        this.goBack();
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.allCategories.set(categories);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Kategorien:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Kategorien konnten nicht geladen werden.'
        });
      }
    });
  }

  loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (locations) => {
        this.allLocations.set(locations);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Locations:', err);
      }
    });
  }

  isPrivateMode(): boolean {
    // Prüfe die aktuelle URL auf '/lender/private-lend'
    const url = (globalThis as any).location?.pathname || '';
    return url.includes('/lender/private-lend');
  }

  handleFormSubmit(data: { formValue: any, imageFile: File | null }): void {
    if ((data as any).privateMode || this.isPrivateMode()) {
      const payload = { ...data.formValue };

      // Suche nach einer Location mit roomNr "privat"
      const privateLocation = this.allLocations().find(loc =>
        loc.roomNr?.toLowerCase() === 'privat'
      );

      if (privateLocation) {
        payload.locationId = privateLocation.id;
      } else {
        // Wenn keine "privat" Location existiert, setze locationId auf null
        payload.locationId = null;
      }

      // Im Private-Modus: Erstelle das Produkt direkt mit POST
      this.productService.createProduct(payload, data.imageFile).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Privates Produkt wurde erfolgreich erstellt!'
          });
          this.goBack();
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
      return;
    }

    if (this.isEditMode() && this.productId) {
      this.productService.updateProduct(this.productId, data.formValue, data.imageFile).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Produkt wurde aktualisiert!'
          });
          this.goBack();
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
      this.productService.createProduct(data.formValue, data.imageFile).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Erfolg',
            detail: 'Produkt wurde erstellt!'
          });
          this.goBack();
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


  goBack(): void {
    if (this.isPrivateMode()) {
      this.router.navigate(['/lender/private-lend']);
    } else {
      this.logicService.navigateToProductList();
    }
  }
}
