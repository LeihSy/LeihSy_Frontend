import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCreateDTO, UserUpdateDTO } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/users - Alle User abrufen (nur Admin)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * GET /api/users/{id} - Einzelnen User per ID abrufen
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/users/me - Eingeloggten User abrufen (basierend auf Keycloak Token)
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  /**
   * GET /api/users/keycloak/{uniqueId} - User nach Keycloak uniqueId abrufen
   */
  getUserByKeycloakId(uniqueId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/keycloak/${uniqueId}`);
  }

  // ============================================
  // Weitere Methoden für zukünftige Erweiterungen
  // ============================================

  /**
   * Neuen User erstellen (falls später vom Backend unterstützt)
   */
  createUser(user: UserCreateDTO): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * User aktualisieren (falls später vom Backend unterstützt)
   */
  updateUser(id: number, user: UserUpdateDTO): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * User Budget aktualisieren (falls später vom Backend unterstützt)
   */
  updateUserBudget(id: number, budget: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/budget`, { budget });
  }

  /**
   * User löschen (falls später vom Backend unterstützt)
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

