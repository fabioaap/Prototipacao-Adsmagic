-- Migration 070: Sync trackable_links.contacts_count from link_accesses conversions
-- Date: 2026-02-28
--
-- Objetivo:
-- 1) Tornar contacts_count derivado de link_accesses.contact_id (contatos unicos por link)
-- 2) Cobrir conversoes via UPDATE em link_accesses
-- 3) Recalcular historico e limpar caracteres invisiveis em templates WhatsApp

BEGIN;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.remove_whatsapp_protocol_invisible_chars(p_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_text IS NULL THEN NULL
    ELSE replace(
      replace(
        replace(
          replace(p_text, chr(8203), ''), -- U+200B
          chr(8204), ''                   -- U+200C
        ),
        chr(8205), ''                     -- U+200D
      ),
      chr(8288), ''                       -- U+2060
    )
  END
$$;

CREATE OR REPLACE FUNCTION public.recompute_trackable_link_contacts_count(p_link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
DECLARE
  v_next_count integer;
BEGIN
  IF p_link_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COUNT(DISTINCT la.contact_id)::integer
    INTO v_next_count
  FROM public.link_accesses la
  WHERE la.link_id = p_link_id
    AND la.contact_id IS NOT NULL;

  UPDATE public.trackable_links tl
  SET contacts_count = COALESCE(v_next_count, 0),
      updated_at = NOW()
  WHERE tl.id = p_link_id
    AND tl.contacts_count IS DISTINCT FROM COALESCE(v_next_count, 0);
END;
$$;

-- ---------------------------------------------------------------------------
-- Trigger em link_accesses para sincronizar contacts_count
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_link_contacts_count_from_accesses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recompute_trackable_link_contacts_count(NEW.link_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_trackable_link_contacts_count(OLD.link_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.link_id IS DISTINCT FROM OLD.link_id THEN
      PERFORM public.recompute_trackable_link_contacts_count(OLD.link_id);
      PERFORM public.recompute_trackable_link_contacts_count(NEW.link_id);
      RETURN NEW;
    END IF;

    IF NEW.contact_id IS DISTINCT FROM OLD.contact_id THEN
      PERFORM public.recompute_trackable_link_contacts_count(NEW.link_id);
    END IF;

    RETURN NEW;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS link_accesses_contacts_count_sync_trigger ON public.link_accesses;
CREATE TRIGGER link_accesses_contacts_count_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.link_accesses
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_link_contacts_count_from_accesses();

-- ---------------------------------------------------------------------------
-- Desativar contagem legada baseada em contacts.main_origin_id
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS contacts_insert_link_counter_trigger ON public.contacts;
DROP TRIGGER IF EXISTS contacts_delete_link_counter_trigger ON public.contacts;

-- ---------------------------------------------------------------------------
-- Indice de suporte para recomputo por link/contacto
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_link_accesses_link_contact_not_null
  ON public.link_accesses (link_id, contact_id)
  WHERE contact_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Backfill global de contacts_count (contatos unicos por link)
-- ---------------------------------------------------------------------------

UPDATE public.trackable_links tl
SET contacts_count = src.cnt,
    updated_at = NOW()
FROM (
  SELECT la.link_id, COUNT(DISTINCT la.contact_id)::integer AS cnt
  FROM public.link_accesses la
  WHERE la.contact_id IS NOT NULL
  GROUP BY la.link_id
) src
WHERE tl.id = src.link_id
  AND tl.contacts_count IS DISTINCT FROM src.cnt;

UPDATE public.trackable_links tl
SET contacts_count = 0,
    updated_at = NOW()
WHERE tl.contacts_count <> 0
  AND NOT EXISTS (
    SELECT 1
    FROM public.link_accesses la
    WHERE la.link_id = tl.id
      AND la.contact_id IS NOT NULL
  );

-- ---------------------------------------------------------------------------
-- Limpeza global de caracteres invisiveis em templates WhatsApp
-- ---------------------------------------------------------------------------

UPDATE public.trackable_links tl
SET initial_message = public.remove_whatsapp_protocol_invisible_chars(tl.initial_message),
    updated_at = NOW()
WHERE tl.initial_message IS NOT NULL
  AND tl.initial_message IS DISTINCT FROM public.remove_whatsapp_protocol_invisible_chars(tl.initial_message);

UPDATE public.trackable_links tl
SET whatsapp_message_template = public.remove_whatsapp_protocol_invisible_chars(tl.whatsapp_message_template),
    updated_at = NOW()
WHERE tl.whatsapp_message_template IS NOT NULL
  AND tl.whatsapp_message_template IS DISTINCT FROM public.remove_whatsapp_protocol_invisible_chars(tl.whatsapp_message_template);

COMMIT;
