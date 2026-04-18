/**
 * Stages API Service
 *
 * Serviço para gerenciar etapas do funil de vendas.
 * Utiliza apiClient como camada única de rede (Edge Functions).
 *
 * @module services/api/stages
 */

import { apiClient, getApiErrorMessage } from './client'
import { supabaseEnabled } from './supabaseClient'
import { MOCK_STAGES } from '@/mocks/stages'
import type { Stage, CreateStageDTO, UpdateStageDTO } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

/** Resposta da API de listagem de stages (snake_case) */
interface BackendStageRow {
  id: string
  project_id: string | null
  name: string
  display_order: number
  color: string | null
  tracking_phrase: string | null
  type: 'normal' | 'sale' | 'lost'
  is_active: boolean
  event_config: Record<string, unknown> | null
  created_at: string
  contacts_count?: number
}

interface BackendStagesListResponse {
  data: BackendStageRow[]
  meta: { total: number; limit: number; offset: number }
}

// ============================================================================
// HELPERS
// ============================================================================

function getCurrentProjectId(): string | null {
  return localStorage.getItem('current_project_id')
}

/**
 * Converts backend stage (snake_case) to frontend Stage (camelCase)
 */
function mapBackendStageToFrontend(row: BackendStageRow): Stage {
  return {
    id: row.id,
    projectId: row.project_id ?? undefined,
    name: row.name,
    order: row.display_order,
    color: row.color ?? undefined,
    trackingPhrase: row.tracking_phrase ?? undefined,
    type: row.type,
    isActive: row.is_active,
    eventConfig: row.event_config ?? undefined,
    createdAt: row.created_at,
    ...(row.contacts_count !== undefined && { contactsCount: row.contacts_count })
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch all stages for the current project (system + project-specific)
 */
export async function getStages(): Promise<Result<Stage[], Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: true, value: [...MOCK_STAGES] }
    }

    const projectId = getCurrentProjectId()
    if (!projectId) {
      return { ok: true, value: [] }
    }

    const response = await apiClient.get<BackendStagesListResponse>('/stages', {
      params: { project_id: projectId, limit: 50, offset: 0 }
    })

    const rows = response.data?.data ?? []
    const stages = rows.map(mapBackendStageToFrontend)
    return { ok: true, value: stages }
  } catch (err) {
    const message = getApiErrorMessage(err)
    if (import.meta.env.DEV) {
      console.error('[Stages Service] Error fetching stages:', err)
    }
    return { ok: false, error: new Error(message) }
  }
}

/**
 * Get a single stage by ID
 */
export async function getStageById(id: string): Promise<Result<Stage | null, Error>> {
  try {
    if (!supabaseEnabled) {
      const stage = MOCK_STAGES.find((s) => s.id === id)
      return { ok: true, value: stage ?? null }
    }

    const response = await apiClient.get<BackendStageRow>(`/stages/${id}`)
    return { ok: true, value: mapBackendStageToFrontend(response.data) }
  } catch (err: unknown) {
    if (import.meta.env.DEV) {
      console.error('[Stages Service] getStageById error:', err)
    }
    const axiosErr = err as { response?: { status?: number } }
    if (axiosErr.response?.status === 404) {
      return { ok: true, value: null }
    }
    return { ok: false, error: new Error(getApiErrorMessage(err)) }
  }
}

/**
 * Create a new stage
 */
export async function createStage(dto: CreateStageDTO): Promise<Result<Stage, Error>> {
  try {
    if (!supabaseEnabled) {
      const newStage: Stage = {
        id: `stage-${Date.now()}`,
        name: dto.name,
        order: 0,
        trackingPhrase: dto.trackingPhrase,
        type: dto.type,
        isActive: true,
        eventConfig: dto.eventConfig,
        createdAt: new Date().toISOString()
      }
      return { ok: true, value: newStage }
    }

    const projectId = getCurrentProjectId()
    if (!projectId) {
      return { ok: false, error: new Error('Nenhum projeto selecionado') }
    }

    const body = {
      project_id: projectId,
      name: dto.name,
      display_order: 0,
      tracking_phrase: dto.trackingPhrase ?? null,
      type: dto.type,
      is_active: true,
      ...(dto.color && { color: dto.color }),
      ...(dto.eventConfig && { event_config: dto.eventConfig })
    }

    const response = await apiClient.post<BackendStageRow>('/stages', body)
    return { ok: true, value: mapBackendStageToFrontend(response.data) }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Stages Service] createStage error:', err)
    }
    return { ok: false, error: new Error(getApiErrorMessage(err)) }
  }
}

/**
 * Update an existing stage
 */
export async function updateStage(
  id: string,
  dto: UpdateStageDTO
): Promise<Result<Stage, Error>> {
  try {
    if (!supabaseEnabled) {
      const stage = MOCK_STAGES.find((s) => s.id === id)
      if (!stage) return { ok: false, error: new Error('Etapa não encontrada') }
      const updated = { ...stage, ...dto }
      return { ok: true, value: updated }
    }

    const body: Record<string, unknown> = {}
    if (dto.name !== undefined) body.name = dto.name
    if (dto.order !== undefined) body.display_order = dto.order
    if (dto.trackingPhrase !== undefined) body.tracking_phrase = dto.trackingPhrase
    if (dto.isActive !== undefined) body.is_active = dto.isActive
    if (dto.eventConfig !== undefined) body.event_config = dto.eventConfig

    const response = await apiClient.patch<BackendStageRow>(`/stages/${id}`, body)
    return { ok: true, value: mapBackendStageToFrontend(response.data) }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Stages Service] updateStage error:', err)
    }
    return { ok: false, error: new Error(getApiErrorMessage(err)) }
  }
}

/**
 * Delete a stage
 */
export async function deleteStage(id: string): Promise<Result<void, Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: true, value: undefined }
    }

    await apiClient.delete(`/stages/${id}`)
    return { ok: true, value: undefined }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Stages Service] deleteStage error:', err)
    }
    return { ok: false, error: new Error(getApiErrorMessage(err)) }
  }
}

/**
 * Reorder stages (POST /stages/reorder)
 */
export async function reorderStages(stageIds: string[]): Promise<Result<Stage[], Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: true, value: [] }
    }

    if (stageIds.length === 0) {
      return { ok: true, value: [] }
    }

    const response = await apiClient.post<{ message?: string; data: BackendStageRow[] }>(
      '/stages/reorder',
      { stage_ids: stageIds }
    )

    const list = response.data?.data ?? []
    return { ok: true, value: list.map(mapBackendStageToFrontend) }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Stages Service] reorderStages error:', err)
    }
    return { ok: false, error: new Error(getApiErrorMessage(err)) }
  }
}
