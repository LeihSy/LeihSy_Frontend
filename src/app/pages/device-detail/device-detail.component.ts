import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Import Product Service & Models
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { LocationService } from '../../services/location.service';
import { Product } from '../../models/product.model';

import { DeviceIconPipe } from '../../pipes/device-icon.pipe';
import { CampusInfoComponent } from '../../components/campus-info/campus-info.component';

// Import PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { PrimeNG } from 'primeng/config';

// Device Interface (für UI-Kompatibilität)
interface Device {
  id: string;
  name: string;
  category: string;
  description: string;
  inventoryNumber?: string;
  availability: {
    available: number;
    total: number;
    borrowed: number;
  };
  campusAvailability: Array<{
    campus: string;
    location: string;
    available: number;
    total: number;
  }>;
  technicalSpecs?: {
    storage?: string;
    sensor?: string;
    accessories?: string[];
  };
  loanConditions: {
    loanPeriod: string;
    extensions: string;
    notes: string;
  };
  keywords: string[];
  price?: number;
  expiryDate?: number;
}

@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    SelectModule,
    DatePickerModule,
    DeviceIconPipe,
    CampusInfoComponent,
  ],
  templateUrl: './device-detail.component.html',
})
export class DeviceDetailPageComponent implements OnInit {
  // --- Injected Services ---
  private route = inject(ActivatedRoute);
  private location = inject(AngularLocation);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private locationService = inject(LocationService);
  private primeng = inject(PrimeNG);

  // --- State ---
  public device: Device | undefined;
  public isLoading = signal(true);
  public errorMessage = signal<string | null>(null);

  public flandernstrasseData: Device['campusAvailability'][0] | undefined;

  public selectedCampus: string = '';
  public pickupDate: Date | undefined;
  public pickupTime: string = '';

  // --- UI Configuration ---
  public minDate: Date;

  constructor() {
    // Mindestdatum auf heute setzen
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0);

    // Deutsche Lokalisierung für den DatePicker
    this.setupGermanLocale();
  }

  ngOnInit(): void {
    // Device-ID aus der URL holen
    const deviceId = this.route.snapshot.paramMap.get('id');

    if (deviceId) {
      this.loadDevice(Number(deviceId));
    }
  }

  // Lade Produkt vom Backend
  private loadDevice(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productService.getProductById(id).subscribe({
      next: (product: Product) => {
        console.log('Product loaded:', product);

        // Lade Items, Category und Location parallel
        forkJoin({
          items: this.productService.getProductItems(id).pipe(catchError(() => of([]))),
          category: product.categoryId
            ? this.categoryService.getCategoryById(product.categoryId).pipe(catchError(() => of(null)))
            : of(null),
          location: product.locationId
            ? this.locationService.getLocationById(product.locationId).pipe(catchError(() => of(null)))
            : of(null)
        }).subscribe({
          next: ({ items, category, location }) => {
            // Berechne Counts basierend auf Items
            const totalItemCount = items.length;
            const availableItemCount = items.filter((item: any) =>
              item.isAvailable === true || item.available === true
            ).length;

            // Erweitere Produkt mit allen Daten
            const enrichedProduct: Product = {
              ...product,
              totalItemCount,
              availableItemCount,
              category: category || undefined,
              location: location || undefined
            };

            // Konvertiere zu Device und zeige an
            this.device = this.mapProductToDevice(enrichedProduct);
            this.setupDeviceData();
          },
          error: (err: any) => {
            console.error('Error loading additional data:', err);
            // Fallback: Verwende Produkt ohne zusätzliche Daten
            product.totalItemCount = 0;
            product.availableItemCount = 0;
            this.device = this.mapProductToDevice(product);
            this.setupDeviceData();
          }
        });
      },
      error: (err: any) => {
        console.error('Error loading product:', err);
        this.errorMessage.set('Produkt konnte nicht geladen werden.');
        this.isLoading.set(false);
      }
    });
  }

  private setupDeviceData(): void {
    // Finde Campus Daten
    if (this.device) {
      this.flandernstrasseData = this.device.campusAvailability.find(
        (ca) => ca.campus === 'Campus Esslingen Flandernstraße'
      );
    }
    this.isLoading.set(false);
  }

  // Konvertiere Backend Product zu Frontend Device
  private mapProductToDevice(product: Product): Device {
    const accessories = this.parseAccessories(product.accessories);

    return {
      id: product.id.toString(),
      name: product.name,
      category: product.category?.name || 'Unbekannt',
      description: product.description,
      price: product.price,
      expiryDate: product.expiryDate,

      // Verfügbarkeit
      availability: {
        available: product.availableItemCount || 0,
        total: product.totalItemCount || 0,
        borrowed: (product.totalItemCount || 0) - (product.availableItemCount || 0)
      },

      // Campus Verfügbarkeit
      campusAvailability: [
        {
          campus: 'Campus Esslingen Flandernstraße',
          location: product.location?.roomNr || 'N/A',
          available: product.availableItemCount || 0,
          total: product.totalItemCount || 0,
        }
      ],

      // Technische Specs
      technicalSpecs: {
        accessories: accessories
      },

      // Ausleihbedingungen
      loanConditions: {
        loanPeriod: `${product.expiryDate} Tage`,
        extensions: 'Maximal 2 Verlängerungen möglich',
        notes: 'Rechtzeitige Rückgabe erforderlich'
      },

      // Keywords
      keywords: [product.category?.name || 'Unbekannt']
    };
  }

  // Parse Accessories JSON
  private parseAccessories(accessories: string | null): string[] {
    if (!accessories) return [];
    try {
      return JSON.parse(accessories);
    } catch {
      return [];
    }
  }

  // Navigiert zur vorherigen Seite zurück
  onBack(): void {
    this.location.back();
  }

  // Setzt deutsche PrimeNG Locale-Einstellungen für DatePicker
  private setupGermanLocale(): void {
    this.primeng.setTranslation({
      firstDayOfWeek: 1,
      dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
      dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      monthNames: [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember',
      ],
      monthNamesShort: [
        'Jan',
        'Feb',
        'Mär',
        'Apr',
        'Mai',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Okt',
        'Nov',
        'Dez',
      ],
      today: 'Heute',
      clear: 'Löschen',
      dateFormat: 'dd.mm.yy',
    });
  }
}
