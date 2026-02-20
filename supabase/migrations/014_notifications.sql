-- Notifications : 4 niveaux d'importance. Créateur ou responsable siège peuvent modifier/supprimer.
-- Les notifications urgentes déclencheront un envoi d'email aux responsables d'églises (côté app).

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  importance TEXT NOT NULL CHECK (importance IN ('info', 'normal', 'important', 'urgente')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE notifications IS 'Notifications du tableau de bord. 4 niveaux : info, normal, important, urgente. Urgente = envoi mail aux responsables d''églises.';
COMMENT ON COLUMN notifications.importance IS 'info (faible), normal, important, urgente (plus élevée)';
COMMENT ON COLUMN notifications.created_by IS 'Auteur : seul lui ou le responsable siège peut modifier/supprimer.';

CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_importance ON notifications(importance);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Lecture : tous les utilisateurs authentifiés
CREATE POLICY "Authenticated can read notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (true);

-- Création : tout utilisateur authentifié (contributeur ou responsable)
CREATE POLICY "Authenticated can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Modification : auteur ou responsable siège
CREATE POLICY "Creator or siege can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.get_my_role() = 'responsable_siège'
  );

-- Suppression : auteur ou responsable siège
CREATE POLICY "Creator or siege can delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.get_my_role() = 'responsable_siège'
  );
