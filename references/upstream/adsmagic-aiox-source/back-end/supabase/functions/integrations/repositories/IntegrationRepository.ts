/**
 * Integration Repository
 * Abstracts database access for integrations
 */

import type { SupabaseDbClient } from '../types-db.ts'

export interface IntegrationRepository {
  findById(id: string, supabaseClient: SupabaseDbClient): Promise<any | null>
  findByProjectAndPlatform(
    projectId: string,
    platform: string,
    supabaseClient: SupabaseDbClient
  ): Promise<any | null>
  updateStatus(
    id: string,
    status: string,
    supabaseClient: SupabaseDbClient
  ): Promise<void>
  updateConfig(
    id: string,
    config: Record<string, unknown>,
    supabaseClient: SupabaseDbClient
  ): Promise<void>
}

export class SupabaseIntegrationRepository implements IntegrationRepository {
  async findById(
    id: string,
    supabaseClient: SupabaseDbClient
  ): Promise<any | null> {
    const { data, error } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[IntegrationRepository] Error finding by id:', error)
      throw new Error(`Failed to find integration: ${error.message}`)
    }

    return data
  }

  async findByProjectAndPlatform(
    projectId: string,
    platform: string,
    supabaseClient: SupabaseDbClient
  ): Promise<any | null> {
    const { data, error } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('project_id', projectId)
      .eq('platform', platform)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('[IntegrationRepository] Error finding by project and platform:', error)
      throw new Error(`Failed to find integration: ${error.message}`)
    }

    return data
  }

  async updateStatus(
    id: string,
    status: string,
    supabaseClient: SupabaseDbClient
  ): Promise<void> {
    const { error } = await supabaseClient
      .from('integrations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('[IntegrationRepository] Error updating status:', error)
      throw new Error(`Failed to update integration status: ${error.message}`)
    }
  }

  async updateConfig(
    id: string,
    config: Record<string, unknown>,
    supabaseClient: SupabaseDbClient
  ): Promise<void> {
    const { error } = await supabaseClient
      .from('integrations')
      .update({
        platform_config: config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('[IntegrationRepository] Error updating config:', error)
      throw new Error(`Failed to update integration config: ${error.message}`)
    }
  }
}

