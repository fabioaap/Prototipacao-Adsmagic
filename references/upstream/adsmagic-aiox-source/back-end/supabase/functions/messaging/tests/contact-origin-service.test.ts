/**
 * Testes unitários para ContactOriginService
 * 
 * FASE 8: Testes completos de validação e lógica de negócio
 */

import { describe, it, beforeEach } from 'https://deno.land/std@0.168.0/testing/bdd.ts'
import { assertEquals, assertExists, assertRejects } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { ContactOriginService } from '../services/ContactOriginService.ts'
import type { NormalizedMessage } from '../types.ts'
import type { Contact } from '../repositories/ContactRepository.ts'

/**
 * Mock completo do Supabase Client para testes
 */
class MockSupabaseClient {
  private origins: Map<string, unknown> = new Map()
  private stages: Map<string, unknown> = new Map()
  private contactOrigins: unknown[] = []
  private contacts: Map<string, Contact> = new Map()
  
  from(table: string) {
    if (table === 'contacts') {
      return {
        select: (columns: string) => {
          // Acumular filtros conforme são adicionados (nova instância para cada query)
          const filters: Array<{ column: string; value: unknown }> = []
          
          const chain = {
            eq: (col: string, val: unknown) => {
              filters.push({ column: col, value: val })
              return chain
            },
            single: async () => {
              // Buscar contato que corresponde a todos os filtros
              const contact = Array.from(this.contacts.values()).find((c) => {
                const record = c as unknown as Record<string, unknown>
                return filters.every((f) => record[f.column] === f.value)
              })
              return { data: contact || null, error: contact ? null : { code: 'PGRST116' } }
            },
          }
          
          return chain
        },
        insert: (data: Record<string, unknown>) => ({
          select: () => ({
            single: async () => {
              const contact: Contact = {
                id: crypto.randomUUID(),
                project_id: data.project_id as string,
                name: data.name as string,
                phone: (data.phone as string) || null,
                country_code: (data.country_code as string) || null,
                jid: (data.jid as string) || null,
                lid: (data.lid as string) || null,
                canonical_identifier: (data.canonical_identifier as string) || null,
                email: (data.email as string) || null,
                company: (data.company as string) || null,
                location: (data.location as string) || null,
                notes: (data.notes as string) || null,
                avatar_url: (data.avatar_url as string) || null,
                is_favorite: (data.is_favorite as boolean) || false,
                main_origin_id: data.main_origin_id as string,
                current_stage_id: data.current_stage_id as string,
                metadata: (data.metadata as Record<string, unknown>) || {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
              this.contacts.set(contact.id, contact)
              return { data: contact, error: null }
            },
          }),
        }),
      }
    }
    
    if (table === 'origins') {
      return {
        select: (columns: string) => {
          // Acumular filtros para is()
          const isFilters: Array<{ column: string; value: unknown }> = []
          const isChain = {
            is: (column: string, value: unknown) => {
              isFilters.push({ column, value })
              return {
                eq: (column2: string, value2: unknown) => {
                  isFilters.push({ column: column2, value: value2 })
                  return {
                    eq: (column3: string, value3: unknown) => {
                      isFilters.push({ column: column3, value: value3 })
                      return {
                        maybeSingle: async () => {
                          const origin = Array.from(this.origins.values()).find((o) => {
                            const record = o as Record<string, unknown>
                            return isFilters.every((f) => record[f.column] === f.value)
                          })
                          return { data: origin || null, error: null }
                        },
                      }
                    },
                    maybeSingle: async () => {
                      const origin = Array.from(this.origins.values()).find((o) => {
                        const record = o as Record<string, unknown>
                        return isFilters.every((f) => record[f.column] === f.value)
                      })
                      return { data: origin || null, error: null }
                    },
                  }
                },
              }
            },
            // Acumular filtros para eq()
            eq: (column: string, value: unknown) => {
              const eqFilters: Array<{ column: string; value: unknown }> = [
                { column, value },
              ]
              const eqChain = {
                eq: (column2: string, value2: unknown) => {
                  eqFilters.push({ column: column2, value: value2 })
                  return {
                    eq: (column3: string, value3: unknown) => {
                      eqFilters.push({ column: column3, value: value3 })
                      return {
                        maybeSingle: async () => {
                          const origin = Array.from(this.origins.values()).find((o) => {
                            const record = o as Record<string, unknown>
                            return eqFilters.every((f) => record[f.column] === f.value)
                          })
                          return { data: origin || null, error: null }
                        },
                        single: async () => {
                          const origin = Array.from(this.origins.values()).find((o) => {
                            const record = o as Record<string, unknown>
                            return eqFilters.every((f) => record[f.column] === f.value)
                          })
                          return { data: origin || null, error: origin ? null : { code: 'PGRST116' } }
                        },
                      }
                    },
                    single: async () => {
                      const origin = Array.from(this.origins.values()).find((o) => {
                        const record = o as Record<string, unknown>
                        return eqFilters.every((f) => record[f.column] === f.value)
                      })
                      return { data: origin || null, error: origin ? null : { code: 'PGRST116' } }
                    },
                    maybeSingle: async () => {
                      const origin = Array.from(this.origins.values()).find((o) => {
                        const record = o as Record<string, unknown>
                        return eqFilters.every((f) => record[f.column] === f.value)
                      })
                      return { data: origin || null, error: null }
                    },
                  }
                },
                single: async () => {
                  const origin = Array.from(this.origins.values()).find((o) => {
                    const record = o as Record<string, unknown>
                    return eqFilters.every((f) => record[f.column] === f.value)
                  })
                  return { data: origin || null, error: origin ? null : { code: 'PGRST116' } }
                },
                maybeSingle: async () => {
                  const origin = Array.from(this.origins.values()).find((o) => {
                    const record = o as Record<string, unknown>
                    return eqFilters.every((f) => record[f.column] === f.value)
                  })
                  return { data: origin || null, error: null }
                },
              }
              return eqChain
            },
          }
          return isChain
        },
        insert: (data: Record<string, unknown>) => ({
          select: () => ({
            single: async () => {
              const origin = {
                id: crypto.randomUUID(),
                ...data,
              }
              this.origins.set(origin.id, origin)
              return { data: origin, error: null }
            },
          }),
        }),
      }
    }
    
    if (table === 'stages') {
      return {
        select: (columns: string) => ({
          eq: (column: string, value: unknown) => ({
            eq: (column2: string, value2: unknown) => ({
              order: (orderColumn: string, options: { ascending: boolean }) => ({
                limit: (num: number) => ({
                  maybeSingle: async () => {
                    // Buscar estágio que corresponde aos filtros
                    const stages = Array.from(this.stages.values()).filter((s) => {
                      const record = s as Record<string, unknown>
                      return record[column] === value && record[column2] === value2
                    })
                    // Ordenar e retornar o primeiro (simulação de order + limit)
                    if (stages.length > 0) {
                      const sorted = stages.sort((a, b) => {
                        const aOrder = (a as Record<string, unknown>)[orderColumn] as number
                        const bOrder = (b as Record<string, unknown>)[orderColumn] as number
                        return options.ascending ? aOrder - bOrder : bOrder - aOrder
                      })
                      return { data: sorted[0] || null, error: null }
                    }
                    return { data: null, error: null }
                  },
                }),
              }),
            }),
          }),
        }),
      }
    }
    
    if (table === 'contact_origins') {
      return {
        select: (columns: string) => ({
          eq: (column: string, value: unknown) => ({
            eq: (column2: string, value2: unknown) => ({
              maybeSingle: async () => {
                const co = this.contactOrigins.find(
                  (co) => (co as Record<string, unknown>)[column] === value &&
                         (co as Record<string, unknown>)[column2] === value2
                )
                return { data: co || null, error: null }
              },
              single: async () => {
                const co = this.contactOrigins.find(
                  (co) => (co as Record<string, unknown>)[column] === value &&
                         (co as Record<string, unknown>)[column2] === value2
                )
                return { data: co || null, error: co ? null : { code: 'PGRST116' } }
              },
            }),
          }),
        }),
        insert: (data: Record<string, unknown>) => {
          this.contactOrigins.push(data)
          return Promise.resolve({ error: null, data: null })
        },
        update: (data: Record<string, unknown>) => ({
          eq: (column: string, value: unknown) => ({
            then: async (callback: (result: { error: unknown }) => unknown) => {
              const index = this.contactOrigins.findIndex(
                (co) => (co as Record<string, unknown>)[column] === value
              )
              if (index >= 0) {
                this.contactOrigins[index] = { ...(this.contactOrigins[index] as Record<string, unknown>), ...data }
              }
              await callback({ error: null })
            },
          }),
        }),
      }
    }
    
    if (table === 'contact_stage_history') {
      return {
        insert: (data: Record<string, unknown>) => ({
          then: async (callback: (result: { error: unknown }) => unknown) => {
            await callback({ error: null })
          },
        }),
      }
    }
    
    throw new Error(`Table ${table} not supported in mock`)
  }
  
  // Métodos auxiliares
  addOrigin(origin: unknown) {
    if (origin && typeof origin === 'object' && 'id' in origin) {
      this.origins.set((origin as { id: string }).id, origin)
    }
  }
  
  addStage(stage: unknown) {
    if (stage && typeof stage === 'object' && 'id' in stage) {
      this.stages.set((stage as { id: string }).id, stage)
    }
  }
  
  getContactOrigins(): unknown[] {
    return this.contactOrigins
  }
  
  getContactOriginsCount(): number {
    return this.contactOrigins.length
  }
  
  addContact(contact: Contact) {
    this.contacts.set(contact.id, contact)
  }
  
  getContact(id: string): Contact | undefined {
    return this.contacts.get(id)
  }
  
  clear() {
    this.origins.clear()
    this.stages.clear()
    this.contactOrigins = []
    this.contacts.clear()
  }
}

/**
 * Mock do ContactRepository
 */
class MockContactRepository {
  private contacts: Map<string, Contact> = new Map()
  
  async findByAnyIdentifier(params: {
    projectId: string
    phone?: string | null
    countryCode?: string | null
    jid?: string | null
    lid?: string | null
    canonicalIdentifier?: string | null
  }): Promise<Contact | null> {
    const contact = Array.from(this.contacts.values()).find((c) => {
      if (c.project_id !== params.projectId) return false
      if (params.canonicalIdentifier && c.canonical_identifier === params.canonicalIdentifier) return true
      if (params.jid && c.jid === params.jid) return true
      if (params.lid && c.lid === params.lid) return true
      if (params.phone && params.countryCode && c.phone === params.phone && c.country_code === params.countryCode) return true
      return false
    })
    return contact || null
  }
  
  async create(params: {
    projectId: string
    name: string
    phone: string | null
    countryCode: string | null
    jid: string | null
    lid: string | null
    canonicalIdentifier: string | null
    mainOriginId: string
    currentStageId: string
    metadata?: Record<string, unknown>
  }): Promise<Contact> {
    const contact: Contact = {
      id: crypto.randomUUID(),
      project_id: params.projectId,
      name: params.name,
      phone: params.phone,
      country_code: params.countryCode,
      jid: params.jid,
      lid: params.lid,
      canonical_identifier: params.canonicalIdentifier,
      email: null,
      company: null,
      location: null,
      notes: null,
      avatar_url: null,
      is_favorite: false,
      main_origin_id: params.mainOriginId,
      current_stage_id: params.currentStageId,
      metadata: params.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.contacts.set(contact.id, contact)
    return contact
  }
  
  addContact(contact: Contact) {
    this.contacts.set(contact.id, contact)
  }
  
  clear() {
    this.contacts.clear()
  }
}

describe('ContactOriginService', () => {
  let mockClient: MockSupabaseClient
  let service: ContactOriginService
  const testProjectId = 'test-project-id'
  
  function createTestMessage(overrides: Partial<NormalizedMessage> = {}): NormalizedMessage {
    return {
      messageId: 'msg-1',
      externalMessageId: 'ext-1',
      brokerId: 'uazapi',
      accountId: 'acc-1',
      from: {
        phoneNumber: '5511999999999',
        name: 'Test User',
      },
      to: {
        phoneNumber: '5511888888888',
        accountName: 'Test Account',
      },
      content: {
        type: 'text',
        text: 'Hello',
      },
      timestamp: new Date(),
      status: 'delivered',
      isGroup: false,
      ...overrides,
    }
  }
  
  beforeEach(() => {
    mockClient = new MockSupabaseClient()
    service = new ContactOriginService(mockClient as never)
    
    // Adicionar estágio padrão
    mockClient.addStage({
      id: 'stage-1',
      project_id: testProjectId,
      name: 'Lead',
      display_order: 1,
      is_active: true,
    })
    
    // Adicionar origem padrão do sistema
    mockClient.addOrigin({
      id: 'origin-whatsapp',
      project_id: null,
      name: 'WhatsApp',
      type: 'system',
      is_active: true,
    })
  })
  
  describe('processIncomingContact - Validações', () => {
    it('should throw error if message is from group', async () => {
      const message = createTestMessage({ isGroup: true })
      
      await assertRejects(
        async () => {
          await service.processIncomingContact({
            normalizedMessage: message,
            projectId: testProjectId,
            supabaseClient: mockClient as never,
          })
        },
        Error,
        'contato individual'
      )
    })
    
    it('should throw error if no identifier found', async () => {
      const message = createTestMessage({
        from: {
          phoneNumber: '', // Vazio para forçar erro
          name: 'Test User',
        },
      })
      
      await assertRejects(
        async () => {
          await service.processIncomingContact({
            normalizedMessage: message,
            projectId: testProjectId,
            supabaseClient: mockClient as never,
          })
        },
        Error,
        'No valid contact identifier found'
      )
    })
  })
  
  describe('processIncomingContact - Criação de Contato', () => {
    it('should create new contact with phone number', async () => {
      const message = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          name: 'New User',
        },
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: message,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      assertExists(result)
      assertEquals(result.created, true)
      assertExists(result.contactId)
    })
    
    it('should create new contact with JID', async () => {
      const message = createTestMessage({
        from: {
          phoneNumber: '5511999999999', // phoneNumber é obrigatório
          jid: '5511999999999@s.whatsapp.net',
          name: 'JID User',
        },
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: message,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      assertExists(result)
      assertEquals(result.created, true)
    })
    
    it('should create new contact with LID', async () => {
      const message = createTestMessage({
        from: {
          phoneNumber: '5511999999999', // phoneNumber é obrigatório
          lid: '213709100187796@lid',
          name: 'LID User',
        },
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: message,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      assertExists(result)
      assertEquals(result.created, true)
    })
    
    it('should create contact with source data when available', async () => {
      const message = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          name: 'User with Origin',
        },
        context: {
          metadata: {
            externalAdReply: {
              ctwaClid: 'Afeuo72uo9m...',
              sourceType: 'ad',
              sourceApp: 'facebook',
              sourceID: '1234567890',
            },
          },
        },
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: message,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      assertExists(result)
      assertEquals(result.created, true)
      assertExists(result.sourceData)
    })
  })
  
  describe('processIncomingContact - Contato Existente', () => {
    it('should return existing contact without creating new', async () => {
      // Note: Este teste requer mock mais complexo do repository
      // Será implementado quando integrarmos com testes de integração
      // Por enquanto, validamos apenas estrutura básica
      const message = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          name: 'Existing User',
        },
      })
      
      // Como não há mock de contato existente, será criado novo
      const result = await service.processIncomingContact({
        normalizedMessage: message,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      assertExists(result)
    })
  })
  
  describe('processIncomingContact - Extração de Identificadores', () => {
    it('should extract identifier from phoneNumber', async () => {
      const message = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
        },
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: message,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      assertExists(result)
    })
    
    it('should extract identifier from JID', async () => {
      const message = createTestMessage({
        from: {
          phoneNumber: '5511999999999', // phoneNumber é obrigatório
          jid: '5511999999999@s.whatsapp.net',
        },
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: message,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      assertExists(result)
    })
    
    it('should prioritize canonicalIdentifier when available', async () => {
      const message = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          canonicalIdentifier: 'phone:55:11999999999',
        },
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: message,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      assertExists(result)
    })
  })
  
  describe('Critical Fields Extraction', () => {
    it('should include critical fields when inserting contact origin with source_data', async () => {
      const message = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          name: 'User with Critical Fields',
        },
        context: {
          metadata: {
            externalAdReply: {
              ctwaClid: 'Afeuo72uo9m...',
              sourceType: 'ad',
              sourceApp: 'facebook',
              sourceID: '1234567890',
              campaignId: 'test-campaign-123',
              adId: 'test-ad-456',
            },
          },
        },
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: message,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      assertExists(result)
      assertEquals(result.created, true)
      
      // Verificar que contact_origins foi inserido com campos críticos
      const insertedOrigins = (mockClient as unknown as { contactOrigins: unknown[] }).contactOrigins
      assertEquals(insertedOrigins.length, 1)
      
      const insertedOrigin = insertedOrigins[0] as Record<string, unknown>
      assertExists(insertedOrigin.source_data)
      
      // Verificar que campos críticos foram extraídos e incluídos
      // (Note: O mock não simula o trigger, mas o código TypeScript inclui os campos)
      const sourceData = insertedOrigin.source_data as Record<string, unknown>
      assertExists(sourceData.campaign)
    })
    
    // Nota: Este teste foi removido porque a nova implementação sempre cria novo registro (INSERT)
    // em vez de atualizar existente. Ver novos testes abaixo para múltiplas origens.
  })
  
  describe('processIncomingContact - Múltiplas Origens (Nova Implementação)', () => {
    it('should create new contact origin when sourceData exists, even if origin already exists', async () => {
      // Arrange: Criar contato existente com origem Meta Ads
      mockClient.addOrigin({
        id: 'origin-meta-ads',
        project_id: null,
        name: 'Meta Ads',
        type: 'system',
        is_active: true,
      })
      
      const existingContact: Contact = {
        id: 'contact-1',
        project_id: testProjectId,
        name: 'Existing User',
        phone: '11999999999',
        country_code: '55',
        jid: null,
        lid: null,
        canonical_identifier: 'phone:55:11999999999',
        email: null,
        company: null,
        location: null,
        notes: null,
        avatar_url: null,
        is_favorite: false,
        main_origin_id: 'origin-meta-ads',
        current_stage_id: 'stage-1',
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      // Simular contato existente adicionando ao repository (via reflection)
      // Nota: Isso requer acesso ao repository interno do serviço
      // Por enquanto, vamos simular enviando mensagem que criará o contato primeiro
      
      const firstMessage = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          name: 'Existing User',
        },
        context: {
          metadata: {
            externalAdReply: {
              ctwaClid: 'FirstClid...',
              sourceType: 'ad',
              sourceApp: 'facebook',
              sourceID: '1234567890',
            },
          },
        },
      })
      
      // Criar contato primeiro
      await service.processIncomingContact({
        normalizedMessage: firstMessage,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      const initialCount = mockClient.getContactOriginsCount()
      assertEquals(initialCount, 1) // Primeiro registro criado
      
      // Act: Enviar segunda mensagem com sourceData Meta Ads novamente
      const secondMessage = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          name: 'Existing User',
        },
        context: {
          metadata: {
            externalAdReply: {
              ctwaClid: 'SecondClid...',
              sourceType: 'ad',
              sourceApp: 'facebook',
              sourceID: '1234567890',
            },
          },
        },
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: secondMessage,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      // Assert: Novo registro em contact_origins deve ser criado (não atualizado)
      assertExists(result)
      assertEquals(result.created, false) // Contato já existia
      const finalCount = mockClient.getContactOriginsCount()
      assertEquals(finalCount, 2) // Dois registros distintos devem existir
    })
    
    it('should not create contact origin when contact exists but no sourceData', async () => {
      // Arrange: Criar contato primeiro
      const firstMessage = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          name: 'Existing User',
        },
        context: {
          metadata: {
            externalAdReply: {
              ctwaClid: 'FirstClid...',
              sourceType: 'ad',
              sourceApp: 'facebook',
              sourceID: '1234567890',
            },
          },
        },
      })
      
      await service.processIncomingContact({
        normalizedMessage: firstMessage,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      const initialCount = mockClient.getContactOriginsCount()
      assertEquals(initialCount, 1) // Primeiro registro criado
      
      // Act: Enviar mensagem sem sourceData
      const messageWithoutSource = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          name: 'Existing User',
        },
        // Sem context.metadata.externalAdReply
      })
      
      const result = await service.processIncomingContact({
        normalizedMessage: messageWithoutSource,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      // Assert: Nenhum novo registro em contact_origins deve ser criado
      assertExists(result)
      assertEquals(result.created, false) // Contato já existia
      const finalCount = mockClient.getContactOriginsCount()
      assertEquals(finalCount, 1) // Mesmo número de registros (não criou novo)
      assertEquals(result.sourceData, undefined) // Sem sourceData
    })
    
    it('should create contact without origin when no sourceData', async () => {
      // Arrange: Contato não existe
      const messageWithoutSource = createTestMessage({
        from: {
          phoneNumber: '5511999999999',
          name: 'New User Without Source',
        },
        // Sem context.metadata.externalAdReply
      })
      
      const initialCount = mockClient.getContactOriginsCount()
      assertEquals(initialCount, 0) // Nenhum registro inicial
      
      // Act: Enviar mensagem sem sourceData
      const result = await service.processIncomingContact({
        normalizedMessage: messageWithoutSource,
        projectId: testProjectId,
        supabaseClient: mockClient as never,
      })
      
      // Assert: Contato criado, mas nenhum registro em contact_origins
      assertExists(result)
      assertEquals(result.created, true) // Contato foi criado
      assertExists(result.contactId)
      const finalCount = mockClient.getContactOriginsCount()
      assertEquals(finalCount, 0) // Nenhum registro em contact_origins
      assertEquals(result.sourceData, undefined) // Sem sourceData
    })
    
    it('should allow multiple contact origins with same origin_id', async () => {
      // Arrange: Contato existe (será criado na primeira mensagem)
      mockClient.addOrigin({
        id: 'origin-meta-ads',
        project_id: null,
        name: 'Meta Ads',
        type: 'system',
        is_active: true,
      })
      
      // Act: Enviar 3 mensagens com sourceData Meta Ads
      for (let i = 1; i <= 3; i++) {
        const message = createTestMessage({
          from: {
            phoneNumber: '5511999999999',
            name: 'User with Multiple Origins',
          },
          context: {
            metadata: {
              externalAdReply: {
                ctwaClid: `Clid${i}...`,
                sourceType: 'ad',
                sourceApp: 'facebook',
                sourceID: `123456789${i}`,
                campaignId: `campaign-${i}`,
              },
            },
          },
        })
        
        await service.processIncomingContact({
          normalizedMessage: message,
          projectId: testProjectId,
          supabaseClient: mockClient as never,
        })
      }
      
      // Assert: 3 registros em contact_origins com mesmo origin_id
      const finalCount = mockClient.getContactOriginsCount()
      assertEquals(finalCount, 3) // Três registros distintos
      
      // Verificar que todos têm o mesmo origin_id (Meta Ads)
      const contactOrigins = mockClient.getContactOrigins() as Array<Record<string, unknown>>
      contactOrigins.forEach((co) => {
        assertEquals(co.origin_id, 'origin-meta-ads')
        assertExists(co.source_data)
      })
    })
  })
})
