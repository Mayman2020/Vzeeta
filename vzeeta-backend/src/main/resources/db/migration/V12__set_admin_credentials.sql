SET search_path TO vzeeta_mgmt;
UPDATE users SET password_hash = '$2b$10$49wu0oR2J3vEOrZkEGsLMuLFpKEt3nrQ9pnquwuvfZu2ceMvriOnq', active = TRUE
WHERE role = 'SUPER_ADMIN' AND email = 'superadmin@tabeebi.com';
