import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';

export const authGuard: CanActivateFn = async (route, state) => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);

  const isLoggedIn = keycloak.authenticated ?? false;
  console.log("keycloak:");
  console.log(keycloak);


  if (!isLoggedIn) {
    console.log("Eingeloggt?:");
    console.log(isLoggedIn);
    await keycloak.login({
      redirectUri: window.location.origin + state.url
    });
    return false;
  }

  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (requiredRoles && requiredRoles.length > 0) {
    const clientId = keycloak.clientId ?? keycloak.tokenParsed?.['azp'];

    // Client Roles
    const clientRoles = clientId
      ? keycloak.tokenParsed?.['resource_access']?.[clientId]?.['roles'] ?? []
      : [];

    // Realm Roles (z.B. admin)
    const realmRoles = keycloak.tokenParsed?.['realm_access']?.['roles'] ?? [];

    // Kombiniere beide
    const allRoles = [...clientRoles, ...realmRoles];

    const hasRole = requiredRoles.some((role) => allRoles.includes(role));

    if (!hasRole) {
      console.log('Access denied. Required:', requiredRoles, 'User has:', allRoles);
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
