import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BadgeModule } from 'primeng/badge';

// Services & Models
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { Location } from '../../models/location.model';

// Pipe
import { DeviceIconPipe } from '../../pipes/device-icon.pipe';

// Device Interface (für UI)
interface Device {
  id: number;
  name: string;
  category: string;
  description: string;
  availability: {
    available: number;
    total: number;
  };
  loanConditions: {
    loanPeriod: string;
  };
  location: string;
  availableItems: number;
  imageUrl: string | null;  // NEU: Bild-URL
}

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    TagModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    BadgeModule,
    DeviceIconPipe
  ],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  // State
  products = signal<Product[]>([]);
  devices = signal<Device[]>([]);
  filteredDevices = signal<Device[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Image Error Tracking (um Endlos-Reload zu vermeiden)
  private imageErrorMap = new Map<number, boolean>();

  // Filters
  searchQuery = '';
  selectedCategory = '';
  selectedCampus = '';
  availabilityFilter = '';
  dateRange: Date[] = [];

  // Filter Options
  categories: string[] = [];
  campuses = ['Campus Stadtmitte', 'Campus Flandernstraße', 'Campus Göppingen'];
  availabilityOptions = [
    { label: 'Verfügbar', value: 'available' },
    { label: 'Ausgeliehen', value: 'borrowed' }
  ];

  // DatePicker
  tomorrow = new Date(Date.now() + 86400000);
  monthsToShow = 1;

  // Computed
  formattedDateRange = computed(() => {
    if (!this.dateRange[0]) return '';
    const start = this.dateRange[0].toLocaleDateString('de-DE');
    const end = this.dateRange[1]?.toLocaleDateString('de-DE') || start;
    return `${start} - ${end}`;
  });

  ngOnInit() {
    this.loadProducts();

    // Responsive months
    if (window.innerWidth >= 768) {
      this.monthsToShow = 2;
    }
  }

  // Lade alle Produkte vom Backend mit expandierten Kategorien
  loadProducts() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productService.getProductsWithCategories().subscribe({
      next: (products: Product[]) => {
        console.log('Products with categories loaded:', products);
        this.products.set(products);

        // Konvertiere Products → Devices
        const devices = this.mapProductsToDevices(products);
        this.devices.set(devices);
        this.filteredDevices.set(devices);

        this.extractCategories(products);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.errorMessage.set('Fehler beim Laden der Produkte.');
        this.isLoading.set(false);
      }
    });
  }

  // Konvertiere Backend Products zu Frontend Devices
  private mapProductsToDevices(products: Product[]): Device[] {
    return products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category?.name || 'Unbekannt',
      description: p.description,
      availability: {
        available: p.availableItemCount,
        total: p.totalItemCount
      },
      loanConditions: {
        loanPeriod: `${p.expiryDate} Tage`
      },
      location: p.location?.roomNr || 'N/A',
      availableItems: p.availableItemCount,
      imageUrl: p.imageUrl
    }));
  }

  // Extrahiere eindeutige Kategorien
  private extractCategories(products: Product[]) {
    const uniqueCategories = [...new Set(products.map(p => p.category?.name || 'Unbekannt'))];
    this.categories = uniqueCategories;
  }

  // Filter anwenden
  applyFilters() {
    let filtered = this.devices();

    // Suche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.category.toLowerCase().includes(query)
      );
    }

    // Kategorie
    if (this.selectedCategory) {
      filtered = filtered.filter(d => d.category === this.selectedCategory);
    }

    // Campus
    if (this.selectedCampus) {
      filtered = filtered.filter(d => {
        const location = d.location.toLowerCase();
        if (this.selectedCampus.includes('Flandernstraße')) {
          return location.includes('flandernstra') || location.startsWith('f');
        }
        if (this.selectedCampus.includes('Stadtmitte')) {
          return location.includes('stadtmitte') || location.startsWith('s');
        }
        return true;
      });
    }

    // Verfügbarkeit
    if (this.availabilityFilter === 'available') {
      filtered = filtered.filter(d => d.availableItems > 0);
    } else if (this.availabilityFilter === 'borrowed') {
      filtered = filtered.filter(d => d.availableItems === 0);
    }

    this.filteredDevices.set(filtered);
  }

  // Navigiere zu Detailseite
  onViewDevice(deviceId: number) {
    this.router.navigate(['/device', deviceId]);
  }

  /**
   * Gibt die vollständige Bild-URL zurück
   */
  getImageUrl(deviceId: number): string | null {
    const device = this.devices().find(d => d.id === deviceId);
    if (!device || !device.imageUrl) {
      return null;
    }

    if (this.imageErrorMap.get(deviceId)) {
      return null;
    }

    const imageUrl = device.imageUrl;

    // Fall 1: Absolute URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Fall 2: Backend API Pfad (/api/images/...)
    if (imageUrl.startsWith('/api/images/')) {
      return `http://localhost:8080${imageUrl}`;
    }

    // Fall 3: Legacy Assets (/assets/...) → Backend
    if (imageUrl.startsWith('/assets/images/')) {
      const filename = imageUrl.replace('/assets/images/', '');
      return `http://localhost:8080/api/images/${filename}`;
    }

    // Fall 4: Nur Filename
    return `http://localhost:8080/api/images/${imageUrl}`;
  }

  /**
   * Error-Handler wenn Bild nicht geladen werden kann
   * Setzt Fallback auf Icon und verhindert Endlos-Reload
   */
  onImageError(event: Event, device: Device): void {
    console.warn(`Image load error for device ${device.id}:`, device.imageUrl);

    // Markiere als fehlerhaft → Template zeigt Icon
    this.imageErrorMap.set(device.id, true);

    // Verhindere weiteren Reload-Versuch
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

}
