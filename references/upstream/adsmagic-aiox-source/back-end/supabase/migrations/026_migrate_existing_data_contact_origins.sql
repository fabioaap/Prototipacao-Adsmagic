-- Migration: Migrar dados existentes para campos críticos
-- Data: 2025-01-XX
-- Descrição: Atualiza registros existentes populando campos críticos a partir de source_data
-- Conforme: PLANO_IMPLEMENTACAO_HIBRIDA_SOURCE_DATA.md

BEGIN;

-- ==========================================
-- MIGRAR DADOS EXISTENTES
-- ==========================================

-- Atualizar campaign_id (padronizado, diferenciado por source_app/origin_id)
UPDATE contact_origins
SET campaign_id = source_data->'campaign'->>'campaign_id'
WHERE source_data IS NOT NULL 
  AND source_data != '{}'::jsonb
  AND campaign_id IS NULL
  AND source_data->'campaign'->>'campaign_id' IS NOT NULL;

-- Atualizar ad_id
UPDATE contact_origins
SET ad_id = source_data->'campaign'->>'ad_id'
WHERE source_data IS NOT NULL 
  AND source_data != '{}'::jsonb
  AND ad_id IS NULL
  AND source_data->'campaign'->>'ad_id' IS NOT NULL;

-- Atualizar adgroup_id
UPDATE contact_origins
SET adgroup_id = source_data->'campaign'->>'adgroup_id'
WHERE source_data IS NOT NULL 
  AND source_data != '{}'::jsonb
  AND adgroup_id IS NULL
  AND source_data->'campaign'->>'adgroup_id' IS NOT NULL;

-- Atualizar source_app
UPDATE contact_origins
SET source_app = source_data->'metadata'->>'source_app'
WHERE source_data IS NOT NULL 
  AND source_data != '{}'::jsonb
  AND source_app IS NULL
  AND source_data->'metadata'->>'source_app' IS NOT NULL;

-- ==========================================
-- VALIDAÇÃO PÓS-MIGRAÇÃO
-- ==========================================

-- Verificar quantos registros foram migrados
DO $$
DECLARE
  campaign_count INTEGER;
  ad_count INTEGER;
  source_app_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO campaign_count
  FROM contact_origins
  WHERE campaign_id IS NOT NULL;
  
  SELECT COUNT(*) INTO ad_count
  FROM contact_origins
  WHERE ad_id IS NOT NULL;
  
  SELECT COUNT(*) INTO adgroup_count
  FROM contact_origins
  WHERE adgroup_id IS NOT NULL;
  
  SELECT COUNT(*) INTO source_app_count
  FROM contact_origins
  WHERE source_app IS NOT NULL;
  
  RAISE NOTICE 'Registros migrados - campaign_id: %, ad_id: %, adgroup_id: %, source_app: %', 
    campaign_count, ad_count, adgroup_count, source_app_count;
END $$;

COMMIT;

