/**
 * Repository Pattern para acesso a dados de contatos
 * 
 * Segue princípios SOLID:
 * - SRP: Responsabilidade única de abstrair acesso ao banco de dados
 * - DIP: Depende de abstração (interface), não implementação concreta
 * - OCP: Extensível via implementações alternativas (Mock para testes)
 * 
 * Suporta busca por múltiplos identificadores:
 * - Telefone (phone + country_code)
 * - JID (Jabber ID)
 * - LID (Local ID)
 * - Identificador canônico (canonical_identifier)
 * - Busca otimizada paralela (findByAnyIdentifier)
 */

import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Interface para entidade Contact no banco de dados
 * 
 * Inclui todos os campos da tabela contacts, incluindo:
 * - Identificadores tradicionais: phone, country_code
 * - Identificadores WhatsApp: jid, lid
 * - Identificador canônico: canonical_identifier
 */
export interface Contact {
  id: string
  project_id: string
  name: string
  phone: string | null
  country_code: string | null
  jid: string | null
  lid: string | null
  canonical_identifier: string | null
  email: string | null
  company: string | null
  location: string | null
  notes: string | null
  avatar_url: string | null
  is_favorite: boolean
  main_origin_id: string
  current_stage_id: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

/**
 * Parâmetros para busca por telefone
 */
export interface FindByPhoneParams {
  projectId: string
  phone: string
  countryCode: string
}

/**
 * Parâmetros para busca por JID
 */
export interface FindByJidParams {
  projectId: string
  jid: string
}

/**
 * Parâmetros para busca por LID
 */
export interface FindByLidParams {
  projectId: string
  lid: string
}

/**
 * Parâmetros para busca por identificador canônico
 */
export interface FindByCanonicalIdentifierParams {
  projectId: string
  canonicalIdentifier: string
}

/**
 * Parâmetros para busca por qualquer identificador (otimizada)
 * 
 * Permite buscar por múltiplos identificadores em paralelo
 */
export interface FindByAnyIdentifierParams {
  projectId: string
  phone?: string
  countryCode?: string
  jid?: string
  lid?: string
  canonicalIdentifier?: string
}

/**
 * Parâmetros para criação de contato
 */
export interface CreateContactParams {
  projectId: string
  name: string
  phone?: string | null
  countryCode?: string | null
  jid?: string | null
  lid?: string | null
  canonicalIdentifier?: string | null
  email?: string | null
  company?: string | null
  location?: string | null
  notes?: string | null
  avatarUrl?: string | null
  isFavorite?: boolean
  mainOriginId: string
  currentStageId: string
  metadata?: Record<string, unknown>
}

/**
 * Interface do Repository (DIP: Dependency Inversion Principle)
 * 
 * Define contrato que qualquer implementação deve seguir
 * Permite trocar implementação (Supabase, Mock, etc.) sem modificar código cliente
 */
export interface IContactRepository {
  /**
   * Busca contato por telefone e código do país
   * 
   * @param params - Parâmetros de busca (projectId, phone, countryCode)
   * @returns Contato encontrado ou null
   */
  findByPhone(params: FindByPhoneParams): Promise<Contact | null>
  
  /**
   * Busca contato por JID
   * 
   * @param params - Parâmetros de busca (projectId, jid)
   * @returns Contato encontrado ou null
   */
  findByJid(params: FindByJidParams): Promise<Contact | null>
  
  /**
   * Busca contato por LID
   * 
   * @param params - Parâmetros de busca (projectId, lid)
   * @returns Contato encontrado ou null
   */
  findByLid(params: FindByLidParams): Promise<Contact | null>
  
  /**
   * Busca contato por identificador canônico
   * 
   * @param params - Parâmetros de busca (projectId, canonicalIdentifier)
   * @returns Contato encontrado ou null
   */
  findByCanonicalIdentifier(
    params: FindByCanonicalIdentifierParams
  ): Promise<Contact | null>
  
