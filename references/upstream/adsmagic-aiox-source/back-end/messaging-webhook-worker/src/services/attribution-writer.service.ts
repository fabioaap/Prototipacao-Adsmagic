/**
 * Contact Origin Attribution Writer — REST client version
 */
import type { SupabaseRestClient } from '../lib/supabase.js'
import type { StandardizedSourceData } from '../types/contact-origin-types.js'
import { extractCriticalFields } from '../utils/source-data-helpers.js'

type AttributionModel = 'first_touch' | 'last_touch' | 'conversion'

interface WriteAttributionParams {
  contactId: string
  projectId: string
  originName: string
  originId?: string | null
  sourceData: StandardizedSourceData
  linkAccessId?: string | null
  attributionSource: string
  attributionPriority?: number
  acquiredAt?: string
}

interface WriteAttributionResult {
  originId: string
  contactOriginId: string | null
  created: boolean
  mainOriginUpdated: boolean
}

export class ContactOriginAttributionWriter {
  constructor(private readonly supabase: SupabaseRestClient) {}

  async write(params: WriteAttributionParams): Promise<WriteAttributionResult> {
    const existingOriginsCount = await this.getContactOriginsCount(params.contactId)
    const originId = params.originId || await this.findOrCreateOrigin(params.projectId, params.originName)

    const existing = await this.findExistingAttribution(params)
    let contactOriginId = existing?.id ?? null
    let created = false

    if (!existing) {
      const criticalFields = extractCriticalFields(params.sourceData)
      try {
        const rows = await this.supabase.insert('contact_origins', {
          contact_id: params.contactId,
          origin_id: originId,
          link_access_id: params.linkAccessId ?? null,
          source_data: params.sourceData,
          campaign_id: criticalFields.campaignId,
          ad_id: criticalFields.adId,
          adgroup_id: criticalFields.adgroupId,
          source_app: criticalFields.sourceApp,
          attribution_source: params.attributionSource,
          attribution_priority: params.attributionPriority ?? 100,
          acquired_at: params.acquiredAt ?? new Date().toISOString(),
        })
        created = true
        contactOriginId = (rows[0]?.id as string) ?? null
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        // Idempotency: unique constraint violation on (contact_id, link_access_id)
        if (errorMessage.includes('23505') && params.linkAccessId) {
          const duplicate = await this.findExistingAttribution(params)
          contactOriginId = duplicate?.id ?? null
        } else {
          throw new Error(`Failed to create contact origin attribution: ${errorMessage}`)
        }
      }
    }

    const mainOriginUpdated = await this.applyMainOriginPolicy({
      contactId: params.contactId,
      projectId: params.projectId,
      nextOriginId: originId,
      existingOriginsCount,
    })

    return {
      originId,
      contactOriginId,
      created,
      mainOriginUpdated,
    }
  }

  private async findExistingAttribution(params: WriteAttributionParams): Promise<{ id: string } | null> {
    if (params.linkAccessId) {
      const row = await this.supabase.selectOne('contact_origins', {
        'contact_id': `eq.${params.contactId}`,
        'link_access_id': `eq.${params.linkAccessId}`,
      }, 'id')
      if (row) return row as { id: string }
    }

    const sourceId = params.sourceData.metadata?.source_id
    if (!sourceId) return null

    // Use cs. (contains) for JSONB containment: source_data @> '{"metadata":{"source_id":"..."}}'
    const row = await this.supabase.selectOne('contact_origins', {
      'contact_id': `eq.${params.contactId}`,
      'source_data': `cs.${JSON.stringify({ metadata: { source_id: sourceId } })}`,
    }, 'id')

    return (row as { id: string } | null) ?? null
  }

  private async getContactOriginsCount(contactId: string): Promise<number> {
    try {
      const rows = await this.supabase.select('contact_origins', {
        'contact_id': `eq.${contactId}`,
      }, 'id')
      return rows.length
    } catch (error) {
      console.error('[ContactOriginAttributionWriter] Failed to count contact origins', { contactId, error })
      return 0
    }
  }

  private async applyMainOriginPolicy(params: {
    contactId: string
    projectId: string
    nextOriginId: string
    existingOriginsCount: number
  }): Promise<boolean> {
    const model = await this.getAttributionModel(params.projectId)

    if (model === 'conversion') {
      return false
    }

    const contact = await this.supabase.selectOne('contacts', {
      'id': `eq.${params.contactId}`,
      'project_id': `eq.${params.projectId}`,
    }, 'main_origin_id')

    if (!contact) return false

    const currentOriginId = contact.main_origin_id as string | null
    let shouldUpdate = false

    if (model === 'last_touch') {
      shouldUpdate = currentOriginId !== params.nextOriginId
    } else if (model === 'first_touch') {
      shouldUpdate = params.existingOriginsCount === 0
    }

    if (!shouldUpdate) return false

    try {
      await this.supabase.update('contacts', {
        main_origin_id: params.nextOriginId,
        updated_at: new Date().toISOString(),
      }, {
        'id': `eq.${params.contactId}`,
        'project_id': `eq.${params.projectId}`,
      })
      return true
    } catch (error) {
      console.error('[ContactOriginAttributionWriter] Failed to update main origin', {
        contactId: params.contactId,
        nextOriginId: params.nextOriginId,
        model,
        error,
      })
      return false
    }
  }

  private async getAttributionModel(projectId: string): Promise<AttributionModel> {
    const row = await this.supabase.selectOne('projects', {
      'id': `eq.${projectId}`,
    }, 'attribution_model')

    if (!row?.attribution_model) return 'first_touch'

    const value = row.attribution_model as string
    if (value === 'last_touch' || value === 'conversion') return value
    return 'first_touch'
  }

  private async findOrCreateOrigin(projectId: string, originName: string): Promise<string> {
    // Try system origin first (project_id IS NULL)
    const systemOrigin = await this.supabase.selectOne('origins', {
      'project_id': `is.null`,
      'name': `eq.${originName}`,
      'is_active': `eq.true`,
    }, 'id')

    if (systemOrigin) return systemOrigin.id as string

    // Try project origin
    const projectOrigin = await this.supabase.selectOne('origins', {
      'project_id': `eq.${projectId}`,
      'name': `eq.${originName}`,
      'is_active': `eq.true`,
    }, 'id')

    if (projectOrigin) return projectOrigin.id as string

    // Create new origin
    const rows = await this.supabase.insert('origins', {
      project_id: projectId,
      name: originName,
      type: 'custom',
      color: '#6B7280',
      icon: 'help-circle',
      is_active: true,
    })

    if (!rows[0]) throw new Error(`Failed to find or create origin ${originName}`)
    return rows[0].id as string
  }
}
