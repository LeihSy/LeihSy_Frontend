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

  // Lade alle Produkte vom Backend
  loadProducts() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        console.log('Products loaded:', products);
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
      category: p.categoryName,
      description: p.description,
      availability: {
        available: p.availableItems,
        total: p.totalItems
      },
      loanConditions: {
        loanPeriod: `${p.expiryDate} Tage`
      },
      location: p.locationRoomNr,
      availableItems: p.availableItems
    }));
  }

  // Extrahiere eindeutige Kategorien
  private extractCategories(products: Product[]) {
    const uniqueCategories = [...new Set(products.map(p => p.categoryName))];
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
}
