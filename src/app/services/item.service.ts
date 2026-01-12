import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemCreate } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:8080/api/items';

  constructor(private http: HttpClient) {}

  // GET /api/items/{id} (Get item by ID)
  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  // PUT /api/items/{id} (Update an item)
  updateItem(id: number, item: ItemCreate): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item);
  }

  // DELETE /api/items/{id} (Delete an item)
  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // PUT /api/items/{id}/related (Update related items/accessories)
  updateRelatedItems(id: number, relatedItems: { deviceId: number; type: 'required' | 'recommended' }[]): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}/related`, relatedItems);
  }

  // GET /api/items (Get all items)
  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  // GET /api/items?includeDeleted=true (Get all items including deleted)
  getAllItemsIncludingDeleted(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}?includeDeleted=true`);
  }

  // POST /api/items (Create a new item)
  createItem(item: ItemCreate): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item);
  }

  // GET /api/items/{id}/bookings (Get all bookings for an item)
  getItemBookings(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/bookings`);
  }
}
