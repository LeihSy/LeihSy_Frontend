import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import Keycloak from 'keycloak-js';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';

// Keycloak Instance erstellen
const keycloak = new Keycloak({
  url: 'https://auth.insy.hs-esslingen.com',
  realm: 'insy',
  clientId: 'leihsy-frontend-dev'
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    // Keycloak als Provider
    { provide: Keycloak, useValue: keycloak },
    // Kombinierter Initializer: Keycloak DANN AuthService
    provideAppInitializer(async () => {
      // AuthService SOFORT holen (vor jedem await!)
      const authService = inject(AuthService);

      // 1. Keycloak initialisieren
      console.log('Initializing Keycloak...');
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          checkLoginIframe: true,
          silentCheckSsoRedirectUri: globalThis.location.origin + '/silent-check-sso.html'
        });
        console.log('Keycloak initialized. Authenticated:', authenticated);
        if (authenticated) {
          console.log('User:', keycloak.tokenParsed?.['preferred_username']);
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
      }

      // 2. AuthService initialisieren (NACH Keycloak)
      console.log('Initializing AuthService...');
      await authService.initialize();
      console.log('AuthService initialized. isLoggedIn:', authService.isLoggedIn());
    })
  ],
};
