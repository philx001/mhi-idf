-- Politique de suppression pour les événements
-- À exécuter dans Supabase Dashboard > SQL Editor

CREATE POLICY "Contributeurs and siege can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND (
        (ur.role = 'siege')
        OR (ur.role = 'contributeur' AND ur.church_id = events.church_id)
      )
    )
  );
