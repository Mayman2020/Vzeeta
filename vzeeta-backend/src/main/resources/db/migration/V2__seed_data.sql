-- Seed data for Tabeebi platform (password for all users: 12345)
-- bcrypt hash for '12345'
-- $2b$10$vC9x3Q19V1ySJOTxw0hLTelSRFQ2OUtjiOED1Vt8lCFT5nA8YevvS

INSERT INTO vzeeta_mgmt.system_settings (setting_key, setting_value, description) VALUES
('platform_commission_percent', '10', 'Default platform commission'),
('appointment_reminder_hours', '24', 'Hours before appointment to send reminder')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO vzeeta_mgmt.cities (id, name_ar, name_en) VALUES
(1, 'القاهرة', 'Cairo'),
(2, 'الجيزة', 'Giza'),
(3, 'الإسكندرية', 'Alexandria')
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.cities_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.cities));

INSERT INTO vzeeta_mgmt.areas (id, city_id, name_ar, name_en) VALUES
(1, 1, 'مدينة نصر', 'Nasr City'),
(2, 1, 'المعادي', 'Maadi'),
(3, 1, 'التجمع الخامس', 'Fifth Settlement'),
(4, 2, 'الدقي', 'Dokki'),
(5, 3, 'سموحة', 'Smouha')
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.areas_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.areas));

INSERT INTO vzeeta_mgmt.specialties (id, code, name_ar, name_en, icon, sort_order) VALUES
(1, 'INTERNAL', 'باطنة', 'Internal Medicine', 'medical_services', 1),
(2, 'CARDIO', 'قلب وأوعية', 'Cardiology', 'favorite', 2),
(3, 'DERMA', 'جلدية', 'Dermatology', 'face', 3),
(4, 'DENTAL', 'أسنان', 'Dentistry', 'dentistry', 4),
(5, 'PEDIA', 'أطفال', 'Pediatrics', 'child_care', 5),
(6, 'ORTHO', 'عظام', 'Orthopedics', 'accessibility', 6),
(7, 'ENT', 'أنف وأذن', 'ENT', 'hearing', 7),
(8, 'OBGYN', 'نساء وتوليد', 'OBGYN', 'pregnant_woman', 8),
(9, 'OPHTH', 'عيون', 'Ophthalmology', 'visibility', 9)
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.specialties_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.specialties));

INSERT INTO vzeeta_mgmt.clinics (id, name_ar, name_en, description_ar, phone, email, active, verified, commission_percent) VALUES
(1, 'عيادات الشفاء', 'Al-Shifa Clinics', 'مجمع طبي متكامل في القاهرة', '+201000000001', 'info@alshifa-clinic.com', TRUE, TRUE, 10),
(2, 'مركز النور الطبي', 'Al-Noor Medical Center', 'مركز طبي حديث في الجيزة', '+201000000002', 'contact@alnoor.com', TRUE, TRUE, 10)
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.clinics_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.clinics));

INSERT INTO vzeeta_mgmt.clinic_branches (id, clinic_id, name_ar, name_en, area_id, address_ar, phone, active) VALUES
(1, 1, 'فرع مدينة نصر', 'Nasr City Branch', 1, 'شارع عباس العقاد، مدينة نصر', '+201000000011', TRUE),
(2, 1, 'فرع المعادي', 'Maadi Branch', 2, 'شارع 9، المعادي', '+201000000012', TRUE),
(3, 2, 'فرع الدقي', 'Dokki Branch', 4, 'شارع التحرير، الدقي', '+201000000021', TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.clinic_branches_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.clinic_branches));

INSERT INTO vzeeta_mgmt.clinic_services (clinic_id, specialty_id, name_ar, name_en, price, active) VALUES
(1, 1, 'كشف باطنة', 'Internal checkup', 300, TRUE),
(1, 3, 'كشف جلدية', 'Dermatology checkup', 350, TRUE),
(1, 6, 'كشف عظام', 'Orthopedics checkup', 400, TRUE),
(2, 4, 'كشف أسنان', 'Dental checkup', 250, TRUE),
(2, 5, 'كشف أطفال', 'Pediatrics checkup', 300, TRUE);

