-- Permettre aux responsables d'église de modifier/supprimer toute inscription de leur église.
-- Ainsi, si un responsable est absent, un autre responsable de la même église peut effectuer les modifications.

DROP POLICY IF EXISTS "Added by or self can update prayer_slot_signups" ON prayer_slot_signups;
CREATE POLICY "Added by or self or responsable eglise can update prayer_slot_signups"
  ON prayer_slot_signups FOR UPDATE
  TO authenticated
  USING (
    added_by_user_id = auth.uid()
    OR user_id = auth.uid()
    OR (public.get_my_role() = 'responsable_eglise' AND church_id = public.get_my_church_id())
  );

DROP POLICY IF EXISTS "Added by or self can delete prayer_slot_signups" ON prayer_slot_signups;
CREATE POLICY "Added by or self or responsable eglise can delete prayer_slot_signups"
  ON prayer_slot_signups FOR DELETE
  TO authenticated
  USING (
    added_by_user_id = auth.uid()
    OR user_id = auth.uid()
    OR (public.get_my_role() = 'responsable_eglise' AND church_id = public.get_my_church_id())
  );
