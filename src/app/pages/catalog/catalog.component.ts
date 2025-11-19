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
import { Product, ProductStatus } from '../../models/product.model';


// Pipe
import { DeviceIconPipe } from '../../pipes/device-icon.pipe';

// Device Interface (für Asinas Template)
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
  status: ProductStatus;
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
export class CatalogPageComponent implements OnInit {
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

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        this.products.set(products);

        // Konvertiere Products → Devices
        const devices = this.mapProductsToDevices(products);
        this.devices.set(devices);
        this.filteredDevices.set(devices);

        this.extractCategories(products);
        this.isLoading.set(false);
      },
      error: (error) => {
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
        available: p.status === 'AVAILABLE' ? 1 : 0,
        total: 1
      },
      loanConditions: {
        loanPeriod: '7 Tage'
      },
      location: p.location,
      status: p.status
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

    // Campus (aktuell kein Backend Field - könnte aus location gefiltert werden)
    if (this.selectedCampus) {
      // TODO: Filtern nach Campus wenn Backend das unterstützt
    }

    // Verfügbarkeit
    if (this.availabilityFilter === 'available') {
      filtered = filtered.filter(d => d.status === 'AVAILABLE');
    } else if (this.availabilityFilter === 'borrowed') {
      filtered = filtered.filter(d => d.status === 'BORROWED');
    }

    // Datumsbereich (aktuell keine Booking-Daten)
    // TODO: Filter nach Verfügbarkeit im Zeitraum wenn Bookings implementiert sind

    this.filteredDevices.set(filtered);
  }

  // Navigiere zu Detailseite
  onViewDevice(deviceId: number) {
    this.router.navigate(['/device', deviceId]);
  }
}