-- Users (password: 12345)
INSERT INTO vzeeta_mgmt.users (id, email, password_hash, full_name_ar, full_name_en, phone, role, active, email_verified) VALUES
(1, 'superadmin@tabeebi.com', '$2b$10$vC9x3Q19V1ySJOTxw0hLTelSRFQ2OUtjiOED1Vt8lCFT5nA8YevvS', 'مدير النظام', 'Super Admin', '+201000000100', 'SUPER_ADMIN', TRUE, TRUE),
(2, 'clinicadmin@tabeebi.com', '$2b$10$vC9x3Q19V1ySJOTxw0hLTelSRFQ2OUtjiOED1Vt8lCFT5nA8YevvS', 'أحمد مدير العيادة', 'Clinic Admin', '+201000000101', 'CLINIC_ADMIN', TRUE, TRUE),
(3, 'doctor1@tabeebi.com', '$2b$10$vC9x3Q19V1ySJOTxw0hLTelSRFQ2OUtjiOED1Vt8lCFT5nA8YevvS', 'د. محمد حسن', 'Dr. Mohamed Hassan', '+201000000102', 'DOCTOR', TRUE, TRUE),
(4, 'doctor2@tabeebi.com', '$2b$10$vC9x3Q19V1ySJOTxw0hLTelSRFQ2OUtjiOED1Vt8lCFT5nA8YevvS', 'د. سارة أحمد', 'Dr. Sara Ahmed', '+201000000103', 'DOCTOR', TRUE, TRUE),
(5, 'patient1@tabeebi.com', '$2b$10$vC9x3Q19V1ySJOTxw0hLTelSRFQ2OUtjiOED1Vt8lCFT5nA8YevvS', 'خالد محمود', 'Khaled Mahmoud', '+201000000104', 'PATIENT', TRUE, TRUE),
(6, 'patient2@tabeebi.com', '$2b$10$vC9x3Q19V1ySJOTxw0hLTelSRFQ2OUtjiOED1Vt8lCFT5nA8YevvS', 'نورا إبراهيم', 'Nora Ibrahim', '+201000000105', 'PATIENT', TRUE, TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.users_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.users));

INSERT INTO vzeeta_mgmt.clinic_admins (user_id, clinic_id) VALUES (2, 1) ON CONFLICT DO NOTHING;

INSERT INTO vzeeta_mgmt.patients (id, user_id, date_of_birth, gender) VALUES
(1, 5, '1990-05-15', 'MALE'),
(2, 6, '1995-08-20', 'FEMALE')
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.patients_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.patients));

INSERT INTO vzeeta_mgmt.doctors (id, user_id, clinic_id, title_ar, title_en, bio_ar, years_experience, consultation_fee, online_fee, verified, rating_avg, rating_count, accepts_online, accepts_in_clinic) VALUES
(1, 3, 1, 'استشاري باطنة', 'Internal Medicine Consultant', 'خبرة 15 عاماً في الطب الباطني', 15, 400, 350, TRUE, 4.8, 120, TRUE, TRUE),
(2, 4, 1, 'استشارية جلدية', 'Dermatology Consultant', 'متخصصة في الأمراض الجلدية والتجميل', 10, 450, 400, TRUE, 4.9, 85, TRUE, TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.doctors_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.doctors));

INSERT INTO vzeeta_mgmt.doctor_specialties (doctor_id, specialty_id) VALUES
(1, 1), (2, 3)
ON CONFLICT DO NOTHING;

INSERT INTO vzeeta_mgmt.doctor_branches (doctor_id, branch_id) VALUES
(1, 1), (1, 2), (2, 1)
ON CONFLICT DO NOTHING;

