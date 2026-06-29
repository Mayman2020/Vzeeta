# فجوات الأعمال والتكامل — Tabeebi (Vzeeta)
## Business & Technical Gap Register

**التاريخ:** 2026-06-28  
**الإصدار:** 1.0  
**الغرض:** تتبع الفجوات الوظيفية والتقنية لأربعة بوابات (SUPER_ADMIN، CLINIC_ADMIN، DOCTOR، PATIENT) قبل اختبار User Stories الكامل.

---

## فجوات SUPER_ADMIN

| ID | الفجوة | الأولوية | الحالة |
|----|--------|----------|--------|
| B-SA1 | لا يوجد CRUD كامل للعيادات من قائمة `/super-admin/clinics` (عرض فقط) | عالية | **Closed** 2026-06-28 |
| B-SA2 | تعديل المستخدمين (تفعيل/تعطيل) غير متاح من قائمة `/super-admin/users` | عالية | **Closed** 2026-06-28 |
| B-SA3 | فلتر حالة الدفع (PAID/PENDING/FAILED) غير متاح في `/super-admin/payments` | متوسطة | **Closed** 2026-06-28 |
| B-SA4 | إدارة المدن/المناطق منفصلة عن Lookups المركزية | منخفضة | **Closed** 2026-06-28 |
| T-SA1 | ~~قوائم بدون pagination/search على الخادم~~ | عالية | **Closed** |
| T-SA2 | ~~غياب ListLoadController + app-empty-state + table-pager~~ | عالية | **Closed** |

---

## فجوات CLINIC_ADMIN

| ID | الفجوة | الأولوية | الحالة |
|----|--------|----------|--------|
| B-CA1 | إضافة/تعديل الأطباء من `/clinic-admin/doctors` غير مكتمل | عالية | **Closed** 2026-06-28 |
| B-CA2 | إنشاء فرع/خدمة من الواجهة غير مربوط بمسارات واضحة | عالية | **Closed** 2026-06-28 |
| B-CA3 | رفع نتيجة مختبر (POST) من `/clinic-admin/lab-results` غير موجود في UI | عالية | **Closed** 2026-06-28 |
| B-CA4 | التخصصات للقراءة فقط (مرجع من `/clinic-admin/specialties`) | متوسطة | **Closed** 2026-06-28 |
| B-CA5 | فلتر حالة الموعد في `/clinic-admin/appointments` | متوسطة | **Closed** 2026-06-28 |
| T-CA1 | ~~doctors/branches/services كـ List بدون pager~~ | عالية | **Closed** |
| T-CA2 | ~~غياب مسارات specialties و lab-results~~ | عالية | **Closed** |

---

## فجوات DOCTOR

| ID | الفجوة | الأولوية | الحالة |
|----|--------|----------|--------|
| B-D1 | إنشاء وصفة طبية من `/doctor/prescriptions` (عرض فقط) | عالية | **Closed** 2026-06-28 |
| B-D2 | إدارة التقويم (POST availability) من `/doctor/calendar` | عالية | **Closed** 2026-06-28 |
| B-D3 | بحث/فلتر المواعيد حسب الحالة | متوسطة | **Closed** 2026-06-28 |
| T-D1 | ~~مواعيد بدون rmsDate في الجدول~~ | عالية | **Closed** |
| T-D2 | ~~pagination UI غير مربوط بالـ API~~ | عالية | **Closed** |

---

## فجوات PATIENT

| ID | الفجوة | الأولوية | الحالة |
|----|--------|----------|--------|
| B-P1 | إعادة جدولة الموعد من `/patient/appointments` | عالية | **Closed** 2026-06-28 |
| B-P2 | بحث في المواعيد/الوصفات/الإشعارات | متوسطة | **Closed** 2026-06-28 |
| B-P3 | تنزيل مرفق نتيجة مختبر | متوسطة | **Closed** 2026-06-28 |
| T-P1 | ~~قوائم size=50 بدون pager~~ | عالية | **Closed** |
| T-P2 | ~~إشعارات بدون pagination metadata~~ | عالية | **Closed** |

---

## فجوات تقنية عامة (Technical)

| ID | الفجوة | الأولوية | الحالة |
|----|--------|----------|--------|
| T1 | ~~غياب `list-load.util.ts` و `pagination.util.ts`~~ | عالية | **Closed** |
| T2 | ~~غياب `parsePageResponse` و `app-empty-state`~~ | عالية | **Closed** |
| T3 | ~~smoke test بدون فحص `totalElements` و `?q=`~~ | عالية | **Closed** |
| T4 | ~~PUT settings غير مغطى في smoke test~~ | عالية | **Closed** |
| T5 | i18n: مفاتيح PAGINATION/PAGE_OF/PREVIOUS/ALL | متوسطة | **Closed** |
| T6 | `user-stories-test-results-ar.md` غير منشأ بعد | متوسطة | **Closed** 2026-06-28 |
| T7 | Mazaad/Vzeeta port conflict على 8081 في التطوير المحلي | منخفضة | **Closed** 2026-06-28 (موثّق في rms-playbook-handoff — شغّل backend واحد فقط) |

---

## ملاحظات

- بعد إغلاق فجوة، غيّر **الحالة** إلى `Closed` مع تاريخ الإغلاق.
- راجع `docs/user-stories-full-system-ar.md` لربط كل US بالمسار والـ API.
- تحقق: `cd vzeeta-web && npm run test:api && npm run build` (backend على 8081).
