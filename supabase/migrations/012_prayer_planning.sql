-- Planning de prière partagé (visible par tous, distinct du calendrier des programmes)
-- Le responsable siège crée les sessions ; les responsables (siège + église) peuvent inscrire
-- des membres de leur église ou s'inscrire eux-mêmes.
-- Par créneau horaire : chaque église peut ajouter de 1 à 3 noms (remplaçants en cas d'indisponibilité).
-- Fuseau : Europe/Paris.

-- 1) Sessions de prière (créées uniquement par responsable_siège)
CREATE TABLE prayer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE prayer_sessions IS 'Temps de prière planifiés (ex. 22h-6h un jour donné). Un même jour peut avoir plusieurs sessions.';
COMMENT ON COLUMN prayer_sessions.session_date IS 'Date du début du temps de prière';
COMMENT ON COLUMN prayer_sessions.start_time IS 'Heure de début (ex. 22:00)';
COMMENT ON COLUMN prayer_sessions.end_time IS 'Heure de fin (ex. 06:00), peut être le lendemain';

CREATE INDEX idx_prayer_sessions_date ON prayer_sessions(session_date);

-- 2) Inscriptions par créneau horaire (max 3 par session + heure + église)
CREATE TABLE prayer_slot_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_session_id UUID NOT NULL REFERENCES prayer_sessions(id) ON DELETE CASCADE,
  slot_time TIME NOT NULL,
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prayer_session_id, slot_time, user_id),
  CHECK (church_id IS NOT NULL)
);

COMMENT ON TABLE prayer_slot_signups IS 'Inscriptions aux créneaux horaires (1h). Par créneau : chaque église peut ajouter 1 à 3 noms (remplaçants). user_id = personne affichée ; added_by = qui a fait l''inscription.';
COMMENT ON COLUMN prayer_slot_signups.church_id IS 'Église du membre inscrit (déduite de user_roles, utilisée pour la limite 3/église/créneau).';
COMMENT ON COLUMN prayer_slot_signups.slot_time IS 'Heure du créneau (ex. 22:00, 23:00, 00:00...)';
COMMENT ON COLUMN prayer_slot_signups.added_by_user_id IS 'Qui a ajouté cette inscription (seul lui ou user_id peut modifier/supprimer)';

CREATE INDEX idx_prayer_slot_signups_session ON prayer_slot_signups(prayer_session_id);
CREATE INDEX idx_prayer_slot_signups_church ON prayer_slot_signups(church_id);
CREATE INDEX idx_prayer_slot_signups_user ON prayer_slot_signups(user_id);

-- 3a) Définir church_id à partir de l'église du user_id (obligatoire : membre d'une église)
CREATE OR REPLACE FUNCTION set_prayer_slot_church_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cid uuid;
BEGIN
  SELECT church_id INTO cid FROM user_roles WHERE user_id = NEW.user_id AND church_id IS NOT NULL LIMIT 1;
  IF cid IS NULL THEN
    RAISE EXCEPTION 'L''utilisateur doit être membre d''une église pour être inscrit au planning de prière.';
  END IF;
  NEW.church_id := cid;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_prayer_slot_church_id
  BEFORE INSERT OR UPDATE OF user_id ON prayer_slot_signups
  FOR EACH ROW
  EXECUTE FUNCTION set_prayer_slot_church_id();

-- 3b) Contrainte : max 3 inscriptions par (session, créneau, église)
CREATE OR REPLACE FUNCTION check_prayer_slot_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n int;
BEGIN
  -- church_id est déjà renseigné (par le trigger set_prayer_slot_church_id)
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*) INTO n
    FROM prayer_slot_signups
    WHERE prayer_session_id = NEW.prayer_session_id AND slot_time = NEW.slot_time AND church_id = NEW.church_id;
  ELSE
    SELECT COUNT(*) INTO n
    FROM prayer_slot_signups
    WHERE prayer_session_id = NEW.prayer_session_id AND slot_time = NEW.slot_time AND church_id = NEW.church_id AND id <> NEW.id;
  END IF;
  IF n >= 3 THEN
    RAISE EXCEPTION 'Votre église a déjà 3 noms pour ce créneau horaire (maximum autorisé par église).';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_prayer_slot_capacity
  BEFORE INSERT OR UPDATE OF prayer_session_id, slot_time ON prayer_slot_signups
  FOR EACH ROW
  EXECUTE FUNCTION check_prayer_slot_capacity();

-- 4) Fonction : l'utilisateur est-il membre d'une église (présent dans user_roles avec church_id) ?
CREATE OR REPLACE FUNCTION public.is_church_member(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = uid AND church_id IS NOT NULL);
$$;

-- 5) Fonction : l'utilisateur cible est-il dans l'église de l'utilisateur courant ?
CREATE OR REPLACE FUNCTION public.is_user_in_my_church(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = uid
    AND ur.church_id = (SELECT church_id FROM user_roles WHERE user_id = auth.uid() LIMIT 1)
  );
$$;

-- 6) RLS
ALTER TABLE prayer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_slot_signups ENABLE ROW LEVEL SECURITY;

-- Lecture : tous les utilisateurs authentifiés
CREATE POLICY "Authenticated can read prayer_sessions"
  ON prayer_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can read prayer_slot_signups"
  ON prayer_slot_signups FOR SELECT
  TO authenticated
  USING (true);

-- Sessions : CRUD réservé au responsable siège
CREATE POLICY "Responsable siege can insert prayer_sessions"
  ON prayer_sessions FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'responsable_siège');

CREATE POLICY "Responsable siege can update prayer_sessions"
  ON prayer_sessions FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'responsable_siège');

CREATE POLICY "Responsable siege can delete prayer_sessions"
  ON prayer_sessions FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'responsable_siège');

-- Signups : insertion par responsable (siège ou église)
-- Siège : peut ajouter tout membre d'une église. Église : peut ajouter uniquement les membres de son église ou lui-même.
CREATE POLICY "Responsables can insert prayer_slot_signups"
  ON prayer_slot_signups FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.get_my_role() IN ('responsable_siège', 'responsable_eglise'))
    AND (
      (public.get_my_role() = 'responsable_siège' AND public.is_church_member(user_id))
      OR (public.get_my_role() = 'responsable_eglise' AND (user_id = auth.uid() OR public.is_user_in_my_church(user_id)))
    )
    AND added_by_user_id = auth.uid()
  );

-- Signups : modification/suppression uniquement par l'auteur de l'ajout ou par la personne inscrite
CREATE POLICY "Added by or self can update prayer_slot_signups"
  ON prayer_slot_signups FOR UPDATE
  TO authenticated
  USING (added_by_user_id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Added by or self can delete prayer_slot_signups"
  ON prayer_slot_signups FOR DELETE
  TO authenticated
  USING (added_by_user_id = auth.uid() OR user_id = auth.uid());
