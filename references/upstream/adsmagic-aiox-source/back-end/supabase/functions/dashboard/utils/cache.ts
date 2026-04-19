/**
 * Utilitários de Cache para Dashboard
 * 
 * Funções auxiliares para gerenciar cache de métricas do dashboard
 * usando a tabela dashboard_cache
 */

import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Gera hash MD5 dos parâmetros da query
 */
export function generateParamsHash(params: Record<string, unknown>): string {
  // Ordenar chaves e criar string consistente
  const sortedKeys = Object.keys(params).sort()
  const paramString = sortedKeys
    .map(key => `${key}=${String(params[key])}`)
    .join('&')
  
  // Gerar hash (simples, para uso local apenas)
  // Em produção, usar função SQL generate_params_hash para consistência
  return btoa(paramString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64)
}

/**
 * Busca cache válido (não expirado)
 */
export async function getDashboardCache(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  endpoint: string,
  params: Record<string, unknown>
): Promise<unknown | null> {
  try {
    const paramsHash = generateParamsHash(params)
    
    // Chamar função SQL get_dashboard_cache
    const { data, error } = await supabaseClient.rpc('get_dashboard_cache', {
      p_project_id: projectId,
      p_endpoint: endpoint,
      p_params_hash: paramsHash
    })

    if (error) {
      console.error('[Dashboard Cache] Error fetching cache:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[Dashboard Cache] Exception fetching cache:', error)
    return null
  }
}

/**
 * Salva cache com TTL configurável
 */
export async function setDashboardCache(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  endpoint: string,
  params: Record<string, unknown>,
  data: unknown,
  ttlMinutes: number = 5 // TTL padrão: 5 minutos
): Promise<void> {
  try {
    const paramsHash = generateParamsHash(params)
    
    // Chamar função SQL set_dashboard_cache
    const { error } = await supabaseClient.rpc('set_dashboard_cache', {
      p_project_id: projectId,
      p_endpoint: endpoint,
      p_params_hash: paramsHash,
      p_data: data,
      p_ttl_minutes: ttlMinutes
    })

    if (error) {
      console.error('[Dashboard Cache] Error saving cache:', error)
    } else {
      console.log('[Dashboard Cache] Cache saved successfully', {
        endpoint,
        projectId,
        ttlMinutes
      })
    }
  } catch (error) {
    console.error('[Dashboard Cache] Exception saving cache:', error)
  }
}

/**
 * Tipos de endpoints de cache suportados
 */
export type CacheEndpoint = 
  | 'summary'
  | 'funnel-stats'
  | 'pipeline-stats'
  | 'origin-breakdown'
  | 'drill-down'
  | 'time-series'
  | 'metrics'
