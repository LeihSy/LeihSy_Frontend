import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Import Product Service & Models
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

// Import Device Interface (für Template Kompatibilität)
import { Device } from '../../interfaces/device.model';

import { DeviceIconPipe } from '../../pipes/device-icon.pipe';
import { CampusInfoComponent } from '../../components/campus-info/campus-info.component';

// Import PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { PrimeNG } from 'primeng/config';

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
      next: (product) => {
        console.log('Product loaded:', product);
        this.device = this.mapProductToDevice(product);

        // Finde Campus Daten (aktuell Mock - später aus Backend)
        this.flandernstrasseData = this.device.campusAvailability.find(
          (ca) => ca.campus === 'Campus Esslingen Flandernstraße'
        );

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage.set('Produkt konnte nicht geladen werden.');
        this.isLoading.set(false);
      }
    });
  }

  // Konvertiere Backend Product zu Frontend Device
  private mapProductToDevice(product: Product): Device {
    return {
      id: product.id.toString(),
      name: product.name,
      category: product.categoryName,
      description: product.description,
      inventoryNumber: product.inventoryNumber,

      // Verfügbarkeit
      availability: {
        available: product.status === 'AVAILABLE' ? 1 : 0,
        total: 1,
        borrowed: product.status === 'BORROWED' ? 1 : 0
      },

      // Campus Verfügbarkeit
      campusAvailability: [
        {
          campus: 'Campus Esslingen Flandernstraße',
          location: product.location,
          available: product.status === 'AVAILABLE' ? 1 : 0,
          total: 1,
        }
      ],

      // Technische Specs
      technicalSpecs: {
        accessories: product.accessories ? product.accessories.split(',').map(a => a.trim()) : []
      },

      // Ausleihbedingungen
      loanConditions: {
        loanPeriod: '7 Tage',
        extensions: 'Maximal 2 Verlängerungen möglich',
        notes: 'Rechtzeitige Rückgabe erforderlich'
      },

      // Keywords
      keywords: [product.categoryName]
    };
  }

  // Gibt das gesamte Datenobjekt für den aktuell ausgewählten Campus zurück
  get selectedCampusData(): Device['campusAvailability'][0] | undefined {
    return this.device?.campusAvailability.find((ca) => ca.campus === this.selectedCampus);
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
