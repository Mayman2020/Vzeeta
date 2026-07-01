import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent)
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./patient-pages.component').then(m => m.PatientAppointmentsComponent)
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./patient-pages.component').then(m => m.PatientFavoritesComponent)
  },
  {
    path: 'prescriptions',
    loadComponent: () =>
      import('./patient-pages.component').then(m => m.PatientPrescriptionsComponent)
  },
  {
    path: 'lab-results',
    loadComponent: () =>
      import('./patient-pages.component').then(m => m.PatientLabResultsComponent)
  },
  {
    path: 'medical-records',
    loadComponent: () =>
      import('./patient-pages.component').then(m => m.PatientMedicalRecordsComponent)
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./patient-pages.component').then(m => m.PatientNotificationsComponent)
  },
  {
    path: 'video/:appointmentId',
    loadComponent: () =>
      import('./patient-pages.component').then(m => m.PatientVideoConsultationComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./patient-profile/patient-profile.component').then(m => m.PatientProfileComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
