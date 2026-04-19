/**
 * WhatsApp Processor — REST client version
 *
 * Processes normalized messages: finds/creates contacts, updates metadata.
 */
import type { SupabaseRestClient } from '../lib/supabase.js'
import type { NormalizedMessage } from '../types/messaging.js'
import { normalizeIdentifier, generateCanonicalIdentifier } from '../utils/identifier-normalizer.js'
import { getStorablePhoneParts } from '../utils/phone-quality.js'
import { ContactRepository, type Contact } from '../repositories/contact.repo.js'

export interface ProcessResult {
  success: boolean
  contactId?: string
  automationsTriggered?: number
  error?: string
}

export class WhatsAppProcessor {
  private contactRepo: ContactRepository

  constructor(private supabase: SupabaseRestClient) {
    this.contactRepo = new ContactRepository(supabase)
  }

  async processMessage(
    normalizedMessage: NormalizedMessage,
    projectId: string
  ): Promise<ProcessResult> {
    try {
      const contact = await this.findOrCreateContact({
        normalizedMessage,
        name: normalizedMessage.from.name,
        projectId,
        metadata: {
          lastMessageAt: normalizedMessage.timestamp.toISOString(),
          lastMessageContent: normalizedMessage.content.text,
          platform: 'whatsapp',
        },
      })

      return {
        success: true,
        contactId: contact.id,
        automationsTriggered: 0,
      }
    } catch (error) {
      console.error('[WhatsAppProcessor] Error processing message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }

  async processStatusUpdate(
    status: { messageId: string; status: string; timestamp: Date }
  ): Promise<void> {
    console.log('[WhatsAppProcessor] Status update:', status)
  }

  private async findOrCreateContact(params: {
    normalizedMessage: NormalizedMessage
    name?: string
    projectId: string
    metadata?: Record<string, unknown>
  }): Promise<Contact> {
    const identifier = this.extractIdentifier(params.normalizedMessage)
    const canonicalIdentifier = generateCanonicalIdentifier(identifier)
    const storablePhone = getStorablePhoneParts(identifier)

    // Sequential fallback: canonical → jid → phone → lid
    const existingContact = await this.contactRepo.findByAnyIdentifier({
      projectId: params.projectId,
      canonicalIdentifier,
      jid: identifier.originalJid,
      phone: storablePhone?.phone,
      countryCode: storablePhone?.countryCode,
      lid: identifier.originalLid,
    })

    if (existingContact) {
      // Update existing contact with latest info
      const updateData: Record<string, unknown> = {
        name: params.name || existingContact.name,
        canonical_identifier: existingContact.canonical_identifier || canonicalIdentifier,
        jid: existingContact.jid || identifier.originalJid || null,
        lid: existingContact.lid || identifier.originalLid || null,
        metadata: {
          ...(existingContact.metadata && typeof existingContact.metadata === 'object'
            ? existingContact.metadata
            : {}),
          ...params.metadata,
          identifier_quality: {
            hasValidPhone: !!storablePhone,
            source: identifier.primaryType,
          },
        },
      }

      if (storablePhone) {
        if (!existingContact.phone) updateData.phone = storablePhone.phone
        if (!existingContact.country_code) updateData.country_code = storablePhone.countryCode
      }

      const updated = await this.contactRepo.update(existingContact.id, updateData)
      return updated || existingContact
    }

    // Find default origin
    const whatsappOrigin = await this.supabase.selectOne('origins', {
      'project_id': `eq.${params.projectId}`,
      'name': `eq.WhatsApp`,
    }, 'id')

    // Find first active stage
    const stages = await this.supabase.select('stages', {
      'project_id': `eq.${params.projectId}`,
      'is_active': `eq.true`,
      'order': 'display_order.asc',
      'limit': '1',
    }, 'id')

    const firstStage = stages[0]
    if (!firstStage) throw new Error('Nenhum estágio encontrado para o projeto')

    return await this.contactRepo.create({
      project_id: params.projectId,
      name: params.name || storablePhone?.phone || 'Sem nome',
      phone: storablePhone?.phone || null,
      country_code: storablePhone?.countryCode || null,
      jid: identifier.originalJid || null,
      lid: identifier.originalLid || null,
      canonical_identifier: canonicalIdentifier,
      main_origin_id: (whatsappOrigin?.id as string) || null,
      current_stage_id: firstStage.id as string,
      metadata: {
        ...(params.metadata || {}),
        identifier_quality: {
          hasValidPhone: !!storablePhone,
          source: identifier.primaryType,
        },
      },
    })
  }

  private extractIdentifier(message: NormalizedMessage) {
    if (message.from.jid) return normalizeIdentifier(message.from.jid)
    if (message.from.phoneNumber) return normalizeIdentifier(message.from.phoneNumber)
    if (message.from.lid) return normalizeIdentifier(message.from.lid)

    if (message.from.canonicalIdentifier) {
      const canonical = message.from.canonicalIdentifier
      if (canonical.startsWith('jid:')) return normalizeIdentifier(canonical.slice(4))
      if (canonical.startsWith('lid:')) return normalizeIdentifier(`${canonical.slice(4)}@lid`)
      if (canonical.startsWith('phone:')) {
        const [, countryCode, phone] = canonical.split(':')
        if (countryCode && phone) return normalizeIdentifier(`${countryCode}${phone}`)
      }
    }

    throw new Error('No valid contact identifier found')
  }
}
