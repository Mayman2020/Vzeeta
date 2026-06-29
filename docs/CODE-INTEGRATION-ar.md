# توثيق التكامل البرمجي — Tabeebi / Vzeeta (Code Integration)

**الإصدار:** 1.0 · **2026-06-28**  
**Skill:** `rms-property-list-integration`

---

## 1. Architecture — 4 Portals

```mermaid
flowchart TB
  subgraph portals [vzeeta-web]
    SA[super-admin-pages]
    CA[clinic-pages]
    DR[doctor-pages]
    PT[patient-pages]
  end
  subgraph core [shared]
    LL[ListLoadController]
    PP[parsePageResponse]
    ES[empty-state]
    TP[table-pager]
  end
  subgraph api [vzeeta-backend :8081/api/v1]
    SAC[/super-admin/*]
    CAC[/clinic-admin/*]
    DRC[/doctor/*]
    PTC[/patient/*]
  end
  portals --> core --> api
```

---

## 2. Paging & Search Contract

### Frontend

```typescript
// core/utils/api-page.util.ts
parsePageResponse<T>(data): PagedResult<T>  // content + totalElements + number + size

// core/utils/pagination.util.ts
withPageParams(page, size, { q, status, ... })
```

### Backend

All list endpoints accept:
- `page`, `size`, `sort` (Spring Pageable)
- `q` (optional search string)

Returns: `ApiResponse<Page<T>>`

---

## 3. Portal List Routes

### SUPER_ADMIN

| Route | API | Features |
|-------|-----|----------|
| `/super-admin/clinics` | `GET /super-admin/clinics` | pager, q, stat-pill |
| `/super-admin/users` | `GET /super-admin/users` | pager, q |
| `/super-admin/verification` | `GET /super-admin/doctors?verified=` | estate table |
| `/super-admin/payments` | `GET /super-admin/payments` | pager, q, rmsDate |
| `/super-admin/settings` | GET/PUT settings | inline edit |
| `/super-admin/lookups` | lookup admin | empty-state |

### CLINIC_ADMIN

| Route | API |
|-------|-----|
| `/clinic-admin/doctors` | Page + q |
| `/clinic-admin/branches` | Page + q |
| `/clinic-admin/appointments` | Page + q |
| `/clinic-admin/patients` | Page + q |
| `/clinic-admin/services` | Page + q |
| `/clinic-admin/specialties` | List (read) |
| `/clinic-admin/lab-results` | Page + q |

### DOCTOR / PATIENT

Lists upgraded: appointments, prescriptions, lab-results, notifications — pager + `rmsDate` where applicable.

---

## 4. Shared Components

| Path | Purpose |
|------|---------|
| `shared/utils/list-load.util.ts` | ListLoadController |
| `shared/components/empty-state/` | Empty UI |
| `shared/components/table-pager/` | Pager (wired) |
| `styles/rms-estate-cards.scss` | Estate card styles |

---

## 5. RBAC

- `permissionGuard` on super-admin + clinic-admin routes
- `PermissionService.loadMine()` on APP_INITIALIZER
- Routes: `/super-admin/permissions`, `/lookups`, `/profile`

---

## 6. Smoke Test

**Script:** `vzeeta-web/scripts/api-integration-test.mjs`  
**Run:** `npm run test:api`  
**Result:** **81/81** (2026-06-28) — includes page metadata, `?q=`, PUT settings

**Logins tested:** SUPER_ADMIN, CLINIC_ADMIN, DOCTOR, PATIENT

---

## 7. Regression Checklist

- [ ] Services use `parsePageResponse`, not `unwrapPage` only
- [ ] No hardcoded `size=50` without pager UI
- [ ] All portal lists use estate-table-toolbar + table-pager
- [ ] Clinic-admin specialties + lab-results routes in sidebar
- [ ] `ng build` passes

---

## 8. Related Docs

| Doc | Path |
|-----|------|
| Business gaps | `docs/business-gaps-ar.md` |
| User stories | `docs/user-stories-full-system-ar.md` |
| Test results | `docs/user-stories-test-results-ar.md` |
| Business spec | `docs/BUSINESS-SPEC-ar.md` |
| Architecture | `docs/architecture.md` |
