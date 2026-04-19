-- Migration 065: Migrate link_accesses deduplication to event_id
-- Data: 2026-02-24
-- Descrição: Troca deduplicação técnica de access_uuid para event_id em link_accesses

BEGIN;

-- ==========================================================================
-- NOVA CHAVE DE IDEMPOTÊNCIA POR EVENTO
-- ==========================================================================

ALTER TABLE link_accesses
  ADD COLUMN IF NOT EXISTS event_id UUID;

-- Backfill para registros antigos
UPDATE link_accesses
SET event_id = gen_random_uuid()
WHERE event_id IS NULL;

ALTER TABLE link_accesses
  ALTER COLUMN event_id SET DEFAULT gen_random_uuid();

ALTER TABLE link_accesses
  ALTER COLUMN event_id SET NOT NULL;

-- ==========================================================================
-- TROCA DE CONSTRAINTS DE DEDUPLICAÇÃO
-- ==========================================================================

-- Não deduplicar mais por visitante (access_uuid)
ALTER TABLE link_accesses
  DROP CONSTRAINT IF EXISTS link_accesses_access_uuid_unique;

-- Deduplicação técnica por evento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'link_accesses_event_id_unique'
      AND conrelid = 'link_accesses'::regclass
  ) THEN
    ALTER TABLE link_accesses
      ADD CONSTRAINT link_accesses_event_id_unique UNIQUE (event_id);
  END IF;
END $$;

-- Índice para análises por visitante no contexto do link
CREATE INDEX IF NOT EXISTS idx_link_accesses_link_access_created
  ON link_accesses(link_id, access_uuid, created_at DESC);

-- ==========================================================================
-- DOCUMENTAÇÃO DAS COLUNAS
-- ==========================================================================

COMMENT ON COLUMN link_accesses.event_id IS
  'ID único do evento de clique; usado para idempotência e deduplicação técnica por evento';

COMMENT ON COLUMN link_accesses.access_uuid IS
  'ID do visitante (cookie); pode aparecer em múltiplos eventos de clique';

COMMIT;
