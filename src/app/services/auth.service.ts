import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Keycloak from 'keycloak-js';
import { firstValueFrom } from 'rxjs';

export interface CurrentUser {
  id: number;
  uniqueId: string;
  name: string;
  budget: number;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  // Signals fuer reaktive UI
  isLoggedIn = signal(false);
  private _currentUser = signal<CurrentUser | null>(null);
  private _isInitialized = signal(false);

  // Public readonly Signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();

  // Konstruktor macht NICHTS - alles passiert in initialize()
  constructor() {}

  private updateLoginStatus() {
    this.isLoggedIn.set(this.keycloak.authenticated);
  }

  /**
   * Initialisiert den Auth-State nach Keycloak-Login.
   * Wird von APP_INITIALIZER aufgerufen NACH Keycloak-Init.
   */
  async initialize(): Promise<void> {
    console.log('AuthService.initialize() - keycloak.authenticated:', this.keycloak.authenticated);

    // Login-Status aktualisieren
    this.updateLoginStatus();
    console.log('AuthService.initialize() - isLoggedIn:', this.isLoggedIn());

    if (this.keycloak.authenticated && this.keycloak.token) {
      try {
        await this.syncUser();
      } catch (error) {
        console.error('Failed to sync user with backend:', error);
      }
    }
    this._isInitialized.set(true);
  }

  /**
   * Synchronisiert User mit Backend (erstellt falls nicht vorhanden)
   */
  async syncUser(): Promise<CurrentUser | null> {
    try {
      const user = await firstValueFrom(
        this.http.get<CurrentUser>(`${this.apiUrl}/users/me`)
      );
      this._currentUser.set(user);
      console.log('User synced:', user);
      return user;
    } catch (error) {
      console.error('Error syncing user:', error);
      this._currentUser.set(null);
      return null;
    }
  }

  /**
   * Gibt die Datenbank-ID des Users zurueck (fuer API-Calls)
   */
  getUserId(): number | null {
    return this._currentUser()?.id ?? null;
  }

  /** Login ueber Keycloak */
  async login(redirectUri?: string) {
    await this.keycloak.login({
      redirectUri: redirectUri ?? window.location.origin,
    });
  }

  /** Logout ueber Keycloak */
  async logout() {
    this._currentUser.set(null);
    await this.keycloak.logout({ redirectUri: window.location.origin });
  }

  /** Gibt den Benutzernamen zurueck */
  getUsername(): string {
    return (this.keycloak.tokenParsed?.['preferred_username'] as string) ?? 'Unbekannt';
  }

  /** Gibt alle Rollen des Benutzers zurueck */
  getRoles(): string[] {
    const clientId = this.keycloak.clientId ?? this.keycloak.tokenParsed?.['azp'];

    // Client Roles (z.B. lender, user)
    const clientRoles = clientId
      ? this.keycloak.tokenParsed?.['resource_access']?.[clientId]?.['roles'] ?? []
      : [];
    // Realm Roles (z.B. admin)
    const realmRoles = this.keycloak.tokenParsed?.['realm_access']?.['roles'] ?? [];
    return [...new Set([...clientRoles, ...realmRoles])];
  }

  /** Prueft, ob der Benutzer eine bestimmte Rolle hat */
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  /** Prueft, ob der Benutzer eine der angegebenen Rollen hat */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some((role) => userRoles.includes(role));
  }

  /** Prueft, ob der Benutzer alle angegebenen Rollen hat */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.every((role) => userRoles.includes(role));
  }

  // Helper fuer UI
  isUser(): boolean {
    const roles = this.getRoles();
    return !roles.includes('admin') && !roles.includes('lender');
  }

  isLender(): boolean {
    return this.hasRole('lender');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Fuer backwards compatibility mit altem Code
  userRole(): 'user' | 'lender' | 'admin' {
    if (this.isAdmin()) return 'admin';
    if (this.isLender()) return 'lender';
    return 'user';
  }
}
