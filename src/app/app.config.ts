import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  APP_INITIALIZER
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import Aura from '@primeuix/themes/aura';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Keycloak from 'keycloak-js';
import { routes } from './app.routes';

// Keycloak Instance erstellen
const keycloak = new Keycloak({
  url: 'https://auth.insy.hs-esslingen.com',
  realm: 'insy',
  clientId: 'leihsy-frontend-dev'
});

// Keycloak Initializer
function initializeKeycloak() {
  return () => {
    console.log('Initializing Keycloak...');

    return keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: true,
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    }).then((authenticated) => {
      console.log('Keycloak initialized. Authenticated:', authenticated);
      if (authenticated) {
        console.log('👤 User:', keycloak.tokenParsed?.['preferred_username']);
        const clientId = keycloak.clientId ?? keycloak.tokenParsed?.['azp'];
        if (clientId) {
          const roles = keycloak.tokenParsed?.['resource_access']?.[clientId]?.['roles'] ?? [];
          console.log('Roles:', roles);
        }
      }
    }).catch(error => {
      console.error('Keycloak initialization failed:', error);
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
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
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: []
    }
  ],
};
