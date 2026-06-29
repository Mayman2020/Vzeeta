# وثيقة User Stories الشاملة — Tabeebi (Vzeeta)
## Complete User Stories & Test Specification

**التاريخ:** 2026-06-28  
**الإصدار:** 1.0  
**البيئة:** Frontend Vzeeta Web · Backend `http://localhost:8081/api/v1` · schema `vzeeta_mgmt`

**الأدوار:** SA = SUPER_ADMIN · CA = CLINIC_ADMIN · DR = DOCTOR · PT = PATIENT

**بيانات الدخول الافتراضية:** `superadmin@tabeebi.com` / `Dev@Local2026!` (SA) · `clinicadmin@tabeebi.com` · `doctor1@tabeebi.com` · `patient1@tabeebi.com`

---

# EPIC 01 — المصادقة (Auth)

### US-001 — تسجيل الدخول
- **المسار:** `/auth/login` · **API:** `POST /auth/login`
- Given بيانات صحيحة، When أضغط دخول، Then أُوجَّه للبوابة حسب الدور.
- ☐ Pass ☐ Fail

### US-002 — تسجيل حساب مريض
- **المسار:** `/auth/register` · **API:** `POST /auth/register`
- ☐ Pass ☐ Fail

### US-003 — تغيير كلمة المرور (SA)
- **المسار:** `/super-admin/profile` · **API:** `POST /users/me/change-password`
- ☐ Pass ☐ Fail

### US-004 — mustChangePassword redirect
- Given `mustChangePassword=true`، Then يُوجَّه SA إلى profile مع highlight.
- ☐ Pass ☐ Fail

### US-005 — تسجيل الخروج
- **API:** `POST /auth/logout` · Then التوكن يُمسح والمسارات محمية.
- ☐ Pass ☐ Fail

### US-006 — GET /auth/me
- After login، Then `/auth/me` يُرجع الدور والبريد.
- ☐ Pass ☐ Fail

---

# EPIC 02 — SUPER_ADMIN

### US-010 — لوحة SA
- **المسار:** `/super-admin/dashboard` · **API:** `GET /super-admin/dashboard`
- ☐ Pass ☐ Fail

### US-011 — قائمة العيادات + pager + search
- **المسار:** `/super-admin/clinics` · **API:** `GET /super-admin/clinics?page=0&size=10&q=`
- Given بيانات، Then stat-pill = totalElements و table-pager يعمل.
- ☐ Pass ☐ Fail

### US-012 — بحث العيادات
- **API:** `GET /super-admin/clinics?q=test`
- ☐ Pass ☐ Fail

### US-013 — قائمة المستخدمين
- **المسار:** `/super-admin/users` · **API:** `GET /super-admin/users?page=0&size=10&q=`
- ☐ Pass ☐ Fail

### US-014 — تحقق الأطباء
- **المسار:** `/super-admin/verification` · **API:** `GET /super-admin/doctors?verified=false`
- When أضغط Verify، Then `POST /super-admin/doctors/{id}/verify?verified=true`.
- ☐ Pass ☐ Fail

### US-015 — قائمة المدفوعات
- **المسار:** `/super-admin/payments` · **API:** `GET /super-admin/payments?page=0&size=10&q=`
- ☐ Pass ☐ Fail

### US-016 — إعدادات النظام + تعديل
- **المسار:** `/super-admin/settings` · **API:** `GET /super-admin/settings` · `PUT /super-admin/settings/{key}?value=`
- ☐ Pass ☐ Fail

### US-017 — إضافة مدينة
- **المسار:** `/super-admin/cities` · **API:** `POST /super-admin/cities`
- ☐ Pass ☐ Fail

### US-018 — مصفوفة الصلاحيات
- **المسار:** `/super-admin/permissions` · **API:** `GET/PUT /role-permissions/{role}`
- ☐ Pass ☐ Fail

### US-019 — Lookups CRUD
- **المسار:** `/super-admin/lookups` · **API:** `/lookups/admin/by-type`
- ☐ Pass ☐ Fail

### US-020 — empty-state بدون فلاتر
- Given قائمة فارغة بدون q، Then `app-empty-state` يظهر.
- ☐ Pass ☐ Fail

### US-021 — is-refreshing عند إعادة التحميل
- When تغيير صفحة أو بحث، Then overlay refresh بدون إخفاء الجدول.
- ☐ Pass ☐ Fail

### US-022 — permissionGuard على clinics
- Given SA بدون clinics.view، Then `/super-admin/clinics` ممنوع.
- ☐ Pass ☐ Fail

### US-023 — sidebar SA حسب menu permissions
- ☐ Pass ☐ Fail

### US-024 — rmsDate في payments
- ☐ Pass ☐ Fail

### US-025 — pagination metadata في API
- Response.data يحتوي content, totalElements, number, size.
- ☐ Pass ☐ Fail

---

# EPIC 03 — CLINIC_ADMIN

### US-030 — لوحة CA
- **المسار:** `/clinic-admin/dashboard` · **API:** `GET /clinic-admin/analytics`
- ☐ Pass ☐ Fail

### US-031 — قائمة الأطباء
- **المسار:** `/clinic-admin/doctors` · **API:** `GET /clinic-admin/doctors?page=0&size=10&q=`
- ☐ Pass ☐ Fail

### US-032 — قائمة الفروع
- **المسار:** `/clinic-admin/branches` · **API:** `GET /clinic-admin/branches?page=0&size=10&q=`
- ☐ Pass ☐ Fail

