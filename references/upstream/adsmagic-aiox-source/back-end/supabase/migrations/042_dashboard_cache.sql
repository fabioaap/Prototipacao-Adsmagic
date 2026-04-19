-- ============================================================================
-- Migration 042: Tabela de Cache para Dashboard Analytics
-- ============================================================================
-- Objetivo: Implementar cache de métricas do dashboard para reduzir latência
-- Data: 2026-01-20
-- 
-- Estratégia: 
-- - Cache armazena resultados serializados de endpoints do dashboard
-- - Invalidação automática via triggers em sales, contacts, stages, origins
-- - TTL (Time To Live) configurável por tipo de métrica
-- - Chave única: (project_id, endpoint, params_hash)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabela: dashboard_cache
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Identificação do cache
  endpoint VARCHAR(100) NOT NULL, -- Ex: 'summary', 'funnel-stats', 'origin-breakdown'
  params_hash VARCHAR(64) NOT NULL, -- Hash dos parâmetros da query (period, filters, etc)
  cache_key TEXT NOT NULL, -- Chave composta legível: endpoint:project_id:params_hash
  
  -- Dados do cache
  data JSONB NOT NULL, -- Resultado serializado da query
  expires_at TIMESTAMPTZ NOT NULL, -- Data de expiração do cache
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  hit_count INTEGER DEFAULT 0, -- Contador de acessos (para estatísticas)
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT dashboard_cache_key_unique UNIQUE(project_id, endpoint, params_hash),
  CONSTRAINT dashboard_cache_endpoint_check CHECK (endpoint IN (
    'summary', 
    'funnel-stats', 
    'pipeline-stats', 
    'origin-breakdown', 
    'drill-down',
    'time-series',
    'metrics'
  ))
);

-- Índices para busca rápida
CREATE INDEX idx_dashboard_cache_project_endpoint 
  ON dashboard_cache(project_id, endpoint);

CREATE INDEX idx_dashboard_cache_expires_at 
  ON dashboard_cache(expires_at) 
  WHERE expires_at < NOW(); -- Índice parcial para limpeza de cache expirado

CREATE INDEX idx_dashboard_cache_key 
  ON dashboard_cache(cache_key);

-- ----------------------------------------------------------------------------
-- 2. Função: Gerar hash de parâmetros
-- ----------------------------------------------------------------------------
-- Função auxiliar para gerar hash consistente dos parâmetros
CREATE OR REPLACE FUNCTION generate_params_hash(params JSONB)
RETURNS VARCHAR(64)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  hash_result VARCHAR(64);
BEGIN
  -- Ordena chaves do JSON e gera hash MD5
  SELECT MD5(jsonb_pretty(params)) INTO hash_result;
  RETURN hash_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Função: Obter cache
-- ----------------------------------------------------------------------------
-- Busca cache válido (não expirado) e atualiza last_accessed_at
CREATE OR REPLACE FUNCTION get_dashboard_cache(
  p_project_id UUID,
  p_endpoint VARCHAR(100),
  p_params_hash VARCHAR(64)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cache_data JSONB;
BEGIN
  -- Buscar cache válido (não expirado)
  SELECT data INTO cache_data
  FROM dashboard_cache
  WHERE project_id = p_project_id
    AND endpoint = p_endpoint
    AND params_hash = p_params_hash
    AND expires_at > NOW();
  
  -- Se encontrado, atualizar estatísticas
  IF cache_data IS NOT NULL THEN
    UPDATE dashboard_cache
    SET hit_count = hit_count + 1,
        last_accessed_at = NOW(),
        updated_at = NOW()
    WHERE project_id = p_project_id
      AND endpoint = p_endpoint
      AND params_hash = p_params_hash;
  END IF;
  
  RETURN cache_data;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. Função: Salvar cache
-- ----------------------------------------------------------------------------
-- Salva ou atualiza cache com TTL configurável
CREATE OR REPLACE FUNCTION set_dashboard_cache(
  p_project_id UUID,
  p_endpoint VARCHAR(100),
  p_params_hash VARCHAR(64),
  p_data JSONB,
  p_ttl_minutes INTEGER DEFAULT 5 -- TTL padrão: 5 minutos
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cache_key_text TEXT;
BEGIN
  -- Gerar chave composta
  cache_key_text := p_endpoint || ':' || p_project_id::TEXT || ':' || p_params_hash;
  
  -- Inserir ou atualizar cache
  INSERT INTO dashboard_cache (
    project_id,
    endpoint,
    params_hash,
    cache_key,
    data,
    expires_at,
    created_at,
    updated_at
  ) VALUES (
    p_project_id,
    p_endpoint,
    p_params_hash,
    cache_key_text,
    p_data,
    NOW() + (p_ttl_minutes || ' minutes')::INTERVAL,
    NOW(),
    NOW()
  )
  ON CONFLICT (project_id, endpoint, params_hash)
  DO UPDATE SET
    data = EXCLUDED.data,
    expires_at = EXCLUDED.expires_at,
    updated_at = EXCLUDED.updated_at,
    hit_count = 0; -- Reset contador ao atualizar cache
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. Função: Invalidar cache
-- ----------------------------------------------------------------------------
-- Invalida cache por projeto, endpoint ou ambos
CREATE OR REPLACE FUNCTION invalidate_dashboard_cache(
  p_project_id UUID,
  p_endpoint VARCHAR(100) DEFAULT NULL -- NULL = invalida todos os endpoints do projeto
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Invalidar por projeto e endpoint (se especificado)
  IF p_endpoint IS NOT NULL THEN
    DELETE FROM dashboard_cache
    WHERE project_id = p_project_id
      AND endpoint = p_endpoint;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  ELSE
    -- Invalidar todos os endpoints do projeto
    DELETE FROM dashboard_cache
    WHERE project_id = p_project_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  END IF;
  
  RETURN deleted_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. Função: Limpar cache expirado
-- ----------------------------------------------------------------------------
-- Remove entradas de cache expiradas (usado por worker de limpeza)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM dashboard_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. Trigger: Atualizar updated_at automaticamente
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_dashboard_cache_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER dashboard_cache_updated_at_trigger
  BEFORE UPDATE ON dashboard_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_cache_updated_at();

-- ----------------------------------------------------------------------------
-- 8. Comentários para documentação
-- ----------------------------------------------------------------------------
COMMENT ON TABLE dashboard_cache IS 
  'Cache de resultados de queries do dashboard para reduzir latência (< 200ms)';

COMMENT ON FUNCTION get_dashboard_cache IS 
  'Busca cache válido e atualiza estatísticas de acesso. Retorna NULL se não encontrado ou expirado.';

COMMENT ON FUNCTION set_dashboard_cache IS 
  'Salva ou atualiza cache com TTL configurável. TTL padrão: 5 minutos.';

COMMENT ON FUNCTION invalidate_dashboard_cache IS 
  'Invalida cache por projeto e endpoint. Use endpoint NULL para invalidar todos os endpoints do projeto.';

COMMENT ON FUNCTION cleanup_expired_cache IS 
  'Remove entradas de cache expiradas. Retorna número de entradas removidas.';
