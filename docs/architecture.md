# Tabeebi Architecture

Mirrors **Property_Managments** conventions:

## Backend (`com.vzeeta`)

```
config/          Security, CORS, OpenAPI, auditing
shared/          ApiResponse, exceptions, JWT, enums
modules/
  auth/          Login, register, forgot password
  user/          User entity
  patient/       Patient portal APIs
  doctor/        Doctor portal APIs
  clinic/        Clinic & branch entities
  clinicadmin/   Clinic admin APIs
  superadmin/    Platform admin APIs
  publicapi/     Public search (no auth)
  appointment/   Booking business logic
  payment/       Payments & invoices
  prescription/  Prescriptions
  lab/           Lab results
  medicalrecord/ Medical records
  review/        Reviews
  notification/  Notifications
  lookup/        Cities, areas, specialties
  favorite/      Favorite doctors
  settings/      System settings
```

## Frontend (`vzeeta-web`)

```
core/            Guards, interceptors, services, i18n
features/        auth, public, patient, doctor, clinic-admin, super-admin
layout/          public-layout, main-layout, sidebar
shared/          Reusable components
```

## Mobile (`vzeeta-mobile`)

```
core/            API client, theme, storage
services/        Auth, doctor, appointment, medical, notification
screens/         Splash, auth, home, search, booking, profile
widgets/         Doctor card, specialty chip, loading, empty state
```

## Database

- Schema: `vzeeta_mgmt`
- Migrations: `V1__full_baseline.sql`, `V2__seed_data.sql`
