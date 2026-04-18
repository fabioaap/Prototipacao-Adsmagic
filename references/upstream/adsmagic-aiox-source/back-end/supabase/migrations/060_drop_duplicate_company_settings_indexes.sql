-- Migration 060: Remove duplicate indexes from company_settings
-- Date: 2026-02-14

BEGIN;

-- Keep canonical unique index company_settings_company_id_key.
DROP INDEX IF EXISTS public.idx_company_settings_company_id;
DROP INDEX IF EXISTS public.idx_company_settings_company;

COMMIT;
