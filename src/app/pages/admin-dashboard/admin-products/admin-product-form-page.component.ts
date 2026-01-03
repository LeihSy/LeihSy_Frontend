import { Component, OnInit, AfterViewInit, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { ProductFormComponent } from '../../../components/form-components/product-form/product-form.component';
import { PrivateLendService } from '../../user-dashboard/user-private-lend/private-lend.service';
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
    DialogModule,
    TooltipModule,
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
        [isEditMode]="isEditMode()"
        [mode]="isPrivateMode() ? 'private' : 'admin'"
        (formSubmit)="handleFormSubmit($event)"
        (formCancel)="goBack()">
      </app-product-form>

      <!-- JSON Preview Dialog -->
      <p-dialog
        header="Produkt-Daten (JSON)"
        [(visible)]="showJsonDialog"
        [modal]="true"
        [style]="{width: '700px', maxHeight: '80vh'}"
        [draggable]="false"
        [resizable]="false">
        <div class="flex flex-col gap-4">
          <p class="text-sm text-gray-600">
            Kopieren Sie den folgenden JSON-String, um ihn per E-Mail zu versenden:
          </p>

          <div class="relative">
            <pre class="bg-gray-50 border border-gray-200 rounded p-4 overflow-auto max-h-96 text-sm">{{ jsonString() }}</pre>
            <button
              pButton
              type="button"
              icon="pi pi-copy"
              label="Kopieren"
              class="absolute top-2 right-2 p-button-sm"
              (click)="copyToClipboard()"
              pTooltip="In Zwischenablage kopieren">
            </button>
          </div>

          @if (copySuccess()) {
            <div class="text-green-600 text-sm flex items-center gap-2">
              <i class="pi pi-check-circle"></i>
              <span>In Zwischenablage kopiert!</span>
            </div>
          }
        </div>

        <ng-template pTemplate="footer">
          <button pButton type="button" label="Schließen" (click)="closeJsonDialog()"></button>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class AdminProductFormPageComponent implements OnInit {
  privateLendService = inject(PrivateLendService);
  @ViewChild(ProductFormComponent) productFormComponent!: ProductFormComponent;

  product = signal<Product | null>(null);
  allCategories = signal<Category[]>([]);
  allLocations = signal<Location[]>([]);
  isEditMode = signal(false);
  productId: number | null = null;

  // JSON Dialog Signals
  showJsonDialog = signal(false);
  jsonString = signal('');
  copySuccess = signal(false);

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

  private checkForImportedData(): void {
    // Prüfe Router State
    const navigation = this.router.getCurrentNavigation();
    const importedData = navigation?.extras?.state?.['importedData'];

    if (importedData) {
      // Erstelle ein temporäres Produkt-Objekt mit den importierten Daten
      const tempProduct: Partial<Product> = {
        name: importedData.name || '',
        description: importedData.description || '',
        expiryDate: importedData.expiryDate || 0,
        price: importedData.price || 0,
        imageUrl: importedData.imageUrl || '',
        accessories: importedData.accessories || '',
        categoryId: importedData.categoryId || null,
        locationId: importedData.locationId || null
      };

      this.product.set(tempProduct as Product);

      this.messageService.add({
        severity: 'success',
        summary: 'Daten geladen',
        detail: 'Die JSON-Daten wurden erfolgreich in das Formular geladen.'
      });
    }
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

  isPrivateMode(): boolean {
    // Prüfe die aktuelle URL auf '/user-dashboard/private-lend'
    const url = (globalThis as any).location?.pathname || '';
    return url.includes('/user-dashboard/private-lend');
  }

  handleFormSubmit(data: { formValue: any, imageFile: File | null }): void {
    if ((data as any).privateMode || this.isPrivateMode()) {
      const payload = { ...data.formValue };
      // Setze Location auf 'privat' wenn privateMode
      payload.locationId = 'privat';

      // Erstelle JSON-String
      const jsonData = {
        type: 'product',
        timestamp: new Date().toISOString(),
        payload: payload
      };

      this.jsonString.set(JSON.stringify(jsonData, null, 2));
      this.showJsonDialog.set(true);
      this.copySuccess.set(false);

      this.messageService.add({
        severity: 'success',
        summary: 'Erfolg',
        detail: 'Produkt-Daten als JSON vorbereitet.'
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

  copyToClipboard(): void {
    const text = this.jsonString();
    navigator.clipboard.writeText(text).then(() => {
      this.copySuccess.set(true);
      this.messageService.add({
        severity: 'success',
        summary: 'Kopiert',
        detail: 'JSON wurde in die Zwischenablage kopiert!'
      });

      // Reset nach 3 Sekunden
      setTimeout(() => this.copySuccess.set(false), 3000);
    }).catch(err => {
      console.error('Fehler beim Kopieren:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Konnte nicht in Zwischenablage kopieren.'
      });
    });
  }

  closeJsonDialog(): void {
    this.showJsonDialog.set(false);
    this.copySuccess.set(false);
  }

  goBack(): void {
    this.logicService.navigateToProductList();
  }
}
