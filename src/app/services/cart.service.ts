import { Injectable, signal, computed, inject, ɵcreateOrReusePlatformInjector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductService } from './product.service';
import { forkJoin, max } from 'rxjs';
import { environment } from '../environments/environment';

export interface TimePeriod {
  startDate: string;
  endDate: string;
}

export interface CartItem {
  cartItemId: string;   // ID eines Eintrags im Cart
  productId: string;
  quantity: number;
  message: string;
  rentalPeriod: Date [] | undefined,
  name?: string;
  location?: string;
  maxLendingDays?: number;
  unavailablePeriods: TimePeriod[];
  disabledDates: Date[];  // ausgegraute Tage für Date Picker
  rentalError?: string; // Fehlermeldungen bei falschen Eingaben
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private productService = inject(ProductService);

  private readonly STORAGE_KEY = 'cart';

  // Cart als Signal -> Komponenten werden automatisch geupdated
  private cart = signal<CartItem[]>([]);

  // Cartcount ist abgeleitet von cart, wird automatisch geupdated + updated Komponenten automatisch
  public cartCount = computed(() => this.cart().length);

  constructor(private http: HttpClient) {

    // Initial aus localStorage laden
    this.loadFromStorage();

    this.enrichCartItems();

    // Reagiert auf Änderungen durch andere Tabs/Fenster
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY) {
        this.loadFromStorage();
      }
    });
  }

  // Gibt alle Items zurück
  getItems(): CartItem[] {
    return [...this.cart()];
  }

  getItemByCartItemId(cartItemId: string): CartItem | null {

    for(let cartItem of this.cart()) {
      if (cartItem.cartItemId === cartItemId) {
        return cartItem;
      }
    }
    return null;
  }

  // Item zu lokalem Warenkorb hinzufügen
  addItem(productId: string, quantity: number, message: string, pickupDate: Date, returnDate: Date): boolean {
    const newItem: CartItem = {
        cartItemId: this.generateCartItemId(),
        productId,
        quantity,
        message,
        rentalPeriod: [pickupDate, returnDate],
        unavailablePeriods: [],
        disabledDates: []
    };
    this.cart.update(cart => [...cart, newItem]); // Füge neues Item hinzu
    this.saveToStorage();

    // Prüfe ob Item erfolgreich erstellt wurde
    if(this.getItemByCartItemId(newItem.cartItemId)) {
      return true;
    } else {
      return false;
    }
  }

  updateItemQuantity(cartItemId: string, quantity: number): void {
    try {
      // Speichere neue Quantity
      this.cart.update(cart =>
        cart.map(item => {
          if(item.cartItemId === cartItemId) {
            return {
              ...item,
              quantity,
              rentalPeriod: [],
              rentalError: "Anzahl des Items geändert",
            };
          }
          return item;
        })
      );
      this.saveToStorage()

      // Speichere neue disabledDates
      this.cart.update(cart =>
        cart.map(item => {
          if(item.cartItemId === cartItemId) {
            return {
              ...item,
              disabledDates: this.getDisabledDates(item.unavailablePeriods),
            };
          }
          return item;
        })
      );
      this.saveToStorage();
    } catch (err) {
      console.log("Fehler beim Updaten der Anzahl des Items")
    }
  }

  // Nachricht zu Item ändern
  updateItemMessage(cartItemId: string, message: string) {
    try {
      this.cart.update(cart =>
        cart.map(item => {
          if(item.cartItemId === cartItemId) {
            return {
              ...item,
              message
            }
          }
        return item;
        })
      );
      this.saveToStorage();
    } catch (err) {
      console.log("Fehler beim Updaten der Message des Items");
    }
  }

  // Ausleihzeitraum von Item ändern
  updateItemRentalPeriod(cartItemId: string, pickupDate: Date, returnDate: Date) {
    console.log("UpdateItemRentalPeriod");
    try {
      this.cart.update(cart =>
        cart.map(item => {
          if(item.cartItemId === cartItemId) {
            let rentalPeriod: Date[] | undefined = [];
            let rentalError: string = "";

            if(!returnDate) {
              rentalPeriod = [pickupDate];
            } else {
              const _pickupDate = this.setHoursToZero(pickupDate);
              const _returnDate = this.setHoursToZero(returnDate);

              console.log("pickupDate: ", _pickupDate);
              console.log("returnDate: ", _returnDate);

              const maxDays = item.maxLendingDays ?? 0;
              const maxReturnDate = this.addDays(_pickupDate, maxDays);

              if(_returnDate > maxReturnDate) { // Falls angegebes Rückgabedatum zu weit von Abholdatum entfernt
                rentalPeriod = [];
                rentalError = "Maximale Ausleihdauer überschritten";
              } else if(this.rangeContainsDisabledDate([_pickupDate, _returnDate], item.disabledDates)) { // Falls nicht verfügbares Datum mit ausgewählt wurde
                rentalPeriod = [];
                rentalError = "Gegenstand in diesem Zeitraum nicht verfügbar";
              } else {
                rentalError = "";
                rentalPeriod = [pickupDate, returnDate];
              }
            }
            return {
              ...item,
              rentalPeriod,
              rentalError,
            }
          }
          return item;
        })
      );
      this.saveToStorage();
    } catch (err) {
      console.log("Fehler beim Updaten des Ausleihzeitraums Items");
    }
  }

  // Updated vorhandes Item im Warenkorb
  updateItem(cartItemId: string, productId: string, quantity: number, message: string): void {
    try {
      this.cart.update(cart =>
      cart.map(item => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            productId,
            quantity,
            message,
          };
        }
        return item;
      })
    );
    this.saveToStorage();
    //Prüfe ob Item erfolgreich zu lokalem Warenkorb hinzugefügt wurde
    console.log("Item geupdated");
    } catch (err) {
      console.log("Fehler beim Updaten des Items")
    }
  }

  // Item aus lokalem Warenkorb entfernen
  removeItem(cartItemId: string): boolean {
    this.cart.update(cart => cart.filter(i => i.cartItemId !== cartItemId));
    this.saveToStorage();
    if (this.getItemByCartItemId(cartItemId)) {
      return false;
    } else {
      return true;
    }
  }

  // gesamten lokalen Warenkorb löschen
  clearCart(): void {
    this.cart.set([]); // cart leeren
    this.saveToStorage();
  }

  // Aus dem LocalStorage lesen
  private loadFromStorage(): void {
    let stored: CartItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if(raw) {
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed)) {
          stored = parsed.map(item => {
            if(item.rentalPeriod && item.rentalPeriod.length === 2) {
              const pickupDate = new Date(item.rentalPeriod[0]);
              const returnDate = new Date(item.rentalPeriod[1]);

              pickupDate.setHours(0, 0, 0, 0);
              returnDate.setHours(0, 0, 0, 0);
              
              // Korrigiere ausgewählte Daten wenn sie in der Vergangenheit liegen
              if(pickupDate < today || returnDate < today) {
                console.log("Ausgewählter Zeitraum liegt in der Vergangenheit");
                return {
                  ...item,
                  rentalPeriod: [],
                };
              } else {
                return {
                  ...item,
                  rentalPeriod: [pickupDate, returnDate],
                };
              }
            }

            return item;

          });
        };
      }
    } catch (err) {
      console.error("Fehler beim Parsen des Carts aus LocalStorage:", err);
    }
    this.cart.set(stored);
  }

  // in den LocalStorage speichern
  private async saveToStorage(): Promise<void> {
    await this.enrichCartItems(); // Reichere CartItem mit Daten vom Backend an
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cart()));
  }

  // ID für Cart Item generieren
  generateCartItemId(): string {
    while(true) {
      let UUID = crypto.randomUUID();
      if (!this.getItemByCartItemId(UUID)) { // Gebe ID nur zurück wenn diese im Cart noch nicht existiert
        return UUID;
      }
    }
  }

  enrichCartItems(): Promise<void> {
    const cartItems = this.cart();

    if (cartItems.length === 0) return Promise.resolve();

    const requests = cartItems.map(item =>
      forkJoin({
        product: this.productService.getProductById(Number(item.productId)),
        unavailablePeriods: this.http.get<TimePeriod[]>(  // Hole nicht verfügbare Zeiträume
          `${environment.apiBaseURL}/api/products/${item.productId}/periods?requiredQuantity=${item.quantity}&type=unavailable`
        )
      })
    );

    return new Promise<void>((resolve, reject) => {
      forkJoin(requests).subscribe({
        next: (results) => {
          this.cart.update(cart =>
            cart.map((item, i) => {
              const disabledDates = this.getDisabledDates(results[i].unavailablePeriods);
              let rentalPeriod = item.rentalPeriod;
              let rentalError = item.rentalError;
              
              if (rentalPeriod && rentalPeriod.length === 2) {
                if(this.rangeContainsDisabledDate(rentalPeriod, disabledDates)) {
                  rentalPeriod = [];
                  rentalError = "Gegenstand in diesem Zeitraum nicht verfügbar";
                } else if (rentalPeriod[1] > this.addDays(this.setHoursToZero(rentalPeriod[0]), results[i].product.expiryDate ?? 0)) {
                  rentalPeriod = [];
                  rentalError = "Maximale Ausleihdauer überschritten";
                }
              } 
              console.log("rentalPeriod in enrichCartItems: ", rentalPeriod);
              return {
                ...item,
                rentalError,
                name: results[i].product.name,
                location: results[i].product.locationRoomNr,
                maxLendingDays: results[i].product.expiryDate,
                unavailablePeriods: results[i].unavailablePeriods,
                disabledDates,
                rentalPeriod,
              }
            })
          );
          resolve();
        },
        error: (err) => {
          console.error('Error loading products:', err);
          reject(err);
        }
      });
    });
  }

  // Wandle nicht verfügbare Zeiträume in Array von Dates um für Date Picker
  getDisabledDates(unavailablePeriods: TimePeriod[]){
    if (!unavailablePeriods) {  // Falls unavailablePeriods nicht definiert ist
      return [];
    } else if (unavailablePeriods.length === 0){  // Falls keine nicht verfügbaren Zeiträume vorhanden sind
      return [];
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

      return disabledDates;
    }
  }
  
  // Prüft ob in einer Range von Dates disabled Dates enthalten sind
  private rangeContainsDisabledDate(range: Date[], disabledDates: Date[]): boolean {
    if (!range || range.length !== 2) {
      return false;
    }

    const start = this.setHoursToZero(range[0]);
    const end = this.setHoursToZero(range[1]);

    const disabledSet = new Set(
      disabledDates.map(d => d.getTime())
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

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private setHoursToZero(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}