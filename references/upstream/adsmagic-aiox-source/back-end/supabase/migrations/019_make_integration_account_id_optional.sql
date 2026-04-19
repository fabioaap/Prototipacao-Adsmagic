-- Migration 019: Tornar integration_account_id opcional em messaging_accounts
-- Data: 2025-01-28
-- Descrição: Permite criar messaging_accounts sem integration_account_id (útil para brokers diretos como UAZAPI)

BEGIN;

-- Alterar constraint para permitir NULL
ALTER TABLE messaging_accounts 
  ALTER COLUMN integration_account_id DROP NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN messaging_accounts.integration_account_id IS 
  'ID da integration_account (opcional). Pode ser NULL para brokers que não usam integração OAuth (ex: UAZAPI direto via API)';

COMMIT;