### US-033 — قائمة المواعيد
- **المسار:** `/clinic-admin/appointments` · **API:** `GET /clinic-admin/appointments?page=0&size=10&q=`
- ☐ Pass ☐ Fail

### US-034 — قائمة المرضى
- **المسار:** `/clinic-admin/patients` · **API:** `GET /clinic-admin/patients?page=0&size=10&q=`
- ☐ Pass ☐ Fail

### US-035 — قائمة الخدمات
- **المسار:** `/clinic-admin/services` · **API:** `GET /clinic-admin/services?page=0&size=10&q=`
- ☐ Pass ☐ Fail

### US-036 — التخصصات (قراءة)
- **المسار:** `/clinic-admin/specialties` · **API:** `GET /clinic-admin/specialties`
- ☐ Pass ☐ Fail

### US-037 — نتائج المختبر
- **المسار:** `/clinic-admin/lab-results` · **API:** `GET /clinic-admin/lab-results?page=0&size=10&q=`
- ☐ Pass ☐ Fail

### US-038 — بحث مواعيد CA
- **API:** `GET /clinic-admin/appointments?q=APT`
- ☐ Pass ☐ Fail

### US-039 — permissionGuard specialties
- **المسار:** `/clinic-admin/specialties`
- ☐ Pass ☐ Fail

### US-040 — permissionGuard lab-results
- **المسار:** `/clinic-admin/lab-results`
- ☐ Pass ☐ Fail

### US-041 — sidebar CA entries
- ☐ Pass ☐ Fail

### US-042 — stat-pill من totalElements
- ☐ Pass ☐ Fail

### US-043 — ListLoadController soft refresh
- ☐ Pass ☐ Fail

### US-044 — rmsDate في appointments CA
- ☐ Pass ☐ Fail

### US-045 — empty-state مع فلاتر نشطة
- Given q بدون نتائج، Then لا empty-state عام (جدول فارغ مع فلاتر).
- ☐ Pass ☐ Fail

---

# EPIC 04 — DOCTOR

### US-050 — لوحة الطبيب
- **المسار:** `/doctor/dashboard` · **API:** `GET /doctor/appointments` · `GET /doctor/earnings`
- ☐ Pass ☐ Fail

### US-051 — التقويم
- **المسار:** `/doctor/calendar` · **API:** `GET /doctor/availability`
- ☐ Pass ☐ Fail

### US-052 — مواعيد الطبيب + pager
- **المسار:** `/doctor/appointments` · **API:** `GET /doctor/appointments?page=0&size=10`
- ☐ Pass ☐ Fail

### US-053 — rmsDate في مواعيد DR
- ☐ Pass ☐ Fail

### US-054 — قبول موعد
- **API:** `POST /doctor/appointments/{id}/accept`
- ☐ Pass ☐ Fail

### US-055 — رفض موعد
- **API:** `POST /doctor/appointments/{id}/reject`
- ☐ Pass ☐ Fail

### US-056 — الوصفات + pager
- **المسار:** `/doctor/prescriptions` · **API:** `GET /doctor/prescriptions?page=0&size=10`
- ☐ Pass ☐ Fail

### US-057 — الأرباح
- **المسار:** `/doctor/earnings` · **API:** `GET /doctor/earnings`
- ☐ Pass ☐ Fail

### US-058 — empty-state مواعيد DR
- ☐ Pass ☐ Fail

### US-059 — table-pager مواعيد DR
- ☐ Pass ☐ Fail

---

# EPIC 05 — PATIENT

### US-060 — مواعيد المريض + pager
- **المسار:** `/patient/appointments` · **API:** `GET /patient/appointments?page=0&size=10`
- ☐ Pass ☐ Fail

### US-061 — إلغاء موعد
- **API:** `POST /patient/appointments/{id}/cancel`
- ☐ Pass ☐ Fail

### US-062 — المفضلة
- **المسار:** `/patient/favorites` · **API:** `GET /patient/favorites`
- ☐ Pass ☐ Fail

### US-063 — الوصفات + pager
- **المسار:** `/patient/prescriptions` · **API:** `GET /patient/prescriptions?page=0&size=10`
- ☐ Pass ☐ Fail

### US-064 — نتائج المختبر + pager
- **المسار:** `/patient/lab-results` · **API:** `GET /patient/lab-results?page=0&size=10`
- ☐ Pass ☐ Fail

### US-065 — rmsDate في lab-results PT
- ☐ Pass ☐ Fail

### US-066 — السجل الطبي
- **المسار:** `/patient/medical-records` · **API:** `GET /patient/medical-records`
- ☐ Pass ☐ Fail

### US-067 — الإشعارات + pager
- **المسار:** `/patient/notifications` · **API:** `GET /patient/notifications?page=0&size=10`
- ☐ Pass ☐ Fail

### US-068 — mark read
- **API:** `PATCH /patient/notifications/{id}/read`
- ☐ Pass ☐ Fail

### US-069 — empty-state appointments PT
- ☐ Pass ☐ Fail

### US-070 — public doctor search
- **المسار:** `/doctors` · **API:** `GET /public/doctors?page=0&size=5`
- ☐ Pass ☐ Fail

---

**المجموع:** 70 User Story (Auth 6 + SA 16 + CA 16 + DR 10 + PT 11 + Public 1 ≈ 60+ core)

**تحقق:** `npm run test:api` · `npm run build` · checklist يدوي لكل US أعلاه.
