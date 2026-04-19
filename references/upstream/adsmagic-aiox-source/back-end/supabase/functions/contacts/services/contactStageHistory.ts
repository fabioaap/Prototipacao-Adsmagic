import type { SupabaseDbClient } from '../types-db.ts'

interface InsertContactStageHistoryParams {
  contactId: string
  stageId: string
  movedBy: string
}

/**
 * Registra a entrada do contato em uma etapa.
 */
export async function insertContactStageHistory(
  supabaseClient: SupabaseDbClient,
  params: InsertContactStageHistoryParams
): Promise<void> {
  const { error } = await supabaseClient
    .from('contact_stage_history')
    .insert({
      contact_id: params.contactId,
      stage_id: params.stageId,
      moved_at: new Date().toISOString(),
      moved_by: params.movedBy
    })

  if (error) {
    throw new Error(`Failed to insert contact stage history: ${error.message}`)
  }
}
