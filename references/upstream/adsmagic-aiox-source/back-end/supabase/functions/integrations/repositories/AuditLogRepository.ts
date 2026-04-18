/**
 * Audit Log Repository
 * Abstracts database access for audit logs
 */

import type { SupabaseDbClient } from '../types-db.ts'

export interface AuditLog {
  integration_id: string
  project_id: string
  action: string
  status: 'success' | 'error' | 'pending'
  metadata?: Record<string, unknown>
  error_message?: string
  client_ip?: string
}

export interface AuditLogRepository {
  create(
    log: AuditLog,
    supabaseClient: SupabaseDbClient
  ): Promise<void>
  
  findByIntegration(
    integrationId: string,
    supabaseClient: SupabaseDbClient,
    limit?: number
  ): Promise<any[]>
}

export class SupabaseAuditLogRepository implements AuditLogRepository {
  async create(
    log: AuditLog,
    supabaseClient: SupabaseDbClient
  ): Promise<void> {
    const { error } = await supabaseClient
      .from('integration_audit_logs')
      .insert({
        integration_id: log.integration_id,
        project_id: log.project_id,
        action: log.action,
        status: log.status,
        metadata: log.metadata || {},
        error_message: log.error_message,
        client_ip: log.client_ip,
      })

    if (error) {
      console.error('[AuditLogRepository] Error creating log:', error)
      // Don't throw - audit logging should not break the main flow
    }
  }

  async findByIntegration(
    integrationId: string,
    supabaseClient: SupabaseDbClient,
    limit = 50
  ): Promise<any[]> {
    const { data, error } = await supabaseClient
      .from('integration_audit_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[AuditLogRepository] Error finding logs:', error)
      throw new Error(`Failed to find audit logs: ${error.message}`)
    }

    return data || []
  }
}
