/**
 * Integration Adapter
 * Converts between backend (snake_case) and frontend (camelCase) formats
 * 
 * Backend contract: /back-end/types.ts:241-256
 */

import type { Integration } from '@/types/models'

/**
 * Backend Integration type (snake_case from database)
 */
export interface BackendIntegration {
  id: string
  project_id: string
  platform: string
  platform_type: string
  status: string
  platform_config: Record<string, unknown>
  last_sync_at?: string
  error_message?: string
  created_at: string
  updated_at: string
}

/**
 * Converts backend Integration to frontend format
 * Maps snake_case → camelCase
 */
export function adaptIntegrationFromBackend(raw: BackendIntegration): Integration {
  return {
    id: raw.id,
    projectId: raw.project_id,
    platform: raw.platform as Integration['platform'],
    platformType: raw.platform_type as Integration['platformType'],
    status: raw.status as Integration['status'],
    platformConfig: raw.platform_config,
    lastSync: raw.last_sync_at,
    errorMessage: raw.error_message,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

/**
 * Converts frontend Integration to backend format
 * Maps camelCase → snake_case
 */
export function adaptIntegrationToBackend(integration: Partial<Integration>): Partial<BackendIntegration> {
  return {
    ...(integration.id && { id: integration.id }),
    ...(integration.projectId && { project_id: integration.projectId }),
    ...(integration.platform && { platform: integration.platform }),
    ...(integration.platformType && { platform_type: integration.platformType }),
    ...(integration.status && { status: integration.status }),
    ...(integration.platformConfig && { platform_config: integration.platformConfig }),
    ...(integration.lastSync && { last_sync_at: integration.lastSync }),
    ...(integration.errorMessage && { error_message: integration.errorMessage }),
    ...(integration.createdAt && { created_at: integration.createdAt }),
    ...(integration.updatedAt && { updated_at: integration.updatedAt }),
  }
}

/**
 * Converts array of backend Integrations to frontend format
 */
export function adaptIntegrationsFromBackend(rawList: BackendIntegration[]): Integration[] {
  return rawList.map(adaptIntegrationFromBackend)
}

