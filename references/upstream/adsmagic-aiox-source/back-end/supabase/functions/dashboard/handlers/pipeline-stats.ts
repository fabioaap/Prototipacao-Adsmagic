/**
 * Handler para estatísticas de pipeline de vendas (GET /dashboard/pipeline-stats)
 *
 * Query params: period (ex: 7d, 30d, 90d); opcionalmente start_date e end_date (YYYY-MM-DD).
 * Se start_date e end_date forem fornecidos, usa esse intervalo; caso contrário, usa period.
 * Retorna 400 se start_date/end_date forem inválidos (formato ou start > end).
 *
 * Retorna:
 * - Deals (vendas) por estágio (contatos criados no período, agrupados por estágio atual)
 * - Valor total por estágio (vendas completed no período)
 * - Tempo médio por estágio
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { getDateRangeFromRequest } from '../utils/dateRange.ts'
import { calculateAvgDaysForAllStages } from '../services/stage-metrics.ts'
import type { SupabaseDbClient } from '../types-db.ts'

interface PipelineStage {
  stageId: string
  stageName: string
  displayOrder: number
  dealsCount: number // Número de contatos neste estágio
  totalValue: number // Valor total das vendas potenciais (contatos neste estágio que têm vendas)
  avgValue: number // Valor médio por deal
  avgDays: number // Tempo médio neste estágio
}

interface PipelineStats {
  stages: PipelineStage[]
  totalDeals: number
  totalValue: number
}

export async function handlePipelineStats(
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
      .select('id, name, display_order')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (stagesError) {
      console.error('[Pipeline Stats] Error fetching stages:', stagesError)
      return errorResponse('Failed to fetch stages', 500)
    }

    if (!stages || stages.length === 0) {
      return successResponse({
        stages: [],
        totalDeals: 0,
        totalValue: 0
      }, 200)
    }

    // Paralelizar contacts e sales (independentes)
    const [contactsResult, salesResult] = await Promise.all([
      supabaseClient
        .from('contacts')
        .select('id, current_stage_id')
        .eq('project_id', projectId)
        .gte('created_at', startISO)
        .lte('created_at', endISO),
      supabaseClient
        .from('sales')
        .select('id, contact_id, value, status, date')
        .eq('project_id', projectId)
        .eq('status', 'completed')
        .gte('date', startISO)
        .lte('date', endISO),
    ])

    const { data: contacts, error: contactsError } = contactsResult
    if (contactsError) {
      console.error('[Pipeline Stats] Error fetching contacts:', contactsError)
      return errorResponse('Failed to fetch contacts', 500)
    }

    const { data: sales, error: salesError } = salesResult
    if (salesError) {
      console.error('[Pipeline Stats] Error fetching sales:', salesError)
    }

    const salesByContact: Record<string, number> = {}
    for (const sale of sales || []) {
      if (sale.contact_id) {
        const currentValue = salesByContact[sale.contact_id] || 0
        salesByContact[sale.contact_id] = currentValue + Number(sale.value || 0)
      }
    }

    // Agrupar contatos (deals) por estágio
    const stageStats: Record<string, {
      count: number
      totalValue: number
    }> = {}

    for (const stage of stages) {
      stageStats[stage.id] = {
        count: 0,
        totalValue: 0
      }
    }

    let totalDeals = 0
    let totalValue = 0

    for (const contact of contacts || []) {
      if (contact.current_stage_id && stageStats[contact.current_stage_id]) {
        stageStats[contact.current_stage_id].count++
        totalDeals++

        const contactValue = salesByContact[contact.id] || 0
        stageStats[contact.current_stage_id].totalValue += contactValue
        totalValue += contactValue
      }
    }

    // Calcular avgDays para TODOS os estágios em uma única query (elimina N+1)
    const stageIds = stages.map(s => s.id)
    const avgDaysByStage = await calculateAvgDaysForAllStages(
      supabaseClient,
      projectId,
      stageIds,
      start,
      end
    )

    const pipelineStages: PipelineStage[] = []

    for (const stage of stages) {
      const stats = stageStats[stage.id]
      const dealsCount = stats.count || 0
      const stageTotalValue = stats.totalValue || 0
      const avgValue = dealsCount > 0 ? stageTotalValue / dealsCount : 0

      pipelineStages.push({
        stageId: stage.id,
        stageName: stage.name,
        displayOrder: stage.display_order,
        dealsCount,
        totalValue: stageTotalValue,
        avgValue,
        avgDays: avgDaysByStage[stage.id] || 0
      })
    }

    const result: PipelineStats = {
      stages: pipelineStages,
      totalDeals,
      totalValue
    }

    console.log('[Dashboard Pipeline Stats]', {
      projectId,
      period: periodParam,
      stagesCount: pipelineStages.length,
      totalDeals,
      totalValue
    })

    return successResponse(result, 200)
  } catch (error) {
    console.error('[Dashboard Pipeline Stats Error]', error)
    return errorResponse('Failed to fetch pipeline stats', 500)
  }
}
