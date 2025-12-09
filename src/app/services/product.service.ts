import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { Product, ProductCreateDTO } from '../models/product.model';
import { CategoryService } from './category.service';
import { LocationService } from './location.service';
import { ItemService } from './item.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService,
    private locationService: LocationService,
    private itemService: ItemService
  ) {}

  // Alle Products abrufen
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Alle Products abrufen mit expandierten Kategorien und Locations
  getProductsWithCategories(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      switchMap((products: Product[]) => {
        // Sammle alle eindeutigen Category IDs und Location IDs
        const categoryIds = [...new Set(products.map(p => p.categoryId).filter(id => id))];
        const locationIds = [...new Set(products.map(p => p.locationId).filter(id => id))];

        const requests: Observable<any>[] = [];

        // Lade Kategorien
        if (categoryIds.length > 0) {
          const categoryRequests = categoryIds.map(id =>
            this.categoryService.getCategoryById(id!)
          );
          requests.push(forkJoin(categoryRequests));
        } else {
          requests.push(new Observable(observer => {
            observer.next([]);
            observer.complete();
          }));
        }

        // Lade Locations
        if (locationIds.length > 0) {
          const locationRequests = locationIds.map(id =>
            this.locationService.getLocationById(id!)
          );
          requests.push(forkJoin(locationRequests));
        } else {
          requests.push(new Observable(observer => {
            observer.next([]);
            observer.complete();
          }));
        }

        // Lade alle Items
        requests.push(this.itemService.getAllItems());

        return forkJoin(requests).pipe(
          map(([categories, locations, items]) => {
            // Erstelle Maps für schnellen Zugriff
            const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat]));
            const locationMap = new Map(locations.map((loc: any) => [loc.id, loc]));

            // Berechne Item-Counts pro Produkt
            const itemCountMap = new Map<number, { total: number, available: number }>();
            items.forEach((item: any) => {
              const productId = item.productId;
              if (!itemCountMap.has(productId)) {
                itemCountMap.set(productId, { total: 0, available: 0 });
              }
              const counts = itemCountMap.get(productId)!;
              counts.total++;
              if (item.available) {
                counts.available++;
              }
            });

            // Füge die Category-, Location-Objekte und Item-Counts zu den Produkten hinzu
            const productsWithData: Product[] = products.map(product => ({
              ...product,
              category: product.categoryId ? categoryMap.get(product.categoryId) : undefined,
              location: product.locationId ? locationMap.get(product.locationId) : undefined,
              totalItemCount: itemCountMap.get(product.id)?.total || 0,
              availableItemCount: itemCountMap.get(product.id)?.available || 0
            } as Product));

            return productsWithData;
          })
        );
      })
    );
  }

  // Einzelnes Product abrufen
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Products nach Kategorie filtern
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  // Products suchen
  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params });
  }

  // Verfügbare Products für Zeitraum abrufen
  getAvailableProducts(startDate: string, endDate: string): Observable<Product[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Product[]>(`${this.apiUrl}/available`, { params });
  }

  // Neues Product erstellen (für Admins)
  createProduct(product: ProductCreateDTO, image: File | null = null): Observable<Product> {
    const formData = new FormData();

    formData.append('product', new Blob([JSON.stringify(product)], {
      type: 'application/json'
    }));

    if (image) {
      formData.append('image', image);
    }

    return this.http.post<Product>(this.apiUrl, formData);
  }

  // Product aktualisieren (für Admins)
  updateProduct(id: number, product: ProductCreateDTO, image: File | null = null): Observable<Product> {
    const formData = new FormData();

    formData.append('product', new Blob([JSON.stringify(product)], {
      type: 'application/json'
    }));

    if (image) {
      formData.append('image', image);
    }

    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  // Product löschen (für Admins)
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
