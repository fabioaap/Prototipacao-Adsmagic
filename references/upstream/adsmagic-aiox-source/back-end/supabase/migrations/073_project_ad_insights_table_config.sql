-- ============================================================================
-- Migration 073: Configuracao de colunas da tabela de Ad Insights por projeto
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_ad_insights_table_config (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  level TEXT NOT NULL,
  selected_column_ids TEXT[] NOT NULL DEFAULT '{}'::text[],
  column_order TEXT[] NOT NULL DEFAULT '{}'::text[],
  updated_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, platform, level),
  CONSTRAINT ad_insights_platform_check CHECK (platform IN ('meta', 'google', 'tiktok')),
  CONSTRAINT ad_insights_level_check CHECK (level IN ('campaign', 'adset', 'ad')),
  CONSTRAINT ad_insights_selected_columns_limit CHECK (cardinality(selected_column_ids) <= 20)
);

CREATE TRIGGER project_ad_insights_table_config_updated_at_trigger
  BEFORE UPDATE ON public.project_ad_insights_table_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.project_ad_insights_table_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ad insights table config in their projects"
  ON public.project_ad_insights_table_config
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_users pu
      WHERE pu.project_id = project_ad_insights_table_config.project_id
        AND pu.user_id = (SELECT auth.uid())
        AND pu.is_active = true
    )
  );

CREATE POLICY "Managers can manage ad insights table config in their projects"
  ON public.project_ad_insights_table_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_users pu
      WHERE pu.project_id = project_ad_insights_table_config.project_id
        AND pu.user_id = (SELECT auth.uid())
        AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.project_users pu
      WHERE pu.project_id = project_ad_insights_table_config.project_id
        AND pu.user_id = (SELECT auth.uid())
        AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  );

COMMENT ON TABLE public.project_ad_insights_table_config IS
  'Configuracao de colunas e ordenacao da tabela de campanhas por projeto/plataforma/nivel.';
