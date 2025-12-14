import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
   * GET /api/users - Alle User abrufen
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Gibt den Namen eines Users basierend auf seiner ID zurück
   * @param userId - Die ID des Users
   * @returns Observable<string> - Der Name des Users oder 'N/A' bei Fehler
   */
  getUserNameById(userId: number | undefined): Observable<string> {
    if (!userId) {
      return of('N/A');
    }

    return this.getUserById(userId).pipe(
      map(user => user.name),
      catchError(() => of(userId.toString()))
    );
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
