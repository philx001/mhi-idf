-- Documents : seuls admin et responsable_eglise peuvent déposer/supprimer.
-- Les membres (membre) restent en lecture seule.

DROP POLICY IF EXISTS "Church members and admin can insert church_documents" ON church_documents;
CREATE POLICY "Admin or responsable eglise can insert church_documents"
  ON church_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Church members and admin can update church_documents" ON church_documents;
CREATE POLICY "Admin or responsable eglise can update church_documents"
  ON church_documents FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  )
  WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );

DROP POLICY IF EXISTS "Church members and admin can delete church_documents" ON church_documents;
CREATE POLICY "Admin or responsable eglise can delete church_documents"
  ON church_documents FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'responsable_eglise' AND public.get_my_church_id() = church_id)
  );
