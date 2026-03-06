-- Espace de partage de documents par église
-- Chaque église a un dossier ; les membres de l'église peuvent CRUD dans leur dossier.
-- L'admin a tous les droits. Tous les membres authentifiés peuvent lire.

-- Table des métadonnées des documents (fichiers stockés dans Supabase Storage)
CREATE TABLE IF NOT EXISTS church_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(church_id, storage_path)
);

CREATE INDEX IF NOT EXISTS idx_church_documents_church_id ON church_documents(church_id);
CREATE INDEX IF NOT EXISTS idx_church_documents_created_at ON church_documents(created_at DESC);

ALTER TABLE church_documents ENABLE ROW LEVEL SECURITY;

-- Lecture : tous les utilisateurs authentifiés peuvent lire
CREATE POLICY "Authenticated users can read church_documents"
  ON church_documents FOR SELECT
  TO authenticated
  USING (true);

-- Insertion : membre de l'église ou admin
CREATE POLICY "Church members and admin can insert church_documents"
  ON church_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_church_id() = church_id)
  );

-- Mise à jour : membre de l'église ou admin
CREATE POLICY "Church members and admin can update church_documents"
  ON church_documents FOR UPDATE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_church_id() = church_id)
  )
  WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_church_id() = church_id)
  );

-- Suppression : membre de l'église ou admin
CREATE POLICY "Church members and admin can delete church_documents"
  ON church_documents FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_church_id() = church_id)
  );