  /**
   * Busca contato por qualquer identificador disponível (otimizada)
   * 
   * Executa buscas em paralelo usando Promise.all para melhor performance.
   * Retorna o primeiro contato encontrado.
   * 
   * Ordem de prioridade:
   * 1. canonical_identifier (mais confiável)
   * 2. jid
   * 3. phone + country_code
   * 4. lid
   * 
   * @param params - Parâmetros de busca (pode incluir múltiplos identificadores)
   * @returns Contato encontrado ou null
   */
  findByAnyIdentifier(
    params: FindByAnyIdentifierParams
  ): Promise<Contact | null>
  
  /**
   * Cria novo contato
   * 
   * Valida que pelo menos um identificador está presente (phone, jid, lid ou canonicalIdentifier)
   * 
   * @param params - Parâmetros de criação
   * @returns Contato criado
   * @throws {Error} Se validação falhar ou erro ao criar
   */
  create(params: CreateContactParams): Promise<Contact>
}

/**
 * Implementação do Repository usando Supabase
 * 
 * Segue padrão estabelecido por MessagingAccountRepository
 */
export class SupabaseContactRepository implements IContactRepository {
  private supabaseClient: SupabaseDbClient
  
  constructor(supabaseClient: SupabaseDbClient) {
    this.supabaseClient = supabaseClient
  }
  
  /**
   * Busca contato por telefone e código do país
   */
  async findByPhone(params: FindByPhoneParams): Promise<Contact | null> {
    const { projectId, phone, countryCode } = params
    
    const { data, error } = await this.supabaseClient
      .from('contacts')
      .select('*')
      .eq('project_id', projectId)
      .eq('phone', phone)
      .eq('country_code', countryCode)
      .single()
    
    if (error) {
      // PGRST116 = not found (não é erro crítico)
      if (error.code === 'PGRST116') {
        return null
      }
      
      console.error('[ContactRepository] Error finding contact by phone:', {
        projectId,
        phone,
        countryCode,
        error: error.message,
        code: error.code,
      })
      
      throw new Error(`Failed to find contact by phone: ${error.message}`)
    }
    
    return data as Contact
  }
  
  /**
   * Busca contato por JID
   */
  async findByJid(params: FindByJidParams): Promise<Contact | null> {
    const { projectId, jid } = params
    
    const { data, error } = await this.supabaseClient
      .from('contacts')
      .select('*')
      .eq('project_id', projectId)
      .eq('jid', jid)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      
      console.error('[ContactRepository] Error finding contact by jid:', {
        projectId,
        jid,
        error: error.message,
        code: error.code,
      })
      
      throw new Error(`Failed to find contact by jid: ${error.message}`)
    }
    
    return data as Contact
  }
  
  /**
   * Busca contato por LID
   */
  async findByLid(params: FindByLidParams): Promise<Contact | null> {
    const { projectId, lid } = params
    
    const { data, error } = await this.supabaseClient
      .from('contacts')
      .select('*')
      .eq('project_id', projectId)
      .eq('lid', lid)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      
      console.error('[ContactRepository] Error finding contact by lid:', {
        projectId,
        lid,
        error: error.message,
        code: error.code,
      })
      
      throw new Error(`Failed to find contact by lid: ${error.message}`)
    }
    
    return data as Contact
  }
  
  /**
   * Busca contato por identificador canônico
   */
  async findByCanonicalIdentifier(
    params: FindByCanonicalIdentifierParams
  ): Promise<Contact | null> {
    const { projectId, canonicalIdentifier } = params
    
    const { data, error } = await this.supabaseClient
      .from('contacts')
      .select('*')
      .eq('project_id', projectId)
      .eq('canonical_identifier', canonicalIdentifier)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      
      console.error('[ContactRepository] Error finding contact by canonical identifier:', {
        projectId,
        canonicalIdentifier,
        error: error.message,
        code: error.code,
      })
      
      throw new Error(
        `Failed to find contact by canonical identifier: ${error.message}`
      )
    }
    
    return data as Contact
  }
  
  /**
   * Busca contato por qualquer identificador disponível (otimizada)
   * 
   * Executa buscas em paralelo usando Promise.all para melhor performance.
   * Retorna o primeiro contato encontrado (prioridade: canonical > jid > phone > lid).
   */
  async findByAnyIdentifier(
    params: FindByAnyIdentifierParams
  ): Promise<Contact | null> {
    const { projectId, phone, countryCode, jid, lid, canonicalIdentifier } = params
    
    // Validar que pelo menos um identificador foi fornecido
    if (!canonicalIdentifier && !jid && (!phone || !countryCode) && !lid) {
      console.warn('[ContactRepository] No identifier provided for findByAnyIdentifier', {
        projectId,
      })
      return null
    }
    
    // Executar buscas em paralelo (Promise.all)
    // Ordem de prioridade: canonical > jid > phone > lid
    const searches: Array<Promise<Contact | null>> = []
    
    if (canonicalIdentifier) {
      searches.push(
        this.findByCanonicalIdentifier({ projectId, canonicalIdentifier })
      )
    }
    
    if (jid) {
      searches.push(this.findByJid({ projectId, jid }))
    }
    
    if (phone && countryCode) {
      searches.push(this.findByPhone({ projectId, phone, countryCode }))
    }
    
    if (lid) {
      searches.push(this.findByLid({ projectId, lid }))
    }
    
    // Executar todas as buscas em paralelo
    const results = await Promise.all(searches)
    
    // Retornar primeiro resultado encontrado (não null)
    for (const result of results) {
      if (result) {
        return result
      }
    }
    
    // Nenhum contato encontrado
    return null
  }
  
  /**
   * Cria novo contato
   * 
   * Valida que pelo menos um identificador está presente
   */
  async create(params: CreateContactParams): Promise<Contact> {
    const {
      projectId,
      name,
      phone,
      countryCode,
      jid,
      lid,
      canonicalIdentifier,
      email,
      company,
      location,
      notes,
      avatarUrl,
      isFavorite = false,
      mainOriginId,
      currentStageId,
      metadata = {},
    } = params
    
    // Validar que pelo menos um identificador está presente
    if (!phone && !jid && !lid && !canonicalIdentifier) {
      throw new Error(
        'At least one identifier must be provided (phone, jid, lid, or canonicalIdentifier)'
      )
    }
    
    // Preparar dados para inserção
    const insertData: Record<string, unknown> = {
      project_id: projectId,
      name,
      phone: phone || null,
      country_code: countryCode || null,
      jid: jid || null,
      lid: lid || null,
      canonical_identifier: canonicalIdentifier || null,
      email: email || null,
      company: company || null,
      location: location || null,
      notes: notes || null,
      avatar_url: avatarUrl || null,
      is_favorite: isFavorite,
      main_origin_id: mainOriginId,
      current_stage_id: currentStageId,
      metadata,
    }
    
    const { data, error } = await this.supabaseClient
      .from('contacts')
      .insert(insertData as never)
      .select()
      .single()
    
    if (error) {
      console.error('[ContactRepository] Error creating contact:', {
        projectId,
        name,
        error: error.message,
        code: error.code,
        details: error.details,
      })
      
      // Tratar erro de unique constraint (duplicata)
      if (error.code === '23505') {
        throw new Error(
          `Contact with this identifier already exists: ${error.details || error.message}`
        )
      }
      
      throw new Error(`Failed to create contact: ${error.message}`)
    }
    
    return data as Contact
  }
}

/**
 * Exportar implementação padrão (Supabase)
 * 
 * Facilita uso direto sem precisar instanciar manualmente
 */
export const ContactRepository = SupabaseContactRepository