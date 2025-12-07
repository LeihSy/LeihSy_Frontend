import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';

/**
 * HTTP Interceptor der den Keycloak JWT Token automatisch
 * an alle API-Requests anhaengt.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(Keycloak);

  // Nur fuer API-Requests den Token hinzufuegen
  if (req.url.includes('/api/')) {
    const token = keycloak.token;

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }
  }

  return next(req);
};
