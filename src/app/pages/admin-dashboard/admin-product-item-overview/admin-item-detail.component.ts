import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../../services/item.service';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { LocationService } from '../../../services/location.service';
import { UserService } from '../../../services/user.service';
import { Item } from '../../../models/item.model';
import { Product } from '../../../models/product.model';
import { User } from '../../../models/user.model';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { FilledButtonComponent } from '../../../components/buttons/filled-button/filled-button.component';
import { SecondaryButtonComponent } from '../../../components/buttons/secondary-button/secondary-button.component';
import { InfoSectionComponent, InfoSectionItem } from '../../../components/lender/info-section/info-section.component';
import { DetailCardComponent } from '../../../components/admin/detail-card/detail-card.component';
import { LoanHistoryComponent } from '../../../components/shared/loan-history/loan-history.component';

@Component({
  selector: 'app-admin-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ToastModule,
    BackButtonComponent,
    FilledButtonComponent,
    SecondaryButtonComponent,
    InfoSectionComponent,
    DetailCardComponent,
    LoanHistoryComponent,
    RouterLink
  ],
  templateUrl: './admin-item-detail.component.html',
  styleUrls: ['./admin-item-detail.component.scss'],
  providers: [MessageService]
})
export class AdminItemDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private locationService = inject(LocationService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  item = signal<Item | null>(null);
  product = signal<Product | null>(null);
  lender = signal<User | null>(null);
  isLoading = signal(true);
  itemId: number | null = null;
  loanHistory = signal<any[]>([]);

  loanHistoryColumns: ColumnDef[] = [
    { field: 'borrower', header: 'Ausleiher', sortable: true },
    { field: 'startDate', header: 'Von', type: 'date', sortable: true, width: '120px' },
    { field: 'endDate', header: 'Bis', type: 'date', sortable: true, width: '120px' },
    { field: 'status', header: 'Status', type: 'status', sortable: true, width: '130px' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.itemId = Number.parseInt(id, 10);
      this.loadItemDetails();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Keine Item-ID gefunden.'
      });
      this.goBack();
    }
  }

  loadItemDetails(): void {
    if (!this.itemId) return;

    this.itemService.getItemById(this.itemId).subscribe({
      next: (item) => {
        this.item.set(item);
        if (item.productId) {
          this.loadProduct(item.productId);
        }
        if (item.lenderId) {
          this.loadLender(item.lenderId);
        }
        // Lade Buchungen für dieses Item
        this.loadItemBookings(this.itemId!);
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

  loadProduct(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        // Lade Category und Location parallel
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

  loadLender(lenderId: number): void {
    this.userService.getUserById(lenderId).subscribe({
      next: (user) => {
        this.lender.set(user);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Verleihers:', err);
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

  getItemInfoItems = computed<InfoSectionItem[]>(() => {
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

  getProductInfoItems = computed<InfoSectionItem[]>(() => {
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

  editItem(): void {
    if (this.itemId) {
      this.router.navigate(['/admin/items', this.itemId, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/all-items']);
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
}

