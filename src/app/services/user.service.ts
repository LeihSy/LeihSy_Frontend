import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  // GET /api/users?name={name}
  searchUsers(query: string): Observable<User[]> {
    // Falls dein Backend eine Liste zurückgibt:
    return this.http.get<User[]>(`${this.apiUrl}/users`, { 
      params: new HttpParams().set('name', query) 
    });
  }
  // GET /api/users/{id} (User per ID abrufen)
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  // GET /api/users/me (Aktuellen User abrufen)
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  // GET /api/users/{userID}/bookings (Get bookings of a user)
  getUserBookings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/bookings`);
  }

  // GET /api/lenders/{lenderID}/bookings (Get bookings of a lender)
  getLenderBookings(lenderId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/lenders/${lenderId}/bookings`);
  }

  // GET /api/users?name={name} (User nach Name suchen)
  getUserByName(name: string): Observable<User> {
    const params = new HttpParams().set('name', name);
    return this.http.get<User>(`${this.apiUrl}/users`, { params });
  }

  // GET /api/users/{userId}/groups (Gruppen des Users abrufen)
  getUserGroups(userId: number): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/users/${userId}/groups`);
  }
}
