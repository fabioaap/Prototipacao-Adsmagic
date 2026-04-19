import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { normalizeIdentifier, generateCanonicalIdentifier, type ContactIdentifier } from '../utils/identifier-normalizer.ts'
import { getStorablePhoneParts } from '../utils/phone-quality.ts'
import {
  type IContactRepository,
  SupabaseContactRepository,
  type Contact,
} from '../repositories/ContactRepository.ts'
import { StageRuleRepository, type StageRule } from '../repositories/StageRuleRepository.ts'
import { ContactStageTransitionRepository } from '../repositories/ContactStageTransitionRepository.ts'
import { SaleValueUpdateRepository } from '../repositories/SaleValueUpdateRepository.ts'
import type { NormalizedMessage } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import { findOrCreateSystemOrProjectOrigin } from '../utils/origin-resolver.ts'
import { extractMonetaryValue } from '../utils/monetary-value-extractor.ts'

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
  private supabaseClient: SupabaseDbClient
  private contactRepo: IContactRepository
  private stageRuleRepo: StageRuleRepository
  private stageTransitionRepo: ContactStageTransitionRepository
  private saleValueUpdateRepo: SaleValueUpdateRepository

  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
    this.contactRepo = new SupabaseContactRepository(supabaseClient)
    this.stageRuleRepo = new StageRuleRepository(supabaseClient)
    this.stageTransitionRepo = new ContactStageTransitionRepository(supabaseClient)
    this.saleValueUpdateRepo = new SaleValueUpdateRepository(supabaseClient)
  }

  async processOutgoingMessage(params: ProcessOutgoingMessageParams): Promise<OutgoingMatchResult> {
    const text = String(params.message.content.text || '').trim()
    if (!text) {
      return { matched: false }
    }

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
      fromStageId: contact.current_stage_id,
      toStageId: matchedRule.stageId,
      matchedPhrase: matchedRule.trackingPhrase,
      matchedText: text,
      brokerType: params.brokerType,
      accountId: params.accountId,
      messageId: params.message.messageId,
    })

    if (matchedRule.stageType === 'sale') {
      await this.tryAttachSaleValueFromMessage({
        projectId: params.projectId,
        contactId: contact.id,
        text,
        messageId: params.message.messageId,
      })
    }

    return {
      matched: true,
      contactId: contact.id,
      stageId: matchedRule.stageId,
      matchedPhrase: matchedRule.trackingPhrase,
    }
  }

  private async tryAttachSaleValueFromMessage(params: {
    projectId: string
    contactId: string
    text: string
    messageId: string
  }): Promise<void> {
    try {
      const extracted = extractMonetaryValue(params.text)
      if (!extracted) {
        return
      }

      await this.saleValueUpdateRepo.updateLatestAutoSaleValue({
        projectId: params.projectId,
        contactId: params.contactId,
        value: extracted.value,
        currency: extracted.currency,
        rawMatch: extracted.rawMatch,
        messageId: params.messageId,
      })
    } catch (error) {
      // Nunca propagar: a transição de estágio já foi feita e não pode ser
      // revertida por uma falha na captura opcional do valor.
      console.error('[FunnelMessageMatcher] Failed to attach sale value:', error)
    }
  }

  private findFirstMatch(text: string, rules: StageRule[]): StageRule | null {
    const normalizedText = normalizeText(text)

    for (const rule of rules) {
      const normalizedRule = normalizeText(rule.trackingPhrase)
      if (!normalizedRule) continue
      if (normalizedText.includes(normalizedRule)) {
        return rule
      }
    }

    return null
  }

  private extractIdentifier(message: NormalizedMessage): ContactIdentifier {
    if (message.from.jid) {
      return normalizeIdentifier(message.from.jid)
    }

    if (message.from.phoneNumber) {
      return normalizeIdentifier(message.from.phoneNumber)
    }

    if (message.from.lid) {
      return normalizeIdentifier(message.from.lid)
    }

    if (message.from.canonicalIdentifier) {
      const parsed = this.parseCanonicalIdentifier(message.from.canonicalIdentifier)
      if (parsed) {
        return normalizeIdentifier(parsed)
      }
    }

    throw new Error('No valid identifier in outgoing message')
  }

  private parseCanonicalIdentifier(canonicalIdentifier: string): string | null {
    if (canonicalIdentifier.startsWith('phone:')) {
      const [, countryCode, phone] = canonicalIdentifier.split(':')
      if (countryCode && phone) {
        return `${countryCode}${phone}`
      }
    }

    if (canonicalIdentifier.startsWith('jid:')) {
      return canonicalIdentifier.slice(4)
    }

    if (canonicalIdentifier.startsWith('lid:')) {
      return `${canonicalIdentifier.slice(4)}@lid`
    }

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

    if (existing) {
      return existing
    }

    const firstStageId = await this.getFirstActiveStageId(projectId)
    const defaultOriginId = await this.getDefaultOriginId(projectId)
    const storablePhone = getStorablePhoneParts(identifier)

    return await this.contactRepo.create({
      projectId,
      name: message.from.name || identifier.normalizedPhone?.phone || 'Sem nome',
      phone: storablePhone?.phone || null,
      countryCode: storablePhone?.countryCode || null,
      jid: identifier.originalJid || null,
      lid: identifier.originalLid || null,
      canonicalIdentifier: generateCanonicalIdentifier(identifier),
      mainOriginId: defaultOriginId,
      currentStageId: firstStageId,
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
    const { data: normalStage } = await this.supabaseClient
      .from('stages')
      .select('id')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .eq('type', 'normal')
      .order('display_order', { ascending: true })
      .limit(1)
      .single()

    if (normalStage?.id) {
      return String(normalStage.id)
    }

    // Fallback: any active stage
    const { data, error } = await this.supabaseClient
      .from('stages')
      .select('id')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .single()

    if (error || !data) {
      throw new Error('No active stage found for project')
    }

    const stageId = String((data as { id?: string }).id || '')
    if (!stageId) {
      throw new Error('No active stage found for project')
    }
    return stageId
  }

  private async getDefaultOriginId(projectId: string): Promise<string> {
    // Usa helper compartilhado para garantir que a origem de sistema "WhatsApp"
    // (project_id IS NULL) seja sempre reutilizada, nunca duplicada como custom.
    return await findOrCreateSystemOrProjectOrigin(
      this.supabaseClient,
      projectId,
      'WhatsApp'
    )
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
