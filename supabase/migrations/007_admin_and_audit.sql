-- MHI-IDF - Story 6.2 : Révocation d'accès et traçabilité
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Politique : le siège peut lire tous les rôles (pour la gestion des utilisateurs)
CREATE POLICY "Siege can read all user_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'siege'
    )
  );

-- Table d'audit pour tracer les révocations (NFR12)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  details JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at ON audit_log(performed_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_type, target_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Seul le siège peut insérer dans audit_log
CREATE POLICY "Siege can insert audit_log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'siege'
    )
  );

-- Le siège peut lire l'audit
CREATE POLICY "Siege can read audit_log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'siege'
    )
  );
