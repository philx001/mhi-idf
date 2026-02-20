-- Trois rôles : responsable_siège, responsable_eglise, contributeur
-- Migration des rôles existants (siege -> responsable_siège) et nouvelles politiques RLS.

-- 1) Fonction pour récupérer l'église de l'utilisateur (évite la récursion dans les politiques)
CREATE OR REPLACE FUNCTION public.get_my_church_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT church_id FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 2) Étendre les valeurs de rôle et migrer les données
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
UPDATE user_roles SET role = 'responsable_siège' WHERE role = 'siege';
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('responsable_siège', 'responsable_eglise', 'contributeur'));

-- 3) Politique user_roles : seul le responsable siège peut lire tous les rôles
DROP POLICY IF EXISTS "Siege can read all user_roles" ON user_roles;
CREATE POLICY "Responsable siege can read all user_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'responsable_siège');

-- 4) Churches : insertion uniquement par responsable siège ; mise à jour par siège ou responsable église (sa propre église)
DROP POLICY IF EXISTS "Siege can insert churches" ON churches;
DROP POLICY IF EXISTS "Siege can update churches" ON churches;
CREATE POLICY "Responsable siege can insert churches"
  ON churches FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'responsable_siège');

CREATE POLICY "Responsable siege or eglise can update churches"
  ON churches FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = id)
  );

-- 5) 002 : plus de mise à jour église par contributeur ; responsable église géré en (4)
DROP POLICY IF EXISTS "Contributeur can update own church" ON churches;

-- 6) Events : écriture (insert/update/delete) par responsable siège ou responsable église (pour son église uniquement)
DROP POLICY IF EXISTS "Contributeurs and siege can insert events" ON events;
DROP POLICY IF EXISTS "Contributeurs and siege can update events" ON events;
DROP POLICY IF EXISTS "Contributeurs and siege can delete events" ON events;

CREATE POLICY "Responsable siege or eglise can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

CREATE POLICY "Responsable siege or eglise can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

CREATE POLICY "Responsable siege or eglise can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

-- 7) Demands : idem
DROP POLICY IF EXISTS "Contributeurs and siege can insert demands" ON demands;
DROP POLICY IF EXISTS "Contributeurs and siege can update demands" ON demands;
DROP POLICY IF EXISTS "Contributeurs and siege can delete demands" ON demands;

CREATE POLICY "Responsable siege or eglise can insert demands"
  ON demands FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

CREATE POLICY "Responsable siege or eglise can update demands"
  ON demands FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

CREATE POLICY "Responsable siege or eglise can delete demands"
  ON demands FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

-- 8) Proposals : idem
DROP POLICY IF EXISTS "Contributeurs and siege can insert proposals" ON proposals;
DROP POLICY IF EXISTS "Contributeurs and siege can update proposals" ON proposals;
DROP POLICY IF EXISTS "Contributeurs and siege can delete proposals" ON proposals;

CREATE POLICY "Responsable siege or eglise can insert proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

CREATE POLICY "Responsable siege or eglise can update proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

CREATE POLICY "Responsable siege or eglise can delete proposals"
  ON proposals FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'responsable_siège'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

-- 9) Announcements : uniquement responsable siège (insert/update/delete)
DROP POLICY IF EXISTS "Siege can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Siege can update announcements" ON announcements;
DROP POLICY IF EXISTS "Siege can delete announcements" ON announcements;

CREATE POLICY "Responsable siege can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'responsable_siège');

CREATE POLICY "Responsable siege can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'responsable_siège');

CREATE POLICY "Responsable siege can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'responsable_siège');

-- 10) Audit log : uniquement responsable siège
DROP POLICY IF EXISTS "Siege can insert audit_log" ON audit_log;
DROP POLICY IF EXISTS "Siege can read audit_log" ON audit_log;

CREATE POLICY "Responsable siege can insert audit_log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'responsable_siège');

CREATE POLICY "Responsable siege can read audit_log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'responsable_siège');
