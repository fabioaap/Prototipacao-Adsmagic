/**
 * Camada de Processamento
 * 
 * Processa mensagens normalizadas
 * Aplica regras de negócio, cria contatos, dispara automações
 */

import type { NormalizedMessage, ProcessResult } from '../types.ts'
import { normalizeIdentifier, generateCanonicalIdentifier } from '../utils/identifier-normalizer.ts'
import { getStorablePhoneParts } from '../utils/phone-quality.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export class WhatsAppProcessor {
  private supabaseClient: SupabaseDbClient
  
  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
  }
  
  /**
   * Processa uma mensagem normalizada
   */
  async processMessage(
    normalizedMessage: NormalizedMessage,
    projectId: string
  ): Promise<ProcessResult> {
    try {
      // 1. Busca ou cria contato
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
      
      // 2. Registra evento de mensagem (pode ser implementado depois)
      // await this.recordMessageEvent({
      //   contactId: contact.id,
      //   messageId: normalizedMessage.messageId,
      //   content: normalizedMessage.content,
      //   timestamp: normalizedMessage.timestamp,
      // })
      
      // 3. Processa regras de automação (pode ser implementado depois)
      // const automationResults = await this.processAutomationRules({
      //   contactId: contact.id,
      //   projectId,
      //   eventType: 'message_received',
      //   message: normalizedMessage,
      // })
      
      return {
        success: true,
        contactId: contact.id,
        automationsTriggered: 0, // Será implementado depois
      }
    } catch (error) {
      console.error('[WhatsAppProcessor] Error processing message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }
  
  /**
   * Processa atualização de status
   */
  async processStatusUpdate(
    status: { messageId: string; status: string; timestamp: Date }
  ): Promise<void> {
    // Implementar registro de status de mensagem
    console.log('[WhatsAppProcessor] Status update:', status)
  }
  
  /**
   * Busca ou cria contato
   */
  private async findOrCreateContact(params: {
    normalizedMessage: NormalizedMessage
    name?: string
    projectId: string
    metadata?: Record<string, unknown>
  }) {
    const identifier = this.extractIdentifier(params.normalizedMessage)
    const canonicalIdentifier = generateCanonicalIdentifier(identifier)
    const storablePhone = getStorablePhoneParts(identifier)

    // 1) Buscar por canonical identifier (mais confiável)
    const { data: byCanonical } = await this.supabaseClient
      .from('contacts')
      .select('*')
      .eq('project_id', params.projectId)
      .eq('canonical_identifier', canonicalIdentifier)
      .single()

    // 2) Fallback por JID
    const existingByJid = !byCanonical && identifier.originalJid
      ? await this.supabaseClient
        .from('contacts')
        .select('*')
        .eq('project_id', params.projectId)
        .eq('jid', identifier.originalJid)
        .single()
      : null

    // 3) Fallback por telefone/countryCode se válido
    const existingByPhone = !byCanonical && !existingByJid?.data && storablePhone
      ? await this.supabaseClient
        .from('contacts')
        .select('*')
        .eq('project_id', params.projectId)
        .eq('phone', storablePhone.phone)
        .eq('country_code', storablePhone.countryCode)
        .single()
      : null

    // 4) Fallback por LID
    const existingByLid = !byCanonical && !existingByJid?.data && !existingByPhone?.data && identifier.originalLid
      ? await this.supabaseClient
        .from('contacts')
        .select('*')
        .eq('project_id', params.projectId)
        .eq('lid', identifier.originalLid)
        .single()
      : null

    const existingContact =
      byCanonical ||
      existingByJid?.data ||
      existingByPhone?.data ||
      existingByLid?.data

    if (existingContact) {
      // Atualizar contato existente
      const { data: updatedContact } = await this.supabaseClient
        .from('contacts')
        .update({
          name: params.name || existingContact.name,
          canonical_identifier: existingContact.canonical_identifier || canonicalIdentifier,
          jid: existingContact.jid || identifier.originalJid || null,
          lid: existingContact.lid || identifier.originalLid || null,
          ...(storablePhone ? {
            phone: existingContact.phone || storablePhone.phone,
            country_code: existingContact.country_code || storablePhone.countryCode,
          } : {}),
          metadata: {
            ...existingContact.metadata,
            ...params.metadata,
            identifier_quality: {
              hasValidPhone: !!storablePhone,
              source: identifier.primaryType,
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingContact.id)
        .select()
        .single()
      
      return updatedContact || existingContact
    }
    
    // Buscar origem "WhatsApp" ou criar
    const { data: whatsappOrigin } = await this.supabaseClient
      .from('origins')
      .select('id')
      .eq('project_id', params.projectId)
      .eq('name', 'WhatsApp')
      .single()
    
    // Buscar primeiro estágio do projeto
    const { data: firstStage } = await this.supabaseClient
      .from('stages')
      .select('id')
      .eq('project_id', params.projectId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .single()
    
    if (!firstStage) {
      throw new Error('Nenhum estágio encontrado para o projeto')
    }
    
    // Criar novo contato
    const { data: newContact, error } = await this.supabaseClient
      .from('contacts')
      .insert({
        project_id: params.projectId,
        name: params.name || storablePhone?.phone || 'Sem nome',
        phone: storablePhone?.phone || null,
        country_code: storablePhone?.countryCode || null,
        jid: identifier.originalJid || null,
        lid: identifier.originalLid || null,
        canonical_identifier: canonicalIdentifier,
        main_origin_id: whatsappOrigin?.id || firstStage.id, // Fallback temporário
        current_stage_id: firstStage.id,
        metadata: {
          ...(params.metadata || {}),
          identifier_quality: {
            hasValidPhone: !!storablePhone,
            source: identifier.primaryType,
          },
        },
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Erro ao criar contato: ${error.message}`)
    }
    
    return newContact
  }

  private extractIdentifier(message: NormalizedMessage) {
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
      const canonical = message.from.canonicalIdentifier
      if (canonical.startsWith('jid:')) {
        return normalizeIdentifier(canonical.slice(4))
      }
      if (canonical.startsWith('lid:')) {
        return normalizeIdentifier(`${canonical.slice(4)}@lid`)
      }
      if (canonical.startsWith('phone:')) {
        const [, countryCode, phone] = canonical.split(':')
        if (countryCode && phone) {
          return normalizeIdentifier(`${countryCode}${phone}`)
        }
      }
    }

    throw new Error('No valid contact identifier found')
  }
}
