/**
 * Serviço compartilhado para métricas de estágios (tempo médio por estágio).
 *
 * Usado por pipeline-stats e funnel-stats para evitar N+1 queries.
 */

import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Calcula tempo médio que contatos permanecem em TODOS os estágios em uma única query.
 * Retorna Record<stageId, avgDays>.
 */
export async function calculateAvgDaysForAllStages(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  stageIds: string[],
  rangeStart: Date,
  rangeEnd: Date
): Promise<Record<string, number>> {
  if (stageIds.length === 0) return {}

  try {
    const startISO = rangeStart.toISOString()
    const endISO = rangeEnd.toISOString()

    const { data: history, error } = await supabaseClient
      .from('contact_stage_history')
      .select(`
        stage_id,
        moved_at,
        created_at,
        contacts!inner(project_id)
      `)
      .eq('contacts.project_id', projectId)
      .in('stage_id', stageIds)
      .gte('moved_at', startISO)
      .lte('moved_at', endISO)

    if (error) {
      console.error('[Stage Metrics] Error fetching all stage history:', error)
      return {}
    }

    if (!history || history.length === 0) {
      return {}
    }

    // Agrupar por stage_id e calcular média em memória
    const grouped: Record<string, { totalDays: number; count: number }> = {}

    for (const entry of history) {
      const stageId = entry.stage_id
      if (!stageId) continue

      const movedAt = entry.moved_at ? new Date(entry.moved_at) : (entry.created_at ? new Date(entry.created_at) : null)
      if (!movedAt) continue

      if (!grouped[stageId]) {
        grouped[stageId] = { totalDays: 0, count: 0 }
      }

      const days = Math.max(0, (rangeEnd.getTime() - movedAt.getTime()) / (1000 * 60 * 60 * 24))
      grouped[stageId].totalDays += days
      grouped[stageId].count++
    }

    const result: Record<string, number> = {}
    for (const [stageId, stats] of Object.entries(grouped)) {
      result[stageId] = stats.count > 0 ? stats.totalDays / stats.count : 0
    }

    return result
  } catch (error) {
    console.error('[Stage Metrics] Error calculating avg days for all stages:', error)
    return {}
  }
}
