import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Import Product Service & Models
import { ProductService } from '../../services/product.service';
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
  private location = inject(Location);
  private productService = inject(ProductService);
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
        this.device = this.mapProductToDevice(product);

        // Finde Campus Daten
        this.flandernstrasseData = this.device.campusAvailability.find(
          (ca) => ca.campus === 'Campus Esslingen Flandernstraße'
        );

        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.errorMessage.set('Produkt konnte nicht geladen werden.');
        this.isLoading.set(false);
      }
    });
  }

  // Konvertiere Backend Product zu Frontend Device
  private mapProductToDevice(product: Product): Device {
    const accessories = this.parseAccessories(product.accessories);

    return {
      id: product.id.toString(),
      name: product.name,
      category: product.categoryName,
      description: product.description,
      price: product.price,
      expiryDate: product.expiryDate,

      // Verfügbarkeit
      availability: {
        available: product.availableItems,
        total: product.totalItems,
        borrowed: product.totalItems - product.availableItems
      },

      // Campus Verfügbarkeit
      campusAvailability: [
        {
          campus: 'Campus Esslingen Flandernstraße',
          location: product.locationRoomNr,
          available: product.availableItems,
          total: product.totalItems,
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
      keywords: [product.categoryName]
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
