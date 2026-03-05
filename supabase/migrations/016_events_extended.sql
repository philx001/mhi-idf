-- Nouveaux types d'événement, type_other (si "Autre"), date/heure de fin, lieu présentiel/en ligne

-- Étendre la liste des types autorisés
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;
ALTER TABLE events ADD CONSTRAINT events_type_check CHECK (
  type IN (
    'culte', 'etude_biblique', 'evenement', 'autre',
    'conference_semaine_royale', 'camp', 'retraite_priere', 'conference_thematique'
  )
);

-- Si type = 'autre', texte libre pour préciser
ALTER TABLE events ADD COLUMN IF NOT EXISTS type_other TEXT;

-- Date et heure de fin (optionnelles)
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end_date DATE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end_time TIME;

-- Lieu : "En Présentiel" (saisie du lieu) ou "En Ligne"
ALTER TABLE events ADD COLUMN IF NOT EXISTS place_type TEXT
  CHECK (place_type IS NULL OR place_type IN ('presentiel', 'en_ligne'));
