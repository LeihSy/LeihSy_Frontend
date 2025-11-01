// src/app/guards/auth.guard.ts
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

  const clientId = 'leihsy-frontend-dev';
  const clientRoles: string[] =
    keycloak.tokenParsed?.resource_access?.[clientId]?.roles ?? [];

  if (requiredRoles && requiredRoles.length > 0) {
    const clientId = keycloak.clientId ?? keycloak.tokenParsed?.['azp'];
    const clientRoles =
      clientId ? keycloak.tokenParsed?.['resource_access']?.[clientId]?.['roles'] ?? [] : [];

    const hasRole = requiredRoles.some((role) => clientRoles.includes(role));

    if (!hasRole) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};
