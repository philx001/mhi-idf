-- Confirmer les utilisateurs créés avant la désactivation de "Confirm email"
-- À exécuter une seule fois dans Supabase Dashboard → SQL Editor
--
-- Met à jour auth.users pour les utilisateurs dont l'email n'est pas encore confirmé,
-- afin qu'ils puissent se connecter sans "Waiting for verification".
-- (confirmed_at est une colonne générée, elle se met à jour automatiquement.)

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
