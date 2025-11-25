import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'catalog',
    loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent),
    canActivate: [authGuard]
  },
  {
    path: 'device/:id',
    loadComponent: () => import('./pages/device-detail/device-detail.component').then(m => m.DeviceDetailPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-dashboard',
    loadComponent: () => import('./pages/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lecturer',
    loadComponent: () => import('./pages/lecturer-dashboard/lecturer-dashboard.component').then(m => m.LecturerDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] } // Nur für Lender & Admin
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-home-dashboard.component')
        .then(m => m.AdminHomeDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/products',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-product-dashboard.component')
        .then(m => m.AdminProductDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/items',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-item-instance-dashboard.component')
        .then(m => m.AdminItemInstanceComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: 'catalog'
  }
];
