-- ============================================================
-- DIAGNOSTIC : État de la migration 020 (responsable_siège → admin)
-- Exécuter ce script dans le SQL Editor Supabase pour savoir où vous en êtes.
-- ============================================================

-- 1) La migration 020 est-elle enregistrée par Supabase ?
SELECT version, name 
FROM supabase_migrations.schema_migrations 
WHERE name LIKE '%020%';

-- Si une ligne s'affiche : Supabase considère que la migration a été appliquée (via db push).
-- Si vide : la migration n'a jamais été appliquée via Supabase CLI.


-- 2) Y a-t-il encore des rôles "responsable_siège" dans user_roles ?
SELECT role, COUNT(*) 
FROM user_roles 
GROUP BY role;

-- Si "responsable_siège" apparaît : la migration des données n'est pas faite.
-- Si seulement admin, responsable_eglise, membre : les données sont migrées.


-- 3) La contrainte user_roles_role_check existe-t-elle ? Quelles valeurs accepte-t-elle ?
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint 
WHERE conrelid = 'public.user_roles'::regclass 
  AND contype = 'c';

-- Si la définition contient 'admin' : la contrainte est à jour.
-- Si elle contient 'responsable_siège' : l'ancienne contrainte est encore là.


-- 4) Les anciennes politiques "Responsable siege" existent-elles encore ?
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE policyname LIKE '%Responsable siege%' OR policyname LIKE '%siege%'
ORDER BY tablename;

-- Si des lignes s'affichent : les anciennes politiques sont encore présentes.
-- Si vide : elles ont été remplacées.


-- 5) Les nouvelles politiques "Admin" existent-elles ?
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE policyname LIKE '%Admin can%' OR policyname = 'Admin or eglise can insert prayer_slot_signups'
ORDER BY tablename
LIMIT 5;

-- Si des lignes s'affichent : les nouvelles politiques sont en place.
