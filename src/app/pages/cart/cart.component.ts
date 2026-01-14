import { Component, inject  } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { PrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { forkJoin } from 'rxjs';

import { CartService } from '../../services/cart.service';


@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
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

  public onRentalPeriodChange(cartItemId: string, productId: string, range: Date[] | null) {
    if(!range || range.length !== 2) {
      return;
    } else {
      this.cartService.updateItem(cartItemId, productId, {pickupDate: range[0], returnDate: range[1]})
    }
  }
  public onConfirmLendingClick(): void {
    // Array von POST-Requests erstellen
    const bookingsToCreate = this.cartService.getItems().map(item => {
      const body = {
        itemId: item.productId,
        startDate: item.rentalPeriod.pickupDate,
        endDate: item.rentalPeriod.returnDate,
        message: ""
      };

      return this.http.post('http://localhost:8080/api/bookings', body, {observe: 'response'});
    });

    // Alle Requests gleichzeitig ausführen
    forkJoin(bookingsToCreate).subscribe({
      next: (responses) => {
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
