-- ============================================================================
-- Migration 044: Configurar Refresh Automático de Materialized Views
-- ============================================================================
-- Objetivo: Configurar refresh automático de materialized views via pg_cron
-- Data: 2026-01-20
-- 
-- Nota: pg_cron pode não estar disponível no Supabase. Se falhar, usar Edge Function worker
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Verificar se pg_cron está disponível
-- ----------------------------------------------------------------------------
-- Se pg_cron não estiver disponível, esta migration falhará
-- Nesse caso, usar Edge Function worker como alternativa (ver função analytics-worker)

-- ----------------------------------------------------------------------------
-- 2. Agendar refresh de materialized views (a cada 5 minutos)
-- ----------------------------------------------------------------------------
-- Refresh incremental (CONCURRENTLY) para não bloquear queries
-- Só funciona se pg_cron estiver habilitado no Supabase

-- Desabilitar jobs antigos (se existirem)
-- SELECT cron.unschedule('refresh-analytics-views') IF EXISTS;

-- Agendar refresh de todas as views a cada 5 minutos
-- NOTA: Este comando pode falhar se pg_cron não estiver disponível
-- Nesse caso, usar Edge Function worker chamada via Cloudflare Workers ou cron job externo

-- Exemplo (comentado - pode não funcionar no Supabase):
-- SELECT cron.schedule(
--   'refresh-analytics-views',
--   '*/5 * * * *', -- A cada 5 minutos
--   $$SELECT refresh_analytics_materialized_views(NULL, 'concurrent')$$
-- );

-- ----------------------------------------------------------------------------
-- 3. Comentários
-- ----------------------------------------------------------------------------
COMMENT ON FUNCTION refresh_analytics_materialized_views IS 
  'Função para refresh de materialized views. 
   Para refresh automático, usar Edge Function worker analytics-worker chamada via cron externo.
   Exemplo de chamada manual: SELECT refresh_analytics_materialized_views();';

-- NOTA: Se pg_cron não estiver disponível, usar Edge Function 'analytics-worker'
-- que será chamada periodicamente via Cloudflare Workers ou outro serviço de cron
