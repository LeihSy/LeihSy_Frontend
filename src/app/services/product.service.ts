import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCreateDTO } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  // GET /api/products/{id} (Get product by ID)
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // PUT /api/products/{id} (Update a product)
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

  // DELETE /api/products/{id} (Delete a product)
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /api/products (Get all products with optional filters)
  getProducts(filters?: { categoryId?: number, locationId?: number, keyword?: string }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters?.categoryId) {
      params = params.set('categoryId', filters.categoryId.toString());
    }
    if (filters?.locationId) {
      params = params.set('locationId', filters.locationId.toString());
    }
    if (filters?.keyword) {
      params = params.set('keyword', filters.keyword);
    }
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  // POST /api/products (Create a new product)
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

  // GET /api/products/{productID}/items
  getProductItems(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/items`);
  }

  // Alias für getProducts() - für Kompatibilität mit bestehendem Code
  getProductsWithCategories(): Observable<Product[]> {
    return this.getProducts();
  }
}
