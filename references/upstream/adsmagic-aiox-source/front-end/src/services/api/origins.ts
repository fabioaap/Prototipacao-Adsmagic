/**
 * Origins API Service
 *
 * Serviço para gerenciar origens de tráfego (fontes de contatos).
 * Utiliza apiClient como camada única de rede (Edge Functions).
 *
 * @module services/api/origins
 */

import { apiClient, getApiErrorMessage } from './client'
import { supabaseEnabled } from './supabaseClient'
import { MOCK_ORIGINS } from '@/mocks/origins'
import type { Origin, CreateOriginDTO, UpdateOriginDTO } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

/** Resposta da API de listagem de origins (snake_case) */
interface BackendOriginRow {
  id: string
  project_id: string | null
  name: string
  type: 'system' | 'custom'
  color: string
  icon: string | null
  is_active: boolean
  utm_source_match_mode: 'exact' | 'contains' | null
  utm_source_match_value: string | null
  created_at: string
}

interface BackendOriginsListResponse {
  data: BackendOriginRow[]
  meta: { total: number; limit: number; offset: number }
}

// ============================================================================
// HELPERS
// ============================================================================

function getCurrentProjectId(): string | null {
  return localStorage.getItem('current_project_id')
}

/**
 * Converts backend origin (snake_case) to frontend Origin (camelCase)
 */
function mapBackendOriginToFrontend(row: BackendOriginRow): Origin {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: row.icon ?? undefined,
    isActive: row.is_active,
    utmSourceMatchMode: row.utm_source_match_mode,
    utmSourceMatchValue: row.utm_source_match_value,
    createdAt: row.created_at
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch all origins for the current project (system + custom)
 */
export async function getOrigins(): Promise<Result<Origin[], Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: true, value: [...MOCK_ORIGINS] }
    }

    const projectId = getCurrentProjectId()
    if (!projectId) {
      return { ok: true, value: [] }
    }

    const response = await apiClient.get<BackendOriginsListResponse>('/origins', {
      params: { project_id: projectId, limit: 50, offset: 0 }
    })

    const rows = response.data?.data ?? []
    const origins = rows.map(mapBackendOriginToFrontend)
    return { ok: true, value: origins }
  } catch (err) {
    const message = getApiErrorMessage(err)
    if (import.meta.env.DEV) {
      console.error('[Origins Service] Error fetching origins:', err)
    }
    return { ok: false, error: new Error(message) }
  }
}

/**
 * Get a single origin by ID
 */
export async function getOriginById(id: string): Promise<Result<Origin | null, Error>> {
  try {
    if (!supabaseEnabled) {
      const origin = MOCK_ORIGINS.find((o) => o.id === id)
      return { ok: true, value: origin ?? null }
    }

    const response = await apiClient.get<BackendOriginRow>(`/origins/${id}`)
    return { ok: true, value: mapBackendOriginToFrontend(response.data) }
  } catch (err: unknown) {
    if (import.meta.env.DEV) {
      console.error('[Origins Service] getOriginById error:', err)
    }
    const axiosErr = err as { response?: { status?: number } }
    if (axiosErr.response?.status === 404) {
      return { ok: true, value: null }
    }
    return { ok: false, error: new Error(getApiErrorMessage(err)) }
  }
}

/**
 * Create a new custom origin
 */
export async function createOrigin(dto: CreateOriginDTO): Promise<Result<Origin, Error>> {
  try {
    if (!supabaseEnabled) {
      const newOrigin: Origin = {
        id: `origin-custom-${Date.now()}`,
        name: dto.name,
        type: 'custom',
        color: dto.color,
        icon: dto.icon,
        isActive: true,
        createdAt: new Date().toISOString()
      }
      return { ok: true, value: newOrigin }
    }

    const projectId = getCurrentProjectId()
    if (!projectId) {
      return { ok: false, error: new Error('Nenhum projeto selecionado') }
    }

    const body: Record<string, unknown> = {
      project_id: projectId,
      name: dto.name,
      type: 'custom' as const,
      color: dto.color,
      is_active: true
    }
    if (dto.icon !== undefined) body.icon = dto.icon
    if (dto.utmSourceMatchMode !== undefined) body.utm_source_match_mode = dto.utmSourceMatchMode
    if (dto.utmSourceMatchValue !== undefined) body.utm_source_match_value = dto.utmSourceMatchValue

    const response = await apiClient.post<BackendOriginRow>('/origins', body)
    return { ok: true, value: mapBackendOriginToFrontend(response.data) }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Origins Service] createOrigin error:', err)
    }
    return { ok: false, error: new Error(getApiErrorMessage(err)) }
  }
}

/**
 * Update an existing origin
 */
export async function updateOrigin(
  id: string,
  dto: UpdateOriginDTO
): Promise<Result<Origin, Error>> {
  try {
    if (!supabaseEnabled) {
      const origin = MOCK_ORIGINS.find((o) => o.id === id)
      if (!origin) return { ok: false, error: new Error('Origem não encontrada') }
      const updated = { ...origin, ...dto }
      return { ok: true, value: updated }
    }

    const body: Record<string, unknown> = {}
    if (dto.name !== undefined) body.name = dto.name
    if (dto.color !== undefined) body.color = dto.color
    if (dto.icon !== undefined) body.icon = dto.icon
    if (dto.isActive !== undefined) body.is_active = dto.isActive
    if (dto.utmSourceMatchMode !== undefined) body.utm_source_match_mode = dto.utmSourceMatchMode
    if (dto.utmSourceMatchValue !== undefined) body.utm_source_match_value = dto.utmSourceMatchValue

    const response = await apiClient.patch<BackendOriginRow>(`/origins/${id}`, body)
    return { ok: true, value: mapBackendOriginToFrontend(response.data) }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Origins Service] updateOrigin error:', err)
    }
    return { ok: false, error: new Error(getApiErrorMessage(err)) }
  }
}

/**
 * Delete a custom origin
 */
export async function deleteOrigin(id: string): Promise<Result<void, Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: true, value: undefined }
    }

    await apiClient.delete(`/origins/${id}`)
    return { ok: true, value: undefined }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Origins Service] deleteOrigin error:', err)
    }
    return { ok: false, error: new Error(getApiErrorMessage(err)) }
  }
}
