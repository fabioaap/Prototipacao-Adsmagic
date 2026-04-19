import { successResponse, errorResponse } from '../utils/response.ts'
import type { SupabaseDbClient } from '../types-db.ts'

type SupabaseClient = SupabaseDbClient

const BASE_METRIC_IDS = [
  'spend',
  'revenue',
  'avgTicket',
  'roi',
  'cac',
  'contacts',
  'sales',
  'salesRate',
  'impressions',
  'clicks',
  'cpc',
  'ctr',
  'avgCycleDays',
  'activeCustomers',
]

const CUSTOM_METRIC_TYPES = ['stage_count', 'sum_stages', 'divide_stages', 'cost_per_stage'] as const
type CustomMetricType = (typeof CUSTOM_METRIC_TYPES)[number]

interface CustomMetricDefinition {
  id: string
  name: string
  type: CustomMetricType
  stageId?: string
  stageIds?: string[]
  numeratorStageIds?: string[]
  denominatorStageIds?: string[]
}

interface NorthStarConfigPayload {
  primaryMetricIds?: string[]
  detailedMetricOrder?: string[]
  customMetrics?: Array<Record<string, unknown>>
}

const CUSTOM_METRIC_ID_REGEX = /^[a-zA-Z0-9:_-]{1,80}$/

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const unique = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (!trimmed) continue
    unique.add(trimmed)
  }
  return Array.from(unique)
}

function normalizeCustomMetric(raw: Record<string, unknown>): CustomMetricDefinition | null {
  const type = typeof raw.type === 'string' ? raw.type : ''
  if (!CUSTOM_METRIC_TYPES.includes(type as CustomMetricType)) {
    return null
  }

  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  if (!name) return null

  const idRaw = typeof raw.id === 'string' ? raw.id.trim() : ''
  const id = idRaw || `custom:${crypto.randomUUID()}`
  if (!CUSTOM_METRIC_ID_REGEX.test(id)) return null

  const base: CustomMetricDefinition = {
    id,
    name: name.slice(0, 80),
    type: type as CustomMetricType,
  }

  const stageId = typeof raw.stageId === 'string' ? raw.stageId.trim() : ''
  const stageIds = normalizeStringArray(raw.stageIds)
  const numeratorStageIds = normalizeStringArray(raw.numeratorStageIds)
  const denominatorStageIds = normalizeStringArray(raw.denominatorStageIds)

  if (base.type === 'stage_count' || base.type === 'cost_per_stage') {
    if (!stageId) return null
    base.stageId = stageId
    return base
  }

  if (base.type === 'sum_stages') {
    if (stageIds.length === 0) return null
    base.stageIds = stageIds
    return base
  }

  if (numeratorStageIds.length === 0 || denominatorStageIds.length === 0) {
    return null
  }
  base.numeratorStageIds = numeratorStageIds
  base.denominatorStageIds = denominatorStageIds
  return base
}

function sanitizeMetricIds(ids: string[], allowed: Set<string>): string[] {
  const out: string[] = []
  for (const id of ids) {
    if (!allowed.has(id)) continue
    if (!out.includes(id)) out.push(id)
  }
  return out
}

export async function handleNorthStarConfig(req: Request, supabaseClient: SupabaseClient) {
  try {
    const projectId = req.headers.get('x-project-id')
    if (!projectId) return errorResponse('Project ID is required', 400)

    const { data: authData } = await supabaseClient.auth.getUser()
    const userId = authData?.user?.id ?? null

    let body: NorthStarConfigPayload
    try {
      body = (await req.json()) as NorthStarConfigPayload
    } catch {
      return errorResponse('Bad Request: Invalid JSON', 400)
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return errorResponse('Bad Request: body must be a JSON object', 400)
    }

    const rawCustomMetrics = Array.isArray(body.customMetrics) ? body.customMetrics : []
    const normalizedCustom = rawCustomMetrics
      .map((item) => (item && typeof item === 'object' ? normalizeCustomMetric(item) : null))
      .filter((item): item is CustomMetricDefinition => item !== null)

    if (normalizedCustom.length > 30) {
      return errorResponse('Limite de 30 métricas customizadas por projeto.', 400)
    }

    const customIds: string[] = []
    const customIdSet = new Set<string>()
    const baseIdSet = new Set(BASE_METRIC_IDS)

    for (const metric of normalizedCustom) {
      if (baseIdSet.has(metric.id)) {
        return errorResponse(`ID de métrica customizada conflita com métrica base: ${metric.id}`, 400)
      }
      if (customIdSet.has(metric.id)) {
        return errorResponse(`ID de métrica customizada duplicado: ${metric.id}`, 400)
      }
      customIdSet.add(metric.id)
      customIds.push(metric.id)
    }

    const allowedMetricIds = new Set([...BASE_METRIC_IDS, ...customIds])

    const primaryMetricIds = sanitizeMetricIds(
      normalizeStringArray(body.primaryMetricIds),
      allowedMetricIds
    ).slice(0, 4)

    const requestedOrder = sanitizeMetricIds(
      normalizeStringArray(body.detailedMetricOrder),
      allowedMetricIds
    )
    const fallbackOrder = [...BASE_METRIC_IDS, ...customIds]
    const mergedOrder = requestedOrder.length > 0 ? [...requestedOrder] : [...fallbackOrder]
    for (const metricId of fallbackOrder) {
      if (!mergedOrder.includes(metricId)) mergedOrder.push(metricId)
    }

    const { data, error } = await supabaseClient
      .from('project_dashboard_north_star_config')
      .upsert(
        {
          project_id: projectId,
          primary_metric_ids: primaryMetricIds,
          detailed_metric_order: mergedOrder,
          custom_metrics: normalizedCustom,
          updated_by: userId,
        },
        { onConflict: 'project_id' }
      )
      .select('project_id, primary_metric_ids, detailed_metric_order, custom_metrics, updated_at')
      .single()

    if (error) {
      console.error('[North Star Config] Error saving config:', error)
      return errorResponse('Não foi possível salvar a configuração da North Star.', 500)
    }

    await supabaseClient.rpc('invalidate_dashboard_cache', {
      p_project_id: projectId,
      p_endpoint: 'summary',
    })

    return successResponse({
      projectId: data.project_id,
      primaryMetricIds: data.primary_metric_ids ?? [],
      detailedMetricOrder: data.detailed_metric_order ?? [],
      customMetrics: data.custom_metrics ?? [],
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('[North Star Config] Unexpected error:', error)
    return errorResponse('Failed to update north star config', 500)
  }
}
