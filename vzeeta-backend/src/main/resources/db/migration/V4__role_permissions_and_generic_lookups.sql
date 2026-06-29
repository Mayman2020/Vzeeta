SET search_path TO vzeeta_mgmt;

CREATE TABLE IF NOT EXISTS role_permissions (
    role              VARCHAR(50) PRIMARY KEY,
    permissions_json  TEXT NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO role_permissions (role, permissions_json) VALUES
('SUPER_ADMIN', $${
  "dashboard":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "appointments":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "favorites":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "prescriptions":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "lab_results":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "medical_records":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "notifications":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "calendar":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "earnings":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "doctors":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "branches":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "patients":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "services":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "analytics":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "clinics":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "users":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "verification":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "cities":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "payments":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "settings":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "permissions":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "lookups":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true},
  "profile":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":false,"export":false,"approve":false}
}$$::jsonb),
('CLINIC_ADMIN', $${
  "dashboard":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false},
  "doctors":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":false,"export":false,"approve":false},
  "branches":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":false,"export":false,"approve":false},
  "appointments":{"enabled":true,"menu":true,"view":true,"create":false,"edit":true,"delete":false,"export":false,"approve":false},
  "patients":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false},
  "services":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":false,"export":false,"approve":false},
  "analytics":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":true,"approve":false}
}$$::jsonb),
('DOCTOR', $${
  "dashboard":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false},
  "calendar":{"enabled":true,"menu":true,"view":true,"create":false,"edit":true,"delete":false,"export":false,"approve":false},
  "appointments":{"enabled":true,"menu":true,"view":true,"create":false,"edit":true,"delete":false,"export":false,"approve":false},
  "prescriptions":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":false,"export":false,"approve":false},
  "earnings":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":true,"approve":false}
}$$::jsonb),
('PATIENT', $${
  "dashboard":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false},
  "appointments":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":false,"export":false,"approve":false},
  "favorites":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":false,"approve":false},
  "prescriptions":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false},
  "lab_results":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false},
  "medical_records":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false},
  "notifications":{"enabled":true,"menu":true,"view":true,"create":false,"edit":false,"delete":false,"export":false,"approve":false}
}$$::jsonb)
ON CONFLICT (role) DO NOTHING;

CREATE TABLE IF NOT EXISTS lookups (
    id          BIGSERIAL PRIMARY KEY,
    type        VARCHAR(50) NOT NULL,
    code        VARCHAR(50) NOT NULL,
    name_ar     VARCHAR(150) NOT NULL,
    name_en     VARCHAR(150) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_lookup_type_code UNIQUE (type, code)
);

CREATE INDEX IF NOT EXISTS idx_lookups_type_active ON lookups (type, is_active, sort_order);

INSERT INTO lookups (type, code, name_ar, name_en, sort_order, is_locked) VALUES
('CLINIC_TYPE', 'GENERAL', 'عيادة عامة', 'General Clinic', 1, TRUE),
('CLINIC_TYPE', 'SPECIALIZED', 'عيادة تخصصية', 'Specialized Clinic', 2, FALSE),
('PAYMENT_METHOD', 'CASH', 'نقدي', 'Cash', 1, TRUE),
('PAYMENT_METHOD', 'CARD', 'بطاقة', 'Card', 2, TRUE),
('PAYMENT_METHOD', 'TRANSFER', 'تحويل بنكي', 'Bank Transfer', 3, FALSE),
('APPOINTMENT_STATUS', 'PENDING', 'قيد الانتظار', 'Pending', 1, TRUE),
('APPOINTMENT_STATUS', 'CONFIRMED', 'مؤكد', 'Confirmed', 2, TRUE),
('APPOINTMENT_STATUS', 'CANCELLED', 'ملغي', 'Cancelled', 3, TRUE),
('APPOINTMENT_STATUS', 'COMPLETED', 'مكتمل', 'Completed', 4, TRUE)
ON CONFLICT (type, code) DO NOTHING;
