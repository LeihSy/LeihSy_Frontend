import { ApplicationConfig,  provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
//import { provideHttpClient } from '@angular/common/http';
import { provideKeycloak} from 'keycloak-angular';
//import { initializeKeycloak } from './keycloak-config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'https://auth.insy.hs-esslingen.com',
        realm: 'insy',
        clientId: 'leihsy-frontend-dev'
      },
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: true,
        silentCheckSsoRedirectUri: `${window.location.origin}public/silent-check-sso.html`,
        pkceMethod: 'S256',

      }
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
