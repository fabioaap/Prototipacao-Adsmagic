/**
 * Utilitários de Cache para Settings
 *
 * Funções auxiliares para gerenciar cache de settings
 * usando a tabela dashboard_cache (endpoint: 'settings')
 */

import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Gera hash dos parâmetros
 */
export function generateParamsHash(params: Record<string, unknown>): string {
  const sortedKeys = Object.keys(params).sort()
  const paramString = sortedKeys
    .map(key => `${key}=${String(params[key])}`)
    .join('&')
  return btoa(paramString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64)
}

/**
 * Busca cache de settings válido (não expirado)
 */
export async function getSettingsCache(
  supabaseClient: SupabaseDbClient,
  projectId: string
): Promise<unknown | null> {
  try {
    const paramsHash = generateParamsHash({ type: 'full_settings' })

    const { data, error } = await supabaseClient.rpc('get_dashboard_cache', {
      p_project_id: projectId,
      p_endpoint: 'settings',
      p_params_hash: paramsHash
    })

    if (error) {
      console.error('[Settings Cache] Error fetching cache:', error)
      return null
    }

    if (data) {
      console.log('[Settings Cache] Cache hit for project:', projectId)
    }

    return data
  } catch (error) {
    console.error('[Settings Cache] Exception fetching cache:', error)
    return null
  }
}

/**
 * Salva cache de settings
 * TTL: 10 minutos (settings mudam menos frequentemente que dashboard)
 */
export async function setSettingsCache(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  data: unknown
): Promise<void> {
  try {
    const paramsHash = generateParamsHash({ type: 'full_settings' })

    // Fire-and-forget: não bloqueia resposta
    supabaseClient.rpc('set_dashboard_cache', {
      p_project_id: projectId,
      p_endpoint: 'settings',
      p_params_hash: paramsHash,
      p_data: data,
      p_ttl_minutes: 10
    }).then(({ error }) => {
      if (error) {
        console.error('[Settings Cache] Error saving cache:', error)
      } else {
        console.log('[Settings Cache] Cache saved for project:', projectId)
      }
    })
  } catch (error) {
    console.error('[Settings Cache] Exception saving cache:', error)
  }
}

/**
 * Invalida cache de settings
 */
export async function invalidateSettingsCache(
  supabaseClient: SupabaseDbClient,
  projectId: string
): Promise<void> {
  try {
    const { error } = await supabaseClient.rpc('invalidate_dashboard_cache', {
      p_project_id: projectId,
      p_endpoint: 'settings'
    })

    if (error) {
      console.error('[Settings Cache] Error invalidating cache:', error)
    } else {
      console.log('[Settings Cache] Cache invalidated for project:', projectId)
    }
  } catch (error) {
    console.error('[Settings Cache] Exception invalidating cache:', error)
  }
}
