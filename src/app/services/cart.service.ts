import { Injectable, signal, computed, inject } from '@angular/core';
import { ProductService } from './product.service';
import { forkJoin } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
  cartItemId: string;   // ID eines Eintrags im Cart
  productId: string;
  rentalPeriod: {
    pickupDate: Date,
    returnDate: Date,
  }
  name?: string;
  location?: string;
  maxLendingDays?: number;
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

  constructor() {
    // Initial aus localStorage laden
    this.loadFromStorage();

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
  addItem(productId: string, pickupDate: Date, returnDate: Date): boolean {
    const newItem: CartItem = {
        cartItemId: this.generateCartItemId(),
        productId,
        rentalPeriod: {
          pickupDate,
          returnDate,
        }
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

  // Updated vorhandes Item im Warenkorb
  updateItem(cartItemId: string, productId: string, rentalPeriod: {pickupDate: Date, returnDate: Date}): void {
    try {
      this.cart.update(cart =>
      cart.map(item => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            productId,
            rentalPeriod,
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
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if(raw) {
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed)) {
          stored = parsed.map(item => ({
            ...item,
            rentalPeriod: {
              pickupDate: new Date(item.rentalPeriod.pickupDate),
              returnDate: new Date(item.rentalPeriod.returnDate),
            }
          }));
        }
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

    const productsToPull = cartItems.map(item =>
      this.productService.getProductById(Number(item.productId))
    );

    return new Promise<void>((resolve, reject) => {
      forkJoin(productsToPull).subscribe({
        next: (products: Product[]) => {
          this.cart.update(cart =>
            cart.map((item, i) => ({
              ...item,
              name: products[i].name,
              location: products[i].locationRoomNr,
              maxLendingDays: products[i].expiryDate
            }))
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
}
