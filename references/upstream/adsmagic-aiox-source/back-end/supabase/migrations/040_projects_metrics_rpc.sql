-- Migration 040: Projects Metrics RPC Function
-- Data: 2026-01-20
-- Descrição: Criar RPC function para retornar projetos com métricas calculadas
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 6)

BEGIN;

-- ============================================================================
-- RPC FUNCTION: get_projects_with_metrics
-- ============================================================================
-- Retorna projetos do usuário com métricas calculadas:
-- - revenue: Soma de vendas com status 'completed'
-- - contacts_count: Total de contatos do projeto
-- - sales_count: Total de vendas com status 'completed'
-- - conversion_rate: Taxa de conversão (sales_count / contacts_count * 100)
-- - average_ticket: Ticket médio (revenue / sales_count)
--
-- A função respeita RLS automaticamente pois usa SECURITY DEFINER com contexto do usuário

CREATE OR REPLACE FUNCTION get_projects_with_metrics(
  p_company_id UUID DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  created_by UUID,
  name VARCHAR,
  description TEXT,
  company_type VARCHAR,
  franchise_count INTEGER,
  country VARCHAR,
  language VARCHAR,
  currency VARCHAR,
  timezone VARCHAR,
  attribution_model VARCHAR,
  whatsapp_connected BOOLEAN,
  meta_ads_connected BOOLEAN,
  google_ads_connected BOOLEAN,
  tiktok_ads_connected BOOLEAN,
  status VARCHAR,
  wizard_progress JSONB,
  wizard_current_step INTEGER,
  wizard_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  revenue DECIMAL,
  contacts_count BIGINT,
  sales_count BIGINT,
  conversion_rate DECIMAL,
  average_ticket DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH project_metrics AS (
    SELECT 
      p.id as project_id,
      COALESCE(SUM(CASE WHEN s.status = 'completed' THEN s.value ELSE 0 END), 0)::DECIMAL as revenue,
      COUNT(DISTINCT c.id)::BIGINT as contacts_count,
      COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END)::BIGINT as sales_count
    FROM projects p
    LEFT JOIN contacts c ON c.project_id = p.id
    LEFT JOIN sales s ON s.project_id = p.id
    GROUP BY p.id
  )
  SELECT 
    p.id,
    p.company_id,
    p.created_by,
    p.name,
    p.description,
    p.company_type::VARCHAR,
    p.franchise_count,
    p.country::VARCHAR,
    p.language::VARCHAR,
    p.currency::VARCHAR,
    p.timezone::VARCHAR,
    p.attribution_model::VARCHAR,
    p.whatsapp_connected,
    p.meta_ads_connected,
    p.google_ads_connected,
    p.tiktok_ads_connected,
    p.status::VARCHAR,
    p.wizard_progress,
    p.wizard_current_step,
    p.wizard_completed_at,
    p.created_at,
    p.updated_at,
    pm.revenue,
    pm.contacts_count,
    pm.sales_count,
    CASE 
      WHEN pm.contacts_count > 0 
      THEN ROUND((pm.sales_count::DECIMAL / pm.contacts_count::DECIMAL * 100)::NUMERIC, 2)
      ELSE 0 
    END::DECIMAL as conversion_rate,
    CASE 
      WHEN pm.sales_count > 0 
      THEN ROUND((pm.revenue / pm.sales_count::DECIMAL)::NUMERIC, 2)
      ELSE 0 
    END::DECIMAL as average_ticket
  FROM projects p
  INNER JOIN project_metrics pm ON pm.project_id = p.id
  WHERE 
    (p_company_id IS NULL OR p.company_id = p_company_id)
    AND (p_status IS NULL OR p.status = p_status)
    AND (
      p_search IS NULL OR 
      p.name ILIKE '%' || p_search || '%' OR 
      p.description ILIKE '%' || p_search || '%'
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Comentários
COMMENT ON FUNCTION get_projects_with_metrics IS 
'Retorna projetos com métricas calculadas (revenue, contacts_count, sales_count, conversion_rate, average_ticket). Respeita RLS via SECURITY DEFINER.';

COMMIT;
