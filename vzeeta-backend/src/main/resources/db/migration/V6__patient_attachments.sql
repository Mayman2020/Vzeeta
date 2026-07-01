SET search_path TO vzeeta_mgmt;

CREATE TABLE IF NOT EXISTS patient_attachments (
    id          BIGSERIAL PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    type        VARCHAR(20) NOT NULL,
    title_ar    VARCHAR(255),
    file_url    VARCHAR(500) NOT NULL,
    notes       TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT patient_attachments_type_chk CHECK (type IN ('XRAY', 'LAB', 'SCAN', 'OTHER'))
);

CREATE INDEX IF NOT EXISTS idx_patient_attachments_patient ON patient_attachments (patient_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_attachments_type ON patient_attachments (patient_id, type, uploaded_at DESC);
