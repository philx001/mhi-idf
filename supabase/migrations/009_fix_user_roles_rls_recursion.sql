-- Fix: récursion infinie sur user_roles (erreur 42P17)
-- La politique "Siege can read all user_roles" faisait un SELECT sur user_roles,
-- ce qui ré-appliquait les politiques RLS → boucle infinie.
-- Solution : une fonction SECURITY DEFINER qui lit le rôle sans passer par RLS.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Supprimer l'ancienne politique qui provoquait la récursion
DROP POLICY IF EXISTS "Siege can read all user_roles" ON user_roles;

-- Remplacer par une politique qui utilise la fonction (pas de SELECT direct sur user_roles)
CREATE POLICY "Siege can read all user_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'siege');
