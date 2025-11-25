import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCreateDTO } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  // Alle Products abrufen
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
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
  createProduct(product: ProductCreateDTO): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // Product aktualisieren (für Admins)
  updateProduct(id: number, product: ProductCreateDTO): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // Product löschen (für Admins)
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
