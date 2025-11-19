import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Dieser Guard schützt Routen, die eine Anmeldung des Benutzers erfordern
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

// Dieser Guard schützt die Login-Seite
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/catalog']);
    return false;
  }

  return true;
};

// Admin Guard (Staff)
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.userRole() !== 'admin') {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};

// Lecturer Guard (Verleiher)
export const lecturerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.userRole();
  if (role !== 'lender' && role !== 'admin') {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
