-- Migration 018: Adicionar pixel_id em integration_accounts
-- Data: 2024-12-19
-- Descrição: Adiciona campo pixel_id para suportar múltiplas contas com pixels diferentes
-- Tipo: Evolutiva (não quebra dados existentes)
-- Rollback: Sim (pode remover campo se necessário)

BEGIN;

-- Adicionar campo pixel_id (NULLABLE para não quebrar dados existentes)
ALTER TABLE integration_accounts
ADD COLUMN IF NOT EXISTS pixel_id VARCHAR(50);

-- Comentário para documentação
COMMENT ON COLUMN integration_accounts.pixel_id IS 
  'ID do pixel do Meta associado a esta conta específica. Permite múltiplas contas com pixels diferentes.';

-- Index para consultas frequentes (se necessário no futuro)
CREATE INDEX IF NOT EXISTS idx_integration_accounts_pixel_id 
ON integration_accounts(pixel_id) 
WHERE pixel_id IS NOT NULL;

COMMIT;

