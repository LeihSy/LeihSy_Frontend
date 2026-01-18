import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../environments/environment';
import {LocationDTO} from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiBaseURL}/api/categories`;

  constructor(private readonly http: HttpClient) {}

  // GET /api/categories (Get all Categories)
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  // PUT /api/categories/{id} (Update a category)
  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }
  
  // POST /api/categories (Create a new category)
  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  // GET /api/categories/{id} (Get category by ID)
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  // DELETE /api/categories/{id} (Delete a category)
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET (location)
  getLocationsByCategory(categoryId: number): Observable<LocationDTO[]> {
  return this.http.get<LocationDTO[]>(`${this.apiUrl}/${categoryId}/locations`);
}
}
