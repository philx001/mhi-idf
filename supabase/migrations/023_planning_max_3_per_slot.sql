-- Limite : 3 inscriptions maximum par créneau (toutes églises confondues)
-- Remplace la contrainte "3 par église" par "3 total par créneau"

DROP TRIGGER IF EXISTS trigger_prayer_slot_capacity ON prayer_slot_signups;

CREATE OR REPLACE FUNCTION check_prayer_slot_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*) INTO n
    FROM prayer_slot_signups
    WHERE prayer_session_id = NEW.prayer_session_id
      AND slot_time = NEW.slot_time;
  ELSE
    SELECT COUNT(*) INTO n
    FROM prayer_slot_signups
    WHERE prayer_session_id = NEW.prayer_session_id
      AND slot_time = NEW.slot_time
      AND id <> NEW.id;
  END IF;
  IF n >= 3 THEN
    RAISE EXCEPTION 'Ce créneau a déjà 3 inscriptions (maximum autorisé par créneau).';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_prayer_slot_capacity
  BEFORE INSERT OR UPDATE OF prayer_session_id, slot_time ON prayer_slot_signups
  FOR EACH ROW
  EXECUTE FUNCTION check_prayer_slot_capacity();
