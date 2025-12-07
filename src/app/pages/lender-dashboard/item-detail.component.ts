import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ItemService } from '../../services/item.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    ToastModule
  ],
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
  providers: [MessageService]
})
export class ItemDetailComponent implements OnInit {

  item = signal<Item | null>(null);
  product = signal<Product | null>(null);
  isLoading = signal(true);
  itemId: number | null = null;
  keycloakFullName = '';

  // TODO: Später mit echten Ausleih-Daten ersetzen
  loanHistory = signal<any[]>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly itemService: ItemService,
    private readonly productService: ProductService,
    private readonly authService: AuthService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Extrahiere Keycloak-Namen (given_name + family_name)
    this.extractKeycloakName();

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

  loadItemDetails(): void {
    if (!this.itemId) return;

    console.log('🔗 API Call: GET /api/items/' + this.itemId);

    this.itemService.getItemById(this.itemId).subscribe({
      next: (item) => {
        console.log('✅ GET /api/items/' + this.itemId + ' - Success:', item);
        this.item.set(item);

        // Lade zugehöriges Produkt
        if (item.productId) {
          this.loadProduct(item.productId);
        }

        // TODO: Lade Ausleih-Historie
        // this.loadLoanHistory(this.itemId);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ GET /api/items/' + this.itemId + ' - Error:', err.status, err.message);
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
    console.log('🔗 API Call: GET /api/products/' + productId);

    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        console.log('✅ GET /api/products/' + productId + ' - Success:', product);

        // Falls Kategorie nicht expandiert ist, lade sie nach
        if (product.categoryId && !product.category) {
          console.log('🔄 Kategorie nicht expandiert, lade nach...');
          this.productService.getProductsWithCategories().subscribe({
            next: (products) => {
              const productWithCategory = products.find(p => p.id === productId);
              if (productWithCategory) {
                this.product.set(productWithCategory);
              } else {
                this.product.set(product);
              }
            },
            error: () => {
              // Fallback: Verwende Produkt ohne Kategorie
              this.product.set(product);
            }
          });
        } else {
          this.product.set(product);
        }
      },
      error: (err) => {
        console.error('❌ GET /api/products/' + productId + ' - Error:', err.status, err.message);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Produkt konnte nicht geladen werden.'
        });
        this.goBack();
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


  goBack(): void {
    this.router.navigate(['/lender/items']);
  }

  getStatusSeverity(available: boolean): 'success' | 'danger' {
    return available ? 'success' : 'danger';
  }

  getStatusLabel(available: boolean): string {
    return available ? 'Verfügbar' : 'Ausgeliehen';
  }
}

