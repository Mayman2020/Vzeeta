import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/auth.guard';

export const CLINIC_ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./clinic-pages.component').then(m => m.ClinicAdminDashboardComponent)
  },
  {
    path: 'doctors',
    loadComponent: () =>
      import('./clinic-pages.component').then(m => m.ClinicDoctorsComponent)
  },
  {
    path: 'branches',
    loadComponent: () =>
      import('./clinic-pages.component').then(m => m.ClinicBranchesComponent)
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./clinic-pages.component').then(m => m.ClinicAppointmentsComponent)
  },
  {
    path: 'patients',
    loadComponent: () =>
      import('./clinic-pages.component').then(m => m.ClinicPatientsComponent)
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./clinic-pages.component').then(m => m.ClinicServicesComponent)
  },
  {
    path: 'specialties',
    canActivate: [permissionGuard],
    data: { permission: 'specialties', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-pages.component').then(m => m.ClinicSpecialtiesComponent)
  },
  {
    path: 'lab-results',
    canActivate: [permissionGuard],
    data: { permission: 'lab_results', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-pages.component').then(m => m.ClinicLabResultsComponent)
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./clinic-pages.component').then(m => m.ClinicAnalyticsComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../profile/account-profile.component').then(m => m.AccountProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
