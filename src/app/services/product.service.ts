import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCreateDTO, ProductStatus } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/items';

  // GET /api/items - Alle Produkte
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // GET /api/items/{id} - Produkt per ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // POST /api/items - Neues Produkt erstellen
  createProduct(product: ProductCreateDTO): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // PUT /api/items/{id} - Produkt aktualisieren
  updateProduct(id: number, product: ProductCreateDTO): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // DELETE /api/items/{id} - Produkt löschen
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /api/items/search?keyword=... - Suche
  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search`, {
      params: { keyword }
    });
  }

  // GET /api/items/status/{status} - Produkte per Status filtern
  getProductsByStatus(status: ProductStatus): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/status/${status}`);
  }
}
