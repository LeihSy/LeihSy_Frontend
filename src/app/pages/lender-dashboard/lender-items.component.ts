import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
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
    TableModule,
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

  allItems = signal<Item[]>([]);
  allProducts = signal<Product[]>([]);
  currentUser = signal<User | null>(null);
  isAdmin = signal(false);
  isLoading = signal(true);
  searchQuery = signal('');
  keycloakFullName = '';

  productsWithItems = computed(() => {
    const products = this.allProducts();
    const items = this.allItems();
    const admin = this.isAdmin();
    const query = this.searchQuery().toLowerCase().trim();

    let filteredProducts = products;

    if (!admin) {
      filteredProducts = products.filter(product =>
        this.checkNamesMatch(product.lenderName, this.keycloakFullName)
      );
    }

    let productGroups = filteredProducts
      .map(product => {
        const productItems = items.filter(item => item.productId === product.id);
        return {
          product,
          items: productItems,
          availableCount: productItems.filter(i => i.available).length,
          totalCount: productItems.length
        };
      })
      .filter(pg => pg.totalCount > 0);

    if (query) {
      productGroups = productGroups.filter(pg =>
        pg.product.name.toLowerCase().includes(query) ||
        pg.product.categoryName.toLowerCase().includes(query) ||
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

    this.extractKeycloakName();

    this.loadCurrentUser();
    this.loadProducts();
    this.loadItems();
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

  loadCurrentUser(): void {
    let keycloakFullName = '';

    try {
      const keycloakInstance = (this.authService as any).keycloak;
      if (keycloakInstance?.tokenParsed) {
        const givenName = keycloakInstance.tokenParsed['given_name'] || '';
        const familyName = keycloakInstance.tokenParsed['family_name'] || '';
        keycloakFullName = `${givenName} ${familyName}`.trim();
      } else {
        keycloakFullName = this.authService.getUsername();
      }
    } catch (error) {
      keycloakFullName = this.authService.getUsername();
    }

    console.log('API Call: GET /api/users/me');

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('GET /api/users/me - Success:', user);

        const namesMatch = this.checkNamesMatch(keycloakFullName, user.name);

        if (namesMatch) {
          this.currentUser.set(user);

          this.messageService.add({
            severity: 'success',
            summary: 'Authentifizierung erfolgreich',
            detail: `Angemeldet als ${user.name} (ID: ${user.id})`,
            life: 3000
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warnung',
            detail: `Keycloak-Name "${keycloakFullName}" stimmt nicht mit Datenbank-Name "${user.name}" überein. Zeige alle Produkte an.`,
            life: 8000
          });

          this.currentUser.set(null);
        }
      },
      error: (err) => {
        console.error(' GET /api/users/me - Error:', err.status, err.message);

        this.messageService.add({
          severity: 'warn',
          summary: 'Hinweis',
          detail: 'User-Daten konnten nicht geladen werden. Es werden alle Produkte angezeigt.',
          life: 5000
        });

        this.currentUser.set(null);
      }
    });
  }


  private checkNamesMatch(name1: string, name2: string): boolean {
    if (!name1 || !name2) return false;

    const normalize = (name: string) =>
      name.toLowerCase().trim().split(/\s+/).sort().join(' ');

    const normalized1 = normalize(name1);
    const normalized2 = normalize(name2);

    if (normalized1 === normalized2) return true;

    const parts1 = name1.toLowerCase().trim().split(/\s+/);
    const parts2 = name2.toLowerCase().trim().split(/\s+/);

    return parts1.every(part => parts2.includes(part)) ||
           parts2.every(part => parts1.includes(part));
  }

  loadProducts(): void {
    this.isLoading.set(true);
    console.log('API Call: GET /api/products');

    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('GET /api/products - Success:', products.length, 'products loaded');
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(' GET /api/products - Error:', err.status, err.message);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Produkte.'
        });
        this.isLoading.set(false);
      }
    });
  }

  loadItems(): void {
    this.isLoading.set(true);
    console.log('API Call: GET /api/items');

    this.itemService.getAllItems().subscribe({
      next: (items) => {
        console.log('GET /api/items - Success:', items.length, 'items loaded');
        this.allItems.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('GET /api/items - Error:', err.status, err.message);
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

