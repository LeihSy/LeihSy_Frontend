import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { ProductFormComponent } from '../../../components/admin/product-form.component';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { LocationService } from '../../../services/location.service';
import { AdminProductFormLogicService } from './services/admin-product-form-logic.service';
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
    ProductFormComponent
  ],
  providers: [MessageService, AdminProductFormLogicService],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      <p-toast position="bottom-right"></p-toast>

      <div class="mb-6">
        <button pButton
                icon="pi pi-arrow-left"
                label="Zurück zur Übersicht"
                class="p-button-text"
                (click)="goBack()"></button>
      </div>

      <app-product-form
        [product]="product()"
        [categories]="allCategories()"
        [locations]="allLocations()"
        [isEditMode]="isEditMode()"
        (formSubmit)="handleFormSubmit($event)"
        (formCancel)="goBack()"
        (locationRoomNrChange)="handleLocationRoomNrChange($event)">
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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly locationService: LocationService,
    private readonly messageService: MessageService,
    private readonly logicService: AdminProductFormLogicService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId = Number.parseInt(id, 10);
      this.isEditMode.set(true);
      this.loadProduct();
    }

    this.loadCategories();
    this.loadLocations();
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

  handleFormSubmit(data: { formValue: any, imageFile: File | null }): void {
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

  handleLocationRoomNrChange(roomNr: string): void {
    if (this.productFormComponent) {
      this.logicService.handleLocationRoomNrChange(roomNr, this.productFormComponent);
    }
  }

  goBack(): void {
    this.logicService.navigateToProductList();
  }
}

