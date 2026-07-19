import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/auth.guard';
import { subscriptionGuard } from '../../core/guards/subscription.guard';

export const CLINIC_ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [permissionGuard, subscriptionGuard],
    data: { permission: 'dashboard', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-admin-dashboard/clinic-admin-dashboard.component').then(m => m.ClinicAdminDashboardComponent)
  },
  {
    path: 'doctors',
    canActivate: [permissionGuard, subscriptionGuard],
    data: { permission: 'doctors', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-doctors/clinic-doctors.component').then(m => m.ClinicDoctorsComponent)
  },
  {
    path: 'branches',
    canActivate: [permissionGuard, subscriptionGuard],
    data: { permission: 'branches', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-branches/clinic-branches.component').then(m => m.ClinicBranchesComponent)
  },
  {
    path: 'appointments',
    canActivate: [permissionGuard, subscriptionGuard],
    data: { permission: 'appointments', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-appointments/clinic-appointments.component').then(m => m.ClinicAppointmentsComponent)
  },
  {
    path: 'patients',
    canActivate: [permissionGuard, subscriptionGuard],
    data: { permission: 'patients', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-patients/clinic-patients.component').then(m => m.ClinicPatientsComponent)
  },
  {
    path: 'services',
    canActivate: [permissionGuard, subscriptionGuard],
    data: { permission: 'services', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-services/clinic-services.component').then(m => m.ClinicServicesComponent)
  },
  {
    path: 'specialties',
    canActivate: [permissionGuard, subscriptionGuard],
    data: { permission: 'specialties', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-specialties/clinic-specialties.component').then(m => m.ClinicSpecialtiesComponent)
  },
  {
    path: 'lab-results',
    canActivate: [permissionGuard, subscriptionGuard],
    data: { permission: 'lab_results', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-lab-results/clinic-lab-results.component').then(m => m.ClinicLabResultsComponent)
  },
  {
    path: 'analytics',
    canActivate: [permissionGuard, subscriptionGuard],
    data: { permission: 'analytics', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-analytics/clinic-analytics.component').then(m => m.ClinicAnalyticsComponent)
  },
  {
    path: 'subscription',
    canActivate: [permissionGuard],
    data: { permission: 'subscriptions', permissionAction: 'view' },
    loadComponent: () =>
      import('./clinic-my-subscription/clinic-my-subscription.component').then(m => m.ClinicMySubscriptionComponent)
  },
  {
    path: 'subscription/choose-plan',
    canActivate: [permissionGuard],
    data: { permission: 'subscriptions', permissionAction: 'create' },
    loadComponent: () =>
      import('./clinic-choose-plan/clinic-choose-plan.component').then(m => m.ClinicChoosePlanComponent)
  },
  {
    path: 'subscription-locked',
    loadComponent: () =>
      import('./clinic-subscription-locked/clinic-subscription-locked.component').then(m => m.ClinicSubscriptionLockedComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../profile/account-profile/account-profile.component').then(m => m.AccountProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
