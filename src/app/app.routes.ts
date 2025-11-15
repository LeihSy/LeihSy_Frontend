import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'items',
    loadComponent: () => import('./pages/items-list/items-list.component').then(m => m.ItemsListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lender',
    loadComponent: () => import('./pages/lender-dashboard/lender-dashboard.component').then(m => m.LenderDashboardComponent),
    canActivate: [authGuard],
    data: { roles: ['lender', 'admin'] } // 🔒 Nur für Lender & Admin
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
