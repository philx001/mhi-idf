-- S'assurer que seuls admin et responsable_eglise peuvent créer/modifier/supprimer events et demands.
-- Les membres (membre) restent en lecture seule pour ces contenus.

-- Events : admin ou responsable_eglise uniquement (pas membre)
DROP POLICY IF EXISTS "Admin or eglise can insert events" ON events;
DROP POLICY IF EXISTS "Admin or eglise or membre can insert events" ON events;
CREATE POLICY "Admin or eglise can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Admin or eglise can update events" ON events;
DROP POLICY IF EXISTS "Admin or eglise or membre can update events" ON events;
CREATE POLICY "Admin or eglise can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Admin or eglise can delete events" ON events;
DROP POLICY IF EXISTS "Admin or eglise or membre can delete events" ON events;
CREATE POLICY "Admin or eglise can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

-- Demands : admin ou responsable_eglise uniquement (pas membre)
DROP POLICY IF EXISTS "Admin or eglise can insert demands" ON demands;
DROP POLICY IF EXISTS "Admin or eglise or membre can insert demands" ON demands;
CREATE POLICY "Admin or eglise can insert demands"
  ON demands FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Admin or eglise can update demands" ON demands;
DROP POLICY IF EXISTS "Admin or eglise or membre can update demands" ON demands;
CREATE POLICY "Admin or eglise can update demands"
  ON demands FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Admin or eglise can delete demands" ON demands;
DROP POLICY IF EXISTS "Admin or eglise or membre can delete demands" ON demands;
CREATE POLICY "Admin or eglise can delete demands"
  ON demands FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );
