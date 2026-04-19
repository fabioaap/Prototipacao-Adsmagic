import type { SupabaseDbClient } from '../types-db.ts'
import type { StandardizedSourceData } from '../types/contact-origin-types.ts'
import { extractCriticalFields } from '../utils/source-data-helpers.ts'
import { findOrCreateSystemOrProjectOrigin } from '../utils/origin-resolver.ts'

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
  constructor(private readonly supabaseClient: SupabaseDbClient) {}

  async write(params: WriteAttributionParams): Promise<WriteAttributionResult> {
    const existingOriginsCount = await this.getContactOriginsCount(params.contactId)
    const originId = params.originId || await this.findOrCreateOrigin(params.projectId, params.originName)

    const existing = await this.findExistingAttribution(params)
    let contactOriginId = existing?.id ?? null
    let created = false

    if (!existing) {
      const criticalFields = extractCriticalFields(params.sourceData)
      const { data: inserted, error: insertError } = await this.supabaseClient
        .from('contact_origins')
        .insert({
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
        } as never)
        .select('id')
        .single()

      if (insertError) {
        // Idempotencia segura para corrida com index unico (contact_id, link_access_id)
        if (insertError.code === '23505' && params.linkAccessId) {
          const duplicate = await this.findExistingAttribution(params)
          contactOriginId = duplicate?.id ?? null
        } else {
          throw new Error(`Failed to create contact origin attribution: ${insertError.message}`)
        }
      } else {
        created = true
        contactOriginId = inserted?.id ?? null
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
      const { data } = await this.supabaseClient
        .from('contact_origins')
        .select('id')
        .eq('contact_id', params.contactId)
        .eq('link_access_id', params.linkAccessId)
        .maybeSingle()

      if (data) return data as { id: string }
    }

    const sourceId = params.sourceData.metadata?.source_id
    if (!sourceId) return null

    const { data } = await this.supabaseClient
      .from('contact_origins')
      .select('id')
      .eq('contact_id', params.contactId)
      .contains('source_data', { metadata: { source_id: sourceId } })
      .maybeSingle()

    return (data as { id: string } | null) ?? null
  }

  private async getContactOriginsCount(contactId: string): Promise<number> {
    const { count, error } = await this.supabaseClient
      .from('contact_origins')
      .select('id', { count: 'exact', head: true })
      .eq('contact_id', contactId)

    if (error) {
      console.error('[ContactOriginAttributionWriter] Failed to count contact origins', { contactId, error })
      return 0
    }

    return count ?? 0
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

    const { data: contact, error: contactError } = await this.supabaseClient
      .from('contacts')
      .select('main_origin_id')
      .eq('id', params.contactId)
      .eq('project_id', params.projectId)
      .maybeSingle()

    if (contactError || !contact) {
      return false
    }

    const currentOriginId = contact.main_origin_id as string | null
    let shouldUpdate = false

    if (model === 'last_touch') {
      shouldUpdate = currentOriginId !== params.nextOriginId
    } else if (model === 'first_touch') {
      shouldUpdate = params.existingOriginsCount === 0
    }

    if (!shouldUpdate) return false

    const { error: updateError } = await this.supabaseClient
      .from('contacts')
      .update({
        main_origin_id: params.nextOriginId,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', params.contactId)
      .eq('project_id', params.projectId)

    if (updateError) {
      console.error('[ContactOriginAttributionWriter] Failed to update main origin', {
        contactId: params.contactId,
        nextOriginId: params.nextOriginId,
        model,
        error: updateError,
      })
      return false
    }

    return true
  }

  private async getAttributionModel(projectId: string): Promise<AttributionModel> {
    const { data, error } = await this.supabaseClient
      .from('projects')
      .select('attribution_model')
      .eq('id', projectId)
      .maybeSingle()

    if (error || !data?.attribution_model) {
      return 'first_touch'
    }

    const value = data.attribution_model as string
    if (value === 'last_touch' || value === 'conversion') {
      return value
    }

    return 'first_touch'
  }

  private async findOrCreateOrigin(projectId: string, originName: string): Promise<string> {
    // Delega ao helper compartilhado — garante que nomes de sistema nunca
    // sejam duplicados como custom em nível de projeto.
    return await findOrCreateSystemOrProjectOrigin(
      this.supabaseClient,
      projectId,
      originName
    )
  }
}
