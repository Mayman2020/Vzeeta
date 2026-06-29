-- Tabeebi / Vzeeta — full database baseline
CREATE SCHEMA IF NOT EXISTS vzeeta_mgmt;

-- ─── Users & roles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name_ar    VARCHAR(255) NOT NULL,
    full_name_en    VARCHAR(255),
    phone           VARCHAR(50),
    role            VARCHAR(50) NOT NULL,
    profile_image   VARCHAR(500),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      BIGINT,
    updated_by      BIGINT,
    CONSTRAINT users_role_chk CHECK (role IN ('PATIENT','DOCTOR','CLINIC_ADMIN','SUPER_ADMIN'))
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.revoked_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token_hash  VARCHAR(128) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    revoked_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES vzeeta_mgmt.users(id) ON DELETE CASCADE,
    token       VARCHAR(128) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Geography ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.cities (
    id          BIGSERIAL PRIMARY KEY,
    name_ar     VARCHAR(255) NOT NULL,
    name_en     VARCHAR(255),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.areas (
    id          BIGSERIAL PRIMARY KEY,
    city_id     BIGINT NOT NULL REFERENCES vzeeta_mgmt.cities(id),
    name_ar     VARCHAR(255) NOT NULL,
    name_en     VARCHAR(255),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Specialties ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.specialties (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(50) NOT NULL UNIQUE,
    name_ar     VARCHAR(255) NOT NULL,
    name_en     VARCHAR(255),
    icon        VARCHAR(100),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Clinics ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.clinics (
    id              BIGSERIAL PRIMARY KEY,
    name_ar         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255),
    description_ar  TEXT,
    description_en  TEXT,
    logo_url        VARCHAR(500),
    phone           VARCHAR(50),
    email           VARCHAR(255),
    website         VARCHAR(255),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    verified        BOOLEAN NOT NULL DEFAULT FALSE,
    commission_percent DECIMAL(5,2) DEFAULT 10.00,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      BIGINT,
    updated_by      BIGINT
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.clinic_branches (
    id              BIGSERIAL PRIMARY KEY,
    clinic_id       BIGINT NOT NULL REFERENCES vzeeta_mgmt.clinics(id) ON DELETE CASCADE,
    name_ar         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255),
    area_id         BIGINT REFERENCES vzeeta_mgmt.areas(id),
    address_ar      VARCHAR(500),
    address_en      VARCHAR(500),
    phone           VARCHAR(50),
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.clinic_services (
    id              BIGSERIAL PRIMARY KEY,
    clinic_id       BIGINT NOT NULL REFERENCES vzeeta_mgmt.clinics(id) ON DELETE CASCADE,
    specialty_id    BIGINT REFERENCES vzeeta_mgmt.specialties(id),
    name_ar         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255),
    price           DECIMAL(10,2) NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Patients ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.patients (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES vzeeta_mgmt.users(id) ON DELETE CASCADE,
    date_of_birth   DATE,
    gender          VARCHAR(20),
    blood_type      VARCHAR(10),
    national_id     VARCHAR(50),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Doctors ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.doctors (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE REFERENCES vzeeta_mgmt.users(id) ON DELETE CASCADE,
    clinic_id           BIGINT REFERENCES vzeeta_mgmt.clinics(id),
    title_ar            VARCHAR(255),
    title_en            VARCHAR(255),
    bio_ar              TEXT,
    bio_en              TEXT,
    years_experience    INT DEFAULT 0,
    consultation_fee    DECIMAL(10,2) NOT NULL DEFAULT 0,
    online_fee          DECIMAL(10,2),
    verified            BOOLEAN NOT NULL DEFAULT FALSE,
    rating_avg          DECIMAL(3,2) DEFAULT 0,
    rating_count        INT DEFAULT 0,
    accepts_online      BOOLEAN NOT NULL DEFAULT TRUE,
    accepts_in_clinic   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.doctor_specialties (
    doctor_id       BIGINT NOT NULL REFERENCES vzeeta_mgmt.doctors(id) ON DELETE CASCADE,
    specialty_id    BIGINT NOT NULL REFERENCES vzeeta_mgmt.specialties(id),
    PRIMARY KEY (doctor_id, specialty_id)
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.doctor_branches (
    doctor_id       BIGINT NOT NULL REFERENCES vzeeta_mgmt.doctors(id) ON DELETE CASCADE,
    branch_id       BIGINT NOT NULL REFERENCES vzeeta_mgmt.clinic_branches(id) ON DELETE CASCADE,
    PRIMARY KEY (doctor_id, branch_id)
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.doctor_availability (
    id              BIGSERIAL PRIMARY KEY,
    doctor_id       BIGINT NOT NULL REFERENCES vzeeta_mgmt.doctors(id) ON DELETE CASCADE,
    branch_id       BIGINT REFERENCES vzeeta_mgmt.clinic_branches(id),
    day_of_week     INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    slot_minutes    INT NOT NULL DEFAULT 30,
    online_only     BOOLEAN NOT NULL DEFAULT FALSE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Appointments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.appointments (
    id                  BIGSERIAL PRIMARY KEY,
    appointment_number  VARCHAR(30) NOT NULL UNIQUE,
    patient_id          BIGINT NOT NULL REFERENCES vzeeta_mgmt.patients(id),
    doctor_id           BIGINT NOT NULL REFERENCES vzeeta_mgmt.doctors(id),
    clinic_id           BIGINT REFERENCES vzeeta_mgmt.clinics(id),
    branch_id           BIGINT REFERENCES vzeeta_mgmt.clinic_branches(id),
    specialty_id        BIGINT REFERENCES vzeeta_mgmt.specialties(id),
    appointment_date    DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    consultation_type   VARCHAR(20) NOT NULL DEFAULT 'IN_CLINIC',
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes               TEXT,
    doctor_notes        TEXT,
    fee_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by          BIGINT,
    updated_by          BIGINT,
    CONSTRAINT appointments_status_chk CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED','REJECTED','RESCHEDULED')),
    CONSTRAINT appointments_type_chk CHECK (consultation_type IN ('IN_CLINIC','ONLINE')),
    CONSTRAINT appointments_unique_slot UNIQUE (doctor_id, appointment_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON vzeeta_mgmt.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON vzeeta_mgmt.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON vzeeta_mgmt.appointments(status);

-- ─── Favorites ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.favorite_doctors (
    patient_id  BIGINT NOT NULL REFERENCES vzeeta_mgmt.patients(id) ON DELETE CASCADE,
    doctor_id   BIGINT NOT NULL REFERENCES vzeeta_mgmt.doctors(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (patient_id, doctor_id)
);

-- ─── Reviews ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.reviews (
    id              BIGSERIAL PRIMARY KEY,
    appointment_id  BIGINT NOT NULL UNIQUE REFERENCES vzeeta_mgmt.appointments(id),
    patient_id      BIGINT NOT NULL REFERENCES vzeeta_mgmt.patients(id),
    doctor_id       BIGINT NOT NULL REFERENCES vzeeta_mgmt.doctors(id),
    rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Prescriptions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.prescriptions (
    id              BIGSERIAL PRIMARY KEY,
    appointment_id  BIGINT NOT NULL REFERENCES vzeeta_mgmt.appointments(id),
    patient_id      BIGINT NOT NULL REFERENCES vzeeta_mgmt.patients(id),
    doctor_id       BIGINT NOT NULL REFERENCES vzeeta_mgmt.doctors(id),
    diagnosis_ar    TEXT,
    diagnosis_en    TEXT,
    notes           TEXT,
    file_url        VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      BIGINT
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.prescription_items (
    id              BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT NOT NULL REFERENCES vzeeta_mgmt.prescriptions(id) ON DELETE CASCADE,
    medicine_name   VARCHAR(255) NOT NULL,
    dosage          VARCHAR(100),
    frequency       VARCHAR(100),
    duration        VARCHAR(100),
    instructions    TEXT,
    sort_order      INT NOT NULL DEFAULT 0
);

-- ─── Medical records ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.medical_records (
    id              BIGSERIAL PRIMARY KEY,
    patient_id      BIGINT NOT NULL REFERENCES vzeeta_mgmt.patients(id),
    doctor_id       BIGINT REFERENCES vzeeta_mgmt.doctors(id),
    appointment_id  BIGINT REFERENCES vzeeta_mgmt.appointments(id),
    title_ar        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255),
    description_ar  TEXT,
    description_en  TEXT,
    record_type     VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    file_url        VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      BIGINT
);

-- ─── Lab results ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.lab_results (
    id              BIGSERIAL PRIMARY KEY,
    patient_id      BIGINT NOT NULL REFERENCES vzeeta_mgmt.patients(id),
    clinic_id       BIGINT REFERENCES vzeeta_mgmt.clinics(id),
    appointment_id  BIGINT REFERENCES vzeeta_mgmt.appointments(id),
    test_name_ar    VARCHAR(255) NOT NULL,
    test_name_en    VARCHAR(255),
    result_summary  TEXT,
    file_url        VARCHAR(500),
    result_date     DATE NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      BIGINT
);

-- ─── Payments & invoices ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.payments (
    id              BIGSERIAL PRIMARY KEY,
    appointment_id  BIGINT NOT NULL REFERENCES vzeeta_mgmt.appointments(id),
    patient_id      BIGINT NOT NULL REFERENCES vzeeta_mgmt.patients(id),
    amount          DECIMAL(10,2) NOT NULL,
    commission      DECIMAL(10,2) DEFAULT 0,
    payment_method  VARCHAR(30) NOT NULL DEFAULT 'CASH',
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    transaction_ref VARCHAR(100),
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT payments_status_chk CHECK (status IN ('PENDING','PAID','FAILED','REFUNDED','CASH')),
    CONSTRAINT payments_method_chk CHECK (payment_method IN ('ONLINE','CASH'))
);

CREATE TABLE IF NOT EXISTS vzeeta_mgmt.invoices (
    id              BIGSERIAL PRIMARY KEY,
    invoice_number  VARCHAR(30) NOT NULL UNIQUE,
    payment_id      BIGINT NOT NULL UNIQUE REFERENCES vzeeta_mgmt.payments(id),
    appointment_id  BIGINT NOT NULL REFERENCES vzeeta_mgmt.appointments(id),
    patient_id      BIGINT NOT NULL REFERENCES vzeeta_mgmt.patients(id),
    subtotal        DECIMAL(10,2) NOT NULL,
    commission      DECIMAL(10,2) DEFAULT 0,
    total           DECIMAL(10,2) NOT NULL,
    issued_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Notifications ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES vzeeta_mgmt.users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title_ar        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255),
    body_ar         TEXT,
    body_en         TEXT,
    reference_type  VARCHAR(50),
    reference_id    BIGINT,
    read_flag       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON vzeeta_mgmt.notifications(user_id, read_flag);

-- ─── System settings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.system_settings (
    id          BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(500) NOT NULL,
    description VARCHAR(255),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Clinic admin mapping ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vzeeta_mgmt.clinic_admins (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE REFERENCES vzeeta_mgmt.users(id) ON DELETE CASCADE,
    clinic_id   BIGINT NOT NULL REFERENCES vzeeta_mgmt.clinics(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
