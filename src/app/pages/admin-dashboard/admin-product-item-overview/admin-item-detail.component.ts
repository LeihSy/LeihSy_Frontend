import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../../services/item.service';
import { ProductService } from '../../../services/product.service';
import { Item } from '../../../models/item.model';
import { Product } from '../../../models/product.model';
import { TableComponent, ColumnDef } from '../../../components/table/table.component';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { InfoCardComponent, InfoItem } from '../../../components/info-card/info-card.component';

@Component({
  selector: 'app-admin-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableComponent,
    ToastModule,
    BackButtonComponent,
    InfoCardComponent,
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
  private messageService = inject(MessageService);

  item = signal<Item | null>(null);
  product = signal<Product | null>(null);
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
        this.product.set(product);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Produkts:', err);
      }
    });
  }

  getItemInfoItems(): InfoItem[] {
    const item = this.item();
    if (!item) return [];

    return [
      { icon: 'pi pi-tag', label: 'Inventarnummer', value: item.invNumber },
      { icon: 'pi pi-user', label: 'Besitzer', value: item.owner },
      { icon: 'pi pi-users', label: 'Verleiher', value: item.lender?.name || 'N/A' },
      {
        icon: item.available ? 'pi pi-check-circle' : 'pi pi-times-circle',
        label: 'Status',
        value: item.available ? 'Verfügbar' : 'Ausgeliehen'
      }
    ];
  }

  getProductInfoItems(): InfoItem[] {
    const product = this.product();
    if (!product) return [];

    return [
      { icon: 'pi pi-box', label: 'Produktname', value: product.name },
      { icon: 'pi pi-tag', label: 'Kategorie', value: product.category?.name || 'N/A' },
      { icon: 'pi pi-map-marker', label: 'Standort', value: product.location?.roomNr || 'N/A' },
      { icon: 'pi pi-euro', label: 'Preis pro Tag', value: `€ ${product.price?.toFixed(2) || '0.00'}` }
    ];
  }

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
}

