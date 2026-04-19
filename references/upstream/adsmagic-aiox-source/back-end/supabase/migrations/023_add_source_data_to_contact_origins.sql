-- Migration: Adicionar source_data JSONB a contact_origins
-- Data: 2025-01-27
-- Descrição: Adiciona campo JSONB para armazenar dados estruturados de origem (click IDs, UTMs, IDs de campanha, metadados)
-- Conforme: FASE 2.4 do PLANO_IMPLEMENTACAO_ETAPAS.md

BEGIN;

-- Adicionar coluna source_data JSONB
ALTER TABLE contact_origins
ADD COLUMN IF NOT EXISTS source_data JSONB DEFAULT '{}'::jsonb;

-- Criar índice GIN para queries eficientes em JSONB
CREATE INDEX IF NOT EXISTS idx_contact_origins_source_data 
ON contact_origins USING gin (source_data);

-- Comentário explicativo na coluna
COMMENT ON COLUMN contact_origins.source_data IS 
'Dados estruturados padronizados da origem de tráfego: click IDs (gclid, fbclid, ctwaClid, etc.), UTMs, IDs de campanha, metadados. 
Estrutura padronizada conforme IMPLEMENTATION_CONTACT_ORIGINS.md e contact-origin-types.ts';

COMMIT;