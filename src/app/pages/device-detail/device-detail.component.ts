import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Import Product Service & Models
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { LocationService } from '../../services/location.service';
import { Product } from '../../models/product.model';
import { CartService, TimePeriod } from '../../services/cart.service';
import { environment } from '../../environments/environment';

import { DeviceIconPipe } from '../../pipes/device-icon.pipe';
import { CampusInfoComponent } from '../../components/campus-info/campus-info.component';
import { FilledButtonComponent } from '../../components/buttons/filled-button/filled-button.component';
import { BackButtonComponent } from '../../components/buttons/back-button/back-button.component';
import { SecondaryButtonComponent } from '../../components/buttons/secondary-button/secondary-button.component';

// Import PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { PrimeNG } from 'primeng/config';
import { InputNumberModule } from 'primeng/inputnumber';

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
    maxLendingDaysInt: number;
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
    InputNumberModule,
    CommonModule,
    FormsModule,
    FilledButtonComponent,
    BackButtonComponent,
    SecondaryButtonComponent,
    ButtonModule,
    CardModule,
    TagModule,
    SelectModule,
    DatePickerModule,
    DeviceIconPipe,
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
  private cartService = inject(CartService);

  // --- State ---
  public device: Device | undefined;
  public isLoading = signal(true);
  public showNotFound = signal(false);
  public errorMessage = signal<string | null>(null);

  public flandernstrasseData: Device['campusAvailability'][0] | undefined;

  public selectedCampus: string = '';

  public disabledDates: Date[] = [];
  public rentalPeriod: Date[] = [];
  public quantity: number = 1;
  public message: string = "";
  public today: Date = this.setHoursToZero(new Date());

  public datePickerErrorMessage: string = "";
  public addedToCart: boolean = false;

  public unavailablePeriods: TimePeriod[] = [];

  private http = inject(HttpClient);

  ngOnInit(): void {

    // Device-ID aus der URL holen
    const deviceId = this.route.snapshot.paramMap.get('id');

    if (deviceId) {
      this.loadDevice(Number(deviceId));
    }

     // Deutsche Lokalisierung für den DatePicker
    this.setupGermanLocale();
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
      this.getUnavailablePeriods(this.device.id, this.quantity);
    }
    this.isLoading.set(false);
    this.showNotFound.set(false);
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
        maxLendingDays: `${product.expiryDate} Tage`,
        maxLendingDaysInt: product.expiryDate,
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

    onAddToCart(): void {
    if (!this.device || !this.rentalPeriod[0] || !this.rentalPeriod[1]) {
      return;
    }

    // Füge Item zu lokalem Warenkorb hinzu und überprüfe auf Erfolg
    if(this.cartService.addItem(
      this.device.id,
      this.quantity,
      this.message,
      this.rentalPeriod[0],
      this.rentalPeriod[1],
    )) {
      this.addedToCart = true;
    } else {
      this.addedToCart = false;
    }
  }

  public onQuantityChange() {
    if(this.quantity < 1) {
      this.rentalPeriod = [];
      return;
    } else if(this.device)
    this.getUnavailablePeriods(this.device.id, this.quantity);
    this.rentalPeriod = [];
  }


  public getUnavailablePeriods(productId: string, quantity: number) {
    this.http
    .get<TimePeriod[]>(
      `${environment.apiBaseURL}/api/products/${productId}/periods`,
      {
        params: {
          requiredQuantity: quantity,
          type: 'unavailable'
        }
      }
    )
    .subscribe({
      next: (periods) => {
        this.unavailablePeriods = periods;
        if(this.unavailablePeriods.length === 0) {
          console.log("No unavailable Periods found");
        } else {
          console.log("UnavailablePeriods: ", this.unavailablePeriods);
        }
        this.getDisabledDates(periods);
        console.log("DisabledDays: ", this.disabledDates);
      },
      error: (err) => {
        console.error('Error loading unavailable periods:', err);
        this.unavailablePeriods = [];
      }
    });
  }

  public onRentalPeriodChange(range: Date[], device: Device) {
    if(!range || range.length !== 2) {
      return;
    } else {
      const pickupDate = this.setHoursToZero(range[0]);
      const returnDate = this.setHoursToZero(range[1]);

      const maxDays = device.loanConditions.maxLendingDaysInt;

      const maxReturnDate = this.addDays(pickupDate, maxDays);

      if (returnDate > maxReturnDate) { // Falls zu langer Zeitraum gewählt wurde
        this.datePickerErrorMessage = `Maximale Ausleihdauer beträgt ${device.loanConditions.maxLendingDays}!`;
        this.rentalPeriod = [];
        return;
      } else if (this.rangeContainsDisabledDate(range)) { // Falls ein nicht verfügbares Datum mit ausgewählt wurde
        this.datePickerErrorMessage = `Gewünschte Anzahl in diesem Zeitraum nicht verfügbar!`;
        this.rentalPeriod = [];
      }
      else {
        this.datePickerErrorMessage = "";
        this.rentalPeriod[0] = range[0];
        this.rentalPeriod[1] = range[1];
        return;
      }
    }
  }

  // Prüft ob in einer Range von Dates disabled Dates enthalten sind
  private rangeContainsDisabledDate(range: Date[]): boolean {
    if (!range || range.length !== 2) {
      return false;
    }

    const start = this.setHoursToZero(range[0]);
    const end = this.setHoursToZero(range[1]);

    const disabledSet = new Set(
      this.disabledDates.map(d => d.getTime())
    );

    let current = new Date(start);
    while (current <= end) {
      if (disabledSet.has(current.getTime())) {
        return true;
      }
      current = this.addDays(current, 1);
    }

    return false;
  }

  // Wandle nicht verfügbare Zeiträume in Array von Dates um für Date Picker
  getDisabledDates(unavailablePeriods: TimePeriod[]){
    if (!unavailablePeriods) {  // Falls unavailablePeriods nicht definiert ist
      this.disabledDates = [];
    } else if (unavailablePeriods.length === 0){  // Falls keine nicht verfügbaren Zeiträume vorhanden sind
      this.disabledDates = [];
    } else {

      console.log("getDisabledDates Logik");
      const disabledDates: Date[] = [];

      for (const period of unavailablePeriods) {
        console.log("for schleife");
        console.log("startdate" , period.startDate);
        console.log("enddate" , period.endDate);
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);


        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        let current = new Date(start);
        while (current <= end) {
          disabledDates.push(new Date(current));
          console.log("new Day added", current);
          current = this.addDays(current, 1);

        }
      }

      this.disabledDates = disabledDates;
    }
  }

  // Prüft ob Item in den Warenkorb gelegt werden kann
  get canPutToCart(): boolean {
    if(this.rentalPeriod && this.rentalPeriod.length === 2 && this.quantity > 0) {
      return true;
    } else {
      return false;
    }
  }

  private setHoursToZero(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  public addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
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
