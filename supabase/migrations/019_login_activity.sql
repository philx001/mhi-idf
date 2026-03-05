-- Journal d'activité : enregistrement des connexions
-- Accessible uniquement par le responsable siège (pas le responsable Croissy)

CREATE TABLE IF NOT EXISTS login_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_activity_created_at ON login_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON login_activity(user_id);

ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

-- L'utilisateur peut insérer sa propre connexion (pour enregistrer après login)
CREATE POLICY "Users can insert own login"
  ON login_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seul le responsable siège peut lire le journal (pas responsable_eglise, pas Croissy)
CREATE POLICY "Responsable siege can read login_activity"
  ON login_activity FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'responsable_siège');
