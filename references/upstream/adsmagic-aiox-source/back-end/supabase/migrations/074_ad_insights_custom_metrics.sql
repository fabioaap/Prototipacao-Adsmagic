-- Migration: Add custom_metrics JSONB column to project_ad_insights_table_config
-- Allows users to define custom funnel metrics (stage_count, sum_stages, divide_stages, cost_per_stage)

ALTER TABLE public.project_ad_insights_table_config
  ADD COLUMN IF NOT EXISTS custom_metrics JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.project_ad_insights_table_config.custom_metrics IS
  'Array of custom metric definitions (NorthStarCustomMetricDefinition[]) for funnel-based metrics';
