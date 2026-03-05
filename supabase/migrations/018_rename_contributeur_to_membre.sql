-- Renommage du rôle "contributeur" en "membre"
-- À exécuter dans Supabase (SQL Editor) ou via supabase db push.
-- Cette migration :
--   1) met à jour les lignes existantes de user_roles (contributeur -> membre)
--   2) met à jour la contrainte CHECK sur role pour accepter "membre" au lieu de "contributeur".

-- 1) Mettre à jour les données existantes
UPDATE user_roles
SET role = 'membre'
WHERE role = 'contributeur';

-- 2) Mettre à jour la contrainte CHECK sur user_roles.role
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE user_roles
ADD CONSTRAINT user_roles_role_check
CHECK (role IN ('responsable_siège', 'responsable_eglise', 'membre'));

