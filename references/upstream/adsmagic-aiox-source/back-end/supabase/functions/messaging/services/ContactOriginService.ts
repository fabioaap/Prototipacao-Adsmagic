/**
 * Serviço para gerenciamento de contatos com rastreamento de origem
 * 
 * Responsabilidades:
 * - Validar condições (isGroup)
 * - Extrair identificadores (phone/jid/lid)
 * - Buscar/criar contato
 * - Gerenciar origens (buscar/criar)
 * - Salvar dados de origem estruturados no campo source_data
 * 
 * Nota: A validação de fromMe deve ser feita no caller (webhook-processor),
 * pois NormalizedMessage não possui esse campo diretamente.
 */

import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type {
  ProcessContactOriginParams,
  ProcessContactOriginResult,
  StandardizedSourceData,
} from '../types/contact-origin-types.ts'
import type { NormalizedMessage } from '../types.ts'
import { 
  normalizeIdentifier,
  generateCanonicalIdentifier,
  type ContactIdentifier,
} from '../utils/identifier-normalizer.ts'
import { getStorablePhoneParts } from '../utils/phone-quality.ts'
import { OriginDataNormalizer } from './OriginDataNormalizer.ts'
import { findCustomOriginByUtmSourceMatch } from './CustomOriginUtmMatcher.ts'
import {
  type IContactRepository,
  SupabaseContactRepository,
} from '../repositories/ContactRepository.ts'
import { extractCriticalFields } from '../utils/source-data-helpers.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export class ContactOriginService {
  private contactRepo: IContactRepository
  private supabaseClient: SupabaseDbClient
  
  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
    this.contactRepo = new SupabaseContactRepository(supabaseClient)
  }
  
  /**
   * Processa contato que ENVIA mensagem (entrada)
   * 
   * Condições:
   * - isGroup === false
   * - Mensagem recebida (não enviada por nós)
   * 
   * Comportamento:
   * - Se contato não existe e tem sourceData: cria contato com origem
   * - Se contato não existe e não tem sourceData: cria contato sem origem (apenas garante existência)
   * - Se contato existe e tem sourceData: sempre cria novo registro em contact_origins
   * - Se contato existe e não tem sourceData: retorna contato existente (não cria origem)
   * 
   * Nota: A validação de fromMe deve ser feita no caller (webhook-processor),
   * pois NormalizedMessage não possui esse campo diretamente.
   * 
   * @param params - Parâmetros de processamento
   * @returns Resultado com contactId, created e sourceData
   * @throws {Error} Se condições não forem atendidas
   */
  async processIncomingContact(
    params: ProcessContactOriginParams
  ): Promise<ProcessContactOriginResult> {
    const { normalizedMessage, projectId } = params
    const shouldPersistOrigin = params.skipOriginPersistence !== true
    
    // 1. Validar condições (apenas isGroup, fromMe é validado no caller)
    if (normalizedMessage.isGroup) {
      throw new Error(
        'processIncomingContact só deve ser chamado para mensagens de contato individual (isGroup=false)'
      )
    }
    
    // 2. Extrair identificador (phone/jid/lid)
    const identifier = this.extractIdentifier(normalizedMessage)
    
    // 3. Normalizar dados de origem
    const sourceData = OriginDataNormalizer.normalize(normalizedMessage)
    
    // 4. Buscar contato existente usando busca otimizada
    const existingContact = await this.contactRepo.findByAnyIdentifier({
      projectId,
      phone: identifier.normalizedPhone?.phone,
      countryCode: identifier.normalizedPhone?.countryCode,
      jid: identifier.originalJid,
      lid: identifier.originalLid,
      canonicalIdentifier: generateCanonicalIdentifier(identifier),
    })
    
    // 5. Se contato não existe: criar com ou sem origem
    if (!existingContact) {
      if (sourceData && OriginDataNormalizer.hasOriginData(sourceData)) {
        // Criar contato com origem
        return await this.createContactWithOrigin({
          projectId,
          identifier,
          name: normalizedMessage.from.name || identifier.normalizedPhone?.phone || 'Sem nome',
          sourceData,
          persistOrigin: shouldPersistOrigin,
        })
      } else {
        // Criar contato sem origem (apenas garantir existência)
        const contactId = await this.ensureContactExists({
          projectId,
          identifier,
          name: normalizedMessage.from.name || identifier.normalizedPhone?.phone || 'Sem nome',
        })
        
        // Buscar origem padrão para retorno
        const defaultOriginId = await this.findOrCreateDefaultOrigin(projectId, 'WhatsApp')
        
        return {
          contactId,
          created: true,
          originId: defaultOriginId,
          sourceData: undefined,
        }
      }
    }
    
    // 6. Se contato existe: criar origem se houver sourceData
    let originId: string | undefined = existingContact.main_origin_id
    
    if (sourceData && OriginDataNormalizer.hasOriginData(sourceData) && shouldPersistOrigin) {
      // Sempre criar novo registro de origem
      originId = await this.findOrCreateOrigin({
        projectId,
        sourceData,
      })
      
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
  
  /**
   * Extrai identificador da mensagem normalizada
   * Suporta phone, jid, lid
   */
  private extractIdentifier(message: NormalizedMessage): ContactIdentifier {
    // Prioridade: canonicalIdentifier > jid > phoneNumber > lid
    if (message.from.canonicalIdentifier) {
      // Se já temos canonicalIdentifier, tentar usar (pode precisar normalizar)
      try {
        // Tentar normalizar usando phoneNumber ou jid se disponível
        if (message.from.phoneNumber) {
          return normalizeIdentifier(message.from.phoneNumber)
        }
        if (message.from.jid) {
          return normalizeIdentifier(message.from.jid)
        }
        if (message.from.lid) {
          return normalizeIdentifier(message.from.lid)
        }
      } catch (error) {
        console.warn('[ContactOriginService] Error normalizing canonicalIdentifier:', error)
      }
    }
    
    // Tentar normalizar usando campos disponíveis
    if (message.from.phoneNumber) {
      return normalizeIdentifier(message.from.phoneNumber)
    }
    
    if (message.from.jid) {
      return normalizeIdentifier(message.from.jid)
    }
    
    if (message.from.lid) {
      return normalizeIdentifier(message.from.lid)
    }
    
    throw new Error('No valid contact identifier found in message (phoneNumber, jid, or lid required)')
  }
  
  /**
   * Cria contato novo com origem
   */
  private async createContactWithOrigin(params: {
    projectId: string
    identifier: ContactIdentifier
    name: string
    sourceData: StandardizedSourceData | null
    persistOrigin: boolean
  }): Promise<ProcessContactOriginResult> {
    // 1. Buscar/criar origem
    const originId = await this.findOrCreateOrigin({
      projectId: params.projectId,
      sourceData: params.sourceData,
    })
    
    // 2. Buscar primeiro estágio ativo
    const firstStage = await this.getFirstActiveStage(params.projectId)
    if (!firstStage) {
      throw new Error('Nenhum estágio ativo encontrado para o projeto')
    }
    
    // 3. Criar contato usando repository
    const canonicalId = generateCanonicalIdentifier(params.identifier)
    const storablePhone = getStorablePhoneParts(params.identifier)
    
    const contact = await this.contactRepo.create({
      projectId: params.projectId,
      name: params.name,
      phone: storablePhone?.phone || null,
      countryCode: storablePhone?.countryCode || null,
      jid: params.identifier.originalJid || null,
      lid: params.identifier.originalLid || null,
      canonicalIdentifier: canonicalId,
      mainOriginId: originId,
      currentStageId: firstStage.id,
      metadata: {
        platform: 'whatsapp',
        identifier_quality: {
          hasValidPhone: !!storablePhone,
          source: params.identifier.primaryType,
        },
      },
    })
    
    // 4. Registrar origem com source_data (quando habilitado)
    if (params.persistOrigin && params.sourceData && OriginDataNormalizer.hasOriginData(params.sourceData)) {
      await this.insertContactOrigin({
        contactId: contact.id,
        originId,
        sourceData: params.sourceData,
      })
    }

    // 5. Registrar histórico de estágio
    await this.insertStageHistory({
      contactId: contact.id,
      stageId: firstStage.id,
    })
    
    return {
      contactId: contact.id,
      created: true,
      originId,
      sourceData: params.sourceData || undefined,
    }
  }
  
  /**
   * Garante que o contato existe na tabela contacts
   * 
   * Se o contato não existir, cria um novo contato com origem padrão "WhatsApp".
   * Não cria registro em contact_origins.
   * 
   * @param params - Parâmetros para garantir existência do contato
   * @returns ID do contato (existente ou criado)
   */
  private async ensureContactExists(params: {
    projectId: string
    identifier: ContactIdentifier
    name: string
  }): Promise<string> {
    // 1. Buscar origem padrão "WhatsApp"
    const defaultOriginId = await this.findOrCreateDefaultOrigin(
      params.projectId,
      'WhatsApp'
    )
    
    // 2. Buscar primeiro estágio ativo
    const firstStage = await this.getFirstActiveStage(params.projectId)
    if (!firstStage) {
      throw new Error('Nenhum estágio ativo encontrado para o projeto')
    }
    
    // 3. Criar contato usando repository
    const canonicalId = generateCanonicalIdentifier(params.identifier)
    const storablePhone = getStorablePhoneParts(params.identifier)
    
    const contact = await this.contactRepo.create({
      projectId: params.projectId,
      name: params.name,
      phone: storablePhone?.phone || null,
      countryCode: storablePhone?.countryCode || null,
      jid: params.identifier.originalJid || null,
      lid: params.identifier.originalLid || null,
      canonicalIdentifier: canonicalId,
      mainOriginId: defaultOriginId,
      currentStageId: firstStage.id,
      metadata: {
        platform: 'whatsapp',
        identifier_quality: {
          hasValidPhone: !!storablePhone,
          source: params.identifier.primaryType,
        },
      },
    })
    
    // 4. Registrar histórico de estágio
    await this.insertStageHistory({
      contactId: contact.id,
      stageId: firstStage.id,
    })
    
    return contact.id
  }
  
  /**
   * Cria novo registro de origem para o contato
   * 
   * Sempre cria um novo registro em contact_origins, permitindo que
   * o mesmo contato tenha múltiplas entradas da mesma origem para
   * rastreamento histórico completo.
   * 
   * @param params - Parâmetros para criação de origem
   */
  private async createContactOrigin(params: {
    contactId: string
    projectId: string
    sourceData: StandardizedSourceData
  }): Promise<void> {
    // 1. Buscar/criar origem
    const originId = await this.findOrCreateOrigin({
      projectId: params.projectId,
      sourceData: params.sourceData,
    })
    
    // 2. Sempre criar novo registro (sem verificar existência)
    await this.insertContactOrigin({
      contactId: params.contactId,
      originId,
      sourceData: params.sourceData,
    })
  }
  
  /**
   * Busca ou cria origem baseada em source_data
   */
  private async findOrCreateOrigin(params: {
    projectId: string
    sourceData: StandardizedSourceData | null
  }): Promise<string> {
    // Se não tem source_data, usar origem padrão "WhatsApp"
    if (!params.sourceData || !OriginDataNormalizer.hasOriginData(params.sourceData)) {
      return await this.findOrCreateDefaultOrigin(params.projectId, 'WhatsApp')
    }
    
    // Determinar nome da origem baseado em source_app e source_type
    const sourceApp = params.sourceData.metadata?.source_app
    const sourceType = params.sourceData.metadata?.source_type
    const utmSource = params.sourceData.utm?.utm_source || null

    let originName: string

    if (sourceApp === 'other') {
      const customOriginMatch = await findCustomOriginByUtmSourceMatch({
        supabaseClient: this.supabaseClient,
        projectId: params.projectId,
        utmSource,
      })

      if (customOriginMatch) {
        return customOriginMatch.originId
      }
    }

    if (sourceApp === 'facebook' || sourceApp === 'instagram') {
      originName = 'Meta Ads'
    } else if (sourceApp === 'google') {
      originName = 'Google Ads'
    } else if (sourceApp === 'tiktok') {
      originName = 'TikTok Ads'
    } else {
      // Fallback: usar origem padrão "WhatsApp"
      return await this.findOrCreateDefaultOrigin(params.projectId, 'WhatsApp')
    }
    
    // Buscar origem do sistema primeiro (project_id IS NULL)
    const systemOrigin = await this.supabaseClient
      .from('origins')
      .select('id')
      .is('project_id', null)
      .eq('name', originName)
      .eq('is_active', true)
      .maybeSingle()
    
    if (systemOrigin.data && systemOrigin.data !== null) {
      const originData = systemOrigin.data as { id: string }
      return originData.id
    }
    
    // Se não encontrou origem do sistema, criar customizada para o projeto
    return await this.findOrCreateDefaultOrigin(params.projectId, originName)
  }
  
  /**
   * Busca ou cria origem padrão
   */
  private async findOrCreateDefaultOrigin(
    projectId: string,
    originName: string
  ): Promise<string> {
    // Buscar origem existente (sistema ou projeto)
    // Primeiro tentar origem do sistema
    const systemOrigin = await this.supabaseClient
      .from('origins')
      .select('id')
      .is('project_id', null)
      .eq('name', originName)
      .eq('is_active', true)
      .maybeSingle()
    
    if (systemOrigin.data && systemOrigin.data !== null) {
      const originData = systemOrigin.data as { id: string }
      return originData.id
    }
    
    // Depois tentar origem do projeto
    const projectOrigin = await this.supabaseClient
      .from('origins')
      .select('id')
      .eq('project_id', projectId)
      .eq('name', originName)
      .eq('is_active', true)
      .maybeSingle()
    
    if (projectOrigin.data && projectOrigin.data !== null) {
      const originData = projectOrigin.data as { id: string }
      return originData.id
    }
    
    // Criar nova origem customizada para o projeto
    const { data, error } = await this.supabaseClient
      .from('origins')
      .insert({
        project_id: projectId,
        name: originName,
        type: 'custom',
        color: this.getDefaultColorForOrigin(originName),
        icon: this.getDefaultIconForOrigin(originName),
        is_active: true,
      } as never)
      .select('id')
      .single()
    
    if (error) {
      console.error('[ContactOriginService] Error creating origin:', error)
      throw new Error(`Erro ao criar origem: ${error.message}`)
    }
    
    if (!data) {
      throw new Error('Erro ao criar origem: dados não retornados')
    }
    
    const originData = data as { id: string }
    return originData.id
  }
  
  /**
   * Insere registro de origem do contato com source_data
   * 
   * Campos críticos são extraídos e incluídos explicitamente.
   * O trigger também sincroniza, mas é melhor ser explícito para garantir consistência.
   */
  private async insertContactOrigin(params: {
    contactId: string
    originId: string
    sourceData: StandardizedSourceData
  }): Promise<void> {
    // Extrair campos críticos usando helper (DRY)
    const criticalFields = extractCriticalFields(params.sourceData)
    
    const { error } = await this.supabaseClient
      .from('contact_origins')
      .insert({
        contact_id: params.contactId,
        origin_id: params.originId,
        source_data: params.sourceData,
        // Campos críticos (trigger também sincroniza, mas melhor ser explícito)
        campaign_id: criticalFields.campaignId,
        ad_id: criticalFields.adId,
        adgroup_id: criticalFields.adgroupId,
        source_app: criticalFields.sourceApp,
        acquired_at: new Date().toISOString(),
      } as never)
    
    if (error) {
      console.error('[ContactOriginService] Error inserting contact origin:', error)
      throw new Error(`Erro ao registrar origem: ${error.message}`)
    }
  }
  
  /**
   * Insere histórico de estágio
   */
  private async insertStageHistory(params: {
    contactId: string
    stageId: string
  }): Promise<void> {
    const { error } = await this.supabaseClient
      .from('contact_stage_history')
      .insert({
        contact_id: params.contactId,
        stage_id: params.stageId,
        moved_by: 'system',
      } as never)
    
    if (error) {
      // Não é crítico se falhar, apenas logar
      console.warn('[ContactOriginService] Erro ao registrar histórico de estágio:', error)
    }
  }
  
  /**
   * Busca primeiro estágio ativo do projeto
   */
  private async getFirstActiveStage(projectId: string): Promise<{ id: string } | null> {
    const { data, error } = await this.supabaseClient
      .from('stages')
      .select('id')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle()
    
    if (error) {
      console.error('[ContactOriginService] Error fetching first stage:', error)
      return null
    }
    
    return data as { id: string } | null
  }
  
  /**
   * Retorna cor padrão para origem
   */
  private getDefaultColorForOrigin(originName: string): string {
    const colors: Record<string, string> = {
      'Meta Ads': '#0866FF',
      'Google Ads': '#4285F4',
      'TikTok Ads': '#000000',
      'WhatsApp': '#25D366',
    }
    
    return colors[originName] || '#6B7280'
  }
  
  /**
   * Retorna ícone padrão para origem
   */
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
