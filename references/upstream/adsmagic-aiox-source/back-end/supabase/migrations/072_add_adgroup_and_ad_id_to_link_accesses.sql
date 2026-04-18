-- Migration 072: Add adgroup_id and ad_id to link_accesses
-- Date: 2026-02-28
-- Description: Persist ad group and ad identifiers from tracking URLs for protocol attribution.

BEGIN;

ALTER TABLE public.link_accesses
  ADD COLUMN IF NOT EXISTS adgroup_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ad_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_link_accesses_adgroup_id
  ON public.link_accesses(adgroup_id)
  WHERE adgroup_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_link_accesses_ad_id
  ON public.link_accesses(ad_id)
  WHERE ad_id IS NOT NULL;

COMMENT ON COLUMN public.link_accesses.adgroup_id IS
  'Ad group/ad set identifier captured from click URL (adgroup_id parameter).';

COMMENT ON COLUMN public.link_accesses.ad_id IS
  'Ad creative identifier captured from click URL (ad_id parameter).';

COMMIT;
