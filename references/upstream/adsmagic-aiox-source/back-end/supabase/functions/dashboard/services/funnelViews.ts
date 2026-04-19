/**
 * Helpers puros para montar as visões do funil de conversão.
 *
 * `current`: contatos que estão atualmente na etapa.
 * `passed`: contatos que já chegaram até a etapa em algum momento.
 */

export interface FunnelStageDefinition {
  id: string
  name: string
  display_order: number
}

export interface FunnelContactRecord {
  id: string
  current_stage_id: string | null
}

export interface FunnelHistoryRecord {
  contact_id: string
  stage_id: string | null
}

export interface FunnelStageView {
  stageId: string
  stageName: string
  displayOrder: number
  count: number
  conversionRate: number
  avgDays: number
}

export interface FunnelViewMetrics {
  stages: FunnelStageView[]
  overallConversionRate: number
}

type StageCountMap = Record<string, number>

function createStageCountMap(orderedStages: FunnelStageDefinition[]): StageCountMap {
  const counts: StageCountMap = {}

  for (const stage of orderedStages) {
    counts[stage.id] = 0
  }

  return counts
}

function buildStageIndexById(orderedStages: FunnelStageDefinition[]): Record<string, number> {
  const stageIndexById: Record<string, number> = {}

  for (let index = 0; index < orderedStages.length; index++) {
    const stage = orderedStages[index]
    if (!stage) continue
    stageIndexById[stage.id] = index
  }

  return stageIndexById
}

function incrementCumulativeCounts(
  stageCounts: StageCountMap,
  orderedStages: FunnelStageDefinition[],
  farthestReachedIndex: number
): void {
  for (let index = 0; index <= farthestReachedIndex; index++) {
    const stage = orderedStages[index]
    if (!stage) continue
    stageCounts[stage.id] = (stageCounts[stage.id] ?? 0) + 1
  }
}

function buildHistoryMaxStageIndexByContact(
  history: FunnelHistoryRecord[],
  stageIndexById: Record<string, number>
): Record<string, number> {
  const historyMaxStageIndexByContact: Record<string, number> = {}

  for (const entry of history) {
    if (!entry.stage_id) continue

    const stageIndex = stageIndexById[entry.stage_id]
    if (stageIndex === undefined) continue

    const currentMax = historyMaxStageIndexByContact[entry.contact_id] ?? -1
    if (stageIndex > currentMax) {
      historyMaxStageIndexByContact[entry.contact_id] = stageIndex
    }
  }

  return historyMaxStageIndexByContact
}

export function countCurrentContactsByStage(
  orderedStages: FunnelStageDefinition[],
  contacts: FunnelContactRecord[]
): StageCountMap {
  const stageCounts = createStageCountMap(orderedStages)

  for (const contact of contacts) {
    if (!contact.current_stage_id) continue
    if (stageCounts[contact.current_stage_id] === undefined) continue

    stageCounts[contact.current_stage_id]++
  }

  return stageCounts
}

export function countPassedContactsByStage(
  orderedStages: FunnelStageDefinition[],
  contacts: FunnelContactRecord[],
  history: FunnelHistoryRecord[]
): StageCountMap {
  const stageCounts = createStageCountMap(orderedStages)
  const stageIndexById = buildStageIndexById(orderedStages)
  const historyMaxStageIndexByContact = buildHistoryMaxStageIndexByContact(history, stageIndexById)

  for (const contact of contacts) {
    const currentStageIndex =
      contact.current_stage_id ? (stageIndexById[contact.current_stage_id] ?? -1) : -1
    const historyStageIndex = historyMaxStageIndexByContact[contact.id] ?? -1
    const farthestReachedIndex = Math.max(currentStageIndex, historyStageIndex)

    if (farthestReachedIndex < 0) continue

    incrementCumulativeCounts(stageCounts, orderedStages, farthestReachedIndex)
  }

  return stageCounts
}

export function buildFunnelViewMetrics(params: {
  orderedStages: FunnelStageDefinition[]
  stageCounts: StageCountMap
  totalContacts: number
  avgDaysByStage: Record<string, number>
}): FunnelViewMetrics {
  const { orderedStages, stageCounts, totalContacts, avgDaysByStage } = params

  const stages: FunnelStageView[] = []
  let previousCount = totalContacts

  for (const stage of orderedStages) {
    const count = stageCounts[stage.id] ?? 0
    const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0

    stages.push({
      stageId: stage.id,
      stageName: stage.name,
      displayOrder: stage.display_order,
      count,
      conversionRate,
      avgDays: avgDaysByStage[stage.id] ?? 0
    })

    previousCount = count
  }

  const lastStage = stages[stages.length - 1]
  const lastStageCount = lastStage?.count ?? 0
  const overallConversionRate = totalContacts > 0 ? (lastStageCount / totalContacts) * 100 : 0

  return {
    stages,
    overallConversionRate
  }
}
