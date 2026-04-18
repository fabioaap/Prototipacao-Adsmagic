/**
 * Testes unitários para ContactRepository
 * 
 * Testa todos os métodos do repository:
 * - findByPhone
 * - findByJid
 * - findByLid
 * - findByCanonicalIdentifier
 * - findByAnyIdentifier (busca otimizada paralela)
 * - create
 * 
 * Edge cases:
 * - Contato não encontrado (retorna null)
 * - Erros de unique constraint
 * - Validação de identificadores obrigatórios
 */

import { describe, it, beforeEach, afterEach } from 'https://deno.land/std@0.168.0/testing/bdd.ts'
import { assertEquals, assertExists, assertRejects } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import {
  SupabaseContactRepository,
  type IContactRepository,
  type Contact,
  type FindByPhoneParams,
  type FindByJidParams,
  type FindByLidParams,
  type FindByCanonicalIdentifierParams,
  type FindByAnyIdentifierParams,
  type CreateContactParams,
} from '../repositories/ContactRepository.ts'

/**
 * Mock do Supabase Client para testes
 */
class MockSupabaseClient {
  private data: Map<string, Contact> = new Map()
  
  from(table: string) {
    if (table !== 'contacts') {
      throw new Error(`Table ${table} not supported in mock`)
    }
    
    return {
      select: (columns: string) => ({
        eq: (column: string, value: unknown) => ({
          eq: (column2: string, value2: unknown) => ({
            eq: (column3: string, value3: unknown) => ({
              single: async () => {
                const contact = Array.from(this.data.values()).find(
                  (c) =>
                    c.project_id === value &&
                    (c as unknown as Record<string, unknown>)[column2] === value2 &&
                    (c as unknown as Record<string, unknown>)[column3] === value3
                )
                
                if (!contact) {
                  return {
                    data: null,
                    error: { code: 'PGRST116', message: 'Not found' },
                  }
                }
                
                return { data: contact, error: null }
              },
            }),
            single: async () => {
              const contact = Array.from(this.data.values()).find(
                (c) =>
                  c.project_id === value &&
                  (c as unknown as Record<string, unknown>)[column2] === value2
              )
              
              if (!contact) {
                return {
                  data: null,
                  error: { code: 'PGRST116', message: 'Not found' },
                }
              }
              
              return { data: contact, error: null }
            },
          }),
          single: async () => {
            const contact = Array.from(this.data.values()).find(
              (c) => (c as unknown as Record<string, unknown>)[column] === value
            )
            
            if (!contact) {
              return {
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }
            }
            
            return { data: contact, error: null }
          },
        }),
        single: async () => {
          // Não usado nos testes atuais
          return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
        },
      }),
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
            
            this.data.set(contact.id, contact)
            
            return { data: contact, error: null }
          },
        }),
      }),
    }
  }
  
  // Método auxiliar para adicionar dados de teste
  addTestContact(contact: Contact) {
    this.data.set(contact.id, contact)
  }
  
  // Método auxiliar para limpar dados
  clear() {
    this.data.clear()
  }
  
  // Método auxiliar para obter contato
  getContact(id: string): Contact | undefined {
    return this.data.get(id)
  }
}

