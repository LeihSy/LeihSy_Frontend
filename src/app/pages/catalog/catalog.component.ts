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

  // 1. Daten direkt als Signals aus dem Service beziehen
  devices = this.catalogService.devices;
  isLoading = this.catalogService.isLoading;
  categories = this.catalogService.categories;
  errorMessage = this.catalogService.errorMessage;

  // 2. Filter-Zustände als lokale Signals
  searchQuery = signal('');
  selectedCategory = signal('');
  selectedCampus = signal('');
  availabilityFilter = signal('');
  dateRange = signal<Date[]>([]);

  // Konstanten für die UI
  campuses = ['Campus Stadtmitte', 'Campus Flandernstraße', 'Campus Göppingen'];
  availabilityOptions = [
    { label: 'Verfügbar', value: 'available' },
    { label: 'Ausgeliehen', value: 'borrowed' }
  ];
  tomorrow = new Date(Date.now() + 86400000);
  monthsToShow = window.innerWidth >= 768 ? 2 : 1;

  // 3. Automatisches Filtern durch computed
  filteredDevices = computed(() => {
    return this.catalogService.applyFilters(
      this.devices(),
      this.searchQuery(),
      this.selectedCategory(),
      this.selectedCampus(),
      this.availabilityFilter(),
      this.dateRange()
    );
  });

  // Hilfs-Computed für das Datum-Label
  formattedDateRange = computed(() => {
    const range = this.dateRange();
    if (!range || !range[0]) return '';
    const start = range[0].toLocaleDateString('de-DE');
    const end = range[1]?.toLocaleDateString('de-DE') || start;
    return `${start} - ${end}`;
  });

  ngOnInit() {
    this.catalogService.loadProducts();
  }

  // Diese Methode bleibt leer oder kann für Analytics genutzt werden,
  // da das computed Signal 'filteredDevices' bereits alles erledigt.
  applyFilters() {
    console.log('Filter wurden angewendet');
  }

  onViewDevice(deviceId: number) {
    this.catalogService.navigateToDevice(deviceId);
  }

  getImageUrl(deviceId: number): string | null {
    const device = this.devices().find(d => d.id === deviceId);
    if (!device) return null;
    return this.catalogService.getImageUrl(deviceId, device.imageUrl, new Map());
  }

  onImageError(event: Event, device: any): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
