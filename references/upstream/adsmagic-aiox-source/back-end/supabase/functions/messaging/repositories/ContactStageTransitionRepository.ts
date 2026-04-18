import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { SupabaseDbClient } from '../types-db.ts'

export interface MoveToStageParams {
  contactId: string
  projectId: string
  fromStageId: string
  toStageId: string
  matchedPhrase: string
  matchedText: string
  brokerType: string
  accountId: string
  messageId: string
}

export class ContactStageTransitionRepository {
  private supabaseClient: SupabaseDbClient

  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
  }

  async moveToStage(params: MoveToStageParams): Promise<void> {
    await this.updateContactStage(params.contactId, params.toStageId)
    await this.insertStageHistory(params.contactId, params.toStageId)
    await this.insertActivity(params)
  }

  private async updateContactStage(contactId: string, stageId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('contacts')
      .update({
        current_stage_id: stageId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)

    if (error) {
      throw new Error(`Failed to update contact stage: ${error.message}`)
    }
  }

  private async insertStageHistory(contactId: string, stageId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('contact_stage_history')
      .insert({
        contact_id: contactId,
        stage_id: stageId,
        moved_at: new Date().toISOString(),
        moved_by: 'system:webhook',
      })

    if (error) {
      throw new Error(`Failed to insert stage history: ${error.message}`)
    }
  }

  private async insertActivity(params: MoveToStageParams): Promise<void> {
    const { error } = await this.supabaseClient
      .from('contact_activities')
      .insert({
        contact_id: params.contactId,
        project_id: params.projectId,
        type: 'stage_changed',
        title: 'Contato avançou de estágio via WhatsApp',
        description: `Mudança automática de estágio por correspondência de mensagem: "${params.matchedPhrase}"`,
        metadata: {
          source: 'whatsapp_webhook',
          broker_type: params.brokerType,
          account_id: params.accountId,
          message_id: params.messageId,
          matched_phrase: params.matchedPhrase,
          matched_text: params.matchedText,
          from_stage_id: params.fromStageId,
          to_stage_id: params.toStageId,
        },
      })

    if (error) {
      throw new Error(`Failed to insert contact activity: ${error.message}`)
    }
  }
}
