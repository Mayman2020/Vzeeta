SET search_path TO vzeeta_mgmt;

CREATE TABLE IF NOT EXISTS subscription_plans (
    id            BIGSERIAL PRIMARY KEY,
    name_ar       VARCHAR(150) NOT NULL,
    name_en       VARCHAR(150),
    billing_cycle VARCHAR(20) NOT NULL,
    price         NUMERIC(10,2) NOT NULL,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT subscription_plans_billing_cycle_chk CHECK (billing_cycle IN ('MONTHLY', 'YEARLY'))
);

CREATE TABLE IF NOT EXISTS clinic_subscriptions (
    id               BIGSERIAL PRIMARY KEY,
    clinic_id        BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    plan_id          BIGINT REFERENCES subscription_plans(id),
    status           VARCHAR(20) NOT NULL,
    payment_method   VARCHAR(20) NOT NULL,
    receipt_url      VARCHAR(500),
    amount           NUMERIC(10,2),
    start_date       DATE,
    end_date         DATE,
    is_free_trial    BOOLEAN NOT NULL DEFAULT FALSE,
    rejection_reason VARCHAR(500),
    reviewed_by      BIGINT REFERENCES users(id),
    reviewed_at      TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT clinic_subscriptions_status_chk
        CHECK (status IN ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'EXPIRED', 'CANCELLED')),
    CONSTRAINT clinic_subscriptions_payment_method_chk
        CHECK (payment_method IN ('RECEIPT_UPLOAD', 'ONLINE_PLACEHOLDER', 'ADMIN_GRANT'))
);

CREATE INDEX IF NOT EXISTS idx_clinic_subscriptions_clinic ON clinic_subscriptions (clinic_id, status, end_date DESC);
CREATE INDEX IF NOT EXISTS idx_clinic_subscriptions_status ON clinic_subscriptions (status, created_at);

INSERT INTO subscription_plans (name_ar, name_en, billing_cycle, price, sort_order) VALUES
('باقة شهرية', 'Monthly Plan', 'MONTHLY', 15.000, 1),
('باقة سنوية', 'Yearly Plan', 'YEARLY', 150.000, 2)
ON CONFLICT DO NOTHING;

-- Safe rollout: grant every existing clinic a 3-month free trial so hard enforcement
-- (doctors hidden from search / clinic-admin screens locked) doesn't lock anyone out at deploy time.
INSERT INTO clinic_subscriptions (clinic_id, plan_id, status, payment_method, amount, start_date, end_date, is_free_trial)
SELECT id, NULL, 'ACTIVE', 'ADMIN_GRANT', 0, CURRENT_DATE, (CURRENT_DATE + INTERVAL '3 months')::date, TRUE
FROM clinics
WHERE NOT EXISTS (SELECT 1 FROM clinic_subscriptions cs WHERE cs.clinic_id = clinics.id);
