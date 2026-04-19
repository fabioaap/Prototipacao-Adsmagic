/**
 * Contact Repository — REST client version
 *
 * Rewrites SupabaseContactRepository from SDK → REST.
 * Sequential fallback: canonical → jid → phone → lid
 */
import type { SupabaseRestClient } from '../lib/supabase.js'

export interface Contact {
  id: string
  project_id: string
  name?: string
  phone?: string | null
  country_code?: string | null
  jid?: string | null
  lid?: string | null
  canonical_identifier?: string | null
  main_origin_id?: string | null
  current_stage_id?: string | null
  metadata?: Record<string, unknown> | null
  [key: string]: unknown
}

export interface CreateContactParams {
  project_id: string
  name: string
  phone?: string | null
  country_code?: string | null
  jid?: string | null
  lid?: string | null
  canonical_identifier?: string | null
  main_origin_id?: string | null
  current_stage_id?: string | null
  metadata?: Record<string, unknown> | null
}

export class ContactRepository {
  constructor(private supabase: SupabaseRestClient) {}

  async findByCanonicalIdentifier(projectId: string, canonicalIdentifier: string): Promise<Contact | null> {
    return await this.supabase.selectOne('contacts', {
      'project_id': `eq.${projectId}`,
      'canonical_identifier': `eq.${canonicalIdentifier}`,
    }) as Contact | null
  }

  async findByJid(projectId: string, jid: string): Promise<Contact | null> {
    return await this.supabase.selectOne('contacts', {
      'project_id': `eq.${projectId}`,
      'jid': `eq.${jid}`,
    }) as Contact | null
  }

  async findByPhone(projectId: string, phone: string, countryCode: string): Promise<Contact | null> {
    return await this.supabase.selectOne('contacts', {
      'project_id': `eq.${projectId}`,
      'phone': `eq.${phone}`,
      'country_code': `eq.${countryCode}`,
    }) as Contact | null
  }

  async findByLid(projectId: string, lid: string): Promise<Contact | null> {
    return await this.supabase.selectOne('contacts', {
      'project_id': `eq.${projectId}`,
      'lid': `eq.${lid}`,
    }) as Contact | null
  }

  async findByAnyIdentifier(params: {
    projectId: string
    canonicalIdentifier?: string | null
    jid?: string | null
    phone?: string | null
    countryCode?: string | null
    lid?: string | null
  }): Promise<Contact | null> {
    // Sequential fallback (same priority as original)
    if (params.canonicalIdentifier) {
      const result = await this.findByCanonicalIdentifier(params.projectId, params.canonicalIdentifier)
      if (result) return result
    }
    if (params.jid) {
      const result = await this.findByJid(params.projectId, params.jid)
      if (result) return result
    }
    if (params.phone && params.countryCode) {
      const result = await this.findByPhone(params.projectId, params.phone, params.countryCode)
      if (result) return result
    }
    if (params.lid) {
      const result = await this.findByLid(params.projectId, params.lid)
      if (result) return result
    }
    return null
  }

  async create(params: CreateContactParams): Promise<Contact> {
    const rows = await this.supabase.insert('contacts', {
      project_id: params.project_id,
      name: params.name,
      phone: params.phone ?? null,
      country_code: params.country_code ?? null,
      jid: params.jid ?? null,
      lid: params.lid ?? null,
      canonical_identifier: params.canonical_identifier ?? null,
      main_origin_id: params.main_origin_id ?? null,
      current_stage_id: params.current_stage_id ?? null,
      metadata: params.metadata ?? null,
    })
    if (!rows[0]) throw new Error('Failed to create contact')
    return rows[0] as Contact
  }

  async update(id: string, data: Record<string, unknown>): Promise<Contact | null> {
    data.updated_at = new Date().toISOString()
    const rows = await this.supabase.update('contacts', data, { 'id': `eq.${id}` })
    return (rows[0] as Contact) || null
  }
}
