-- Migration 017: Add 'expired' status to integrations
-- Data: 2025-01-27
-- Descrição: Adiciona status 'expired' para integrações com tokens expirados

BEGIN;

-- Alterar constraint de status para incluir 'expired'
ALTER TABLE integrations
DROP CONSTRAINT IF EXISTS integrations_status_check;

ALTER TABLE integrations
ADD CONSTRAINT integrations_status_check
CHECK (status IN (
    'connected', 'disconnected', 'error', 'syncing', 'pending', 'expired'
));

COMMENT ON COLUMN integrations.status IS 'Status da integração (connected, disconnected, error, syncing, pending, expired)';

COMMIT;

