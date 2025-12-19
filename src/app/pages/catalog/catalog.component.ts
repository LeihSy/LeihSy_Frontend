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
import { CatalogService } from './services/catalog.service';

// Components
import { CatalogSearchFiltersComponent } from './components/catalog-search-filters.component';
import { DeviceCardComponent, Device } from '../../components/device-card/device-card.component';


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
    CatalogSearchFiltersComponent,
    DeviceCardComponent
  ],
  providers: [CatalogService],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);

  // Use service signals
  products = this.catalogService.products;
  devices = this.catalogService.devices;
  isLoading = this.catalogService.isLoading;
  errorMessage = this.catalogService.errorMessage;

  // Local component state
  filteredDevices = signal<Device[]>([]);

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
    this.catalogService.loadProducts();

    // Update categories and filteredDevices after load
    setTimeout(() => {
      this.categories = this.catalogService.categories();
      this.filteredDevices.set(this.devices());
    }, 100);
  }


  // Filter anwenden
  applyFilters() {
    const filtered = this.catalogService.applyFilters(
      this.devices(),
      this.searchQuery,
      this.selectedCategory,
      this.selectedCampus,
      this.availabilityFilter,
      this.dateRange
    );

    this.filteredDevices.set(filtered);
  }

  // Navigiere zu Detailseite
  onViewDevice(deviceId: number) {
    this.catalogService.navigateToDevice(deviceId);
  }

  /**
   * Gibt die vollständige Bild-URL zurück
   */
  getImageUrl(deviceId: number): string | null {
    const device = this.devices().find(d => d.id === deviceId);
    if (!device) return null;

    return this.catalogService.getImageUrl(deviceId, device.imageUrl, this.imageErrorMap);
  }

  /**
   * Error-Handler wenn Bild nicht geladen werden kann
   * Setzt Fallback auf Icon und verhindert Endlos-Reload
   */
  onImageError(event: Event, device: Device): void {
    console.warn(`Image load error for device ${device.id}:`, device.imageUrl);

    this.catalogService.handleImageError(device.id, this.imageErrorMap);

    // Verhindere weiteren Reload-Versuch
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

}
