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
    loadComponent: () => import('./pages/user-dashboard/user-bookings/user-bookings.component').then(m => m.UserBookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-dashboard/private-lend',
    loadComponent: () => import('./pages/user-dashboard/user-private-lend/private-lend.component').then(m => m.PrivateLendComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-dashboard/private-lend/product',
    loadComponent: () => import('./pages/admin-dashboard/admin-products/admin-product-form-page.component').then(m => m.AdminProductFormPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-dashboard/private-lend/item',
    loadComponent: () => import('./pages/admin-dashboard/admin-items/admin-item-form-page.component').then(m => m.AdminItemFormPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-dashboard/bookings/:id',
    loadComponent: () => import('./pages/user-dashboard/user-bookings/booking-detail.component').then(m => m.BookingDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-dashboard/groups',
    loadComponent: () => import('./pages/user-dashboard/user-groups/user-groups.component').then(m => m.UserGroupsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-dashboard/groups/:id',
    loadComponent: () => import('./pages/user-dashboard/user-groups/user-group-detail.component').then(m => m.UserGroupDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'qr-action/:id',
    loadComponent: () => import('./pages/user-dashboard/user-bookings/qr-action.component').then(m => m.QrActionComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] }
  },
  {
    path: 'lender',
    loadComponent: () => import('./pages/lender-dashboard/lender-dashboard.component').then(m => m.LenderDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] } // Nur für Lender & Admin
  },
  {
    path: 'lender/items',
    loadComponent: () => import('./pages/lender-dashboard/lender-items/lender-items.component').then(m => m.LenderItemsComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] }
  },
  {
    path: 'lender/items/:id',
    loadComponent: () => import('./pages/lender-dashboard/lender-items/item-detail.component').then(m => m.ItemDetailComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] }
  },
  {
    path: 'lender/loan',
    loadComponent: () =>
      import('./pages/lender-dashboard/admin-loan-dashboard.component')
        .then(m => m.AdminLoanDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['lender'] },
  },
  {
    path: 'lender/requests',
    loadComponent: () =>
      import('./pages/lender-dashboard/lender-requests.component')
        .then(m => m.LenderRequestsComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] }
  },
  // Admin Bereich
  {
    path: 'admin/category',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-category-dashboard.component')
        .then(m => m.AdminCategoryDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
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
      import('./pages/admin-dashboard/admin-products/admin-product-dashboard.component')
        .then(m => m.AdminProductDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/products/new',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-products/admin-product-form-page.component')
        .then(m => m.AdminProductFormPageComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/products/:id/edit',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-products/admin-product-form-page.component')
        .then(m => m.AdminProductFormPageComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/all-items',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-product-item-overview/admin-all-items.component')
        .then(m => m.AdminAllItemsComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/items/detail/:id',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-product-item-overview/admin-item-detail.component')
        .then(m => m.AdminItemDetailComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/items',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-items/admin-item-instance-dashboard.component')
        .then(m => m.AdminItemInstanceComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/items/new',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-items/admin-item-form-page.component')
        .then(m => m.AdminItemFormPageComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },

  {
    path: 'admin/devices',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-device-management.component')
        .then(m => m.AdminDeviceManagementComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },

  {
    path: 'admin/items/:id/edit',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-items/admin-item-form-page.component')
        .then(m => m.AdminItemFormPageComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },

  {
    path: 'admin/bookings',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-bookings/admin-bookings.component')
        .then(m => m.AdminBookingsComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/bookings/statistics',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-bookings/admin-booking-statistics.component')
        .then(m => m.AdminBookingStatisticsComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/bookings/:id',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-bookings/admin-booking-detail.component')
        .then(m => m.AdminBookingDetailComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/locations',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-locations/admin-locations.component')
        .then(m => m.AdminLocationsComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/locations/:id',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-locations/admin-location-detail.component')
        .then(m => m.AdminLocationDetailComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/private',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-private-management/admin-private-management.component')
        .then(m => m.AdminPrivateManagementComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/insy-import',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-insy-import/admin-insy-import.component')
        .then(m => m.AdminInsyImportComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/groups',
    loadComponent: () => import('./pages/admin-dashboard/admin-student-groups/admin-student-groups.component').then(m => m.AdminStudentGroupsComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/groups/new',
    loadComponent: () => import('./pages/admin-dashboard/admin-student-groups/admin-student-group-form.component').then(m => m.AdminStudentGroupFormComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/groups/:id',
    loadComponent: () => import('./pages/admin-dashboard/admin-student-groups/admin-student-group-detail.component').then(m => m.AdminStudentGroupDetailComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'admin/groups/:id/edit',
    loadComponent: () => import('./pages/admin-dashboard/admin-student-groups/admin-student-group-edit.component').then(m => m.AdminStudentGroupEditComponent),
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
