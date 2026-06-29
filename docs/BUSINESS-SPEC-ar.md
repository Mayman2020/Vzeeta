# المواصفات التجارية — Tabeebi / Vzeeta (Business Spec)

**الإصدار:** 1.0 · **2026-06-28**

---

## 1. الغرض

منصة حجز وإدارة عيادات طبية — بوابة عامة للمرضى، بوابات إدارية للعيادات والمنصة، بوابة للأطباء.

---

## 2. الأدوار والبوابات

| Role | Portal | المسارات الأساسية |
|------|--------|-------------------|
| SUPER_ADMIN | `/super-admin/*` | clinics, users, verification, payments, settings, permissions, lookups |
| CLINIC_ADMIN | `/clinic-admin/*` | doctors, branches, appointments, patients, services, specialties, lab-results |
| DOCTOR | `/doctor/*` | appointments, calendar, prescriptions, records |
| PATIENT | `/patient/*` | book, appointments, prescriptions, lab-results, notifications |
| Public | `/` | search doctors, book slots |

---

## 3. Business Flows

### 3.1 حجز مريض

```mermaid
flowchart LR
  Search[بحث طبيب] --> Slots[اختيار slot]
  Slots --> Book[POST appointment]
  Book --> Pay[دفع]
  Pay --> Notify[إشعار]
```

### 3.2 تحقق طبيب (SA)

SA يراجع `/super-admin/verification` → `POST /super-admin/doctors/{id}/verify`

### 3.3 إدارة عيادة (CA)

CA يدير الأطباء والفروع والمواعيد والمرضى — قوائم Property-style مع pager و search.

---

## 4. List UX Standard (Property parity)

| Element | Requirement |
|---------|-------------|
| stat-pill | Counts from `totalElements` / status breakdown |
| Search | Server `?q=` |
| Pagination | `app-table-pager` |
| Empty | `app-empty-state` |
| Dates | `rmsDate` in tables |
| Refresh | `ListLoadController.is-refreshing` |

---

## 5. Acceptance Criteria (Lists)

| Portal | Given | When | Then |
|--------|-------|------|------|
| SA clinics | عيادات في DB | يفتح القائمة + يبحث | pager + q returns filtered Page |
| SA settings | إعداد موجود | يعدل value | PUT 200 + UI reflects |
| CA appointments | مواعيد العيادة | يغير page | totalElements ثابت |
| DR appointments | مواعيد اليوم | يفتح القائمة | dates بـ rmsDate |
| PT notifications | إشعارات | scroll pages | metadata صحيح |

---

## 6. Gap Status

**Closed (list + CRUD/features):** All B-SA*, B-CA*, B-D*, B-P*, T1–T7  
**Open:** —

راجع `docs/business-gaps-ar.md`.

---

## 7. Test Results

| Metric | Value |
|--------|-------|
| API smoke | **81/81 Pass** |
| User stories | **70/70 Pass** |

`docs/user-stories-test-results-ar.md`

---

## 8. User Stories

70 user story في `docs/user-stories-full-system-ar.md`:
- EPIC 01 Auth (6)
- EPIC 02–05 SUPER_ADMIN (20)
- EPIC 06–09 CLINIC_ADMIN (18)
- EPIC 10–11 DOCTOR (12)
- EPIC 12–13 PATIENT (14)
