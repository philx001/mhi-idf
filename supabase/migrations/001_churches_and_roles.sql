-- MHI-IDF - Schéma initial (Story 2.1)
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Table des églises (créée en premier car user_roles y fait référence)
CREATE TABLE IF NOT EXISTS churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  contacts JSONB DEFAULT '{}',
  specialities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des rôles utilisateurs (siège vs contributeur)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('siege', 'contributeur')),
  church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Index pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_churches_is_active ON churches(is_active);

-- RLS : activer la sécurité au niveau des lignes
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

-- user_roles : chaque utilisateur voit son propre rôle
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- churches : lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read churches"
  ON churches FOR SELECT
  TO authenticated
  USING (true);

-- churches : insertion/modification uniquement par le siège
CREATE POLICY "Siege can insert churches"
  ON churches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'siege'
    )
  );

CREATE POLICY "Siege can update churches"
  ON churches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'siege'
    )
  );
