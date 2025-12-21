import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { Device } from '../../../components/device-card/device-card.component';

@Injectable()
export class CatalogService {
  private productService = inject(ProductService);
  private router = inject(Router);

  // Signals für das State-Management
  products = signal<Product[]>([]);
  devices = signal<Device[]>([]);
  categories = signal<string[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  /**
   * Lädt Produkte vom Server und mappt sie direkt in das Device-Format
   */
  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productService.getProductsWithCategories().pipe(
      catchError((error: any) => {
        console.error('Fehler beim Laden der Produkte:', error);
        this.errorMessage.set('Produkte konnten nicht geladen werden.');
        return of([]);
      })
    ).subscribe((products: Product[]) => {
      this.products.set(products);

      const mappedDevices = this.mapProductsToDevices(products);
      this.devices.set(mappedDevices);

      // Kategorien extrahieren
      const uniqueCategories = [...new Set(mappedDevices.map(d => d.category))];
      this.categories.set(uniqueCategories);

      this.isLoading.set(false);
    });
  }

  /**
   * Zentrale Filter-Logik (wird vom computed() in der Komponente aufgerufen)
   */
  applyFilters(
    devices: Device[],
    query: string,
    category: string,
    campus: string,
    availability: string,
    dateRange: Date[] = []
  ): Device[] {
    let filtered = [...devices];

    // 1. Suchanfrage (Name, Beschreibung, Kategorie)
    if (query?.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }

    // 2. Kategorie
    if (category) {
      filtered = filtered.filter(d => d.category === category);
    }

    // 3. Campus (Logik basierend auf Raum-Nummer oder Standort-Name)
    if (campus) {
      filtered = filtered.filter(d => {
        const loc = d.location.toLowerCase();
        if (campus.includes('Flandernstraße')) return loc.includes('flandernstra') || loc.startsWith('f');
        if (campus.includes('Stadtmitte')) return loc.includes('stadtmitte') || loc.startsWith('s');
        if (campus.includes('Göppingen')) return loc.includes('göppingen') || loc.startsWith('g');
        return true;
      });
    }

    // 4. Verfügbarkeit
    if (availability === 'available') {
      filtered = filtered.filter(d => d.availability.isAvailable > 0);
    } else if (availability === 'borrowed') {
      filtered = filtered.filter(d => d.availability.isAvailable === 0);
    }

    return filtered;
  }

  /**
   * Mapping von Backend-Model auf UI-Model
   */
  private mapProductsToDevices(products: Product[]): Device[] {
    return products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category?.name || 'Unbekannt',
      description: p.description || '',
      availability: {
        isAvailable: p.availableItemCount || 0,
        total: p.totalItemCount || 0
      },
      loanConditions: {
        loanPeriod: `${p.expiryDate || 0} Tage`
      },
      location: p.location?.roomNr || 'N/A',
      availableItems: p.availableItemCount || 0,
      imageUrl: p.imageUrl
    }));
  }
  /**
   * Generiert die korrekte Bild-URL basierend auf dem Pfad
   */
  getImageUrl(deviceId: number, imageUrl: string | null, imageErrorMap: Map<number, boolean>): string | null {
    if (!imageUrl || imageErrorMap.get(deviceId)) return null;

    if (imageUrl.startsWith('http')) return imageUrl;

    // Pfad-Konstruktion (Anpassung an deine API-Struktur)
    if (imageUrl.startsWith('/api/')) return `http://localhost:8080${imageUrl}`;

    return `http://localhost:8080/api/images/${imageUrl}`;
  }

  navigateToDevice(deviceId: number): void {
    this.router.navigate(['/device', deviceId]);
  }
}
