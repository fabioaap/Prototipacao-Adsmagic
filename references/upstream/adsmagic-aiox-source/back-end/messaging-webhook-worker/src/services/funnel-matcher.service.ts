/**
 * Funnel Message Matcher Service — REST client version
 *
 * Matches outgoing WhatsApp messages against stage tracking phrases
 * to automatically move contacts through the funnel.
 */
import type { SupabaseRestClient } from '../lib/supabase.js'
import type { NormalizedMessage } from '../types/messaging.js'
import {
  normalizeIdentifier,
  generateCanonicalIdentifier,
  type ContactIdentifier,
} from '../utils/identifier-normalizer.js'
import { getStorablePhoneParts } from '../utils/phone-quality.js'
import { ContactRepository, type Contact } from '../repositories/contact.repo.js'
import { StageRuleRepository, type StageRule } from '../repositories/stage-rule.repo.js'
import { ContactStageTransitionRepository } from '../repositories/contact-stage-transition.repo.js'

export interface OutgoingMatchResult {
  matched: boolean
  contactId?: string
  stageId?: string
  matchedPhrase?: string
}

interface ProcessOutgoingMessageParams {
  projectId: string
  accountId: string
  brokerType: string
  message: NormalizedMessage
}

export class FunnelMessageMatcherService {
  private supabase: SupabaseRestClient
  private contactRepo: ContactRepository
  private stageRuleRepo: StageRuleRepository
  private stageTransitionRepo: ContactStageTransitionRepository

  constructor(supabase: SupabaseRestClient) {
    this.supabase = supabase
    this.contactRepo = new ContactRepository(supabase)
    this.stageRuleRepo = new StageRuleRepository(supabase)
    this.stageTransitionRepo = new ContactStageTransitionRepository(supabase)
  }

  async processOutgoingMessage(params: ProcessOutgoingMessageParams): Promise<OutgoingMatchResult> {
    const text = String(params.message.content.text || '').trim()
    if (!text) return { matched: false }

    const identifier = this.extractIdentifier(params.message)
    const contact = await this.findOrCreateContact(params.projectId, params.message, identifier)
    const rules = await this.stageRuleRepo.listActiveRules(params.projectId)
    const matchedRule = this.findFirstMatch(text, rules)

    if (!matchedRule) {
      return { matched: false, contactId: contact.id }
    }

    if (contact.current_stage_id === matchedRule.stageId) {
      return {
        matched: true,
        contactId: contact.id,
        stageId: matchedRule.stageId,
        matchedPhrase: matchedRule.trackingPhrase,
      }
    }

    await this.stageTransitionRepo.moveToStage({
      contactId: contact.id,
      projectId: params.projectId,
      fromStageId: contact.current_stage_id || null,
      toStageId: matchedRule.stageId,
      movedBy: `system:funnel_match:${params.brokerType}`,
    })

    return {
      matched: true,
      contactId: contact.id,
      stageId: matchedRule.stageId,
      matchedPhrase: matchedRule.trackingPhrase,
    }
  }

  private findFirstMatch(text: string, rules: StageRule[]): StageRule | null {
    const normalizedText = normalizeText(text)

    for (const rule of rules) {
      const normalizedRule = normalizeText(rule.trackingPhrase)
      if (!normalizedRule) continue
      if (normalizedText.includes(normalizedRule)) return rule
    }

    return null
  }

  private extractIdentifier(message: NormalizedMessage): ContactIdentifier {
    if (message.from.jid) return normalizeIdentifier(message.from.jid)
    if (message.from.phoneNumber) return normalizeIdentifier(message.from.phoneNumber)
    if (message.from.lid) return normalizeIdentifier(message.from.lid)

    if (message.from.canonicalIdentifier) {
      const parsed = this.parseCanonicalIdentifier(message.from.canonicalIdentifier)
      if (parsed) return normalizeIdentifier(parsed)
    }

    throw new Error('No valid identifier in outgoing message')
  }

  private parseCanonicalIdentifier(canonicalIdentifier: string): string | null {
    if (canonicalIdentifier.startsWith('phone:')) {
      const [, countryCode, phone] = canonicalIdentifier.split(':')
      if (countryCode && phone) return `${countryCode}${phone}`
    }
    if (canonicalIdentifier.startsWith('jid:')) return canonicalIdentifier.slice(4)
    if (canonicalIdentifier.startsWith('lid:')) return `${canonicalIdentifier.slice(4)}@lid`
    return null
  }

  private async findOrCreateContact(
    projectId: string,
    message: NormalizedMessage,
    identifier: ContactIdentifier
  ): Promise<Contact> {
    const existing = await this.contactRepo.findByAnyIdentifier({
      projectId,
      phone: identifier.normalizedPhone?.phone,
      countryCode: identifier.normalizedPhone?.countryCode,
      jid: identifier.originalJid,
      lid: identifier.originalLid,
      canonicalIdentifier: generateCanonicalIdentifier(identifier),
    })

    if (existing) return existing

    const firstStageId = await this.getFirstActiveStageId(projectId)
    const defaultOriginId = await this.getDefaultOriginId(projectId)
    const storablePhone = getStorablePhoneParts(identifier)

    return await this.contactRepo.create({
      project_id: projectId,
      name: message.from.name || identifier.normalizedPhone?.phone || 'Sem nome',
      phone: storablePhone?.phone || null,
      country_code: storablePhone?.countryCode || null,
      jid: identifier.originalJid || null,
      lid: identifier.originalLid || null,
      canonical_identifier: generateCanonicalIdentifier(identifier),
      main_origin_id: defaultOriginId,
      current_stage_id: firstStageId,
      metadata: {
        platform: 'whatsapp',
        source: 'webhook_outgoing',
        identifier_quality: {
          hasValidPhone: !!storablePhone,
          source: identifier.primaryType,
        },
      },
    })
  }

  private async getFirstActiveStageId(projectId: string): Promise<string> {
    // Prefer normal stages over sale/lost to avoid assigning contacts to final stages
    const normalRows = await this.supabase.select('stages', {
      'project_id': `eq.${projectId}`,
      'is_active': `eq.true`,
      'type': `eq.normal`,
      'order': 'display_order.asc',
      'limit': '1',
    }, 'id')

    if (normalRows[0]?.id) return normalRows[0].id as string

    // Fallback: any active stage
    const rows = await this.supabase.select('stages', {
      'project_id': `eq.${projectId}`,
      'is_active': `eq.true`,
      'order': 'display_order.asc',
      'limit': '1',
    }, 'id')

    if (!rows[0]?.id) throw new Error('No active stage found for project')
    return rows[0].id as string
  }

  private async getDefaultOriginId(projectId: string): Promise<string> {
    const existing = await this.supabase.selectOne('origins', {
      'project_id': `eq.${projectId}`,
      'name': `eq.WhatsApp`,
    }, 'id')

    if (existing?.id) return existing.id as string

    const rows = await this.supabase.insert('origins', {
      project_id: projectId,
      name: 'WhatsApp',
      color: '#25D366',
      icon: 'message-circle',
      type: 'custom',
    })

    if (!rows[0]?.id) throw new Error('Failed to create default WhatsApp origin')
    return rows[0].id as string
  }
}

function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
