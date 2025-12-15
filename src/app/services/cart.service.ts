import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Interface des Warenkorb-Items
export interface CartItem {
  cartItemId: string;   // ID eines Eintrags im Cart
  productId: string;
  pickupDate: string;
  returnDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly STORAGE_KEY = 'cart';

  // interner State
  private cart: CartItem[] = [];

  // Observable für Item-Count (Komponenten können sich darauf subscriben)
  private itemCountSubject = new BehaviorSubject<number>(0);
  public itemCount$ = this.itemCountSubject.asObservable();

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
    return [...this.cart];
  }

  getItemByCartItemId(cartItemId: string): CartItem | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    const localCart = raw ? JSON.parse(raw) : [];

    for(let cartItem of localCart) {
      if (cartItem.cartItemId === cartItemId) {
        return cartItem;
      }
    }
    return null;
  }

  // Item zu lokalem Warenkorb hinzufügen
  addItem(productId: string, pickupDate: string, returnDate: string): boolean {
    const newItem: CartItem = {
        cartItemId: this.generateCartItemId(),
        productId,
        pickupDate,
        returnDate,
    };
    this.cart.push(newItem);
    this.saveToStorage();

    // Prüfe ob Item erfolgreich erstellt wurde
    if(this.getItemByCartItemId(newItem.cartItemId)) {
      return true;
    } else {
      return false;
    }
  }

  updateItem(cartItemId: string, productId: string, pickupDate: string, returnDate: string): boolean {
      const newItem: CartItem = {
        cartItemId,
        productId,
        pickupDate,
        returnDate,
    };
    if(this.removeItem(cartItemId)) { // Falls Item erfolgreich aus lokalem Warenkorb gelöscht wurde
      this.cart.push(newItem);
      this.saveToStorage();
    }
    //Prüfe ob Item erfolgreich zu lokalem Warenkorb hinzugefügt wurde
    if(this.getItemByCartItemId(cartItemId)) {
      console.log("Item geupdated");
      return true;
    } else {
      return false;
    }
  }

  // Item aus lokalem Warenkorb entfernen
  removeItem(cartItemId: string): boolean {
    this.cart = this.cart.filter(i => i.cartItemId !== cartItemId);
    this.saveToStorage();
    if (this.getItemByCartItemId(cartItemId)) {
      return false;
    } else {
      this.updateItemCount();
      return true;
    }

  }

  // gesamten lokalen Warenkorb löschen
  clearCart(): void {
    this.cart = [];
    this.saveToStorage();
  }

  // Aus dem LocalStorage lesen
  private loadFromStorage(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    this.cart = raw ? JSON.parse(raw) : [];
    this.updateItemCount();
  }

  // in den LocalStorage speichern
  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cart));
    this.updateItemCount();
  }

  // ItemCount aktualisieren
  private updateItemCount(): void {
    this.itemCountSubject.next(this.cart.length);
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
}
