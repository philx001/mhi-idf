-- Étendre les sessions de planning : type de programme (prière, culte, etc.),
-- type de présence (présentiel / en ligne / autre) et lieu si présentiel.

ALTER TABLE prayer_sessions
  ADD COLUMN IF NOT EXISTS program_type TEXT NOT NULL DEFAULT 'prière'
    CHECK (program_type IN ('prière', 'étude biblique', 'culte', 'autre')),
  ADD COLUMN IF NOT EXISTS attendance_type TEXT NOT NULL DEFAULT 'presentiel'
    CHECK (attendance_type IN ('presentiel', 'en_ligne', 'autre')),
  ADD COLUMN IF NOT EXISTS location TEXT;

COMMENT ON COLUMN prayer_sessions.program_type IS 'Type de programme : prière, étude biblique, culte, autre';
COMMENT ON COLUMN prayer_sessions.attendance_type IS 'En présentiel, en ligne ou autre';
COMMENT ON COLUMN prayer_sessions.location IS 'Lieu (si en présentiel)';

-- Mise à jour des lignes existantes si la colonne venait d'être ajoutée avec une valeur par défaut
UPDATE prayer_sessions
SET program_type = 'prière', attendance_type = 'presentiel'
WHERE program_type IS NULL OR attendance_type IS NULL;
