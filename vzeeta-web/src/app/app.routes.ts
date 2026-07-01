import { Routes } from '@angular/router';
import {
  authGuard,
  patientGuard,
  doctorGuard,
  clinicAdminGuard,
  superAdminGuard,
  mustChangePasswordGuard,
  patientOnlyGuard
} from './core/guards/auth.guard';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  // ── Public pages (with layout wrapper) ──────────────────────────────
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/public/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'specialties',
        loadComponent: () =>
          import('./features/public/specialties/specialties.component').then(m => m.SpecialtiesComponent)
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./features/public/doctor-search/doctor-search.component').then(m => m.DoctorSearchComponent)
      },
      {
        path: 'doctors/:id',
        loadComponent: () =>
          import('./features/public/doctor-profile/doctor-profile.component').then(m => m.DoctorProfileComponent)
      },
      {
        path: 'booking/:doctorId',
        canActivate: [authGuard, patientOnlyGuard, mustChangePasswordGuard],
        loadComponent: () =>
          import('./features/public/booking/booking.component').then(m => m.BookingComponent)
      }
    ]
  },

  // ── Auth (login / register) ──────────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // ── Patient portal ───────────────────────────────────────────────────
  {
    path: 'patient',
    component: MainLayoutComponent,
    canActivate: [authGuard, patientGuard, mustChangePasswordGuard],
    loadChildren: () =>
      import('./features/patient/patient.routes').then(m => m.PATIENT_ROUTES)
  },

  // ── Doctor portal ────────────────────────────────────────────────────
  {
    path: 'doctor',
    component: MainLayoutComponent,
    canActivate: [authGuard, doctorGuard, mustChangePasswordGuard],
    loadChildren: () =>
      import('./features/doctor/doctor.routes').then(m => m.DOCTOR_ROUTES)
  },

  // ── Clinic-admin portal ──────────────────────────────────────────────
  {
    path: 'clinic-admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, clinicAdminGuard, mustChangePasswordGuard],
    loadChildren: () =>
      import('./features/clinic-admin/clinic-admin.routes').then(m => m.CLINIC_ADMIN_ROUTES)
  },

  // ── Super-admin portal ───────────────────────────────────────────────
  {
    path: 'super-admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, superAdminGuard, mustChangePasswordGuard],
    loadChildren: () =>
      import('./features/super-admin/super-admin.routes').then(m => m.SUPER_ADMIN_ROUTES)
  },

  { path: '**', redirectTo: '' }
];
