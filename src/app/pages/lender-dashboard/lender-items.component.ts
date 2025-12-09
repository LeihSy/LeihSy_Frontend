import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Item } from '../../models/item.model';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';
import { Location } from '../../models/location.model';
import { TabelleComponent, ColumnDef } from '../../shared/tabelle/tabelle.component';

interface ProductWithItems {
  product: Product;
  items: Item[];
  availableCount: number;
  totalCount: number;
}

@Component({
  selector: 'app-lender-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    TabelleComponent,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ToastModule
  ],
  templateUrl: './lender-items.component.html',
  styleUrls: ['./lender-items.component.scss'],
  providers: [MessageService]
})
export class LenderItemsComponent implements OnInit {

  // Spalten-Definition für die Item-Tabelle
  itemColumns: ColumnDef[] = [
    { field: 'invNumber', header: 'Inventarnummer', sortable: true, width: '150px' },
    { field: 'owner', header: 'Besitzer', sortable: true },
    { field: 'availableLabel', header: 'Status', type: 'status', sortable: true, width: '120px' }
  ];

  allItems = signal<Item[]>([]);
  allProducts = signal<Product[]>([]);
  currentUser = signal<User | null>(null);
  isAdmin = signal(false);
  isLoading = signal(true);
  searchQuery = signal('');

  productsWithItems = computed(() => {
    const products = this.allProducts();
    const items = this.allItems();
    const currentUser = this.currentUser();
    const isAdmin = this.isAdmin();
    const query = this.searchQuery().toLowerCase().trim();

    // Filtere Items basierend auf Rolle
    let filteredItems = items;
    if (!isAdmin && currentUser) {
      // Normale Verleiher: Nur eigene Items
      filteredItems = items.filter(item => item.lenderId === currentUser.id);
    }
    // Admins sehen alle Items (kein Filter)

    // Erstelle Produktgruppen mit gefilterten Items
    let productGroups = products
      .map(product => {
        const productItems = filteredItems.filter(item => item.productId === product.id);
        // Füge zusätzliche Felder für die Tabelle hinzu
        const itemsWithDisplayFields = productItems.map(item => ({
          ...item,
          availableLabel: item.available ? 'Verfügbar' : 'Ausgeliehen'
        }));

        return {
          product,
          items: itemsWithDisplayFields,
          availableCount: productItems.filter(i => i.available).length,
          totalCount: productItems.length
        };
      })
      .filter(pg => pg.totalCount > 0); // Nur Produkte mit mindestens einem Item anzeigen

    // Suchfilter
    if (query) {
      productGroups = productGroups.filter(pg =>
        pg.product.name.toLowerCase().includes(query) ||
        (pg.product.category?.name || '').toLowerCase().includes(query) ||
        pg.items.some(item => item.invNumber.toLowerCase().includes(query))
      );
    }

    return productGroups;
  });

  totalItems = computed(() => {
    return this.productsWithItems().reduce((sum, pg) => sum + pg.totalCount, 0);
  });

  totalAvailable = computed(() => {
    return this.productsWithItems().reduce((sum, pg) => sum + pg.availableCount, 0);
  });

  constructor(
    private readonly itemService: ItemService,
    private readonly productService: ProductService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.isAdmin.set(this.authService.isAdmin());
    this.loadCurrentUser();
    this.loadProducts();
    this.loadItems();
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        const roleText = this.isAdmin() ? '(Administrator)' : '(Verleiher)';
        this.messageService.add({
          severity: 'success',
          summary: 'Angemeldet',
          detail: `Angemeldet als ${user.name} ${roleText} (ID: ${user.id})`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Fehler beim Laden des aktuellen Users:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'User-Daten konnten nicht geladen werden.',
          life: 5000
        });

        this.currentUser.set(null);
      }
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);

    this.productService.getProductsWithCategories().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Produkte:', err);

        this.productService.getProducts().subscribe({
          next: (products) => {
            this.allProducts.set(products);
            this.isLoading.set(false);
          },
          error: (fallbackErr) => {
            console.error('Fehler beim Laden der Produkte (Fallback):', fallbackErr);
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Fehler beim Laden der Produkte.'
            });
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  loadItems(): void {
    this.isLoading.set(true);

    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.allItems.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Items:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Gegenstände.'
        });
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  getStatusSeverity(available: boolean): 'success' | 'danger' {
    return available ? 'success' : 'danger';
  }

  getStatusLabel(available: boolean): string {
    return available ? 'Verfügbar' : 'Ausgeliehen';
  }
}

