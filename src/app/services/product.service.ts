import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Product, ProductCreateDTO } from '../models/product.model';
import { Item } from '../models/item.model';
import { CategoryService } from './category.service';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8080/api/products';
  private categoryService = inject(CategoryService);
  private locationService = inject(LocationService);

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
      params = params.set('search', filters.keyword);
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

  // Lädt Produkte mit Items und berechnet availableItemCount und totalItemCount
  // Lädt auch Categories und Locations für jedes Produkt
  getProductsWithItems(filters?: { categoryId?: number, locationId?: number, keyword?: string }): Observable<Product[]> {
    return forkJoin({
      products: this.getProducts(filters),
      categories: this.categoryService.getAllCategories().pipe(catchError(() => of([]))),
      locations: this.locationService.getAllLocations().pipe(catchError(() => of([])))
    }).pipe(
      switchMap(({ products, categories, locations }) => {
        if (products.length === 0) {
          return of([]);
        }

        // Erstelle Maps für schnellen Zugriff
        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
        const locationMap = new Map(locations.map(loc => [loc.id, loc]));

        // Für jedes Produkt Items laden und Category/Location zuordnen
        const productRequests = products.map(product =>
          this.getProductItems(product.id).pipe(
            map((items: any[]) => {
              const totalCount = items.length;
              const availableCount = items.filter(item =>
                item.isAvailable === true || item.available === true
              ).length;

              return {
                ...product,
                totalItemCount: totalCount,
                availableItemCount: availableCount,
                category: product.categoryId ? categoryMap.get(product.categoryId) : undefined,
                location: product.locationId ? locationMap.get(product.locationId) : undefined
              };
            }),
            catchError(() => of({
              ...product,
              totalItemCount: 0,
              availableItemCount: 0,
              category: product.categoryId ? categoryMap.get(product.categoryId) : undefined,
              location: product.locationId ? locationMap.get(product.locationId) : undefined
            }))
          )
        );

        return forkJoin(productRequests);
      })
    );
  }
}