describe('ContactRepository', () => {
  let repository: IContactRepository
  let mockClient: MockSupabaseClient
  
  const testProjectId = 'test-project-id'
  const testContact: Contact = {
    id: 'test-contact-id',
    project_id: testProjectId,
    name: 'Test Contact',
    phone: '16997202704',
    country_code: '55',
    jid: '5516997202704@s.whatsapp.net',
    lid: '213709100187796@lid',
    canonical_identifier: 'phone:55:16997202704',
    email: 'test@example.com',
    company: 'Test Company',
    location: 'São Paulo',
    notes: 'Test notes',
    avatar_url: null,
    is_favorite: false,
    main_origin_id: 'test-origin-id',
    current_stage_id: 'test-stage-id',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  beforeEach(() => {
    mockClient = new MockSupabaseClient()
    repository = new SupabaseContactRepository(
      mockClient as unknown as ReturnType<typeof import('https://esm.sh/@supabase/supabase-js@2').createClient>
    )
    mockClient.addTestContact(testContact)
  })
  
  afterEach(() => {
    mockClient.clear()
  })
  
  describe('findByPhone', () => {
    it('should find contact by phone and country code', async () => {
      const params: FindByPhoneParams = {
        projectId: testProjectId,
        phone: '16997202704',
        countryCode: '55',
      }
      
      const result = await repository.findByPhone(params)
      
      assertExists(result)
      assertEquals(result.phone, '16997202704')
      assertEquals(result.country_code, '55')
    })
    
    it('should return null when contact not found', async () => {
      const params: FindByPhoneParams = {
        projectId: testProjectId,
        phone: '99999999999',
        countryCode: '55',
      }
      
      const result = await repository.findByPhone(params)
      
      assertEquals(result, null)
    })
  })
  
  describe('findByJid', () => {
    it('should find contact by jid', async () => {
      const params: FindByJidParams = {
        projectId: testProjectId,
        jid: '5516997202704@s.whatsapp.net',
      }
      
      const result = await repository.findByJid(params)
      
      assertExists(result)
      assertEquals(result.jid, '5516997202704@s.whatsapp.net')
    })
    
    it('should return null when contact not found', async () => {
      const params: FindByJidParams = {
        projectId: testProjectId,
        jid: '99999999999@s.whatsapp.net',
      }
      
      const result = await repository.findByJid(params)
      
      assertEquals(result, null)
    })
  })
  
  describe('findByLid', () => {
    it('should find contact by lid', async () => {
      const params: FindByLidParams = {
        projectId: testProjectId,
        lid: '213709100187796@lid',
      }
      
      const result = await repository.findByLid(params)
      
      assertExists(result)
      assertEquals(result.lid, '213709100187796@lid')
    })
    
    it('should return null when contact not found', async () => {
      const params: FindByLidParams = {
        projectId: testProjectId,
        lid: '999999999999@lid',
      }
      
      const result = await repository.findByLid(params)
      
      assertEquals(result, null)
    })
  })
  
  describe('findByCanonicalIdentifier', () => {
    it('should find contact by canonical identifier', async () => {
      const params: FindByCanonicalIdentifierParams = {
        projectId: testProjectId,
        canonicalIdentifier: 'phone:55:16997202704',
      }
      
      const result = await repository.findByCanonicalIdentifier(params)
      
      assertExists(result)
      assertEquals(result.canonical_identifier, 'phone:55:16997202704')
    })
    
    it('should return null when contact not found', async () => {
      const params: FindByCanonicalIdentifierParams = {
        projectId: testProjectId,
        canonicalIdentifier: 'phone:55:99999999999',
      }
      
      const result = await repository.findByCanonicalIdentifier(params)
      
      assertEquals(result, null)
    })
  })
  
  describe('findByAnyIdentifier', () => {
    it('should find contact by canonical identifier (priority)', async () => {
      const params: FindByAnyIdentifierParams = {
        projectId: testProjectId,
        canonicalIdentifier: 'phone:55:16997202704',
        phone: '16997202704',
        countryCode: '55',
        jid: '5516997202704@s.whatsapp.net',
        lid: '213709100187796@lid',
      }
      
      const result = await repository.findByAnyIdentifier(params)
      
      assertExists(result)
      assertEquals(result.canonical_identifier, 'phone:55:16997202704')
    })
    
    it('should find contact by jid when canonical not found', async () => {
      // Criar contato sem canonical_identifier
      const contactWithoutCanonical: Contact = {
        ...testContact,
        id: 'test-contact-2',
        canonical_identifier: null,
      }
      mockClient.addTestContact(contactWithoutCanonical)
      
      const params: FindByAnyIdentifierParams = {
        projectId: testProjectId,
        jid: '5516997202704@s.whatsapp.net',
      }
      
      const result = await repository.findByAnyIdentifier(params)
      
      assertExists(result)
      assertEquals(result.jid, '5516997202704@s.whatsapp.net')
    })
    
    it('should return null when no identifiers provided', async () => {
      const params: FindByAnyIdentifierParams = {
        projectId: testProjectId,
      }
      
      const result = await repository.findByAnyIdentifier(params)
      
      assertEquals(result, null)
    })
    
    it('should return null when contact not found by any identifier', async () => {
      const params: FindByAnyIdentifierParams = {
        projectId: testProjectId,
        phone: '99999999999',
        countryCode: '55',
      }
      
      const result = await repository.findByAnyIdentifier(params)
      
      assertEquals(result, null)
    })
  })
  
  describe('create', () => {
    it('should create contact with phone', async () => {
      const params: CreateContactParams = {
        projectId: testProjectId,
        name: 'New Contact',
        phone: '11999999999',
        countryCode: '55',
        mainOriginId: 'test-origin-id',
        currentStageId: 'test-stage-id',
      }
      
      const result = await repository.create(params)
      
      assertExists(result)
      assertEquals(result.name, 'New Contact')
      assertEquals(result.phone, '11999999999')
      assertEquals(result.country_code, '55')
    })
    
    it('should create contact with jid only', async () => {
      const params: CreateContactParams = {
        projectId: testProjectId,
        name: 'New Contact JID',
        jid: '5511999999999@s.whatsapp.net',
        mainOriginId: 'test-origin-id',
        currentStageId: 'test-stage-id',
      }
      
      const result = await repository.create(params)
      
      assertExists(result)
      assertEquals(result.name, 'New Contact JID')
      assertEquals(result.jid, '5511999999999@s.whatsapp.net')
      assertEquals(result.phone, null)
    })
    
    it('should create contact with lid only', async () => {
      const params: CreateContactParams = {
        projectId: testProjectId,
        name: 'New Contact LID',
        lid: '213709100187796@lid',
        mainOriginId: 'test-origin-id',
        currentStageId: 'test-stage-id',
      }
      
      const result = await repository.create(params)
      
      assertExists(result)
      assertEquals(result.name, 'New Contact LID')
      assertEquals(result.lid, '213709100187796@lid')
      assertEquals(result.phone, null)
    })
    
    it('should create contact with canonical identifier', async () => {
      const params: CreateContactParams = {
        projectId: testProjectId,
        name: 'New Contact Canonical',
        canonicalIdentifier: 'phone:55:11999999999',
        mainOriginId: 'test-origin-id',
        currentStageId: 'test-stage-id',
      }
      
      const result = await repository.create(params)
      
      assertExists(result)
      assertEquals(result.name, 'New Contact Canonical')
      assertEquals(result.canonical_identifier, 'phone:55:11999999999')
    })
    
    it('should throw error when no identifier provided', async () => {
      const params: CreateContactParams = {
        projectId: testProjectId,
        name: 'Invalid Contact',
        mainOriginId: 'test-origin-id',
        currentStageId: 'test-stage-id',
      }
      
      await assertRejects(
        async () => {
          await repository.create(params)
        },
        Error,
        'At least one identifier must be provided'
      )
    })
  })
})