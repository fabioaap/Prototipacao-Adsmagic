/**
 * Audit Logger Utility
 * Centralized logging for OAuth operations
 */

import { SupabaseAuditLogRepository, type AuditLog } from '../repositories/AuditLogRepository.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Log an OAuth operation
 * 
 * @param log - Audit log data
 * @param supabaseClient - Supabase client (should be service role for inserts)
 */
export async function logOAuthOperation(
  log: Omit<AuditLog, 'created_at'>,
  supabaseClient: SupabaseDbClient
): Promise<void> {
  try {
    const auditRepo = new SupabaseAuditLogRepository()
    await auditRepo.create(log, supabaseClient)
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error('[Audit Logger] Failed to log operation:', error)
  }
}

/**
 * Extract client IP from request
 * 
 * @param req - Request object
 * @returns Client IP or undefined
 */
export function getClientIp(req: Request): string | undefined {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers.get('X-Forwarded-For')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = req.headers.get('X-Real-Ip')
  if (realIp) {
    return realIp
  }

  return undefined
}

