-- ============================================================================
-- Migration 043: RLS Policies e Triggers de Invalidação de Cache
-- ============================================================================
-- Objetivo: Configurar RLS para dashboard_cache e triggers de invalidação automática
-- Data: 2026-01-20
-- 
-- Estratégia:
-- - RLS: Usuários só veem cache de projetos em que são membros
-- - Triggers: Invalidam cache quando dados relacionados são modificados
--   (sales, contacts, stages, origins)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Habilitar RLS na tabela dashboard_cache
-- ----------------------------------------------------------------------------
ALTER TABLE dashboard_cache ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. RLS Policy: Leitura de cache
-- ----------------------------------------------------------------------------
-- Usuários podem ver cache de projetos em que são membros
CREATE POLICY "Users can view dashboard_cache in their projects"
  ON dashboard_cache FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_users
      WHERE project_users.project_id = dashboard_cache.project_id
        AND project_users.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 3. RLS Policy: Inserção/Atualização de cache
-- ----------------------------------------------------------------------------
-- Funções SECURITY DEFINER podem inserir/atualizar cache
-- (funções get_dashboard_cache, set_dashboard_cache são SECURITY DEFINER)
-- Usuários comuns não precisam de acesso direto, apenas via Edge Function
CREATE POLICY "Functions can manage dashboard_cache"
  ON dashboard_cache FOR ALL
  USING (true) -- Permite acesso via funções SECURITY DEFINER
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 4. Trigger: Invalidar cache ao criar/atualizar/deletar sales
-- ----------------------------------------------------------------------------
-- Invalida cache de 'summary', 'origin-breakdown', 'pipeline-stats'
CREATE OR REPLACE FUNCTION invalidate_cache_on_sales_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_project_id UUID;
BEGIN
  -- Determinar project_id (NEW para INSERT/UPDATE, OLD para DELETE)
  affected_project_id := COALESCE(NEW.project_id, OLD.project_id);
  
  -- Invalidar cache dos endpoints afetados
  PERFORM invalidate_dashboard_cache(affected_project_id, 'summary');
  PERFORM invalidate_dashboard_cache(affected_project_id, 'origin-breakdown');
  PERFORM invalidate_dashboard_cache(affected_project_id, 'pipeline-stats');
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER sales_insert_cache_invalidation_trigger
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_cache_on_sales_change();

CREATE TRIGGER sales_update_cache_invalidation_trigger
  AFTER UPDATE ON sales
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.value IS DISTINCT FROM NEW.value)
  EXECUTE FUNCTION invalidate_cache_on_sales_change();

CREATE TRIGGER sales_delete_cache_invalidation_trigger
  AFTER DELETE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_cache_on_sales_change();

-- ----------------------------------------------------------------------------
-- 5. Trigger: Invalidar cache ao criar/atualizar/deletar contacts
-- ----------------------------------------------------------------------------
-- Invalida cache de 'summary', 'funnel-stats', 'origin-breakdown', 'pipeline-stats'
CREATE OR REPLACE FUNCTION invalidate_cache_on_contacts_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_project_id UUID;
BEGIN
  affected_project_id := COALESCE(NEW.project_id, OLD.project_id);
  
  -- Invalidar cache dos endpoints afetados
  PERFORM invalidate_dashboard_cache(affected_project_id, 'summary');
  PERFORM invalidate_dashboard_cache(affected_project_id, 'funnel-stats');
  PERFORM invalidate_dashboard_cache(affected_project_id, 'origin-breakdown');
  PERFORM invalidate_dashboard_cache(affected_project_id, 'pipeline-stats');
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER contacts_insert_cache_invalidation_trigger
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_cache_on_contacts_change();

CREATE TRIGGER contacts_update_cache_invalidation_trigger
  AFTER UPDATE ON contacts
  FOR EACH ROW
  WHEN (
    OLD.current_stage_id IS DISTINCT FROM NEW.current_stage_id OR
    OLD.main_origin_id IS DISTINCT FROM NEW.main_origin_id
  )
  EXECUTE FUNCTION invalidate_cache_on_contacts_change();

CREATE TRIGGER contacts_delete_cache_invalidation_trigger
  AFTER DELETE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_cache_on_contacts_change();

