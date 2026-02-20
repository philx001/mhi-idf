-- Story 2.3 : Les contributeurs peuvent modifier le profil de leur église
-- À exécuter dans Supabase Dashboard > SQL Editor

CREATE POLICY "Contributeur can update own church"
  ON churches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'contributeur'
      AND church_id = churches.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'contributeur'
      AND church_id = churches.id
    )
  );
