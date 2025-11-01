// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);

  /** Prüft, ob der Benutzer eingeloggt ist */
  async isLoggedIn(): Promise<boolean> {
    return !!this.keycloak.authenticated;
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

  getRoles(): string[] {
    // Use clientId from Keycloak instance or fallback to token's 'azp' field
    const clientId = this.keycloak.clientId ?? this.keycloak.tokenParsed?.['azp'];

    if (!clientId) return [];

    const clientRoles = this.keycloak.tokenParsed?.['resource_access']?.[clientId]?.['roles'];

    return Array.isArray(clientRoles) ? clientRoles : [];
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
}
