-- Calendriers par église (privé / partagé) et calendrier synthétique
-- visibility: 'private' = visible uniquement par l'église, 'shared' = visible par tout le réseau
-- is_main: événement "principal" pour le calendrier synthétique (modifiable par siège uniquement en pratique)

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'shared'
    CHECK (visibility IN ('private', 'shared')),
  ADD COLUMN IF NOT EXISTS is_main BOOLEAN NOT NULL DEFAULT false;

-- Commentaire pour documentation
COMMENT ON COLUMN events.visibility IS 'private: visible uniquement par les membres de l''église; shared: visible par tout le réseau';
COMMENT ON COLUMN events.is_main IS 'Marqué comme programme principal pour le calendrier synthétique (affichage par le siège)';

-- Mise à jour des événements existants: tous considérés partagés (comportement actuel)
UPDATE events SET visibility = 'shared' WHERE visibility IS NULL;

-- Remplacer la politique de lecture: partagés visibles par tous, privés uniquement par l'église ou le siège
DROP POLICY IF EXISTS "Authenticated users can read events" ON events;

CREATE POLICY "Users can read events by visibility and role"
  ON events FOR SELECT
  TO authenticated
  USING (
    (visibility = 'shared')
    OR (visibility = 'private' AND church_id = public.get_my_church_id())
    OR (public.get_my_role() = 'responsable_siège')
  );

-- Index pour filtrer par visibilité (calendrier synthétique = shared seulement)
CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_visibility_date ON events(visibility, event_date);
