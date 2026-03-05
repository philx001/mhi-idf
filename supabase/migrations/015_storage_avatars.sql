-- Bucket "avatars" : à créer dans le Dashboard Supabase > Storage > New bucket :
--   - Name: avatars
--   - Public: oui
--   - Allowed MIME types: image/* (ou image/jpeg, image/png, image/webp, image/gif)
--   - File size limit: 2 MB
-- Ces politiques RLS permettent à chaque utilisateur d’uploader/modifier/supprimer sa propre photo (dossier = user_id).

-- Lecture : chaque utilisateur peut voir ses propres fichiers (nécessaire après INSERT)
CREATE POLICY "Users can read own avatar"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    (bucket_id = 'avatars' OR bucket_id = 'AVATARS')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Insertion : uniquement dans son dossier (nom = user_id/...)
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    (bucket_id = 'avatars' OR bucket_id = 'AVATARS')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Mise à jour : uniquement ses propres fichiers
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING ((storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK ((bucket_id = 'avatars' OR bucket_id = 'AVATARS'));

-- Suppression : uniquement ses propres fichiers
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    (bucket_id = 'avatars' OR bucket_id = 'AVATARS')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
