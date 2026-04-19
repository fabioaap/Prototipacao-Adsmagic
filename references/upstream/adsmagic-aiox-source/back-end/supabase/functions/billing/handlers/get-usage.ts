/**
 * GET /billing/usage — Get usage tracking for current project
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../utils/response.ts'

export async function handleGetUsage(
  req: Request,
  supabaseClient: SupabaseClient
): Promise<Response> {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Get project ID from header
    const projectId = req.headers.get('X-Project-ID')
    if (!projectId) {
      return errorResponse('Missing X-Project-ID header', 400)
    }

    // Verify user has access to project (RLS handles this, but explicit check for clear error)
    const { data: projectAccess, error: accessError } = await supabaseClient
      .from('project_users')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (accessError || !projectAccess) {
      return errorResponse('Access denied to this project', 403)
    }

    // Get current period usage
    const today = new Date().toISOString().split('T')[0]
    const { data: usage, error: usageError } = await supabaseClient
      .from('usage_tracking')
      .select('*')
      .eq('project_id', projectId)
      .lte('period_start', today)
      .gte('period_end', today)
      .order('period_start', { ascending: false })
      .limit(1)
      .single()

    if (usageError) {
      // No usage record = no tracking active
      if (usageError.code === 'PGRST116') {
        return successResponse({
          usage: null,
          message: 'No usage tracking for current period',
        })
      }
      console.error('[get-usage] Error:', usageError)
      return errorResponse('Failed to fetch usage', 500)
    }

    return successResponse({
      usage: {
        project_id: usage.project_id,
        period_start: usage.period_start,
        period_end: usage.period_end,
        contacts_created: usage.contacts_created,
        contacts_limit: usage.contacts_limit,
        usage_percentage: usage.contacts_limit > 0
          ? Math.round((usage.contacts_created / usage.contacts_limit) * 100)
          : 0,
        remaining: Math.max(0, usage.contacts_limit - usage.contacts_created),
      },
    })
  } catch (error) {
    console.error('[get-usage] Unexpected error:', error)
    return errorResponse('Internal server error', 500)
  }
}
