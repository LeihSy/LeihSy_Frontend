import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Import Device data and services
import { Device } from '../../interfaces/device.model';
import { DeviceService } from '../../services/device.service';

// Import PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { PrimeNG } from 'primeng/config';
import { DeviceIconPipe } from '../../pipes/device-icon.pipe';
import { CampusInfoComponent } from '../../components/campus-info/campus-info.component';

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
  private deviceService = inject(DeviceService);
  private primeng = inject(PrimeNG);

  public device: Device | undefined;

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
    // Device-ID aus der URL holen (ersetzt props.deviceId)
    const deviceId = this.route.snapshot.paramMap.get('id');

    if (deviceId) {
      this.device = this.deviceService.getDeviceById(deviceId);

      if (this.device) {
        this.flandernstrasseData = this.device.campusAvailability.find(
          (ca) => ca.campus === 'Campus Esslingen Flandernstraße'
        );
      }
    }
  }

  // Gibt das gesamte Datenobjekt für den aktuell ausgewählten Campus zurück.
  get selectedCampusData(): Device['campusAvailability'][0] | undefined {
    return this.device?.campusAvailability.find((ca) => ca.campus === this.selectedCampus);
  }

  // Navigiert zur vorherigen Seite zurück
  onBack(): void {
    this.location.back();
  }

  //Setzt deutsche PrimeNG Locale-Einstellungen für DatePicker
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
