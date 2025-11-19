import { Routes } from '@angular/router';
import { adminGuard, authGuard, loginGuard, lecturerGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard], // Schützt die Login-Seite vor bereits angemeldeten Benutzern
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'catalog',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/catalog/catalog.component').then((m) => m.CatalogPageComponent),
  },
  {
    path: 'device/:id', // ":id" ist ein Routenparameter
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/device-detail/device-detail.component').then(
        (m) => m.DeviceDetailPageComponent
      ),
  },
  {
    path: 'user-dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/user-dashboard/user-dashboard.component').then(
        (m) => m.UserDashboardComponent
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard], // Erfordert Anmeldung UND Administratorrolle
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: 'lender-dashboard',
    canActivate: [authGuard, lecturerGuard], // Erfordert Anmeldung und Dozentenrolle
    loadComponent: () =>
      import('./pages/lecturer-dashboard/lecturer-dashboard.component').then(
        (m) => m.LecturerDashboardComponent
      ),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartPageComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Weiterleitungen
  { path: '', redirectTo: '/catalog', pathMatch: 'full' }, // Default route
  { path: '**', redirectTo: '/catalog' }, // Wildcard-Route für 404-Fehler
];
