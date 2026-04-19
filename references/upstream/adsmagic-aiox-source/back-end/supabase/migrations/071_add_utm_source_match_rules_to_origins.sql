-- Migration 071: Add utm_source match rules to custom origins
-- Date: 2026-02-28
--
-- Objetivo:
-- 1) Permitir regras de match de utm_source por origem customizada
-- 2) Suportar modos "exact" e "contains"
-- 3) Evitar duplicidades por projeto para origens ativas

BEGIN;

ALTER TABLE public.origins
  ADD COLUMN IF NOT EXISTS utm_source_match_mode text NULL,
  ADD COLUMN IF NOT EXISTS utm_source_match_value text NULL;

ALTER TABLE public.origins
  DROP CONSTRAINT IF EXISTS origins_utm_source_match_mode_check;

ALTER TABLE public.origins
  ADD CONSTRAINT origins_utm_source_match_mode_check
  CHECK (
    utm_source_match_mode IS NULL
    OR utm_source_match_mode IN ('exact', 'contains')
  );

ALTER TABLE public.origins
  DROP CONSTRAINT IF EXISTS origins_utm_source_match_consistency_check;

ALTER TABLE public.origins
  ADD CONSTRAINT origins_utm_source_match_consistency_check
  CHECK (
    (utm_source_match_mode IS NULL AND utm_source_match_value IS NULL)
    OR (
      utm_source_match_mode IS NOT NULL
      AND utm_source_match_value IS NOT NULL
      AND btrim(utm_source_match_value) <> ''
      AND utm_source_match_value = lower(btrim(utm_source_match_value))
      AND position(' ' in utm_source_match_value) = 0
    )
  );

COMMENT ON COLUMN public.origins.utm_source_match_mode IS
  'Mode to match utm_source for custom attribution (exact|contains).';

COMMENT ON COLUMN public.origins.utm_source_match_value IS
  'Normalized utm_source value used for exact/contains matching.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_origins_project_utm_source_match_rule
  ON public.origins (project_id, utm_source_match_mode, utm_source_match_value)
  WHERE project_id IS NOT NULL
    AND type = 'custom'
    AND is_active = true
    AND utm_source_match_value IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_origins_project_utm_source_match_lookup
  ON public.origins (project_id, type, is_active, utm_source_match_mode, utm_source_match_value)
  WHERE project_id IS NOT NULL
    AND type = 'custom'
    AND is_active = true
    AND utm_source_match_value IS NOT NULL;

COMMIT;
