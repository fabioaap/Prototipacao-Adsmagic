-- Migration: Rate Limit Counters
-- Description: Tabela para armazenar contadores de rate limiting para webhooks
-- Date: 2025-01-28

-- Criar tabela de contadores de rate limit
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL, -- Chave única para rate limiting (ex: "webhook:global:uazapi", "webhook:account:uuid")
  count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL, -- Quando o contador expira
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índice único para buscar contador por chave e validar expiração
  CONSTRAINT rate_limit_counters_key_expires_unique UNIQUE (key, expires_at)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_counters_key ON rate_limit_counters(key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_counters_expires_at ON rate_limit_counters(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_counters_key_expires ON rate_limit_counters(key, expires_at);

-- Função para limpar contadores expirados automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limit_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limit_counters
  WHERE expires_at < NOW();
END;
$$;

-- Comentários
COMMENT ON TABLE rate_limit_counters IS 'Armazena contadores de rate limiting para webhooks';
COMMENT ON COLUMN rate_limit_counters.key IS 'Chave única para rate limiting (ex: webhook:global:uazapi)';
COMMENT ON COLUMN rate_limit_counters.count IS 'Número de requisições no período';
COMMENT ON COLUMN rate_limit_counters.expires_at IS 'Timestamp de expiração do contador';
COMMENT ON FUNCTION cleanup_expired_rate_limit_counters() IS 'Remove contadores expirados';

-- RLS: Permitir acesso apenas para service role (Edge Functions)
ALTER TABLE rate_limit_counters ENABLE ROW LEVEL SECURITY;

-- Política: Permitir todas as operações para service role
CREATE POLICY "Service role can manage rate limit counters"
  ON rate_limit_counters
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
