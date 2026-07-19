SET search_path TO vzeeta_mgmt;

UPDATE role_permissions
SET permissions_json = permissions_json || '{"subscriptions":{"enabled":true,"menu":true,"view":true,"create":true,"edit":true,"delete":true,"export":true,"approve":true}}'::jsonb
WHERE role = 'SUPER_ADMIN';

UPDATE role_permissions
SET permissions_json = permissions_json || '{"subscriptions":{"enabled":true,"menu":true,"view":true,"create":true,"edit":false,"delete":false,"export":false,"approve":false}}'::jsonb
WHERE role = 'CLINIC_ADMIN';
