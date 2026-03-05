-- Carte des besoins : types multiples (array), nouveaux types, importance/urgence

-- 1) Ajouter la colonne types (array) et importance
ALTER TABLE demands ADD COLUMN IF NOT EXISTS types TEXT[] DEFAULT NULL;
ALTER TABLE demands ADD COLUMN IF NOT EXISTS importance TEXT
  CHECK (importance IS NULL OR importance IN ('faible', 'moyen', 'eleve', 'urgent'));

-- 2) Migrer les données existantes : type -> types (un seul élément)
UPDATE demands SET types = ARRAY[type]::text[] WHERE types IS NULL AND type IS NOT NULL;

-- 3) Valeur par défaut pour les lignes sans type (anciennes)
UPDATE demands SET types = ARRAY['autre']::text[] WHERE types IS NULL;

-- 4) Rendre types obligatoire et supprimer l'ancienne colonne type
ALTER TABLE demands ALTER COLUMN types SET NOT NULL;
ALTER TABLE demands ALTER COLUMN types SET DEFAULT ARRAY['autre']::text[];

-- Contrainte : chaque élément de types doit être dans la liste autorisée
ALTER TABLE demands DROP CONSTRAINT IF EXISTS demands_type_check;
ALTER TABLE demands ADD CONSTRAINT demands_types_check CHECK (
  types <@ ARRAY[
    'intervenant', 'salle', 'ressource', 'financier', 'conseil',
    'aide_logistique', 'ressources_spirituelles', 'autre'
  ]::text[]
  AND cardinality(types) >= 1
);

ALTER TABLE demands DROP COLUMN IF EXISTS type;

-- Index pour filtrer par type (contains)
CREATE INDEX IF NOT EXISTS idx_demands_types ON demands USING GIN (types);
