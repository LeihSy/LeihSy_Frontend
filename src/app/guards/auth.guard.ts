import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';

export const authGuard: CanActivateFn = async (route, state) => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  const isLoggedIn = keycloak.authenticated ?? false;

  if (!isLoggedIn) {
    await keycloak.login({
      redirectUri: window.location.origin + state.url
    });
    return false;
  }

  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (requiredRoles && requiredRoles.length > 0) {
    const clientId = keycloak.clientId ?? keycloak.tokenParsed?.['azp'];
    const clientRoles =
      clientId ? keycloak.tokenParsed?.['resource_access']?.[clientId]?.['roles'] ?? [] : [];

    const hasRole = requiredRoles.some((role) => clientRoles.includes(role));

    if (!hasRole) {
      console.log('Access denied. Required:', requiredRoles, 'User has:', clientRoles);
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};

// Login Guard - verhindert Zugriff auf Login wenn schon eingeloggt
export const loginGuard: CanActivateFn = async (route, state) => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  if (keycloak.authenticated) {
    router.navigate(['/catalog']);
    return false;
  }

  return true;
};
