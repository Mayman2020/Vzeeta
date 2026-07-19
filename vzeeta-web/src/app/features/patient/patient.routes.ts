import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/auth.guard';

export const PATIENT_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [permissionGuard],
    data: { permission: 'dashboard', permissionAction: 'view' },
    loadComponent: () =>
      import('./patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent)
  },
  {
    path: 'appointments',
    canActivate: [permissionGuard],
    data: { permission: 'appointments', permissionAction: 'view' },
    loadComponent: () =>
      import('./patient-appointments/patient-appointments.component').then(m => m.PatientAppointmentsComponent)
  },
  {
    path: 'favorites',
    canActivate: [permissionGuard],
    data: { permission: 'favorites', permissionAction: 'view' },
    loadComponent: () =>
      import('./patient-favorites/patient-favorites.component').then(m => m.PatientFavoritesComponent)
  },
  {
    path: 'prescriptions',
    canActivate: [permissionGuard],
    data: { permission: 'prescriptions', permissionAction: 'view' },
    loadComponent: () =>
      import('./patient-prescriptions/patient-prescriptions.component').then(m => m.PatientPrescriptionsComponent)
  },
  {
    path: 'lab-results',
    canActivate: [permissionGuard],
    data: { permission: 'lab_results', permissionAction: 'view' },
    loadComponent: () =>
      import('./patient-lab-results/patient-lab-results.component').then(m => m.PatientLabResultsComponent)
  },
  {
    path: 'medical-records',
    canActivate: [permissionGuard],
    data: { permission: 'medical_records', permissionAction: 'view' },
    loadComponent: () =>
      import('./patient-medical-records/patient-medical-records.component').then(m => m.PatientMedicalRecordsComponent)
  },
  {
    path: 'notifications',
    canActivate: [permissionGuard],
    data: { permission: 'notifications', permissionAction: 'view' },
    loadComponent: () =>
      import('./patient-notifications/patient-notifications.component').then(m => m.PatientNotificationsComponent)
  },
  {
    path: 'video/:appointmentId',
    canActivate: [permissionGuard],
    data: { permission: 'appointments', permissionAction: 'view' },
    loadComponent: () =>
      import('./patient-video-consultation/patient-video-consultation.component').then(m => m.PatientVideoConsultationComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./patient-profile/patient-profile.component').then(m => m.PatientProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
