import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/auth.guard';

export const DOCTOR_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [permissionGuard],
    data: { permission: 'dashboard', permissionAction: 'view' },
    loadComponent: () =>
      import('./doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
  },
  {
    path: 'calendar',
    canActivate: [permissionGuard],
    data: { permission: 'calendar', permissionAction: 'view' },
    loadComponent: () =>
      import('./doctor-calendar/doctor-calendar.component').then(m => m.DoctorCalendarComponent)
  },
  {
    path: 'appointments',
    canActivate: [permissionGuard],
    data: { permission: 'appointments', permissionAction: 'view' },
    loadComponent: () =>
      import('./doctor-appointments/doctor-appointments.component').then(m => m.DoctorAppointmentsComponent)
  },
  {
    path: 'prescriptions',
    canActivate: [permissionGuard],
    data: { permission: 'prescriptions', permissionAction: 'view' },
    loadComponent: () =>
      import('./doctor-prescriptions/doctor-prescriptions.component').then(m => m.DoctorPrescriptionsComponent)
  },
  {
    path: 'earnings',
    canActivate: [permissionGuard],
    data: { permission: 'earnings', permissionAction: 'view' },
    loadComponent: () =>
      import('./doctor-earnings/doctor-earnings.component').then(m => m.DoctorEarningsComponent)
  },
  {
    path: 'medical-records',
    canActivate: [permissionGuard],
    data: { permission: 'medical_records', permissionAction: 'view' },
    loadComponent: () =>
      import('./doctor-medical-records/doctor-medical-records.component').then(m => m.DoctorMedicalRecordsComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('../profile/account-profile/account-profile.component').then(m => m.AccountProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
