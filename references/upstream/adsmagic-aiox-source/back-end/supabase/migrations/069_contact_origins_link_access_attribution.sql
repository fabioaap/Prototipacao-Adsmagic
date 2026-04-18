-- Migration 069: Link contact_origins to link_accesses and add attribution metadata
-- Date: 2026-02-26

BEGIN;

ALTER TABLE public.contact_origins
  ADD COLUMN IF NOT EXISTS link_access_id UUID REFERENCES public.link_accesses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS attribution_source TEXT,
  ADD COLUMN IF NOT EXISTS attribution_priority SMALLINT NOT NULL DEFAULT 100;

CREATE INDEX IF NOT EXISTS idx_contact_origins_contact_acquired_at
  ON public.contact_origins(contact_id, acquired_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_origins_link_access_id
  ON public.contact_origins(link_access_id)
  WHERE link_access_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_origins_contact_source
  ON public.contact_origins(contact_id, source_app, acquired_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_origins_contact_link_access
  ON public.contact_origins(contact_id, link_access_id)
  WHERE link_access_id IS NOT NULL;

COMMENT ON COLUMN public.contact_origins.link_access_id IS
  'Sessao tecnica de clique vinculada para auditoria e atribuicao por protocolo';

COMMENT ON COLUMN public.contact_origins.attribution_source IS
  'Fonte da atribuicao: whatsapp_protocol, native_webhook, manual etc';

COMMENT ON COLUMN public.contact_origins.attribution_priority IS
  'Prioridade tecnica usada para reconciliacao de atribuicoes (menor = maior prioridade)';

COMMIT;
