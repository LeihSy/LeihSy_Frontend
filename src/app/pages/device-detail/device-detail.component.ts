import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, getLocaleCurrencyCode, Location } from '@angular/common';
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

// import Cart Service
import { CartService } from '../../services/cart.service';

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
    maxLendingDays: string;
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
  private cartService = inject(CartService);

  // --- State ---
  public device: Device | undefined;
  public isLoading = signal(true);
  public errorMessage = signal<string | null>(null);

  public flandernstrasseData: Device['campusAvailability'][0] | undefined;

  public selectedCampus: string = '';
  public pickupDate: Date = new Date();
  public returnDate: Date = new Date();
  public pickupTime: string = '';
  public addedToCart = false;

  // --- UI Configuration ---
  public earliestPickupDate: Date;
  public latestPickupDate: Date;

  public earliestReturnDate: Date;
  public latestReturnDate: Date;

  constructor() {

    // Daten auf heute setzen
    const today = this.setHoursToZero(new Date());

    this.earliestPickupDate = today;  // Abholung frühestens heute
    this.earliestReturnDate = this.addDays(today, 1); // Rückgabe frühestens morgen

    this.latestPickupDate = this.addDays(today, 180); // Maximal halbes Jahr im Voraus ausleihbar
    this.latestReturnDate = this.addDays(today, 180);

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
        maxLendingDays: `${product.expiryDate} Tage`,
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

  onAddToCart(): void {
    if (!this.device || !this.pickupDate || !this.returnDate) return;

    // Füge Item zu lokalem Warenkorb hinzu und überprüfe auf Erfolg
    if(this.cartService.addItem(
      this.device.id,
      this.pickupDate.toISOString(),
      this.returnDate.toISOString()
    )) {
      this.addedToCart = true;
    } else {
      this.addedToCart = false;
    }
  }

  onSelectPickupDate(date: Date, device: Device) {
    if (!date) {
      return;
    }

    const pickupDate = this.setHoursToZero(date);
    this.earliestReturnDate = this.addDays(pickupDate, 1); // Rückgabe muss frühestens einen Tag nach nach Ausleihe sein
    this.latestReturnDate = this.addDays(pickupDate, parseInt(device.loanConditions.maxLendingDays));  // Rückgabe darf spätestens zum Ende des maximalen Ausleihzeitraums sein
    this.returnDate = this.latestReturnDate; // In Auswahlfenster Rückgabezeitpunkt automatisch auf spätestmögliches Datum setzen
  }

  private setHoursToZero(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

}
