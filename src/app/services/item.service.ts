import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemCreate, ItemStatus } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:8080/api/items';

  constructor(private http: HttpClient) {}

  // GET /api/items
  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  // GET /api/items/{id}
  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  // POST /api/items
  createItem(item: ItemCreate): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item);
  }

  // PUT /api/items/{id}
  updateItem(id: number, item: ItemCreate): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item);
  }

  // DELETE /api/items/{id}
  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /api/items/search?keyword=...
  searchItems(keyword: string): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/search`, {
      params: { keyword }
    });
  }

  // GET /api/items/status/{status}
  getItemsByStatus(status: ItemStatus): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/status/${status}`);
  }
}
