/**
 * Handler para estatísticas de funil de conversão (GET /dashboard/funnel-stats)
 *
 * Query params: period (ex: 7d, 30d, 90d); opcionalmente start_date e end_date (YYYY-MM-DD).
 * Se start_date e end_date forem fornecidos, usa esse intervalo; caso contrário, usa period.
 * Retorna 400 se start_date/end_date forem inválidos (formato ou start > end).
 *
 * Retorna:
 * - Visão `current`: contatos que estão atualmente na etapa
 * - Visão `passed`: contatos que já chegaram até a etapa
 * - Taxa de conversão sequencial entre estágios em cada visão
 * - Tempo médio em cada estágio
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { getDateRangeFromRequest } from '../utils/dateRange.ts'
import { calculateAvgDaysForAllStages } from '../services/stage-metrics.ts'
import {
  buildFunnelViewMetrics,
  countCurrentContactsByStage,
  countPassedContactsByStage
} from '../services/funnelViews.ts'
import type { SupabaseDbClient } from '../types-db.ts'

interface FunnelStage {
  stageId: string
  stageName: string
  displayOrder: number
  count: number
  conversionRate: number // Taxa de conversão deste estágio vs anterior
  avgDays: number // Tempo médio neste estágio
}

interface FunnelViewStats {
  stages: FunnelStage[]
  overallConversionRate: number
}

interface FunnelStats {
  totalContacts: number
  views: {
    current: FunnelViewStats
    passed: FunnelViewStats
  }
}

export async function handleFunnelStats(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    const url = new URL(req.url)
    const periodParam = url.searchParams.get('period') || '30d'

    const projectId = req.headers.get('x-project-id')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const dateRangeResult = getDateRangeFromRequest(url, periodParam)
    if (!dateRangeResult.ok) {
      return errorResponse(dateRangeResult.message, 400)
    }
    const { start, end } = dateRangeResult
    const startISO = start.toISOString()
    const endISO = end.toISOString()

    const originId = url.searchParams.get('origin') || null
    const filterByOrigin = originId && originId !== 'all'

    const { data: stages, error: stagesError } = await supabaseClient
      .from('stages')
      .select('id, name, display_order, type')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (stagesError) {
      console.error('[Funnel Stats] Error fetching stages:', stagesError)
      return errorResponse('Failed to fetch stages', 500)
    }

    if (!stages || stages.length === 0) {
      return successResponse(
        {
          totalContacts: 0,
          views: {
            current: {
              stages: [],
              overallConversionRate: 0
            },
            passed: {
              stages: [],
              overallConversionRate: 0
            }
          }
        },
        200
      )
    }

    let contactsQuery = supabaseClient
      .from('contacts')
      .select('id, current_stage_id')
      .eq('project_id', projectId)
      .gte('created_at', startISO)
      .lte('created_at', endISO)

    if (filterByOrigin) {
      contactsQuery = contactsQuery.eq('main_origin_id', originId!)
    }

    const { data: contacts, error: contactsError } = await contactsQuery

    if (contactsError) {
      console.error('[Funnel Stats] Error fetching contacts:', contactsError)
      return errorResponse('Failed to fetch contacts', 500)
    }

    const totalContacts = contacts?.length || 0

    const orderedStages = [...stages].sort((a, b) => a.display_order - b.display_order)
    const stageIds = orderedStages.map((stage) => stage.id)
    const contactIds = (contacts ?? []).map((contact) => contact.id)
    const currentStageCounts = countCurrentContactsByStage(orderedStages, contacts ?? [])

    let stageHistory: Array<{ contact_id: string; stage_id: string | null }> = []

    if (contactIds.length > 0 && stageIds.length > 0) {
      const { data: historyRows, error: historyError } = await supabaseClient
        .from('contact_stage_history')
        .select('contact_id, stage_id')
        .in('contact_id', contactIds)
        .in('stage_id', stageIds)

      if (historyError) {
        console.warn('[Funnel Stats] Error fetching stage history, using fallback logic:', historyError)
      } else {
        stageHistory = historyRows ?? []
      }
    }

    const passedStageCounts = countPassedContactsByStage(
      orderedStages,
      contacts ?? [],
      stageHistory
    )

    // Calcular avgDays para TODOS os estágios em uma única query (elimina N+1)
    const avgDaysByStage = await calculateAvgDaysForAllStages(
      supabaseClient,
      projectId,
      stageIds,
      start,
      end
    )

    const currentView = buildFunnelViewMetrics({
      orderedStages,
      stageCounts: currentStageCounts,
      totalContacts,
      avgDaysByStage
    })

    const passedView = buildFunnelViewMetrics({
      orderedStages,
      stageCounts: passedStageCounts,
      totalContacts,
      avgDaysByStage
    })

    const result: FunnelStats = {
      totalContacts,
      views: {
        current: currentView,
        passed: passedView
      }
    }

    console.log('[Dashboard Funnel Stats]', {
      projectId,
      period: periodParam,
      stagesCount: orderedStages.length,
      totalContacts,
      currentOverallConversionRate: currentView.overallConversionRate,
      passedOverallConversionRate: passedView.overallConversionRate
    })

    return successResponse(result, 200)
  } catch (error) {
    console.error('[Dashboard Funnel Stats Error]', error)
    return errorResponse('Failed to fetch funnel stats', 500)
  }
}
