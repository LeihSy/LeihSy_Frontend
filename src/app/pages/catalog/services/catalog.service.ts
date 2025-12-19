import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { Device } from '../../../components/device-card/device-card.component';

@Injectable()
export class CatalogService {
  private productService = inject(ProductService);
  private router = inject(Router);

  // Signals for state management
  products = signal<Product[]>([]);
  devices = signal<Device[]>([]);
  categories = signal<string[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productService.getProductsWithCategories().subscribe({
      next: (products: Product[]) => {
        this.products.set(products);

        const devices = this.mapProductsToDevices(products);
        this.devices.set(devices);

        const categories = this.extractCategories(products);
        this.categories.set(categories);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage.set('Fehler beim Laden der Produkte.');
        this.isLoading.set(false);
      }
    });
  }

  private mapProductsToDevices(products: Product[]): Device[] {
    return products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category?.name || 'Unbekannt',
      description: p.description,
      availability: {
        available: p.availableItemCount || 0,
        total: p.totalItemCount || 0
      },
      loanConditions: {
        loanPeriod: `${p.expiryDate} Tage`
      },
      location: p.location?.roomNr || 'N/A',
      availableItems: p.availableItemCount || 0,
      imageUrl: p.imageUrl
    }));
  }

  private extractCategories(products: Product[]): string[] {
    return [...new Set(products.map(p => p.category?.name || 'Unbekannt'))];
  }

  applyFilters(
    devices: Device[],
    searchQuery: string,
    selectedCategory: string,
    selectedCampus: string,
    availabilityFilter: string,
    dateRange: Date[]
  ): Device[] {
    let filtered = devices;

    // Freitext-Suche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.category.toLowerCase().includes(query)
      );
    }

    // Kategorie-Filter
    if (selectedCategory) {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    // Campus-Filter
    if (selectedCampus) {
      filtered = filtered.filter(d => d.location.includes(selectedCampus));
    }

    // Verfügbarkeitsfilter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(d => d.availability.available > 0);
    } else if (availabilityFilter === 'borrowed') {
      filtered = filtered.filter(d => d.availability.available === 0);
    }

    // Datumsfilter (optional: nach Buchungszeitraum)
    if (dateRange && dateRange[0]) {
      // TODO: Implementierung falls Buchungszeitraum-Check benötigt wird
    }

    return filtered;
  }

  getImageUrl(deviceId: number, imageUrl: string | null, imageErrorMap: Map<number, boolean>): string | null {
    if (!imageUrl) return null;
    if (imageErrorMap.get(deviceId)) return null;

    // Fall 1: Absolute URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Fall 2: Relative URL → base path hinzufügen
    return `/assets/images/${imageUrl}`;
  }

  handleImageError(deviceId: number, imageErrorMap: Map<number, boolean>): void {
    imageErrorMap.set(deviceId, true);
  }

  navigateToDevice(deviceId: number): void {
    this.router.navigate(['/device', deviceId]);
  }
}

