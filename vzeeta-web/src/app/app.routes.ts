import { Routes } from '@angular/router';
import { authGuard, patientGuard, doctorGuard, clinicAdminGuard, superAdminGuard, mustChangePasswordGuard, permissionGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './features/public/home/home.component';
import { DoctorSearchComponent } from './features/public/doctor-search/doctor-search.component';
import { DoctorProfileComponent } from './features/public/doctor-profile/doctor-profile.component';
import { BookingComponent } from './features/public/booking/booking.component';
import { SpecialtiesComponent } from './features/public/specialties/specialties.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PatientDashboardComponent } from './features/patient/patient-dashboard/patient-dashboard.component';
import {
  PatientAppointmentsComponent,
  PatientFavoritesComponent,
  PatientPrescriptionsComponent,
  PatientLabResultsComponent,
  PatientMedicalRecordsComponent,
  PatientNotificationsComponent,
  PatientVideoConsultationComponent
} from './features/patient/patient-pages.component';
import {
  DoctorDashboardComponent,
  DoctorCalendarComponent,
  DoctorAppointmentsComponent,
  DoctorPrescriptionsComponent,
  DoctorEarningsComponent
} from './features/doctor/doctor-pages.component';
import {
  ClinicAdminDashboardComponent,
  ClinicDoctorsComponent,
  ClinicBranchesComponent,
  ClinicAppointmentsComponent,
  ClinicPatientsComponent,
  ClinicServicesComponent,
  ClinicSpecialtiesComponent,
  ClinicLabResultsComponent,
  ClinicAnalyticsComponent
} from './features/clinic-admin/clinic-pages.component';
import {
  SuperAdminDashboardComponent,
  SuperAdminClinicsComponent,
  SuperAdminUsersComponent,
  SuperAdminVerificationComponent,
  SuperAdminCitiesComponent,
  SuperAdminPaymentsComponent,
  SuperAdminSettingsComponent,
  SuperAdminPermissionsComponent,
  SuperAdminLookupsComponent,
  SuperAdminProfileComponent
} from './features/super-admin/super-admin-pages.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'specialties', component: SpecialtiesComponent },
      { path: 'doctors', component: DoctorSearchComponent },
      { path: 'doctors/:id', component: DoctorProfileComponent },
      { path: 'booking/:doctorId', component: BookingComponent }
    ]
  },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'patient',
    component: MainLayoutComponent,
    canActivate: [authGuard, patientGuard],
    children: [
      { path: 'dashboard', component: PatientDashboardComponent },
      { path: 'appointments', component: PatientAppointmentsComponent },
      { path: 'favorites', component: PatientFavoritesComponent },
      { path: 'prescriptions', component: PatientPrescriptionsComponent },
      { path: 'lab-results', component: PatientLabResultsComponent },
      { path: 'medical-records', component: PatientMedicalRecordsComponent },
      { path: 'notifications', component: PatientNotificationsComponent },
      { path: 'video/:appointmentId', component: PatientVideoConsultationComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'doctor',
    component: MainLayoutComponent,
    canActivate: [authGuard, doctorGuard],
    children: [
      { path: 'dashboard', component: DoctorDashboardComponent },
      { path: 'calendar', component: DoctorCalendarComponent },
      { path: 'appointments', component: DoctorAppointmentsComponent },
      { path: 'prescriptions', component: DoctorPrescriptionsComponent },
      { path: 'earnings', component: DoctorEarningsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'clinic-admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, clinicAdminGuard],
    children: [
      { path: 'dashboard', component: ClinicAdminDashboardComponent },
      { path: 'doctors', component: ClinicDoctorsComponent },
      { path: 'branches', component: ClinicBranchesComponent },
      { path: 'appointments', component: ClinicAppointmentsComponent },
      { path: 'patients', component: ClinicPatientsComponent },
      { path: 'services', component: ClinicServicesComponent },
      { path: 'specialties', component: ClinicSpecialtiesComponent, canActivate: [permissionGuard], data: { permission: 'specialties', permissionAction: 'view' } },
      { path: 'lab-results', component: ClinicLabResultsComponent, canActivate: [permissionGuard], data: { permission: 'lab_results', permissionAction: 'view' } },
      { path: 'analytics', component: ClinicAnalyticsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'super-admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, superAdminGuard, mustChangePasswordGuard],
    children: [
      { path: 'dashboard', component: SuperAdminDashboardComponent, canActivate: [permissionGuard], data: { permission: 'dashboard', permissionAction: 'view' } },
      { path: 'clinics', component: SuperAdminClinicsComponent, canActivate: [permissionGuard], data: { permission: 'clinics', permissionAction: 'view' } },
      { path: 'users', component: SuperAdminUsersComponent, canActivate: [permissionGuard], data: { permission: 'users', permissionAction: 'view' } },
      { path: 'verification', component: SuperAdminVerificationComponent, canActivate: [permissionGuard], data: { permission: 'verification', permissionAction: 'view' } },
      { path: 'cities', component: SuperAdminCitiesComponent, canActivate: [permissionGuard], data: { permission: 'settings', permissionAction: 'view' } },
      { path: 'payments', component: SuperAdminPaymentsComponent, canActivate: [permissionGuard], data: { permission: 'payments', permissionAction: 'view' } },
      { path: 'settings', component: SuperAdminSettingsComponent, canActivate: [permissionGuard], data: { permission: 'settings', permissionAction: 'view' } },
      { path: 'permissions', component: SuperAdminPermissionsComponent, canActivate: [permissionGuard], data: { permission: 'permissions', permissionAction: 'view' } },
      { path: 'lookups', component: SuperAdminLookupsComponent, canActivate: [permissionGuard], data: { permission: 'lookups', permissionAction: 'view' } },
      { path: 'profile', component: SuperAdminProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
