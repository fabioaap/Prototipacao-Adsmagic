-- Migration: Adicionar campos críticos normalizados em contact_origins
-- Data: 2025-01-27
-- Descrição: Adiciona colunas normalizadas (campaign_id, ad_id, adgroup_id, source_app) para otimizar queries
-- Conforme: PLANO_IMPLEMENTACAO_HIBRIDA_SOURCE_DATA.md

BEGIN;

-- ==========================================
-- ADICIONAR COLUNAS CRÍTICAS
-- ==========================================

-- Campaign ID (mais consultado em relatórios)
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS campaign_id TEXT;

-- Ad ID (Meta Ads - muito consultado)
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS ad_id TEXT;

-- Adgroup ID (Google/Meta - conjunto/grupo de anúncios, muito usado em análises)
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS adgroup_id TEXT;

-- Source App (filtro comum: google, facebook, instagram, tiktok)
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS source_app TEXT;

-- ==========================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ==========================================

-- Índice para campaign_id (campo mais consultado)
CREATE INDEX IF NOT EXISTS idx_contact_origins_campaign_id 
ON contact_origins(campaign_id) 
WHERE campaign_id IS NOT NULL;

-- Índice para ad_id (Meta Ads)
CREATE INDEX IF NOT EXISTS idx_contact_origins_ad_id 
ON contact_origins(ad_id) 
WHERE ad_id IS NOT NULL;

-- Índice para adgroup_id (Google/Meta)
CREATE INDEX IF NOT EXISTS idx_contact_origins_adgroup_id 
ON contact_origins(adgroup_id) 
WHERE adgroup_id IS NOT NULL;

-- Índice para source_app (filtro comum)
CREATE INDEX IF NOT EXISTS idx_contact_origins_source_app 
ON contact_origins(source_app) 
WHERE source_app IS NOT NULL;

-- Índice composto para queries frequentes (campaign_id + source_app)
CREATE INDEX IF NOT EXISTS idx_contact_origins_campaign_source_app 
ON contact_origins(campaign_id, source_app) 
WHERE campaign_id IS NOT NULL AND source_app IS NOT NULL;

-- ==========================================
-- COMENTÁRIOS EXPLICATIVOS
-- ==========================================

COMMENT ON COLUMN contact_origins.campaign_id IS 
'ID da campanha de anúncios (extraído de source_data->campaign->campaign_id). 
Campo crítico para relatórios e queries de performance. Sincronizado automaticamente via trigger.';

COMMENT ON COLUMN contact_origins.ad_id IS 
'ID do anúncio (extraído de source_data->campaign->ad_id). 
Campo crítico para Meta Ads. Sincronizado automaticamente via trigger.';

COMMENT ON COLUMN contact_origins.adgroup_id IS 
'ID do conjunto/grupo de anúncios (extraído de source_data->campaign->adgroup_id). 
Campo crítico para Google Ads e Meta Ads. Sincronizado automaticamente via trigger.';

COMMENT ON COLUMN contact_origins.source_app IS 
'Plataforma de origem (google, facebook, instagram, tiktok). 
Extraído de source_data->metadata->source_app. Sincronizado automaticamente via trigger.';

COMMIT;

