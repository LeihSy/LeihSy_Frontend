import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../../../services/item.service';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { LocationService } from '../../../../services/location.service';
import { AuthService } from '../../../../services/auth.service';
import { Item } from '../../../../models/item.model';
import { Product } from '../../../../models/product.model';
import { InfoSectionItem } from '../../../../components/lender/info-section/info-section.component';

@Injectable()
export class ItemDetailService {
  private readonly router = inject(Router);
  private readonly itemService = inject(ItemService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  item = signal<Item | null>(null);
  product = signal<Product | null>(null);
  isLoading = signal(true);
  loanHistory = signal<any[]>([]);
  keycloakFullName = '';

  // Computed signals für Info-Section Daten
  itemInfoItems = computed<InfoSectionItem[]>(() => {
    const currentItem = this.item();
    if (!currentItem) return [];

    return [
      { label: 'Inventarnummer', value: currentItem.invNumber },
      { label: 'Besitzer', value: currentItem.owner },
      { label: 'Status', value: this.getStatusLabel(currentItem.isAvailable), type: 'tag' }
    ];
  });

  productGroupItems = computed<InfoSectionItem[]>(() => {
    const currentProduct = this.product();
    if (!currentProduct) return [];

    const items: InfoSectionItem[] = [
      { label: 'Produkt', value: currentProduct.name },
      { label: 'Beschreibung', value: currentProduct.description },
      { label: 'Kategorie', value: currentProduct.category?.name },
      { label: 'Standort', value: currentProduct.location?.roomNr }
    ];

    if (currentProduct.imageUrl) {
      items.push({ label: 'Bild', value: currentProduct.imageUrl, type: 'image' });
    }

    return items;
  });

  productInfoItems = computed<InfoSectionItem[]>(() => {
    const currentProduct = this.product();
    if (!currentProduct) return [];

    return [
      { label: 'Produkt ID', value: currentProduct.id },
      { label: 'Preis', value: currentProduct.price, type: 'currency' }
    ];
  });

  loanConditionsItems = computed<InfoSectionItem[]>(() => {
    const currentProduct = this.product();
    if (!currentProduct) return [];

    const items: InfoSectionItem[] = [
      { label: 'Max. Dauer', value: currentProduct.expiryDate ? `${currentProduct.expiryDate} Tage` : 'N/A' },
      { label: 'Preis/Tag', value: currentProduct.price, type: 'currency' }
    ];

    if (currentProduct.accessories) {
      items.push({ label: 'Zubehör', value: currentProduct.accessories });
    }

    return items;
  });

  constructor() {
    this.extractKeycloakName();
  }

  private extractKeycloakName(): void {
    try {
      const keycloakInstance = (this.authService as any).keycloak;
      if (keycloakInstance?.tokenParsed) {
        const givenName = keycloakInstance.tokenParsed['given_name'] || '';
        const familyName = keycloakInstance.tokenParsed['family_name'] || '';
        this.keycloakFullName = `${givenName} ${familyName}`.trim();
      } else {
        this.keycloakFullName = this.authService.getUsername();
      }
    } catch (error) {
      this.keycloakFullName = this.authService.getUsername();
    }
  }

  loadItemDetails(itemId: number): void {
    this.itemService.getItemById(itemId).subscribe({
      next: (item) => {
        this.item.set(item);

        // Lade zugehöriges Produkt
        if (item.productId) {
          this.loadProduct(item.productId);
        }

        // Lade Ausleih-Historie
        this.loadItemBookings(itemId);

        this.isLoading.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Item konnte nicht geladen werden.'
        });
        this.isLoading.set(false);
        this.goBack();
      }
    });
  }

  loadProduct(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        // Lade Items, Category und Location parallel
        forkJoin({
          items: this.productService.getProductItems(productId).pipe(catchError(() => of([]))),
          category: product.categoryId
            ? this.categoryService.getCategoryById(product.categoryId).pipe(catchError(() => of(null)))
            : of(null),
          location: product.locationId
            ? this.locationService.getLocationById(product.locationId).pipe(catchError(() => of(null)))
            : of(null)
        }).subscribe({
          next: ({ items, category, location }) => {
            // Berechne Item Counts
            const totalItemCount = items.length;
            const availableItemCount = items.filter((item: any) =>
              item.isAvailable === true || item.available === true
            ).length;

            // Erweitere Produkt mit allen Daten
            const enrichedProduct: Product = {
              ...product,
              totalItemCount,
              availableItemCount,
              category: category || undefined,
              location: location || undefined
            };

            this.product.set(enrichedProduct);
          },
          error: (err: any) => {
            console.error('Error loading additional data:', err);
            // Fallback: Verwende Produkt ohne zusätzliche Daten
            this.product.set(product);
          }
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Produkt konnte nicht geladen werden.'
        });
        this.goBack();
      }
    });
  }

  loadItemBookings(itemId: number): void {
    this.itemService.getItemBookings(itemId).subscribe({
      next: (bookings) => {
        // Transformiere die Buchungen für die Tabelle
        const transformedBookings = bookings.map((booking: any) => ({
          borrower: booking.userName || booking.user?.name || 'N/A',
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: this.getBookingStatusLabel(booking.status),
          statusSeverity: this.getBookingStatusSeverity(booking.status)
        }));
        this.loanHistory.set(transformedBookings);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Buchungen:', err);
        this.loanHistory.set([]);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/lender/items']);
  }

  getStatusSeverity(available: boolean): 'success' | 'danger' {
    return available ? 'success' : 'danger';
  }

  getStatusLabel(available: boolean): string {
    return available ? 'Verfügbar' : 'Ausgeliehen';
  }

  getBookingStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Ausstehend',
      'CONFIRMED': 'Bestätigt',
      'REJECTED': 'Abgelehnt',
      'PICKED_UP': 'Ausgegeben',
      'RETURNED': 'Zurückgegeben',
      'CANCELLED': 'Storniert'
    };
    return statusMap[status] || status;
  }

  getBookingStatusSeverity(status: string): 'success' | 'danger' | 'warning' | 'info' {
    const severityMap: { [key: string]: 'success' | 'danger' | 'warning' | 'info' } = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'REJECTED': 'danger',
      'PICKED_UP': 'info',
      'RETURNED': 'success',
      'CANCELLED': 'danger'
    };
    return severityMap[status] || 'info';
  }
}

