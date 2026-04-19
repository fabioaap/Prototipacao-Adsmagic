import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import {
  buildFunnelViewMetrics,
  countCurrentContactsByStage,
  countPassedContactsByStage,
  type FunnelContactRecord,
  type FunnelHistoryRecord,
  type FunnelStageDefinition
} from '../services/funnelViews.ts'

const orderedStages: FunnelStageDefinition[] = [
  { id: 'stage-1', name: 'Contato iniciado', display_order: 0 },
  { id: 'stage-2', name: 'Qualificação', display_order: 1 },
  { id: 'stage-3', name: 'Proposta', display_order: 2 },
  { id: 'stage-4', name: 'Venda', display_order: 3 }
]

function createContacts(): FunnelContactRecord[] {
  return [
    { id: 'contact-1', current_stage_id: 'stage-2' },
    { id: 'contact-2', current_stage_id: 'stage-4' },
    { id: 'contact-3', current_stage_id: 'stage-1' },
    { id: 'contact-4', current_stage_id: 'stage-2' }
  ]
}

Deno.test('countCurrentContactsByStage - conta apenas contatos na etapa atual', () => {
  const counts = countCurrentContactsByStage(orderedStages, createContacts())

  assertEquals(counts['stage-1'], 1)
  assertEquals(counts['stage-2'], 2)
  assertEquals(counts['stage-3'], 0)
  assertEquals(counts['stage-4'], 1)
})

Deno.test('countPassedContactsByStage - usa histórico e preserva etapa mais avançada já alcançada', () => {
  const contacts = createContacts()
  const history: FunnelHistoryRecord[] = [
    { contact_id: 'contact-1', stage_id: 'stage-2' },
    { contact_id: 'contact-2', stage_id: 'stage-4' },
    { contact_id: 'contact-2', stage_id: 'stage-3' }
  ]

  const counts = countPassedContactsByStage(orderedStages, contacts, history)

  assertEquals(counts['stage-1'], 4)
  assertEquals(counts['stage-2'], 3)
  assertEquals(counts['stage-3'], 1)
  assertEquals(counts['stage-4'], 1)
})

Deno.test('countPassedContactsByStage - faz fallback cumulativo quando não há histórico suficiente', () => {
  const contacts: FunnelContactRecord[] = [
    { id: 'contact-legacy', current_stage_id: 'stage-3' }
  ]
  const history: FunnelHistoryRecord[] = []

  const counts = countPassedContactsByStage(orderedStages, contacts, history)

  assertEquals(counts['stage-1'], 1)
  assertEquals(counts['stage-2'], 1)
  assertEquals(counts['stage-3'], 1)
  assertEquals(counts['stage-4'], 0)
})

Deno.test('buildFunnelViewMetrics - calcula taxas sequenciais e conversão final por visão', () => {
  const stageCounts = {
    'stage-1': 4,
    'stage-2': 3,
    'stage-3': 1,
    'stage-4': 1
  }

  const result = buildFunnelViewMetrics({
    orderedStages,
    stageCounts,
    totalContacts: 4,
    avgDaysByStage: {
      'stage-1': 0,
      'stage-2': 2.5,
      'stage-3': 4,
      'stage-4': 6
    }
  })

  assertEquals(result.stages.length, 4)
  assertEquals(result.stages[0]?.conversionRate, 100)
  assertEquals(result.stages[1]?.conversionRate, 75)
  assertEquals(result.stages[2]?.conversionRate, 33.33333333333333)
  assertEquals(result.stages[3]?.conversionRate, 100)
  assertEquals(result.overallConversionRate, 25)
  assertEquals(result.stages[2]?.avgDays, 4)
})
