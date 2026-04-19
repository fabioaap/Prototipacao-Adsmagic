/**
 * Contact Origin Service — REST client version
 *
 * Manages contacts with origin tracking for incoming messages.
 */
import type { SupabaseRestClient } from '../lib/supabase.js'
import type {
  ProcessContactOriginParams,
  ProcessContactOriginResult,
  StandardizedSourceData,
} from '../types/contact-origin-types.js'
import type { NormalizedMessage } from '../types/messaging.js'
import {
  normalizeIdentifier,
  generateCanonicalIdentifier,
  type ContactIdentifier,
} from '../utils/identifier-normalizer.js'
import { getStorablePhoneParts } from '../utils/phone-quality.js'
import { OriginDataNormalizer } from './origin-data-normalizer.js'
import { findCustomOriginByUtmSourceMatch } from './custom-origin-utm-matcher.js'
import { ContactRepository } from '../repositories/contact.repo.js'
import { extractCriticalFields } from '../utils/source-data-helpers.js'

export class ContactOriginService {
  private contactRepo: ContactRepository
  private supabase: SupabaseRestClient

  constructor(supabase: SupabaseRestClient) {
    this.supabase = supabase
    this.contactRepo = new ContactRepository(supabase)
  }

  async processIncomingContact(
    params: ProcessContactOriginParams
  ): Promise<ProcessContactOriginResult> {
    const { normalizedMessage, projectId } = params
    const shouldPersistOrigin = params.skipOriginPersistence !== true

    if (normalizedMessage.isGroup) {
      throw new Error(
        'processIncomingContact só deve ser chamado para mensagens de contato individual (isGroup=false)'
      )
    }

    const identifier = this.extractIdentifier(normalizedMessage)
    const sourceData = OriginDataNormalizer.normalize(normalizedMessage)

    const existingContact = await this.contactRepo.findByAnyIdentifier({
      projectId,
      phone: identifier.normalizedPhone?.phone,
      countryCode: identifier.normalizedPhone?.countryCode,
      jid: identifier.originalJid,
      lid: identifier.originalLid,
      canonicalIdentifier: generateCanonicalIdentifier(identifier),
    })

    if (!existingContact) {
      if (sourceData && OriginDataNormalizer.hasOriginData(sourceData)) {
        return await this.createContactWithOrigin({
          projectId,
          identifier,
          name: normalizedMessage.from.name || identifier.normalizedPhone?.phone || 'Sem nome',
          sourceData,
          persistOrigin: shouldPersistOrigin,
        })
      } else {
        const contactId = await this.ensureContactExists({
          projectId,
          identifier,
          name: normalizedMessage.from.name || identifier.normalizedPhone?.phone || 'Sem nome',
        })

        const defaultOriginId = await this.findOrCreateDefaultOrigin(projectId, 'WhatsApp')

        return {
          contactId,
          created: true,
          originId: defaultOriginId,
          sourceData: undefined,
        }
      }
    }

    let originId: string | undefined = existingContact.main_origin_id as string | undefined

    if (sourceData && OriginDataNormalizer.hasOriginData(sourceData) && shouldPersistOrigin) {
      originId = await this.findOrCreateOrigin({ projectId, sourceData })
      await this.createContactOrigin({
        contactId: existingContact.id,
        projectId,
        sourceData,
      })
    }

    return {
      contactId: existingContact.id,
      created: false,
      originId,
      sourceData: sourceData || undefined,
    }
  }

  private extractIdentifier(message: NormalizedMessage): ContactIdentifier {
    if (message.from.canonicalIdentifier) {
      try {
        if (message.from.phoneNumber) return normalizeIdentifier(message.from.phoneNumber)
        if (message.from.jid) return normalizeIdentifier(message.from.jid)
        if (message.from.lid) return normalizeIdentifier(message.from.lid)
      } catch (error) {
        console.warn('[ContactOriginService] Error normalizing canonicalIdentifier:', error)
      }
    }

    if (message.from.phoneNumber) return normalizeIdentifier(message.from.phoneNumber)
    if (message.from.jid) return normalizeIdentifier(message.from.jid)
    if (message.from.lid) return normalizeIdentifier(message.from.lid)

    throw new Error('No valid contact identifier found in message (phoneNumber, jid, or lid required)')
  }

  private async createContactWithOrigin(params: {
    projectId: string
    identifier: ContactIdentifier
    name: string
    sourceData: StandardizedSourceData | null
    persistOrigin: boolean
  }): Promise<ProcessContactOriginResult> {
    const originId = await this.findOrCreateOrigin({
      projectId: params.projectId,
      sourceData: params.sourceData,
    })

    const firstStage = await this.getFirstActiveStage(params.projectId)
    if (!firstStage) throw new Error('Nenhum estágio ativo encontrado para o projeto')

    const canonicalId = generateCanonicalIdentifier(params.identifier)
    const storablePhone = getStorablePhoneParts(params.identifier)

    const contact = await this.contactRepo.create({
      project_id: params.projectId,
      name: params.name,
      phone: storablePhone?.phone || null,
      country_code: storablePhone?.countryCode || null,
      jid: params.identifier.originalJid || null,
      lid: params.identifier.originalLid || null,
      canonical_identifier: canonicalId,
      main_origin_id: originId,
      current_stage_id: firstStage.id,
      metadata: {
        platform: 'whatsapp',
        identifier_quality: {
          hasValidPhone: !!storablePhone,
          source: params.identifier.primaryType,
        },
      },
    })

    if (params.persistOrigin && params.sourceData && OriginDataNormalizer.hasOriginData(params.sourceData)) {
      await this.insertContactOrigin({
        contactId: contact.id,
        originId,
        sourceData: params.sourceData,
      })
    }

    await this.insertStageHistory({ contactId: contact.id, stageId: firstStage.id })

    return {
      contactId: contact.id,
      created: true,
      originId,
      sourceData: params.sourceData || undefined,
    }
  }

  private async ensureContactExists(params: {
    projectId: string
    identifier: ContactIdentifier
    name: string
  }): Promise<string> {
    const defaultOriginId = await this.findOrCreateDefaultOrigin(params.projectId, 'WhatsApp')

    const firstStage = await this.getFirstActiveStage(params.projectId)
    if (!firstStage) throw new Error('Nenhum estágio ativo encontrado para o projeto')

    const canonicalId = generateCanonicalIdentifier(params.identifier)
    const storablePhone = getStorablePhoneParts(params.identifier)

    const contact = await this.contactRepo.create({
      project_id: params.projectId,
      name: params.name,
      phone: storablePhone?.phone || null,
      country_code: storablePhone?.countryCode || null,
      jid: params.identifier.originalJid || null,
      lid: params.identifier.originalLid || null,
      canonical_identifier: canonicalId,
      main_origin_id: defaultOriginId,
      current_stage_id: firstStage.id,
      metadata: {
        platform: 'whatsapp',
        identifier_quality: {
          hasValidPhone: !!storablePhone,
          source: params.identifier.primaryType,
        },
      },
    })

    await this.insertStageHistory({ contactId: contact.id, stageId: firstStage.id })
    return contact.id
  }

  private async createContactOrigin(params: {
    contactId: string
    projectId: string
    sourceData: StandardizedSourceData
  }): Promise<void> {
    const originId = await this.findOrCreateOrigin({
      projectId: params.projectId,
      sourceData: params.sourceData,
    })
    await this.insertContactOrigin({
      contactId: params.contactId,
      originId,
      sourceData: params.sourceData,
    })
  }

