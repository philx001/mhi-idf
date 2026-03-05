-- À exécuter dans Supabase > SQL Editor si l'upload de photo renvoie encore
-- "new row violates row-level security policy".
-- Ajoute la politique SELECT manquante (lecture après écriture).

CREATE POLICY "Users can read own avatar"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    (bucket_id = 'avatars' OR bucket_id = 'AVATARS')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
