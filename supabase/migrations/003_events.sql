-- Epic 3 : Table des événements (cultes, études bibliques, etc.)
-- À exécuter dans Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('culte', 'etude_biblique', 'evenement', 'autre')),
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_church_id ON events(church_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- Insertion par contributeurs de leur église ou par le siège
CREATE POLICY "Contributeurs and siege can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND (
        (ur.role = 'siege')
        OR (ur.role = 'contributeur' AND ur.church_id = events.church_id)
      )
    )
  );

-- Mise à jour par contributeurs de leur église ou par le siège
CREATE POLICY "Contributeurs and siege can update events"
  ON events FOR UPDATE
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
