-- Epic 5 : Annonces du siège
-- À exécuter dans Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

-- Insertion, mise à jour et suppression uniquement par le siège
CREATE POLICY "Siege can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'siege'
    )
  );

CREATE POLICY "Siege can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'siege'
    )
  );

CREATE POLICY "Siege can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'siege'
    )
  );
