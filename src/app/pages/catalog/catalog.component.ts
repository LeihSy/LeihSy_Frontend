import { Component, OnInit, inject, HostListener} from '@angular/core';

import { CommonModule, DOCUMENT } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Import Device data
import { Device } from '../../interfaces/device.model';
import { DeviceService } from '../../services/device.service';
import { DeviceIconPipe } from '../../pipes/device-icon.pipe';

// Import PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

// Helper interface für PrimeNG Dropdowns
interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    BadgeModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    DatePickerModule,
    DeviceIconPipe,
  ],
  templateUrl: './catalog.component.html',
})
export class CatalogPageComponent implements OnInit {
  private deviceService = inject(DeviceService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  // Vollständige Geräteliste
  public allDevices: Device[] = [];
  // Gefilterte Geräteliste
  public filteredDevices: Device[] = [];

  // Such- und Filterzustände für die UI
  public searchQuery: string = '';
  public selectedCategory: string = 'all';
  public selectedCampus: string = 'all';
  public availabilityFilter: string = 'all';
  // Datumsbereich aus dem DatePicker
  public dateRange: (Date | undefined)[] = [undefined, undefined];

  // Anzahl der im DatePicker angezeigten Monate (Responsiveness)
  public monthsToShow: number = 2;

  // Dropdown-Optionen für Kategorien, Campus und Verfügbarkeit
  public categories: SelectOption[];
  public campuses: SelectOption[];
  public availabilityOptions: SelectOption[] = [
    { label: 'Alle Medien', value: 'all' },
    { label: 'Nur Verfügbare', value: 'available' },
  ];

  constructor() {
    // Mögliche Gerätekategorien für den Filter
    this.categories = [
      { label: 'Alle Kategorien', value: 'all' },
      { label: 'VR-Geräte', value: 'VR geräte' },
      { label: 'Licht-Equipment', value: 'Lichtset equipment' },
      { label: 'Audio-Equipment', value: 'Audio equipment' },
      { label: 'Kameras', value: 'kameras' },
      { label: 'Kamera-Zubehör', value: 'kamera zubehör' },

    ];

    // Campus-Standorte für den Filter
    this.campuses = [
      { label: 'Alle Campus', value: 'all' },
      { label: 'Campus Esslingen Flandernstraße', value: 'Campus Esslingen Flandernstraße' },
      { label: 'Campus Esslingen Stadtmitte', value: 'Campus Esslingen Stadtmitte' },
      { label: 'Campus Göppingen', value: 'Campus Göppingen' },
    ];
  }

  ngOnInit(): void {
    // Alle Geräte beim Initialisieren aus dem Service laden
    this.allDevices = this.deviceService.getDevices();
    // Startfilter anwenden (zeigt initial alle Geräte)
    this.applyFilters();
    // Direkt beim Laden prüfen, wie viele Monate im DatePicker angezeigt werden sollen
    this.checkScreenSize();

  }

  // Listener für Fenstergrößenänderung
  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  // Responsive Verhalten für den DatePicker:
  // auf großen Bildschirmen 2 Monate, auf kleineren nur 1 Monat anzeigen
  private checkScreenSize(): void {
    const width = this.document.defaultView?.innerWidth || 0;
    this.monthsToShow = width >= 768 ? 2 : 1;
  }

  // Zentrale Filterlogik für Katalogliste
  applyFilters(): void {
    // Helper-Funktion: Strings in Kleinschreibung und ohne Bindestriche vergleichen
    const normalize = (value: string | null | undefined): string =>
      (value ?? '').toLowerCase().replace(/-/g, ' ');

    const query = normalize(this.searchQuery.trim());
    const [from, to] = this.dateRange;

    this.filteredDevices = this.allDevices.filter(device => {
      // Volltextsuche über mehrere Felder (Name, Inventarnummer, Kategorie, Beschreibung, Keywords)
      const matchesSearch =
        normalize(device.name).includes(query) ||
        normalize(device.inventoryNumber).includes(query) ||
        normalize(device.category).includes(query) ||
        normalize(device.description).includes(query) ||
        device.keywords.some(k => normalize(k).includes(query));

      // Kategorie-Filter
      const matchesCategory =
        this.selectedCategory === 'all' ||
        device.category === this.selectedCategory;

      // Campus-Filter
      const matchesCampus =
        this.selectedCampus === 'all' ||
        device.campusAvailability.some(
          ca => ca.campus === this.selectedCampus && ca.available > 0
        );

      // Verfügbarkeitsfilter
      const matchesAvailability =
        this.availabilityFilter === 'all' ||
        (this.availabilityFilter === 'available' &&
          device.availability.available > 0);

      const matchesDateRange = !from || device.availability.available > 0;

      return (matchesSearch &&
        matchesCategory &&
        matchesCampus &&
        matchesAvailability &&
        matchesDateRange);
    });
  }

  // Formatiert den gewählten Datumsbereich für die Anzeige im UI
  get formattedDateRange(): string {
    const [from, to] = this.dateRange;
    if (from && to) {
      return `📅 ${format(from, 'dd.MM.', { locale: de })} - ${format(to, 'dd.MM.yy', { locale: de })}`;
    }
    if (from) {
      return `📅 Ab ${format(from, 'dd.MM.yy', { locale: de })}`;
    }
    return '';
  }



  // Navigation zur Detailansicht eines Geräts
  onViewDevice(deviceId: string): void {
    this.router.navigate(['/device', deviceId]);
  }

// Berechnet das Datum von "morgen" (00:00 Uhr)
  get tomorrow(): Date {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}
