import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { Product, ProductCreateDTO } from '../models/product.model';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService
  ) {}

  // Alle Products abrufen
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Alle Products abrufen mit expandierten Kategorien
  getProductsWithCategories(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      switchMap((products: Product[]) => {
        console.log('📦 Products geladen, lade nun Kategorien...');

        // Sammle alle eindeutigen Category IDs
        const categoryIds = [...new Set(products.map(p => p.categoryId).filter(id => id))];

        if (categoryIds.length === 0) {
          console.log('⚠️ Keine Kategorie-IDs in Produkten gefunden');
          return [products];
        }

        console.log('🔍 Lade Kategorien für IDs:', categoryIds);

        // Lade alle Kategorien parallel
        const categoryRequests = categoryIds.map(id =>
          this.categoryService.getCategoryById(id!)
        );

        return forkJoin(categoryRequests).pipe(
          map(categories => {
            console.log('✅ Kategorien geladen:', categories);

            // Erstelle eine Map für schnellen Zugriff
            const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

            // Füge die Category-Objekte zu den Produkten hinzu
            const productsWithCategories = products.map(product => ({
              ...product,
              category: product.categoryId ? categoryMap.get(product.categoryId) : undefined
            }));

            console.log('✅ Produkte mit Kategorien:', productsWithCategories);
            return productsWithCategories;
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
