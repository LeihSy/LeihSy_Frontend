// src/app/keycloak-config.ts
import { KeycloakService } from 'keycloak-angular';

/**
 * Initialisierungsfunktion für Keycloak.
 * Diese Funktion wird beim App-Start ausgeführt (via APP_INITIALIZER).
 */
export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'https://auth.insy.hs-esslingen.com',
        realm: 'insy',
        clientId: 'leihsy-frontend-dev'
      },
      initOptions: {
        onLoad: 'check-sso',  // Ändere zu 'login-required' für sofortigen Login
        checkLoginIframe: false,
        pkceMethod: 'S256'  // WICHTIG: PKCE für Public Clients
      },
      enableBearerInterceptor: true,
      bearerExcludedUrls: ['/assets', '/favicon.ico']
    });
}