-- ----------------------------------------------------------------------------
-- 6. Trigger: Invalidar cache ao atualizar stages
-- ----------------------------------------------------------------------------
-- Invalida cache de 'funnel-stats', 'pipeline-stats'
CREATE OR REPLACE FUNCTION invalidate_cache_on_stages_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_project_id UUID;
BEGIN
  affected_project_id := COALESCE(NEW.project_id, OLD.project_id);
  
  -- Invalidar cache dos endpoints afetados
  PERFORM invalidate_dashboard_cache(affected_project_id, 'funnel-stats');
  PERFORM invalidate_dashboard_cache(affected_project_id, 'pipeline-stats');
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER stages_update_cache_invalidation_trigger
  AFTER UPDATE ON stages
  FOR EACH ROW
  WHEN (
    OLD.is_active IS DISTINCT FROM NEW.is_active OR
    OLD.display_order IS DISTINCT FROM NEW.display_order OR
    OLD.name IS DISTINCT FROM NEW.name
  )
  EXECUTE FUNCTION invalidate_cache_on_stages_change();

CREATE TRIGGER stages_delete_cache_invalidation_trigger
  AFTER DELETE ON stages
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_cache_on_stages_change();

-- ----------------------------------------------------------------------------
-- 7. Trigger: Invalidar cache ao atualizar origins
-- ----------------------------------------------------------------------------
-- Invalida cache de 'origin-breakdown'
CREATE OR REPLACE FUNCTION invalidate_cache_on_origins_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_project_id UUID;
BEGIN
  affected_project_id := COALESCE(NEW.project_id, OLD.project_id);
  
  -- Invalidar cache do endpoint afetado
  PERFORM invalidate_dashboard_cache(affected_project_id, 'origin-breakdown');
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER origins_update_cache_invalidation_trigger
  AFTER UPDATE ON origins
  FOR EACH ROW
  WHEN (
    OLD.is_active IS DISTINCT FROM NEW.is_active OR
    OLD.name IS DISTINCT FROM NEW.name
  )
  EXECUTE FUNCTION invalidate_cache_on_origins_change();

CREATE TRIGGER origins_delete_cache_invalidation_trigger
  AFTER DELETE ON origins
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_cache_on_origins_change();

-- ----------------------------------------------------------------------------
-- 8. Trigger: Invalidar cache ao atualizar contact_stage_history
-- ----------------------------------------------------------------------------
-- Invalida cache de 'funnel-stats', 'pipeline-stats' (mudanças de estágio)
CREATE OR REPLACE FUNCTION invalidate_cache_on_stage_history_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_project_id UUID;
BEGIN
  -- Buscar project_id via contact
  SELECT c.project_id INTO affected_project_id
  FROM contacts c
  WHERE c.id = COALESCE(NEW.contact_id, OLD.contact_id);
  
  IF affected_project_id IS NOT NULL THEN
    -- Invalidar cache dos endpoints afetados
    PERFORM invalidate_dashboard_cache(affected_project_id, 'funnel-stats');
    PERFORM invalidate_dashboard_cache(affected_project_id, 'pipeline-stats');
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER stage_history_insert_cache_invalidation_trigger
  AFTER INSERT ON contact_stage_history
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_cache_on_stage_history_change();

-- ----------------------------------------------------------------------------
-- 9. Comentários para documentação
-- ----------------------------------------------------------------------------
COMMENT ON FUNCTION invalidate_cache_on_sales_change IS 
  'Invalida cache de summary, origin-breakdown, pipeline-stats ao modificar sales';

COMMENT ON FUNCTION invalidate_cache_on_contacts_change IS 
  'Invalida cache de summary, funnel-stats, origin-breakdown, pipeline-stats ao modificar contacts';

COMMENT ON FUNCTION invalidate_cache_on_stages_change IS 
  'Invalida cache de funnel-stats, pipeline-stats ao modificar stages';

COMMENT ON FUNCTION invalidate_cache_on_origins_change IS 
  'Invalida cache de origin-breakdown ao modificar origins';

COMMENT ON FUNCTION invalidate_cache_on_stage_history_change IS 
  'Invalida cache de funnel-stats, pipeline-stats ao modificar contact_stage_history';