-- Working hours: Sun-Thu 9-17
INSERT INTO vzeeta_mgmt.doctor_availability (doctor_id, branch_id, day_of_week, start_time, end_time, slot_minutes, online_only, active) VALUES
(1, 1, 0, '09:00', '17:00', 30, FALSE, TRUE),
(1, 1, 1, '09:00', '17:00', 30, FALSE, TRUE),
(1, 1, 2, '09:00', '17:00', 30, FALSE, TRUE),
(1, 1, 3, '09:00', '17:00', 30, FALSE, TRUE),
(1, 1, 4, '09:00', '17:00', 30, FALSE, TRUE),
(1, NULL, 0, '18:00', '21:00', 30, TRUE, TRUE),
(1, NULL, 1, '18:00', '21:00', 30, TRUE, TRUE),
(2, 1, 0, '10:00', '16:00', 30, FALSE, TRUE),
(2, 1, 1, '10:00', '16:00', 30, FALSE, TRUE),
(2, 1, 2, '10:00', '16:00', 30, FALSE, TRUE),
(2, 1, 3, '10:00', '16:00', 30, FALSE, TRUE),
(2, 1, 4, '10:00', '16:00', 30, FALSE, TRUE);

INSERT INTO vzeeta_mgmt.favorite_doctors (patient_id, doctor_id) VALUES (1, 2) ON CONFLICT DO NOTHING;

-- Sample completed appointment for reviews
INSERT INTO vzeeta_mgmt.appointments (id, appointment_number, patient_id, doctor_id, clinic_id, branch_id, specialty_id, appointment_date, start_time, end_time, consultation_type, status, fee_amount) VALUES
(1, 'TB-2024-00001', 1, 1, 1, 1, 1, CURRENT_DATE - 7, '10:00', '10:30', 'IN_CLINIC', 'COMPLETED', 400)
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.appointments_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.appointments));

INSERT INTO vzeeta_mgmt.reviews (appointment_id, patient_id, doctor_id, rating, comment) VALUES
(1, 1, 1, 5, 'طبيب ممتاز وخدمة رائعة')
ON CONFLICT DO NOTHING;

INSERT INTO vzeeta_mgmt.payments (id, appointment_id, patient_id, amount, commission, payment_method, status, paid_at) VALUES
(1, 1, 1, 400, 40, 'CASH', 'PAID', NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

SELECT setval('vzeeta_mgmt.payments_id_seq', (SELECT COALESCE(MAX(id),1) FROM vzeeta_mgmt.payments));

INSERT INTO vzeeta_mgmt.invoices (invoice_number, payment_id, appointment_id, patient_id, subtotal, commission, total) VALUES
('INV-2024-00001', 1, 1, 1, 400, 40, 400)
ON CONFLICT DO NOTHING;

INSERT INTO vzeeta_mgmt.prescriptions (appointment_id, patient_id, doctor_id, diagnosis_ar, diagnosis_en) VALUES
(1, 1, 1, 'التهاب حلق', 'Sore throat');

INSERT INTO vzeeta_mgmt.prescription_items (prescription_id, medicine_name, dosage, frequency, duration, sort_order)
SELECT id, 'أموكسيسيلين', '500mg', '3 مرات يومياً', '7 أيام', 1 FROM vzeeta_mgmt.prescriptions WHERE appointment_id = 1;

INSERT INTO vzeeta_mgmt.lab_results (patient_id, clinic_id, appointment_id, test_name_ar, test_name_en, result_summary, result_date) VALUES
(1, 1, 1, 'تحليل دم شامل', 'Complete Blood Count', 'النتائج ضمن المعدل الطبيعي', CURRENT_DATE - 6);

INSERT INTO vzeeta_mgmt.medical_records (patient_id, doctor_id, appointment_id, title_ar, title_en, record_type) VALUES
(1, 1, 1, 'ملخص الزيارة', 'Visit Summary', 'VISIT');

INSERT INTO vzeeta_mgmt.notifications (user_id, type, title_ar, title_en, body_ar, body_en, reference_type, reference_id) VALUES
(5, 'APPOINTMENT_CONFIRMED', 'تأكيد الموعد', 'Appointment Confirmed', 'تم تأكيد موعدك مع د. محمد حسن', 'Your appointment with Dr. Mohamed Hassan is confirmed', 'APPOINTMENT', 1),
(3, 'NEW_APPOINTMENT', 'موعد جديد', 'New Appointment', 'لديك موعد جديد من مريض', 'You have a new appointment request', 'APPOINTMENT', 1);
