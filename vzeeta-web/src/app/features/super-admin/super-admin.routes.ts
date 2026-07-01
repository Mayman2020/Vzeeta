import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/auth.guard';

export const SUPER_ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [permissionGuard],
    data: { permission: 'dashboard', permissionAction: 'view' },
    loadComponent: () =>
      import('./super-admin-pages.component').then(m => m.SuperAdminDashboardComponent)
  },
  {
    path: 'clinics',
    canActivate: [permissionGuard],
    data: { permission: 'clinics', permissionAction: 'view' },
    loadComponent: () =>
      import('./super-admin-pages.component').then(m => m.SuperAdminClinicsComponent)
  },
  {
    path: 'users',
    canActivate: [permissionGuard],
    data: { permission: 'users', permissionAction: 'view' },
    loadComponent: () =>
      import('./super-admin-pages.component').then(m => m.SuperAdminUsersComponent)
  },
  {
    path: 'verification',
    canActivate: [permissionGuard],
    data: { permission: 'verification', permissionAction: 'view' },
    loadComponent: () =>
      import('./super-admin-pages.component').then(m => m.SuperAdminVerificationComponent)
  },
  {
    path: 'cities',
    redirectTo: 'lookups',
    pathMatch: 'full'
  },
  {
    path: 'payments',
    canActivate: [permissionGuard],
    data: { permission: 'payments', permissionAction: 'view' },
    loadComponent: () =>
      import('./super-admin-pages.component').then(m => m.SuperAdminPaymentsComponent)
  },
  {
    path: 'settings',
    canActivate: [permissionGuard],
    data: { permission: 'settings', permissionAction: 'view' },
    loadComponent: () =>
      import('./super-admin-pages.component').then(m => m.SuperAdminSettingsComponent)
  },
  {
    path: 'permissions',
    canActivate: [permissionGuard],
    data: { permission: 'permissions', permissionAction: 'view' },
    loadComponent: () =>
      import('./super-admin-pages.component').then(m => m.SuperAdminPermissionsComponent)
  },
  {
    path: 'lookups',
    canActivate: [permissionGuard],
    data: { permission: 'lookups', permissionAction: 'view' },
    loadComponent: () =>
      import('./super-admin-lookups.component').then(m => m.SuperAdminLookupsComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../profile/account-profile.component').then(m => m.AccountProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
