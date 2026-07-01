SET search_path TO vzeeta_mgmt;

-- CLINIC_ADMIN: add specialties + lab_results modules (UI routes require permissionGuard)
UPDATE role_permissions
SET permissions_json = permissions_json::jsonb
    || '{
  "specialties": {"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":false,"export":false,"approve":false},
  "lab_results": {"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":false,"export":false,"approve":false}
}'::jsonb,
    updated_at = NOW()
WHERE role = 'CLINIC_ADMIN';

-- PATIENT: add profile module (sidebar profile link uses permissionKey profile)
UPDATE role_permissions
SET permissions_json = permissions_json::jsonb
    || '{
  "profile": {"enabled":true,"menu":true,"view":true,"create":false,"edit":true,"delete":false,"export":false,"approve":false}
}'::jsonb,
    updated_at = NOW()
WHERE role = 'PATIENT';
