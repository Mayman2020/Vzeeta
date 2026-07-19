SET search_path TO vzeeta_mgmt;

ALTER TABLE clinic_subscriptions ADD COLUMN IF NOT EXISTS doctor_count INT;
ALTER TABLE clinic_subscriptions ADD COLUMN IF NOT EXISTS is_topup BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill existing rows with the clinic's current verified doctor count so the
-- per-doctor pricing baseline is meaningful for already-active free trials.
UPDATE clinic_subscriptions cs
SET doctor_count = COALESCE((
    SELECT COUNT(*) FROM doctors d WHERE d.clinic_id = cs.clinic_id AND d.verified = true
), 0)
WHERE cs.doctor_count IS NULL;
