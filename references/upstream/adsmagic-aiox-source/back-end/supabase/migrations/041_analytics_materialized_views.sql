-- ============================================================================
-- Migration 041: Materialized Views para Analytics Avançado
-- ============================================================================
-- Objetivo: Criar views materializadas para otimizar queries pesadas do dashboard
-- Data: 2026-01-20
-- 
-- Estratégia: Views materializadas agregam dados básicos (sales, contacts por dia/projeto)
-- Cálculos complexos (taxas, médias) são feitos na Edge Function usando essas views
-- 
-- Refresh automático via pg_cron (a cada 5 minutos)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Materialized View: Summary Metrics (Agregação diária)
-- ----------------------------------------------------------------------------
-- Agrega sales e contacts por projeto e data
DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_summary_metrics CASCADE;

CREATE MATERIALIZED VIEW mv_dashboard_summary_metrics AS
WITH sales_daily AS (
  SELECT 
    project_id,
    DATE_TRUNC('day', date) AS metric_date,
    COUNT(DISTINCT CASE WHEN status = 'completed' THEN id END) AS sales_count,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN value ELSE 0 END), 0) AS revenue,
    COUNT(DISTINCT CASE WHEN status = 'completed' THEN contact_id END) AS active_customers
  FROM sales
  GROUP BY project_id, DATE_TRUNC('day', date)
),
contacts_daily AS (
  SELECT 
    project_id,
    DATE_TRUNC('day', created_at) AS metric_date,
    COUNT(DISTINCT id) AS contacts_count
  FROM contacts
  GROUP BY project_id, DATE_TRUNC('day', created_at)
)
SELECT 
  COALESCE(s.project_id, c.project_id) AS project_id,
  COALESCE(s.metric_date, c.metric_date) AS metric_date,
  COALESCE(s.sales_count, 0) AS sales_count,
  COALESCE(s.revenue, 0) AS revenue,
  COALESCE(c.contacts_count, 0) AS contacts_count,
  COALESCE(s.active_customers, 0) AS active_customers,
  NOW() AS last_updated
FROM sales_daily s
FULL OUTER JOIN contacts_daily c 
  ON s.project_id = c.project_id 
  AND s.metric_date = c.metric_date;

-- Índices para busca rápida
CREATE INDEX idx_mv_summary_metrics_project_date 
  ON mv_dashboard_summary_metrics(project_id, metric_date DESC);

CREATE INDEX idx_mv_summary_metrics_project 
  ON mv_dashboard_summary_metrics(project_id);

-- ----------------------------------------------------------------------------
-- 2. Materialized View: Funnel Stats (Agregação por estágio)
-- ----------------------------------------------------------------------------
-- Agrega contatos por estágio
DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_funnel_stats CASCADE;

CREATE MATERIALIZED VIEW mv_dashboard_funnel_stats AS
SELECT 
  st.project_id,
  st.id AS stage_id,
  st.name AS stage_name,
  st.display_order,
  st.type AS stage_type,
  COUNT(DISTINCT c.id) AS contacts_count,
  COUNT(DISTINCT CASE 
    WHEN st.type = 'sale' AND s.status = 'completed' 
    THEN s.id 
  END) AS sales_count,
  NOW() AS last_updated
FROM stages st
LEFT JOIN contacts c ON c.project_id = st.project_id AND c.current_stage_id = st.id
LEFT JOIN sales s ON s.contact_id = c.id AND s.status = 'completed'
WHERE st.is_active = true
GROUP BY st.project_id, st.id, st.name, st.display_order, st.type;

-- Índices para busca rápida
CREATE INDEX idx_mv_funnel_stats_project_stage 
  ON mv_dashboard_funnel_stats(project_id, stage_id);

CREATE INDEX idx_mv_funnel_stats_project 
  ON mv_dashboard_funnel_stats(project_id);

-- ----------------------------------------------------------------------------
-- 3. Materialized View: Origin Breakdown (Agregação por origem)
-- ----------------------------------------------------------------------------
-- Agrega contatos, vendas e revenue por origem
DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_origin_breakdown CASCADE;

CREATE MATERIALIZED VIEW mv_dashboard_origin_breakdown AS
SELECT 
  o.project_id,
  o.id AS origin_id,
  o.name AS origin_name,
  o.type AS origin_type,
  COUNT(DISTINCT c.id) AS contacts_count,
  COUNT(DISTINCT CASE 
    WHEN s.status = 'completed' 
    THEN s.id 
  END) AS sales_count,
  COALESCE(SUM(CASE 
    WHEN s.status = 'completed' 
    THEN s.value 
    ELSE 0 
  END), 0) AS revenue,
  0::DECIMAL AS spend, -- Será preenchido via integrações futuras
  NOW() AS last_updated
FROM origins o
LEFT JOIN contacts c ON c.main_origin_id = o.id
LEFT JOIN sales s ON s.contact_id = c.id
WHERE o.is_active = true
GROUP BY o.project_id, o.id, o.name, o.type;

