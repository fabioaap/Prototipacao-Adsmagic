/**
 * Utilitarios de Cache para Ad Insights
 *
 * Funcoes auxiliares para gerenciar cache de metricas de ads
 * usando a tabela dashboard_cache existente
 */

import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Gera hash dos parametros da query
 */
export function generateParamsHash(params: Record<string, unknown>): string {
  const sortedKeys = Object.keys(params).sort()
  const paramString = sortedKeys
    .map((key) => `${key}=${String(params[key])}`)
    .join('&')

  return btoa(paramString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64)
}

/**
 * Busca cache valido (nao expirado)
 */
export async function getAdInsightsCache(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  endpoint: string,
  params: Record<string, unknown>
): Promise<unknown | null> {
  try {
    const paramsHash = generateParamsHash(params)

    const { data, error } = await supabaseClient.rpc('get_dashboard_cache', {
      p_project_id: projectId,
      p_endpoint: `ad-insights-${endpoint}`,
      p_params_hash: paramsHash,
    })

    if (error) {
      console.error('[Ad Insights Cache] Error fetching cache:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[Ad Insights Cache] Exception fetching cache:', error)
    return null
  }
}

/**
 * Salva cache com TTL configuravel
 */
export async function setAdInsightsCache(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  endpoint: string,
  params: Record<string, unknown>,
  data: unknown,
  ttlMinutes: number = 15 // TTL padrao: 15 minutos para dados de ads
): Promise<void> {
  try {
    const paramsHash = generateParamsHash(params)

    const { error } = await supabaseClient.rpc('set_dashboard_cache', {
      p_project_id: projectId,
      p_endpoint: `ad-insights-${endpoint}`,
      p_params_hash: paramsHash,
      p_data: data,
      p_ttl_minutes: ttlMinutes,
    })

    if (error) {
      console.error('[Ad Insights Cache] Error saving cache:', error)
    } else {
      console.log('[Ad Insights Cache] Cache saved successfully', {
        endpoint,
        projectId,
        ttlMinutes,
      })
    }
  } catch (error) {
    console.error('[Ad Insights Cache] Exception saving cache:', error)
  }
}

/**
 * Tipos de endpoints de cache suportados
 */
export type AdInsightsCacheEndpoint =
  | 'summary'
  | 'campaigns'
  | 'adsets'
  | 'ads'
  | 'performance'
