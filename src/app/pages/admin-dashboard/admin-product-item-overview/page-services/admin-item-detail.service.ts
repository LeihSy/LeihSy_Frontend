import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../../../services/item.service';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { LocationService } from '../../../../services/location.service';
import { UserService } from '../../../../services/user.service';
import { Item } from '../../../../models/item.model';
import { Product } from '../../../../models/product.model';
import { User } from '../../../../models/user.model';
import { InfoSectionItem } from '../../../../components/lender/info-section/info-section.component';

export interface BookingHistoryItem {
  borrower: string;
  startDate: string;
  endDate: string;
  status: string;
  statusSeverity: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable()
export class AdminItemDetailService {
  private readonly itemService = inject(ItemService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);


  item = signal<Item | null>(null);
  product = signal<Product | null>(null);
  lender = signal<User | null>(null);
  isLoading = signal(true);
  loanHistory = signal<BookingHistoryItem[]>([]);

  itemInfoItems = computed<InfoSectionItem[]>(() => {
    const item = this.item();
    const lender = this.lender();
    if (!item) return [];

    return [
      { label: 'Inventarnummer', value: item.invNumber },
      { label: 'Besitzer', value: item.owner },
      { label: 'Verleiher', value: lender?.name || item.lender?.name || 'N/A' },
      {
        label: 'Status',
        value: item.isAvailable ? 'Verfügbar' : 'Ausgeliehen',
        type: 'tag',
        tagSeverity: item.isAvailable ? 'success' : 'danger'
      }
    ];
  });

  productInfoItems = computed<InfoSectionItem[]>(() => {
    const product = this.product();
    if (!product) return [];

    const items: InfoSectionItem[] = [
      { label: 'Produktname', value: product.name },
      { label: 'Kategorie', value: product.category?.name || 'N/A' },
      { label: 'Standort', value: product.location?.roomNr || 'N/A' },
      { label: 'Preis pro Tag', value: product.price, type: 'currency' }
    ];

    if (product.imageUrl) {
      items.push({ label: 'Bild', value: product.imageUrl, type: 'image' });
    }

    return items;
  });

  loadItemDetails(itemId: number): void {
    this.isLoading.set(true);

    this.itemService.getItemById(itemId).subscribe({
      next: (item) => {
        this.item.set(item);

        if (item.productId) {
          this.loadProduct(item.productId);
        }

        if (item.lenderId) {
          this.loadLender(item.lenderId);
        }

        this.loadItemBookings(itemId);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Items:', err);
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

  private loadProduct(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        const requests: any = {};

        if (product.categoryId) {
          requests.category = this.categoryService.getCategoryById(product.categoryId).pipe(
            catchError(() => of(null))
          );
        }

        if (product.locationId) {
          requests.location = this.locationService.getLocationById(product.locationId).pipe(
            catchError(() => of(null))
          );
        }

        if (Object.keys(requests).length > 0) {
          forkJoin(requests).subscribe({
            next: (relations: any) => {
              const enrichedProduct = {
                ...product,
                category: relations.category || undefined,
                location: relations.location || undefined
              };
              this.product.set(enrichedProduct);
            },
            error: () => {
              this.product.set(product);
            }
          });
        } else {
          this.product.set(product);
        }
      },
      error: (err) => {
        console.error('Fehler beim Laden des Produkts:', err);
      }
    });
  }

  private loadLender(lenderId: number): void {
    this.userService.getUserById(lenderId).subscribe({
      next: (user) => {
        this.lender.set(user);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Verleihers:', err);
      }
    });
  }

  private loadItemBookings(itemId: number): void {
    this.itemService.getItemBookings(itemId).subscribe({
      next: (bookings) => {
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

  getStatusSeverity(available: boolean): 'success' | 'danger' {
    return available ? 'success' : 'danger';
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

  editItem(itemId: number): void {
    this.router.navigate(['/admin/items', itemId, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/admin/all-items']);
  }
}

