import { Component, inject  } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { PrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { forkJoin } from 'rxjs';

import { CartService, TimePeriod } from '../../services/cart.service';


@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    InputNumberModule,
    CheckboxModule,
    DatePickerModule,
    FormsModule,
    ButtonModule,
    CommonModule,
  ],
  templateUrl: './cart.component.html',
})
export class CartPageComponent {
  private primeng = inject(PrimeNG);
  public cartService = inject(CartService);
  private http = inject(HttpClient);
  private router = inject(Router);

  acceptedTerms: boolean = false;
  bookingsCreatedSuccessfully: boolean = false;
  today = new Date();
  

  constructor() {
    // Deutsche Lokalisierung für den DatePicker
    this.today.setHours(0, 0, 0, 0);
    this.setupGermanLocale();
  }
  public onRemoveItem(cartItemId: string): void {
    this.cartService.removeItem(String(cartItemId));  // entferne Item aus lokal gespeichertem Warenkorb
  }

  public onBackToCatalogClick(): void {
    this.router.navigate(['/catalog']);
  }

  getDisabledDates(unavailablePeriods: TimePeriod[]): Date[] {
    if (!unavailablePeriods || unavailablePeriods.length === 0) {
      return [];
    }

    const disabledDates: Date[] = [];

    for (const period of unavailablePeriods) {
      let current = new Date(period.startDate);
      const end = new Date(period.endDate);

      // sicherstellen, dass Uhrzeiten keinen Ärger machen
      current.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      while (current <= end) {
        disabledDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }

    return disabledDates;
  }

  public onQuantityChange(cartItemId: string, quantity: number) {
    if(quantity < 1) {
      return;
    } else {
      this.cartService.updateItemQuantity(cartItemId, quantity)
    }
  }

  public onRentalPeriodChange(cartItemId: string, range: Date[] | null) {
    if(!range || range.length !== 2) {
      return;
    } else {
      this.cartService.updateItemRentalPeriod(cartItemId, range[0], range[1])
    }
  }

  public onMessageChange(cartItemId: string, message: string) {
    this.cartService.updateItemMessage(cartItemId, message);
  }

  public onConfirmLendingClick(): void {
    // Array von POST-Requests erstellen
    const bookingsToCreate = this.cartService.getItems()
    .filter(item => item.rentalPeriod && item.rentalPeriod.length === 2)
    .map(item => ({
      productId: item.productId,
      startDate: item.rentalPeriod![0],
      endDate: item.rentalPeriod![1],
      message: item.message,
      quantity: item.quantity,
    }))
    .map(body =>
      this.http.post('http://localhost:8080/api/bookings', body, { observe: 'response' , headers: { 'Content-Type': 'application/json' }})
    );

    console.log("bookingsToCreate erstellt: ", bookingsToCreate);

    // Alle Requests gleichzeitig ausführen
    forkJoin(bookingsToCreate).subscribe({
      next: (responses) => {
        console.log("Response von Booking Backend: ", responses);
        // Falls alle Antworten vom Backend response code 201 enthalten
        if(responses.every((res: HttpResponse<any>) => res.status === 201)){
          console.log('Bookings erfolgreich erstellt:', responses);
          this.cartService.clearCart(); // lokal gespeicherten Warenkorb löschen
          this.bookingsCreatedSuccessfully = true;
        }
      },
      error: (err) => {
        console.error('Fehler beim Buchen:', err);
      }
    });
  }

  // Prüft ob für alle Items im Warenkorb Ausleihanfragen abgeschickt werden können
  get canConfirmLending(): boolean {
    // Prüft, ob die Nutzungsbedingungen akzeptiert wurden
    if (!this.acceptedTerms) return false;

    // Prüft jedes Item im Warenkorb
    return this.cartService.getItems().every(item =>
      item.rentalPeriod &&
      item.rentalPeriod.length === 2 &&
      !item.rentalError
    );
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
