-- Epic 4 : Carte des besoins - Demandes et propositions
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Table des demandes (intervenant, salle, ressource)
CREATE TABLE IF NOT EXISTS demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('intervenant', 'salle', 'ressource')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des propositions (réponses aux demandes)
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id UUID NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demands_church_id ON demands(church_id);
CREATE INDEX IF NOT EXISTS idx_demands_type ON demands(type);
CREATE INDEX IF NOT EXISTS idx_demands_created_at ON demands(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_demand_id ON proposals(demand_id);
CREATE INDEX IF NOT EXISTS idx_proposals_church_id ON proposals(church_id);

ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Demandes : lecture pour tous les authentifiés
CREATE POLICY "Authenticated users can read demands"
  ON demands FOR SELECT
  TO authenticated
  USING (true);

-- Demandes : insertion par contributeurs de leur église ou siège
CREATE POLICY "Contributeurs and siege can insert demands"
  ON demands FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND (
        (ur.role = 'siege')
        OR (ur.role = 'contributeur' AND ur.church_id = demands.church_id)
      )
    )
  );

-- Demandes : mise à jour et suppression par créateur (église) ou siège
CREATE POLICY "Contributeurs and siege can update demands"
  ON demands FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND (
        (ur.role = 'siege')
        OR (ur.role = 'contributeur' AND ur.church_id = demands.church_id)
      )
    )
  );

CREATE POLICY "Contributeurs and siege can delete demands"
  ON demands FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND (
        (ur.role = 'siege')
        OR (ur.role = 'contributeur' AND ur.church_id = demands.church_id)
      )
    )
  );

-- Propositions : lecture pour tous les authentifiés
CREATE POLICY "Authenticated users can read proposals"
  ON proposals FOR SELECT
  TO authenticated
  USING (true);

-- Propositions : insertion par contributeurs de leur église ou siège
CREATE POLICY "Contributeurs and siege can insert proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND (
        (ur.role = 'siege')
        OR (ur.role = 'contributeur' AND ur.church_id = proposals.church_id)
      )
    )
  );

-- Propositions : mise à jour et suppression par créateur ou siège
CREATE POLICY "Contributeurs and siege can update proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND (
        (ur.role = 'siege')
        OR (ur.role = 'contributeur' AND ur.church_id = proposals.church_id)
      )
    )
  );

CREATE POLICY "Contributeurs and siege can delete proposals"
  ON proposals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND (
        (ur.role = 'siege')
        OR (ur.role = 'contributeur' AND ur.church_id = proposals.church_id)
      )
    )
  );
