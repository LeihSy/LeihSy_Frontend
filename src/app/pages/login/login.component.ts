import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private keycloak = inject(KeycloakService);
  private router = inject(Router);

  async login() {
    try {
      await this.keycloak.login({
        redirectUri: window.location.origin + '/catalog'
      });
    } catch (error) {
      console.error('Login failed:', error);
      // Fallback: Redirect direkt (für Mock)
      this.router.navigate(['/catalog']);
    }
  }
}
