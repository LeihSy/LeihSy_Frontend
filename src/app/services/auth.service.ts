import { Injectable, inject, signal } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);

  // Signals für reaktive UI
  isLoggedIn = signal(false);

  constructor() {
    // Initialisiere Signal
    this.updateLoginStatus();
  }

  private updateLoginStatus() {
    this.isLoggedIn.set(!!this.keycloak.authenticated);
  }

  /** Login über Keycloak */
  async login(redirectUri?: string) {
    await this.keycloak.login({
      redirectUri: redirectUri ?? window.location.origin,
    });
  }

  /** Logout über Keycloak */
  async logout() {
    await this.keycloak.logout({ redirectUri: window.location.origin });
  }

  /** Gibt den Benutzernamen zurück */
  getUsername(): string {
    return (this.keycloak.tokenParsed?.['preferred_username'] as string) ?? 'Unbekannt';
  }

  /** Gibt die Keycloak-ID (uniqueId/sub) zurück */
  getKeycloakId(): string | undefined {
    return this.keycloak.tokenParsed?.['sub'];
  }

  /** Gibt alle Rollen des Benutzers zurück */
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
  /** Prüft, ob der Benutzer eine bestimmte Rolle hat */
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  /** Prüft, ob der Benutzer eine der angegebenen Rollen hat */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some((role) => userRoles.includes(role));
  }

  /** Prüft, ob der Benutzer alle angegebenen Rollen hat */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.every((role) => userRoles.includes(role));
  }

  // Helper für UI
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

  // Für backwards compatibility mit altem Code
  userRole(): 'user' | 'lender' | 'admin' {
    if (this.isAdmin()) return 'admin';
    if (this.isLender()) return 'lender';
    return 'user';
  }
}
