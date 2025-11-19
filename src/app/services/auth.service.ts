import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export type UserRole = 'user' | 'admin' | 'lender';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signals für reaktive UI
  isLoggedIn = signal(false);
  userRole = signal<UserRole>('user');

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Prüfe ob Keycloak verfügbar ist
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      this.isLoggedIn.set(isLoggedIn);

      if (isLoggedIn) {
        // Hole User-Rolle aus Keycloak Token
        const role = this.extractRoleFromToken();
        this.userRole.set(role);
      }
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      // Fallback zu Mock-Auth (für Entwicklung ohne Keycloak)
      this.isLoggedIn.set(true);
      this.userRole.set('user');
    }
  }

  private extractRoleFromToken(): UserRole {
    try {
      const token = this.keycloakService.getKeycloakInstance().tokenParsed;
      const groups = (token?.['groups'] as string[]) || [];

      // Map Keycloak groups zu User Roles
      if (groups.includes('admin')) return 'admin';
      if (groups.includes('lender')) return 'lender';
      return 'user';
    } catch (error) {
      return 'user';
    }
  }

  // Mock Login (für Entwicklung ohne Keycloak)
  login(role: UserRole) {
    this.isLoggedIn.set(true);
    this.userRole.set(role);
    this.router.navigate(['/catalog']);
  }

  async logout() {
    try {
      await this.keycloakService.logout(window.location.origin);
    } catch (error) {
      // Fallback logout
      this.isLoggedIn.set(false);
      this.userRole.set('user');
      this.router.navigate(['/login']);
    }
  }

  getUsername(): string {
    try {
      return this.keycloakService.getUsername();
    } catch {
      return 'Test User';
    }
  }
  isUser(): boolean {
    return this.userRole() === 'user';
  }

  isLender(): boolean {
    return this.userRole() === 'lender';
  }

  isAdmin(): boolean {
    return this.userRole() === 'admin';
  }

}
