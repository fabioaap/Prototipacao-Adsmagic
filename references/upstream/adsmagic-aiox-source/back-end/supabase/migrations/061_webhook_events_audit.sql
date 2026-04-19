-- ============================================================================
-- Migration 061: Auditoria de Webhooks (payload sanitizado + retenção)
-- ============================================================================
-- Objetivo:
-- - Persistir eventos recebidos por webhooks para auditoria e troubleshooting
-- - Manter retenção automática de 30 dias via função SQL
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project_id UUID NULL REFERENCES projects(id) ON DELETE SET NULL,
  messaging_account_id UUID NULL REFERENCES messaging_accounts(id) ON DELETE SET NULL,
  broker_type TEXT NOT NULL,
  webhook_type TEXT NOT NULL CHECK (webhook_type IN ('global', 'by_account')),
  endpoint_path TEXT NOT NULL,
  request_headers JSONB NULL DEFAULT '{}'::jsonb,
  payload_raw JSONB NOT NULL,
  payload_hash TEXT NOT NULL,
  resolved_by TEXT NULL,
  parse_status TEXT NOT NULL DEFAULT 'received' CHECK (parse_status IN ('received', 'processed', 'failed')),
  error_message TEXT NULL,
  processing_time_ms INTEGER NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at
  ON webhook_events(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_account_received
  ON webhook_events(messaging_account_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_project_received
  ON webhook_events(project_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_payload_hash
  ON webhook_events(payload_hash);

-- Opcionalmente habilitamos RLS para bloquear acesso direto por usuários comuns.
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Sem policies: acesso bloqueado para authenticated; service role continua acessando.

CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_events
  WHERE received_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

COMMENT ON TABLE webhook_events IS
  'Auditoria de webhooks recebidos (payload sanitizado). Retenção alvo: 30 dias.';

COMMENT ON FUNCTION cleanup_old_webhook_events IS
  'Remove registros antigos de webhook_events (mais de 30 dias). Pode ser chamada por job-worker/cron.';
