-- Renommage du rôle "responsable_siège" en "admin"
-- Le rôle admin a les droits les plus élevés. Attribution à philippe.diarra@gmail.com.
-- SCRIPT IDEMPOTENT : peut être exécuté plusieurs fois sans erreur.

-- 1) Supprimer la contrainte actuelle (IF EXISTS = pas d'erreur si déjà supprimée)
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- 2) Mettre à jour les données (WHERE = 0 lignes si déjà migré)
UPDATE user_roles
SET role = 'admin'
WHERE role = 'responsable_siège';

-- 3) Réajouter la contrainte (on a drop au début, donc pas de doublon)
ALTER TABLE user_roles
ADD CONSTRAINT user_roles_role_check
CHECK (role IN ('admin', 'responsable_eglise', 'membre'));

-- 4) Attribuer le rôle admin à philippe.diarra@gmail.com (ON CONFLICT = idempotent)
INSERT INTO user_roles (user_id, role, church_id)
SELECT id, 'admin', NULL FROM auth.users WHERE email = 'philippe.diarra@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', church_id = NULL;

-- 5) Politiques RLS : DROP ancien ET nouveau nom avant CREATE (idempotent)
DROP POLICY IF EXISTS "Responsable siege can read all user_roles" ON user_roles;
DROP POLICY IF EXISTS "Admin can read all user_roles" ON user_roles;
CREATE POLICY "Admin can read all user_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- 6) Churches
DROP POLICY IF EXISTS "Responsable siege can insert churches" ON churches;
DROP POLICY IF EXISTS "Admin can insert churches" ON churches;
CREATE POLICY "Admin can insert churches"
  ON churches FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Responsable siege or eglise can update churches" ON churches;
DROP POLICY IF EXISTS "Admin or eglise can update churches" ON churches;
CREATE POLICY "Admin or eglise can update churches"
  ON churches FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = id)
  );

-- 7) Events
DROP POLICY IF EXISTS "Responsable siege or eglise can insert events" ON events;
DROP POLICY IF EXISTS "Admin or eglise can insert events" ON events;
CREATE POLICY "Admin or eglise can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Responsable siege or eglise can update events" ON events;
DROP POLICY IF EXISTS "Admin or eglise can update events" ON events;
CREATE POLICY "Admin or eglise can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Responsable siege or eglise can delete events" ON events;
DROP POLICY IF EXISTS "Admin or eglise can delete events" ON events;
CREATE POLICY "Admin or eglise can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

-- 8) Demands
DROP POLICY IF EXISTS "Responsable siege or eglise can insert demands" ON demands;
DROP POLICY IF EXISTS "Admin or eglise can insert demands" ON demands;
CREATE POLICY "Admin or eglise can insert demands"
  ON demands FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Responsable siege or eglise can update demands" ON demands;
DROP POLICY IF EXISTS "Admin or eglise can update demands" ON demands;
CREATE POLICY "Admin or eglise can update demands"
  ON demands FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Responsable siege or eglise can delete demands" ON demands;
DROP POLICY IF EXISTS "Admin or eglise can delete demands" ON demands;
CREATE POLICY "Admin or eglise can delete demands"
  ON demands FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

-- 9) Proposals
DROP POLICY IF EXISTS "Responsable siege or eglise can insert proposals" ON proposals;
DROP POLICY IF EXISTS "Admin or eglise can insert proposals" ON proposals;
CREATE POLICY "Admin or eglise can insert proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Responsable siege or eglise can update proposals" ON proposals;
DROP POLICY IF EXISTS "Admin or eglise can update proposals" ON proposals;
CREATE POLICY "Admin or eglise can update proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Responsable siege or eglise can delete proposals" ON proposals;
DROP POLICY IF EXISTS "Admin or eglise can delete proposals" ON proposals;
CREATE POLICY "Admin or eglise can delete proposals"
  ON proposals FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

-- 10) Announcements
DROP POLICY IF EXISTS "Responsable siege can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can insert announcements" ON announcements;
CREATE POLICY "Admin can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Responsable siege can update announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can update announcements" ON announcements;
CREATE POLICY "Admin can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Responsable siege can delete announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can delete announcements" ON announcements;
CREATE POLICY "Admin can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- 11) Audit log
DROP POLICY IF EXISTS "Responsable siege can insert audit_log" ON audit_log;
DROP POLICY IF EXISTS "Admin can insert audit_log" ON audit_log;
CREATE POLICY "Admin can insert audit_log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Responsable siege can read audit_log" ON audit_log;
DROP POLICY IF EXISTS "Admin can read audit_log" ON audit_log;
CREATE POLICY "Admin can read audit_log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- 12) Prayer sessions
DROP POLICY IF EXISTS "Responsable siege can insert prayer_sessions" ON prayer_sessions;
DROP POLICY IF EXISTS "Admin can insert prayer_sessions" ON prayer_sessions;
CREATE POLICY "Admin can insert prayer_sessions"
  ON prayer_sessions FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Responsable siege can update prayer_sessions" ON prayer_sessions;
DROP POLICY IF EXISTS "Admin can update prayer_sessions" ON prayer_sessions;
CREATE POLICY "Admin can update prayer_sessions"
  ON prayer_sessions FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Responsable siege can delete prayer_sessions" ON prayer_sessions;
DROP POLICY IF EXISTS "Admin can delete prayer_sessions" ON prayer_sessions;
CREATE POLICY "Admin can delete prayer_sessions"
  ON prayer_sessions FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- 13) Prayer slot signups
DROP POLICY IF EXISTS "Responsables can insert prayer_slot_signups" ON prayer_slot_signups;
DROP POLICY IF EXISTS "Admin or eglise can insert prayer_slot_signups" ON prayer_slot_signups;
CREATE POLICY "Admin or eglise can insert prayer_slot_signups"
  ON prayer_slot_signups FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.get_my_role() IN ('admin', 'responsable_eglise'))
    AND (
      (public.get_my_role() = 'admin' AND public.is_church_member(user_id))
      OR (public.get_my_role() = 'responsable_eglise' AND (user_id = auth.uid() OR public.is_user_in_my_church(user_id)))
    )
    AND added_by_user_id = auth.uid()
  );

-- 14) Login activity
DROP POLICY IF EXISTS "Responsable siege can read login_activity" ON login_activity;
DROP POLICY IF EXISTS "Admin can read login_activity" ON login_activity;
CREATE POLICY "Admin can read login_activity"
  ON login_activity FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- 15) Events visibility (policy 011)
DROP POLICY IF EXISTS "Users can read events by visibility and role" ON events;
CREATE POLICY "Users can read events by visibility and role"
  ON events FOR SELECT
  TO authenticated
  USING (
    (visibility = 'shared')
    OR (visibility = 'private' AND church_id = public.get_my_church_id())
    OR (public.get_my_role() = 'admin')
  );

-- 16) Notifications
DROP POLICY IF EXISTS "Creator or siege can update notifications" ON notifications;
DROP POLICY IF EXISTS "Creator or admin can update notifications" ON notifications;
CREATE POLICY "Creator or admin can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.get_my_role() = 'admin'
  );

DROP POLICY IF EXISTS "Creator or siege can delete notifications" ON notifications;
DROP POLICY IF EXISTS "Creator or admin can delete notifications" ON notifications;
CREATE POLICY "Creator or admin can delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.get_my_role() = 'admin'
  );
