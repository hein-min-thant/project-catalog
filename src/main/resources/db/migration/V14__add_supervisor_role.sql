-- Update the role constraint to include SUPERVISOR
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'SUPERVISOR'));

-- Optionally, you can set specific users as supervisors by running:
-- UPDATE users SET role = 'SUPERVISOR' WHERE email = 'supervisor@example.com';