-- Índices para busca rápida
CREATE INDEX idx_mv_origin_breakdown_project_origin 
  ON mv_dashboard_origin_breakdown(project_id, origin_id);

CREATE INDEX idx_mv_origin_breakdown_project 
  ON mv_dashboard_origin_breakdown(project_id);

-- ----------------------------------------------------------------------------
-- 4. Materialized View: Pipeline Stats (Agregação por estágio)
-- ----------------------------------------------------------------------------
-- Agrega deals (contatos) e valores por estágio
DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_pipeline_stats CASCADE;

CREATE MATERIALIZED VIEW mv_dashboard_pipeline_stats AS
SELECT 
  st.project_id,
  st.id AS stage_id,
  st.name AS stage_name,
  st.display_order,
  COUNT(DISTINCT c.id) AS deals_count,
  COALESCE(SUM(CASE 
    WHEN s.status = 'completed' 
    THEN s.value 
    ELSE 0 
  END), 0) AS total_value,
  NOW() AS last_updated
FROM stages st
LEFT JOIN contacts c ON c.project_id = st.project_id AND c.current_stage_id = st.id
LEFT JOIN sales s ON s.contact_id = c.id
WHERE st.is_active = true
GROUP BY st.project_id, st.id, st.name, st.display_order;

-- Índices para busca rápida
CREATE INDEX idx_mv_pipeline_stats_project_stage 
  ON mv_dashboard_pipeline_stats(project_id, stage_id);

CREATE INDEX idx_mv_pipeline_stats_project 
  ON mv_dashboard_pipeline_stats(project_id);

-- ----------------------------------------------------------------------------
-- 5. Função para refresh de views materializadas
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_analytics_materialized_views(
  view_name TEXT DEFAULT NULL,
  refresh_type TEXT DEFAULT 'concurrent'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Refresh completo de todas as views
  IF view_name IS NULL THEN
    IF refresh_type = 'full' THEN
      REFRESH MATERIALIZED VIEW mv_dashboard_summary_metrics;
      REFRESH MATERIALIZED VIEW mv_dashboard_funnel_stats;
      REFRESH MATERIALIZED VIEW mv_dashboard_origin_breakdown;
      REFRESH MATERIALIZED VIEW mv_dashboard_pipeline_stats;
    ELSE
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_summary_metrics;
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_funnel_stats;
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_origin_breakdown;
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_pipeline_stats;
    END IF;
    RETURN;
  END IF;
  
  -- Refresh de view específica
  CASE view_name
    WHEN 'summary_metrics' THEN
      IF refresh_type = 'full' THEN
        REFRESH MATERIALIZED VIEW mv_dashboard_summary_metrics;
      ELSE
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_summary_metrics;
      END IF;
    WHEN 'funnel_stats' THEN
      IF refresh_type = 'full' THEN
        REFRESH MATERIALIZED VIEW mv_dashboard_funnel_stats;
      ELSE
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_funnel_stats;
      END IF;
    WHEN 'origin_breakdown' THEN
      IF refresh_type = 'full' THEN
        REFRESH MATERIALIZED VIEW mv_dashboard_origin_breakdown;
      ELSE
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_origin_breakdown;
      END IF;
    WHEN 'pipeline_stats' THEN
      IF refresh_type = 'full' THEN
        REFRESH MATERIALIZED VIEW mv_dashboard_pipeline_stats;
      ELSE
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_pipeline_stats;
      END IF;
    ELSE
      RAISE EXCEPTION 'Unknown view name: %. Valid options: summary_metrics, funnel_stats, origin_breakdown, pipeline_stats', view_name;
  END CASE;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. Comentários para documentação
-- ----------------------------------------------------------------------------
COMMENT ON MATERIALIZED VIEW mv_dashboard_summary_metrics IS 
  'Agregação diária de sales e contacts por projeto (usado pelo endpoint /dashboard/summary)';

COMMENT ON MATERIALIZED VIEW mv_dashboard_funnel_stats IS 
  'Agregação de contatos por estágio (usado pelo endpoint /dashboard/funnel-stats)';

COMMENT ON MATERIALIZED VIEW mv_dashboard_origin_breakdown IS 
  'Agregação de contatos, vendas e revenue por origem (usado pelo endpoint /dashboard/origin-breakdown)';

COMMENT ON MATERIALIZED VIEW mv_dashboard_pipeline_stats IS 
  'Agregação de deals e valores por estágio (usado pelo endpoint /dashboard/pipeline-stats)';

COMMENT ON FUNCTION refresh_analytics_materialized_views IS 
  'Função auxiliar para refresh de views materializadas (concurrent ou full). 
   Exemplo: SELECT refresh_analytics_materialized_views(); para todas as views
   Exemplo: SELECT refresh_analytics_materialized_views(''summary_metrics'', ''full''); para uma view específica';
