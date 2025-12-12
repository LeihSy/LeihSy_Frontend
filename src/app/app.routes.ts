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
    path: 'user-dashboard/bookings',
    loadComponent: () => import('./pages/user-dashboard/user-bookings.component').then(m => m.UserBookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-dashboard/bookings/:id',
    loadComponent: () => import('./pages/user-dashboard/booking-detail.component').then(m => m.BookingDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lender',
    loadComponent: () => import('./pages/lender-dashboard/lender-dashboard.component').then(m => m.LenderDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] } // Nur für Lender & Admin
  },
  {
    path: 'lender/items',
    loadComponent: () => import('./pages/lender-dashboard/lender-items.component').then(m => m.LenderItemsComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] }
  },
  {
    path: 'lender/items/:id',
    loadComponent: () => import('./pages/lender-dashboard/item-detail.component').then(m => m.ItemDetailComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] }
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
    path: 'admin/products/new',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-product-form-page.component')
        .then(m => m.AdminProductFormPageComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/products/:id/edit',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-product-form-page.component')
        .then(m => m.AdminProductFormPageComponent),
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
    path: 'admin/items/new',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-item-form-page.component')
        .then(m => m.AdminItemFormPageComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/items/:id/edit',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-item-form-page.component')
        .then(m => m.AdminItemFormPageComponent),
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
