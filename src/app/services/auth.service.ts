// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private keycloak: KeycloakService) {}

  /**
   * Gibt den Benutzernamen des eingeloggten Users zurück
   */
  public getUsername(): string {
    return this.keycloak.getUsername();
  }

  /**
   * Lädt das vollständige User-Profil
   */
  public async getUserProfile(): Promise<KeycloakProfile> {
    return await this.keycloak.loadUserProfile();
  }

  /**
   * Prüft ob der User eingeloggt ist
   */
  public async isLoggedIn(): Promise<boolean> {
    return await this.keycloak.isLoggedIn();
  }

  /**
   * Gibt alle Rollen des Users zurück
   */
  public getRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  /**
   * Prüft ob der User eine bestimmte Rolle hat
   */
  public hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  /**
   * Prüft ob der User EINE der angegebenen Rollen hat
   */
  public hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Prüft ob der User ALLE angegebenen Rollen hat
   */
  public hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  /**
   * Logout und Weiterleitung zur Keycloak Logout-Seite
   */
  public logout(): void {
    this.keycloak.logout(window.location.origin);
  }

  /**
   * Gibt das aktuelle Access Token zurück
   */
  public async getToken(): Promise<string> {
    return await this.keycloak.getToken();
  }

  /**
   * Login-Redirect zu Keycloak
   */
  public login(): void {
    this.keycloak.login();
  }
}
