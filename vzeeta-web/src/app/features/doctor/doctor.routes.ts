import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./doctor-pages.component').then(m => m.DoctorDashboardComponent)
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./doctor-pages.component').then(m => m.DoctorCalendarComponent)
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./doctor-pages.component').then(m => m.DoctorAppointmentsComponent)
  },
  {
    path: 'prescriptions',
    loadComponent: () =>
      import('./doctor-pages.component').then(m => m.DoctorPrescriptionsComponent)
  },
  {
    path: 'earnings',
    loadComponent: () =>
      import('./doctor-pages.component').then(m => m.DoctorEarningsComponent)
  },
  {
    path: 'medical-records',
    loadComponent: () =>
      import('./doctor-pages.component').then(m => m.DoctorMedicalRecordsComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../profile/account-profile.component').then(m => m.AccountProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
