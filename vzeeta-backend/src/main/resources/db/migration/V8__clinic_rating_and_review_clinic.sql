SET search_path TO vzeeta_mgmt;

ALTER TABLE clinics ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2);
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS rating_count INT;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS clinic_id BIGINT REFERENCES clinics(id);

UPDATE reviews r
SET clinic_id = d.clinic_id
FROM doctors d
WHERE r.doctor_id = d.id
AND r.clinic_id IS NULL;

UPDATE clinics c
SET rating_avg = agg.avg_rating,
    rating_count = agg.review_count
FROM (
    SELECT clinic_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS review_count
    FROM reviews
    WHERE clinic_id IS NOT NULL
    GROUP BY clinic_id
) agg
WHERE c.id = agg.clinic_id;
