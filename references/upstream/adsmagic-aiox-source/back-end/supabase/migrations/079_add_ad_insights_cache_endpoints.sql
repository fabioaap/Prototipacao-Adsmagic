-- Migration: Expand dashboard_cache endpoint CHECK constraint to include ad-insights endpoints
-- Fixes: set_dashboard_cache returning 400 for ad-insights cache writes

BEGIN;

ALTER TABLE dashboard_cache DROP CONSTRAINT IF EXISTS dashboard_cache_endpoint_check;

ALTER TABLE dashboard_cache ADD CONSTRAINT dashboard_cache_endpoint_check CHECK (endpoint IN (
  'summary', 'funnel-stats', 'pipeline-stats', 'origin-breakdown',
  'drill-down', 'time-series', 'metrics', 'settings',
  'ad-insights-summary', 'ad-insights-campaigns',
  'ad-insights-adsets', 'ad-insights-ads', 'ad-insights-performance'
));

COMMIT;
