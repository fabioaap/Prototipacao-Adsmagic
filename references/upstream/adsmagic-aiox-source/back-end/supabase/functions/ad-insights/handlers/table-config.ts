/**
 * Handler de configuração de tabela para Ad Insights.
 *
 * Endpoints:
 * - GET /ad-insights/table-config?platform=google&level=campaign
 * - PATCH /ad-insights/table-config?platform=google&level=campaign
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import {
  MAX_SELECTED_COLUMNS,
  resolveLevel,
  resolvePlatform,
  resolveTableColumns,
  sanitizeColumnIds,
  normalizeStringArray,
} from './table-config.helpers.ts'

type SupabaseClient = SupabaseDbClient

interface CustomMetricDefinition {
  id: string
  name: string
  type: string
  stageId?: string
  stageIds?: string[]
  numeratorStageIds?: string[]
  denominatorStageIds?: string[]
}

interface TableConfigPayload {
  selectedColumnIds?: string[]
  columnOrder?: string[]
  customMetrics?: CustomMetricDefinition[]
}

export async function handleTableConfig(
  req: Request,
  supabaseClient: SupabaseClient
) {
  try {
    const projectId = req.headers.get('x-project-id')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const url = new URL(req.url)
    const platform = resolvePlatform(url.searchParams.get('platform'))
    const level = resolveLevel(url.searchParams.get('level'))

    if (!platform) {
      return errorResponse('Platform is required (meta, google, tiktok)', 400)
    }

    if (!level) {
      return errorResponse('Level is required (campaign, adset, ad)', 400)
    }

    if (req.method === 'GET') {
      const { data, error } = await supabaseClient
        .from('project_ad_insights_table_config')
        .select('selected_column_ids, column_order, custom_metrics, updated_at')
        .eq('project_id', projectId)
        .eq('platform', platform)
        .eq('level', level)
        .maybeSingle()

      if (error) {
        console.error('[Ad Insights Table Config] Error fetching config:', error)
        return errorResponse('Não foi possível carregar a configuração da tabela.', 500)
      }

      const resolvedConfig = resolveTableColumns(
        level,
        data?.selected_column_ids,
        data?.column_order
      )

      const customMetrics = Array.isArray(data?.custom_metrics)
        ? data.custom_metrics
        : []

      return successResponse({
        projectId,
        platform,
        level,
        selectedColumnIds: resolvedConfig.selectedColumnIds,
        columnOrder: resolvedConfig.columnOrder,
        customMetrics,
        updatedAt: data?.updated_at ?? null,
      })
    }

    if (req.method === 'PATCH') {
      let body: TableConfigPayload
      try {
        body = (await req.json()) as TableConfigPayload
      } catch {
        return errorResponse('Bad Request: Invalid JSON', 400)
      }

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return errorResponse('Bad Request: body must be a JSON object', 400)
      }

      const selectedColumnIds = sanitizeColumnIds(
        normalizeStringArray(body.selectedColumnIds)
      )
      if (selectedColumnIds.length > MAX_SELECTED_COLUMNS) {
        return errorResponse('Limite de 20 colunas selecionadas por tabela.', 400)
      }

      const resolvedConfig = resolveTableColumns(
        level,
        selectedColumnIds,
        body.columnOrder
      )

      // Validate and normalize custom metrics
      const customMetrics = Array.isArray(body.customMetrics)
        ? body.customMetrics.filter(
            (m): m is CustomMetricDefinition =>
              typeof m === 'object' &&
              m !== null &&
              typeof m.id === 'string' &&
              m.id.startsWith('custom:') &&
              typeof m.name === 'string' &&
              typeof m.type === 'string' &&
              ['stage_count', 'sum_stages', 'divide_stages', 'cost_per_stage'].includes(m.type)
          )
        : undefined

      const { data: authData } = await supabaseClient.auth.getUser()
      const userId = authData?.user?.id ?? null

      const upsertPayload: Record<string, unknown> = {
        project_id: projectId,
        platform,
        level,
        selected_column_ids: resolvedConfig.selectedColumnIds,
        column_order: resolvedConfig.columnOrder,
        updated_by: userId,
      }

      if (customMetrics !== undefined) {
        upsertPayload.custom_metrics = customMetrics
      }

      const { data, error } = await supabaseClient
        .from('project_ad_insights_table_config')
        .upsert(upsertPayload, { onConflict: 'project_id,platform,level' })
        .select('selected_column_ids, column_order, custom_metrics, updated_at')
        .single()

      if (error) {
        console.error('[Ad Insights Table Config] Error saving config:', error)
        return errorResponse('Não foi possível salvar a configuração da tabela.', 500)
      }

      return successResponse({
        projectId,
        platform,
        level,
        selectedColumnIds: data.selected_column_ids ?? resolvedConfig.selectedColumnIds,
        columnOrder: data.column_order ?? resolvedConfig.columnOrder,
        customMetrics: Array.isArray(data.custom_metrics) ? data.custom_metrics : [],
        updatedAt: data.updated_at,
      })
    }

    return errorResponse('Method not allowed for table-config', 405)
  } catch (error) {
    console.error('[Ad Insights Table Config] Unexpected error:', error)
    return errorResponse('Failed to process table config', 500)
  }
}
