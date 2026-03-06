-- Bucket "documents" : à créer dans Supabase Dashboard > Storage > New bucket :
--   - Name: documents
--   - Public: non (accès via signed URLs ou politiques RLS)
--   - File size limit: 10 MB
--   - Allowed MIME types: tous (ou laisser vide pour tout autoriser)
--
-- Structure des chemins : {church_id}/{uuid}_{filename}
-- Lecture : tous les utilisateurs authentifiés
-- Écriture : admin OU membre de l'église (dossier = church_id)

-- Lecture : tous les utilisateurs authentifiés peuvent lire
CREATE POLICY "Authenticated users can read documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    OR bucket_id = 'DOCUMENTS'
  );

-- Insertion : admin ou membre de l'église (dossier = church_id)
CREATE POLICY "Church members and admin can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    (bucket_id = 'documents' OR bucket_id = 'DOCUMENTS')
    AND (
      public.get_my_role() = 'admin'
      OR (storage.foldername(name))[1] = public.get_my_church_id()::text
    )
  );

-- Mise à jour : admin ou membre de l'église
CREATE POLICY "Church members and admin can update documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    (bucket_id = 'documents' OR bucket_id = 'DOCUMENTS')
    AND (
      public.get_my_role() = 'admin'
      OR (storage.foldername(name))[1] = public.get_my_church_id()::text
    )
  )
  WITH CHECK (
    bucket_id = 'documents' OR bucket_id = 'DOCUMENTS'
  );

-- Suppression : admin ou membre de l'église
CREATE POLICY "Church members and admin can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    (bucket_id = 'documents' OR bucket_id = 'DOCUMENTS')
    AND (
      public.get_my_role() = 'admin'
      OR (storage.foldername(name))[1] = public.get_my_church_id()::text
    )
  );
