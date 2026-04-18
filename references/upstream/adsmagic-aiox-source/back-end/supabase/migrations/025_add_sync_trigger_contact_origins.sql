-- Migration: Adicionar trigger para sincronizar campos críticos
-- Data: 2025-01-27
-- Descrição: Trigger automático que sincroniza campos críticos (campaign_id, ad_id, adgroup_id, source_app) 
--            com source_data JSONB em INSERT e UPDATE
-- Conforme: PLANO_IMPLEMENTACAO_HIBRIDA_SOURCE_DATA.md

BEGIN;

-- ==========================================
-- FUNÇÃO DE SINCRONIZAÇÃO
-- ==========================================

CREATE OR REPLACE FUNCTION sync_contact_origin_critical_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Extrair campaign_id padronizado (diferenciado por source_app/origin_id)
  NEW.campaign_id := NEW.source_data->'campaign'->>'campaign_id';
  
  -- Extrair ad_id
  NEW.ad_id := NEW.source_data->'campaign'->>'ad_id';
  
  -- Extrair adgroup_id (Google/Meta)
  NEW.adgroup_id := NEW.source_data->'campaign'->>'adgroup_id';
  
  -- Extrair source_app de source_data->metadata->source_app
  NEW.source_app := NEW.source_data->'metadata'->>'source_app';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMENTÁRIO EXPLICATIVO
-- ==========================================

COMMENT ON FUNCTION sync_contact_origin_critical_fields() IS 
'Sincroniza automaticamente campos críticos (campaign_id, ad_id, adgroup_id, source_app) 
com source_data JSONB em INSERT e UPDATE. Mantém consistência entre JSONB e colunas normalizadas.
campaign_id é padronizado e diferenciado pela source_app/origin_id.';

-- ==========================================
-- CRIAR TRIGGER
-- ==========================================

DROP TRIGGER IF EXISTS trigger_sync_critical_fields ON contact_origins;

CREATE TRIGGER trigger_sync_critical_fields
BEFORE INSERT OR UPDATE ON contact_origins
FOR EACH ROW
WHEN (NEW.source_data IS NOT NULL AND NEW.source_data != '{}'::jsonb)
EXECUTE FUNCTION sync_contact_origin_critical_fields();

-- ==========================================
-- COMENTÁRIO EXPLICATIVO
-- ==========================================

COMMENT ON TRIGGER trigger_sync_critical_fields ON contact_origins IS 
'Trigger que executa antes de INSERT/UPDATE para sincronizar campos críticos 
com source_data JSONB. Executa apenas quando source_data não é NULL ou vazio.';

COMMIT;

