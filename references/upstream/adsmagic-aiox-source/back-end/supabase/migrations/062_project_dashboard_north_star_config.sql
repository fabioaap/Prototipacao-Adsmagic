-- ============================================================================
-- Migration 062: Configuracao personalizavel da North Star por projeto
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_dashboard_north_star_config (
  project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  primary_metric_ids TEXT[] NOT NULL DEFAULT '{}'::text[],
  detailed_metric_order TEXT[] NOT NULL DEFAULT '{}'::text[],
  custom_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT north_star_primary_limit CHECK (cardinality(primary_metric_ids) <= 4),
  CONSTRAINT north_star_custom_metrics_array CHECK (jsonb_typeof(custom_metrics) = 'array')
);

CREATE TRIGGER project_dashboard_north_star_config_updated_at_trigger
  BEFORE UPDATE ON public.project_dashboard_north_star_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.project_dashboard_north_star_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view north star config in their projects"
  ON public.project_dashboard_north_star_config
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_users pu
      WHERE pu.project_id = project_dashboard_north_star_config.project_id
        AND pu.user_id = (SELECT auth.uid())
        AND pu.is_active = true
    )
  );

CREATE POLICY "Managers can manage north star config in their projects"
  ON public.project_dashboard_north_star_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_users pu
      WHERE pu.project_id = project_dashboard_north_star_config.project_id
        AND pu.user_id = (SELECT auth.uid())
        AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.project_users pu
      WHERE pu.project_id = project_dashboard_north_star_config.project_id
        AND pu.user_id = (SELECT auth.uid())
        AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  );

COMMENT ON TABLE public.project_dashboard_north_star_config IS
  'Configuracao de cards North Star e metricas customizadas por projeto.';