  private async findOrCreateOrigin(params: {
    projectId: string
    sourceData: StandardizedSourceData | null
  }): Promise<string> {
    if (!params.sourceData || !OriginDataNormalizer.hasOriginData(params.sourceData)) {
      return await this.findOrCreateDefaultOrigin(params.projectId, 'WhatsApp')
    }

    const sourceApp = params.sourceData.metadata?.source_app
    const utmSource = params.sourceData.utm?.utm_source || null

    if (sourceApp === 'other') {
      const customOriginMatch = await findCustomOriginByUtmSourceMatch({
        supabase: this.supabase,
        projectId: params.projectId,
        utmSource,
      })
      if (customOriginMatch) return customOriginMatch.originId
    }

    let originName: string
    if (sourceApp === 'facebook' || sourceApp === 'instagram') {
      originName = 'Meta Ads'
    } else if (sourceApp === 'google') {
      originName = 'Google Ads'
    } else if (sourceApp === 'tiktok') {
      originName = 'TikTok Ads'
    } else {
      return await this.findOrCreateDefaultOrigin(params.projectId, 'WhatsApp')
    }

    // Try system origin first (project_id IS NULL)
    const systemOrigin = await this.supabase.selectOne('origins', {
      'project_id': `is.null`,
      'name': `eq.${originName}`,
      'is_active': `eq.true`,
    }, 'id')

    if (systemOrigin) return systemOrigin.id as string

    return await this.findOrCreateDefaultOrigin(params.projectId, originName)
  }

  private async findOrCreateDefaultOrigin(projectId: string, originName: string): Promise<string> {
    // System origin first
    const systemOrigin = await this.supabase.selectOne('origins', {
      'project_id': `is.null`,
      'name': `eq.${originName}`,
      'is_active': `eq.true`,
    }, 'id')

    if (systemOrigin) return systemOrigin.id as string

    // Project origin
    const projectOrigin = await this.supabase.selectOne('origins', {
      'project_id': `eq.${projectId}`,
      'name': `eq.${originName}`,
      'is_active': `eq.true`,
    }, 'id')

    if (projectOrigin) return projectOrigin.id as string

    // Create new
    const rows = await this.supabase.insert('origins', {
      project_id: projectId,
      name: originName,
      type: 'custom',
      color: this.getDefaultColorForOrigin(originName),
      icon: this.getDefaultIconForOrigin(originName),
      is_active: true,
    })

    if (!rows[0]) throw new Error(`Erro ao criar origem: dados não retornados`)
    return rows[0].id as string
  }

  private async insertContactOrigin(params: {
    contactId: string
    originId: string
    sourceData: StandardizedSourceData
  }): Promise<void> {
    const criticalFields = extractCriticalFields(params.sourceData)

    await this.supabase.insert('contact_origins', {
      contact_id: params.contactId,
      origin_id: params.originId,
      source_data: params.sourceData,
      campaign_id: criticalFields.campaignId,
      ad_id: criticalFields.adId,
      adgroup_id: criticalFields.adgroupId,
      source_app: criticalFields.sourceApp,
      acquired_at: new Date().toISOString(),
    })
  }

  private async insertStageHistory(params: {
    contactId: string
    stageId: string
  }): Promise<void> {
    try {
      await this.supabase.insert('contact_stage_history', {
        contact_id: params.contactId,
        stage_id: params.stageId,
        moved_by: 'system',
      })
    } catch (error) {
      console.warn('[ContactOriginService] Erro ao registrar histórico de estágio:', error)
    }
  }

  private async getFirstActiveStage(projectId: string): Promise<{ id: string } | null> {
    const rows = await this.supabase.select('stages', {
      'project_id': `eq.${projectId}`,
      'is_active': `eq.true`,
      'order': 'display_order.asc',
      'limit': '1',
    }, 'id')

    return rows[0] ? { id: rows[0].id as string } : null
  }

  private getDefaultColorForOrigin(originName: string): string {
    const colors: Record<string, string> = {
      'Meta Ads': '#0866FF',
      'Google Ads': '#4285F4',
      'TikTok Ads': '#000000',
      'WhatsApp': '#25D366',
    }
    return colors[originName] || '#6B7280'
  }

  private getDefaultIconForOrigin(originName: string): string {
    const icons: Record<string, string> = {
      'Meta Ads': 'facebook',
      'Google Ads': 'chrome',
      'TikTok Ads': 'music',
      'WhatsApp': 'message-circle',
    }
    return icons[originName] || 'help-circle'
  }
}
