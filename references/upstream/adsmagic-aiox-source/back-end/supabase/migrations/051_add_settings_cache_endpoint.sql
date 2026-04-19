-- ============================================================================
-- Migration 051: Add 'settings' endpoint to dashboard_cache
-- ============================================================================
-- Objetivo: Permitir cache de settings para reduzir latência (13.4s -> <500ms)
-- Data: 2026-02-02
-- ============================================================================

BEGIN;

-- Atualizar CHECK constraint para incluir endpoint 'settings'
ALTER TABLE dashboard_cache DROP CONSTRAINT IF EXISTS dashboard_cache_endpoint_check;

ALTER TABLE dashboard_cache ADD CONSTRAINT dashboard_cache_endpoint_check CHECK (endpoint IN (
  'summary',
  'funnel-stats',
  'pipeline-stats',
  'origin-breakdown',
  'drill-down',
  'time-series',
  'metrics',
  'settings'
));

COMMENT ON CONSTRAINT dashboard_cache_endpoint_check ON dashboard_cache IS
  'Endpoints válidos para cache: summary, funnel-stats, pipeline-stats, origin-breakdown, drill-down, time-series, metrics, settings';

COMMIT;
