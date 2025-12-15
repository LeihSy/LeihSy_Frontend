import { Component, Input, inject  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { PrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { forkJoin } from 'rxjs';

import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CheckboxModule,
    DatePickerModule,
    FormsModule,
    ButtonModule,
    CommonModule,
    AsyncPipe,
  ],
  templateUrl: './cart.component.html',
})
export class CartPageComponent {

  private primeng = inject(PrimeNG);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private http = inject(HttpClient);
  private router = inject(Router);
  
  
  cartCount$ = this.cartService.itemCount$; // Auto-Updatender Cart Count aus Service

  cartItemsFull: any[] = [];

  acceptedTerms: boolean = false;

  constructor() {

    // zu Produkten im Lokalen Browser Storage die vollständigen Daten vom Backend holen
    this.loadFullProducts();

    // Deutsche Lokalisierung für den DatePicker
    this.setupGermanLocale();
  }

  private loadFullProducts(): void {

    const cartItems = this.cartService.getItems();

    // Erstelle Array aus Produkt-Observables für alle Items im Cart
    const productsToPull = cartItems.map(item => 
      this.productService.getProductById(Number(item.productId))
    );
    // Hole parallel alle Produktdaten zu den Produkten im Kart von den Observables
    forkJoin(productsToPull).subscribe({
      next: (products: Product[]) => {  // Array von Produkten vorliegend
        this.cartItemsFull = products.map((product, i) => ({  // Iteriere durch Array von Produkten und über i gleichzeitig um kombiniertes Produkt mit Daten vom Backend anzureichern
          cartItemId: cartItems[i].cartItemId,
          productId: cartItems[i].productId,
          pickupDate: new Date(cartItems[i].pickupDate),
          returnDate: new Date(cartItems[i].returnDate),
          name: product.name,
          location: product.locationRoomNr,
          maxLendingDays: product.expiryDate
        }));
      },
      error: (err) => {
        console.error("Error loading products: ", err);
      }
    });
  }

  public onRemoveItem(index: number): void {
    const cartItemId = this.cartItemsFull[index].cartItemId
    this.cartItemsFull = this.cartItemsFull.filter(item => item.cartItemId !== cartItemId)  // filtere Item mit der passenden cartItemId aus dem Array angereicherter Produkte
    this.cartService.removeItem(String(cartItemId));  // entferne Item aus lokal gespeichertem Warenkorb
  }

  public onBackToCatalogClick(): void {
    this.router.navigate(['/catalog']);
  }

  public onConfirmLendingClick(): void {
    // Array von POST-Requests erstellen
    const bookingsToCreate = this.cartItemsFull.map(item => {
      const body = {
        itemId: item.productId,
        startDate: item.pickupDate.toISOString(),
        endDate: item.returnDate.toISOString(),
        message: ""
      };

      return this.http.post('http://localhost:8080/api/bookings', body);
    });

    // Alle Requests gleichzeitig ausführen
    forkJoin(bookingsToCreate).subscribe({
      next: (responses) => {
        console.log('Bookings erfolgreich erstellt:', responses);
        this.cartService.clearCart(); // lokal gespeicherten Warenkorb löschen
        this.cartItemsFull = [];  // Angereichterte Produkte löschen
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
