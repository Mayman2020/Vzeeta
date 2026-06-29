# NABD (نبض) — Clinic & Doctor Booking Platform

Original Arabic RTL medical booking platform inspired by modern healthcare marketplaces.  
Built following the **Property_Managments** project structure and conventions.

## Tech Stack

| Layer | Technology |
|--------|------------|
| Backend | Java 17, Spring Boot 3.2.5, JWT, Flyway |
| Database | PostgreSQL (`vzeeta_mgmt` schema) |
| Web | Angular 17, Material, ngx-translate |
| Mobile | Flutter 3.29 |
| API Docs | Swagger UI (springdoc) |

## Repository Layout

```text
Vzeeta Project/
├── vzeeta-backend/     # Spring Boot API (port 8081, context /api/v1)
├── vzeeta-web/         # Angular SPA (port 4200)
├── vzeeta-mobile/      # Flutter patient app
├── docs/               # Architecture notes
└── README.md
```

## Prerequisites

- JDK 17
- PostgreSQL 14+ on port 5432
- Node.js 18+ and npm
- Flutter SDK 3.x

## Database Setup

PostgreSQL uses the default `postgres` database with schema `vzeeta_mgmt` (created automatically by Flyway).

```sql
-- Optional: ensure postgres DB exists
CREATE DATABASE postgres; -- usually already exists
```

Default connection (see `application.yml`):
- URL: `jdbc:postgresql://localhost:5432/postgres?currentSchema=vzeeta_mgmt`
- User: `postgres`
- Password: `admin` (override with `DB_PASS` env var)

## Run Backend

```powershell
cd "d:\Apps Work\My Apps\Vzeeta Project\vzeeta-backend"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
.\run-backend.ps1
```

Or manually:

```powershell
.\mvnw.cmd spring-boot:run
```

- API: `http://localhost:8081/api/v1`
- Swagger: `http://localhost:8081/api/v1/swagger-ui.html`
- Health: `http://localhost:8081/api/v1/actuator/health`

## Run Web Frontend

```powershell
cd "d:\Apps Work\My Apps\Vzeeta Project\vzeeta-web"
npm install
npm start
```

Opens at **http://localhost:4200** with proxy to backend.

## Run Mobile App

```powershell
cd "d:\Apps Work\My Apps\Vzeeta Project\vzeeta-mobile"
flutter pub get
flutter run
```

Default API for Android emulator: `http://10.0.2.2:8081/api/v1`  
Change in Profile → API settings for physical devices (use your machine LAN IP).

## Test Users (password: `Dev@Local2026!`)

| Role | Email |
|------|-------|
| Super Admin | `superadmin@tabeebi.com` |
| Clinic Admin | `clinicadmin@tabeebi.com` |
| Doctor | `doctor1@tabeebi.com` |
| Doctor | `doctor2@tabeebi.com` |
| Patient | `patient1@tabeebi.com` |
| Patient | `patient2@tabeebi.com` |

## Core Modules

1. **Authentication** — Register, login, JWT, forgot password, role-based access
2. **Patient** — Search doctors, book/cancel/reschedule, favorites, reviews, prescriptions, lab results, medical records, notifications
3. **Doctor** — Profile, availability, appointment management, prescriptions, earnings
4. **Clinic Admin** — Doctors, branches, appointments, patients, services, analytics
5. **Super Admin** — Clinics, users, verification, cities/areas, payments, settings
6. **Booking Flow** — Specialty → Doctor → Clinic/Online → Date → Time → Confirm
7. **Payments** — Cash/online placeholder, invoices, refund status
8. **Notifications** — Appointment events, lab results, prescriptions

## Business Rules

- No duplicate booking for same doctor/time slot
- Only **verified** doctors appear in public search
- Reviews allowed only after **COMPLETED** appointments
- Lab results and prescriptions visible only to the related patient
- Doctor must define working hours before accepting appointments

## API Overview

| Prefix | Access |
|--------|--------|
| `/auth/*` | Public (login/register) + authenticated (me/logout) |
| `/public/*` | Public doctor search, specialties, cities |
| `/patient/*` | Patient role |
| `/doctor/*` | Doctor role |
| `/clinic-admin/*` | Clinic Admin role |
| `/super-admin/*` | Super Admin role |
| `/payments/*` | Authenticated |

## Tests

```powershell
cd vzeeta-backend
.\mvnw.cmd test

cd ..\vzeeta-web
npm run build

cd ..\vzeeta-mobile
flutter analyze
```

## Branding

- **Name:** NABD (نبض)
- **Primary color:** `#1A6FD4` (medical blue)
- **Layout:** Arabic RTL default
- Original design — not a Vezeeta brand copy
