/**
 * Contact Stage Transition Repository — REST client version
 */
import type { SupabaseRestClient } from '../lib/supabase.js'

export class ContactStageTransitionRepository {
  constructor(private supabase: SupabaseRestClient) {}

  async moveToStage(params: {
    contactId: string
    projectId: string
    fromStageId: string | null
    toStageId: string
    movedBy?: string
  }): Promise<void> {
    const { contactId, projectId, fromStageId, toStageId, movedBy } = params

    // 1. Update contact's current_stage_id
    await this.supabase.update('contacts', {
      current_stage_id: toStageId,
      updated_at: new Date().toISOString(),
    }, { 'id': `eq.${contactId}` })

    // 2. Insert stage history
    await this.supabase.insert('contact_stage_history', {
      contact_id: contactId,
      project_id: projectId,
      from_stage_id: fromStageId,
      to_stage_id: toStageId,
      moved_by: movedBy || 'system:webhook',
    })

    // 3. Insert activity
    await this.supabase.insert('contact_activities', {
      contact_id: contactId,
      project_id: projectId,
      type: 'stage_changed',
      metadata: {
        from_stage_id: fromStageId,
        to_stage_id: toStageId,
        moved_by: movedBy || 'system:webhook',
      },
    })
  }
}
