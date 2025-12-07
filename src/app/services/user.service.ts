import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8080/api/users';

  constructor(private readonly http: HttpClient) {
  }

  /**
   * GET /api/users/{id} - User per ID abrufen
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/users/names/{name} - User per Benutzername abrufen
   */
  getUserByName(name: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/names/${name}`);
  }

  /**
   * GET /api/users/me - Aktuellen User abrufen (basierend auf Keycloak Token)
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }
}
