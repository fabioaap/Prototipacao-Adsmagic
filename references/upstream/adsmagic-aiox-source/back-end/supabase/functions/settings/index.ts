/**
 * Edge Function para API de Settings
 *
 * Combina dados do projeto (projects table) com dados da empresa (company_settings table)
 * para retornar/atualizar configuracoes consolidadas.
 *
 * Rotas:
 * - GET    /settings            -> Retorna settings consolidados
 * - PATCH  /settings/general    -> Atualiza nome, descricao, attribution_model no projects
 * - PATCH  /settings/currency   -> Atualiza moeda/timezone no company_settings
 * - PATCH  /settings/notifications -> Atualiza notificacoes no company_settings
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './utils/cors.ts'
import { successResponse, errorResponse } from './utils/response.ts'
import { getSettingsCache, setSettingsCache, invalidateSettingsCache } from './utils/cache.ts'

serve(async (req) => {
  // CORS preflight - Optimized response (no body, 204 status)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    // Auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorized: Invalid or expired token', 401)
    }

    // Project ID from header
    const projectId = req.headers.get('x-project-id')
    if (!projectId) {
      return errorResponse('Missing x-project-id header', 400)
    }

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, company_id, name, description, attribution_model, revenue_goal, currency, timezone, status, created_at')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return errorResponse('Project not found or access denied', 404)
    }

    // Routing
    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/settings\/?/, '').replace(/\/$/, '')

    // GET /settings -> Return consolidated settings
    if (req.method === 'GET' && (!path || path === '')) {
      return await handleGetSettings(supabase, project)
    }

    // PATCH /settings/general
    if (req.method === 'PATCH' && path === 'general') {
      const body = await req.json()
      return await handleUpdateGeneral(supabase, projectId, body)
    }

    // PATCH /settings/currency
    if (req.method === 'PATCH' && path === 'currency') {
      const body = await req.json()
      return await handleUpdateCurrency(supabase, projectId, project.company_id, body)
    }

    // PATCH /settings/notifications
    if (req.method === 'PATCH' && path === 'notifications') {
      const body = await req.json()
      return await handleUpdateNotifications(supabase, projectId, project.company_id, body)
    }

    return errorResponse('Not Found', 404)
  } catch (error) {
    console.error('[Settings Edge Function Error]', error)
    if (error instanceof SyntaxError) {
      return errorResponse('Bad Request: Invalid JSON', 400)
    }
    return errorResponse('Internal Server Error', 500)
  }
})

// ============================================================================
// Handlers
// ============================================================================

async function handleGetSettings(supabase: any, project: any) {
  // Try to get from cache first
  const cached = await getSettingsCache(supabase, project.id)
  if (cached) {
    console.log('[Settings] Cache hit, returning cached data')
    return successResponse(cached)
  }

  console.log('[Settings] Cache miss, fetching from database')

  // Get company_settings for currency/notification data
  const { data: companySettings } = await supabase
    .from('company_settings')
    .select('*')
    .eq('company_id', project.company_id)
    .single()

  const settings = {
    general: {
      projectId: project.id,
      projectName: project.name || '',
      projectDescription: project.description || '',
      attributionModel: project.attribution_model || 'first_touch',
      revenueGoal: project.revenue_goal ?? null,
      createdAt: project.created_at
    },
    currency: {
      currency: companySettings?.currency || project.currency || 'BRL',
      timezone: companySettings?.timezone || project.timezone || 'America/Sao_Paulo',
      dateFormat: companySettings?.date_format || 'DD/MM/YYYY',
      timeFormat: companySettings?.time_format || '24h',
      thousandsSeparator: companySettings?.thousands_separator || '.',
      decimalSeparator: companySettings?.decimal_separator || ','
    },
    notifications: {
      enabled: companySettings?.notifications_enabled ?? true,
      email: companySettings?.notification_email || '',
      events: ['contact_created', 'sale_completed'],
      digestFrequency: companySettings?.digest_frequency || 'daily',
      digestTime: companySettings?.digest_time || '09:00',
      timezone: companySettings?.timezone || project.timezone || 'America/Sao_Paulo'
    }
  }

  // Save to cache asynchronously (fire-and-forget)
  setSettingsCache(supabase, project.id, settings)

  return successResponse(settings)
}

async function handleUpdateGeneral(supabase: any, projectId: string, body: any) {
  const updates: Record<string, any> = {}

  if (body.projectName !== undefined) updates.name = body.projectName
  if (body.projectDescription !== undefined) updates.description = body.projectDescription
  if (body.attributionModel !== undefined) updates.attribution_model = body.attributionModel
  if (body.revenueGoal !== undefined) updates.revenue_goal = body.revenueGoal

  if (Object.keys(updates).length === 0) {
    return errorResponse('No fields to update', 400)
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select('id, name, description, attribution_model, revenue_goal, created_at')
    .single()

  if (error) {
    console.error('[Settings] Error updating general:', error)
    return errorResponse('Failed to update general settings', 500)
  }

  // Invalidate settings cache
  invalidateSettingsCache(supabase, projectId)

  return successResponse({
    projectId: data.id,
    projectName: data.name,
    projectDescription: data.description,
    attributionModel: data.attribution_model,
    revenueGoal: data.revenue_goal ?? null,
    createdAt: data.created_at
  })
}

async function handleUpdateCurrency(supabase: any, projectId: string, companyId: string, body: any) {
  const updates: Record<string, any> = {}

  // Validate currency (ISO 4217 format)
  if (body.currency !== undefined) {
    if (body.currency && !/^[A-Z]{3}$/.test(body.currency)) {
      return errorResponse('Invalid currency format. Use ISO 4217 (e.g., BRL, USD)', 400)
    }
    updates.currency = body.currency || null
  }

  if (body.timezone !== undefined) updates.timezone = body.timezone || null

  // Validate date format
  if (body.dateFormat !== undefined) {
    const validDateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
    if (body.dateFormat && !validDateFormats.includes(body.dateFormat)) {
      return errorResponse('Invalid date format. Use DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD', 400)
    }
    updates.date_format = body.dateFormat || null
  }

  // Validate time format
  if (body.timeFormat !== undefined) {
    const validTimeFormats = ['12h', '24h']
    if (body.timeFormat && !validTimeFormats.includes(body.timeFormat)) {
      return errorResponse('Invalid time format. Use 12h or 24h', 400)
    }
    updates.time_format = body.timeFormat || null
  }

  if (body.thousandsSeparator !== undefined) updates.thousands_separator = body.thousandsSeparator
  if (body.decimalSeparator !== undefined) updates.decimal_separator = body.decimalSeparator

  if (Object.keys(updates).length === 0) {
    return errorResponse('No fields to update', 400)
  }

  updates.updated_at = new Date().toISOString()

  // Upsert: create if not exists, update if exists
  const { data, error } = await supabase
    .from('company_settings')
    .upsert(
      { company_id: companyId, ...updates },
      { onConflict: 'company_id' }
    )
    .select('currency, timezone, date_format, time_format, thousands_separator, decimal_separator')
    .single()

  if (error) {
    console.error('[Settings] Error updating currency:', error)

    // Return specific error for constraint violations
    if (error.code === '23514') {
      return errorResponse('Invalid field value', 400)
    }

    return errorResponse('Failed to update currency settings', 500)
  }

  // Invalidate settings cache
  invalidateSettingsCache(supabase, projectId)

  return successResponse({
    currency: data.currency,
    timezone: data.timezone,
    dateFormat: data.date_format,
    timeFormat: data.time_format,
    thousandsSeparator: data.thousands_separator,
    decimalSeparator: data.decimal_separator
  })
}

async function handleUpdateNotifications(supabase: any, projectId: string, companyId: string, body: any) {
  const updates: Record<string, any> = {}

  if (body.enabled !== undefined) updates.notifications_enabled = body.enabled

  // Validate and normalize email
  if (body.email !== undefined) {
    if (body.email === '' || body.email === null) {
      // Convert empty string to null for PostgreSQL constraint
      updates.notification_email = null
    } else {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i
      if (!emailRegex.test(body.email)) {
        return errorResponse('Invalid email format', 400)
      }
      updates.notification_email = body.email
    }
  }

  if (body.digestFrequency !== undefined) updates.digest_frequency = body.digestFrequency

  // Validate and normalize digest_time
  if (body.digestTime !== undefined) {
    if (body.digestTime === '' || body.digestTime === null) {
      updates.digest_time = null
    } else {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/
      if (!timeRegex.test(body.digestTime)) {
        return errorResponse('Invalid time format. Use HH:MM or HH:MM:SS', 400)
      }
      // Ensure HH:MM:SS format for PostgreSQL TIME type
      const parts = body.digestTime.split(':')
      updates.digest_time = parts.length === 2 ? `${body.digestTime}:00` : body.digestTime
    }
  }

  if (body.timezone !== undefined) updates.timezone = body.timezone

  if (Object.keys(updates).length === 0) {
    return errorResponse('No fields to update', 400)
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('company_settings')
    .upsert(
      { company_id: companyId, ...updates },
      { onConflict: 'company_id' }
    )
    .select('notifications_enabled, notification_email, digest_frequency, digest_time, timezone')
    .single()

  if (error) {
    console.error('[Settings] Error updating notifications:', error)

    // Return specific error messages for known constraint violations
    if (error.message?.includes('company_settings_email_format')) {
      return errorResponse('Invalid email format', 400)
    }
    if (error.code === '23514') {
      return errorResponse('Invalid field value', 400)
    }

    return errorResponse('Failed to update notification settings', 500)
  }

  // Invalidate settings cache
  invalidateSettingsCache(supabase, projectId)

  return successResponse({
    enabled: data.notifications_enabled,
    email: data.notification_email,
    events: ['contact_created', 'sale_completed'],
    digestFrequency: data.digest_frequency,
    digestTime: data.digest_time,
    timezone: data.timezone
  })
}
