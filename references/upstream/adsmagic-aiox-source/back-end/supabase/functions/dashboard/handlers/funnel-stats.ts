/**
 * Handler para estatísticas de funil de conversão (GET /dashboard/funnel-stats)
 *
 * Query params: period (ex: 7d, 30d, 90d); opcionalmente start_date e end_date (YYYY-MM-DD).
 * Se start_date e end_date forem fornecidos, usa esse intervalo; caso contrário, usa period.
 * Retorna 400 se start_date/end_date forem inválidos (formato ou start > end).
 *
 * Retorna:
 * - Contagem cumulativa de contatos por estágio do funil
 * - Taxa de conversão sequencial entre estágios
 * - Tempo médio em cada estágio
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { getDateRangeFromRequest } from '../utils/dateRange.ts'
import type { SupabaseDbClient } from '../types-db.ts'

interface FunnelStage {
  stageId: string
  stageName: string
  displayOrder: number
  count: number
  conversionRate: number // Taxa de conversão deste estágio vs anterior
  avgDays: number // Tempo médio neste estágio
}

interface FunnelStats {
  stages: FunnelStage[]
  totalContacts: number
  overallConversionRate: number // Contatos -> Vendas
}

/**
 * Calcula tempo médio que contatos permanecem em cada estágio (movimentações no intervalo [rangeStart, rangeEnd]).
 */
async function calculateAvgDaysInStage(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  stageId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<number> {
  try {
    const startISO = rangeStart.toISOString()
    const endISO = rangeEnd.toISOString()

    const { data: history, error } = await supabaseClient
      .from('contact_stage_history')
      .select(`
        id,
        contact_id,
        stage_id,
        moved_at,
        created_at,
        contacts!inner(project_id)
      `)
      .eq('contacts.project_id', projectId)
      .eq('stage_id', stageId)
      .gte('moved_at', startISO)
      .lte('moved_at', endISO)

    if (error) {
      console.error('[Funnel Stats] Error fetching stage history:', error)
      return 0
    }

    if (!history || history.length === 0) {
      return 0
    }

    let totalDays = 0
    let count = 0
    for (const entry of history) {
      const movedAt = entry.moved_at ? new Date(entry.moved_at) : (entry.created_at ? new Date(entry.created_at) : null)
      if (movedAt) {
        const days = Math.max(0, (rangeEnd.getTime() - movedAt.getTime()) / (1000 * 60 * 60 * 24))
        totalDays += days
        count++
      }
    }

    return count > 0 ? totalDays / count : 0
  } catch (error) {
    console.error('[Funnel Stats] Error calculating avg days:', error)
    return 0
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
      return successResponse({
        stages: [],
        totalContacts: 0,
        overallConversionRate: 0
      }, 200)
    }

    const { data: contacts, error: contactsError } = await supabaseClient
      .from('contacts')
      .select('id, current_stage_id, created_at')
      .eq('project_id', projectId)
      .gte('created_at', startISO)
      .lte('created_at', endISO)

    if (contactsError) {
      console.error('[Funnel Stats] Error fetching contacts:', contactsError)
      return errorResponse('Failed to fetch contacts', 500)
    }

    const totalContacts = contacts?.length || 0

    // Contagem cumulativa: se o contato está em uma etapa mais avançada,
    // ele também conta como tendo passado pelas anteriores.
    const stageCounts: Record<string, number> = {}
    const orderedStages = [...stages].sort((a, b) => a.display_order - b.display_order)
    const stageIndexById: Record<string, number> = {}

    for (let index = 0; index < orderedStages.length; index++) {
      const stage = orderedStages[index]
      stageCounts[stage.id] = 0
      stageIndexById[stage.id] = index
    }

    for (const contact of contacts || []) {
      if (!contact.current_stage_id) {
        continue
      }

      const currentStageIndex = stageIndexById[contact.current_stage_id]
      if (currentStageIndex === undefined) {
        continue
      }

      for (let index = 0; index <= currentStageIndex; index++) {
        const reachedStage = orderedStages[index]
        if (!reachedStage) {
          continue
        }

        stageCounts[reachedStage.id]++
      }
    }

    const avgDaysPromises = orderedStages.map(stage =>
      calculateAvgDaysInStage(supabaseClient, projectId, stage.id, start, end)
    )
    const avgDaysResults = await Promise.all(avgDaysPromises)

    // Calcular taxas de conversão e montar resultado
    const funnelStages: FunnelStage[] = []
    let previousCount = totalContacts // Contatos no topo do funil

    for (let i = 0; i < orderedStages.length; i++) {
      const stage = orderedStages[i]
      const count = stageCounts[stage.id] || 0
      const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0

      funnelStages.push({
        stageId: stage.id,
        stageName: stage.name,
        displayOrder: stage.display_order,
        count,
        conversionRate,
        avgDays: avgDaysResults[i]
      })

      previousCount = count // Para próximo estágio, usar count atual como base
    }

    const lastStageCount = funnelStages.length > 0 ? (funnelStages[funnelStages.length - 1]?.count ?? 0) : 0
    const overallConversionRate = totalContacts > 0 ? (lastStageCount / totalContacts) * 100 : 0

    const result: FunnelStats = {
      stages: funnelStages,
      totalContacts,
      overallConversionRate
    }

    console.log('[Dashboard Funnel Stats]', {
      projectId,
      period: periodParam,
      stagesCount: funnelStages.length,
      totalContacts,
      overallConversionRate
    })

    return successResponse(result, 200)
  } catch (error) {
    console.error('[Dashboard Funnel Stats Error]', error)
    return errorResponse('Failed to fetch funnel stats', 500)
  }
}
