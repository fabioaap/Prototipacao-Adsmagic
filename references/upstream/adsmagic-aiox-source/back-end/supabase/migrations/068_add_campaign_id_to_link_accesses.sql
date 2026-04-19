-- Migration 068: Add campaign_id to link_accesses
-- Date: 2026-02-26
-- Descrição: Persistir campaign_id explícito no clique para atribuição por protocolo

BEGIN;

ALTER TABLE public.link_accesses
  ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_link_accesses_campaign_id
  ON public.link_accesses(campaign_id)
  WHERE campaign_id IS NOT NULL;

COMMENT ON COLUMN public.link_accesses.campaign_id IS
  'ID lógico de campanha capturado no clique (ex.: campaign_id da URL/tag)';

COMMIT;
