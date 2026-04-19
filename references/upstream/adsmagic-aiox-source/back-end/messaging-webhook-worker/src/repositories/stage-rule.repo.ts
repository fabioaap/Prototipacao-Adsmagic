/**
 * Stage Rule Repository — REST client version
 */
import type { SupabaseRestClient } from '../lib/supabase.js'

export interface StageRule {
  stageId: string
  stageName: string
  trackingPhrase: string
  displayOrder: number
}

export class StageRuleRepository {
  constructor(private supabase: SupabaseRestClient) {}

  async listActiveRules(projectId: string): Promise<StageRule[]> {
    const rows = await this.supabase.select(
      'stages',
      {
        'project_id': `eq.${projectId}`,
        'is_active': `eq.true`,
        'order': 'display_order.asc',
      },
      'id,name,tracking_phrase,display_order'
    )

    return rows
      .filter(row => {
        const phrase = row.tracking_phrase as string | null
        return phrase && phrase.trim().length > 0
      })
      .map(row => ({
        stageId: row.id as string,
        stageName: row.name as string,
        trackingPhrase: row.tracking_phrase as string,
        displayOrder: row.display_order as number,
      }))
  }
}
