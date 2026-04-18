import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { SupabaseDbClient } from '../types-db.ts'

export interface StageRule {
  stageId: string
  stageName: string
  trackingPhrase: string
  displayOrder: number
}

export class StageRuleRepository {
  private supabaseClient: SupabaseDbClient

  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
  }

  async listActiveRules(projectId: string): Promise<StageRule[]> {
    const { data, error } = await this.supabaseClient
      .from('stages')
      .select('id, name, tracking_phrase, display_order')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch stage rules: ${error.message}`)
    }

    const rows = (data || []) as Array<Record<string, unknown>>

    return rows
      .map((stage) => ({
        stageId: String(stage.id || ''),
        stageName: String(stage.name || ''),
        trackingPhrase: String(stage.tracking_phrase || '').trim(),
        displayOrder: Number(stage.display_order || 0),
      }))
      .filter((rule) => rule.stageId && rule.trackingPhrase.length > 0)
  }
}
