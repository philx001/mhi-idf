-- MHI-IDF - Attribuer le rôle siège à un utilisateur
-- Utilisez cette requête pour créer OU mettre à jour le rôle (fonctionne dans les deux cas).
--
-- 1. Récupérez l'UUID de l'utilisateur : Supabase > Authentication > Users > cliquer sur l'utilisateur > copier "User UID"
-- 2. Remplacez VOTRE_USER_UID ci-dessous par cet UUID
-- 3. Cliquez sur Run pour exécuter la requête

INSERT INTO user_roles (user_id, role, church_id)
VALUES ('VOTRE_USER_UID', 'siege', NULL)
ON CONFLICT (user_id) DO UPDATE SET role = 'siege', church_id = NULL;

-- Exemple pour test1@gmail.com (UUID 7d36f93c-02ed-4456-892f-8d867ff9391c) :
-- INSERT INTO user_roles (user_id, role, church_id)
-- VALUES ('7d36f93c-02ed-4456-892f-8d867ff9391c', 'siege', NULL)
-- ON CONFLICT (user_id) DO UPDATE SET role = 'siege', church_id = NULL;
