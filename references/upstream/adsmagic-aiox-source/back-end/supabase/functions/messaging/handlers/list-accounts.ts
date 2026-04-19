/**
 * Handler para listar contas/instâncias de mensageria de um projeto
 * GET /messaging/accounts?projectId=...&platform=whatsapp&includeAll=true
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import type { SupabaseDbClient } from '../types-db.ts'

type AccountRow = {
  id: string
  broker_type: string
  status: string
  account_identifier: string | null
  account_name: string | null
  broker_config: Record<string, unknown> | null
  updated_at: string
}

function mapAccountStatus(status: string): 'connected' | 'connecting' | 'disconnected' {
  if (status === 'active') return 'connected'
  if (status === 'connecting') return 'connecting'
  return 'disconnected'
}

function parsePhoneNumber(accountIdentifier: string | null): string | null {
  if (!accountIdentifier) return null
  if (accountIdentifier.startsWith('instance-')) return null

  const digitsOnly = accountIdentifier.replace(/[^\d]/g, '')
  if (digitsOnly.length < 8) return null
  return digitsOnly
}

export async function handleListAccounts(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    const url = new URL(req.url)
    const projectId = url.searchParams.get('projectId')
    const platform = url.searchParams.get('platform') || 'whatsapp'
    const includeAll = url.searchParams.get('includeAll') !== 'false'

    if (!projectId) {
      return errorResponse('projectId is required', 400)
    }

    const { data: projectAccess, error: projectError } = await supabaseClient
      .from('project_users')
      .select('project_id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (projectError || !projectAccess) {
      return errorResponse('Acesso negado ao projeto ou projeto não encontrado', 403)
    }

    let query = supabaseClient
      .from('messaging_accounts')
      .select('id, broker_type, status, account_identifier, account_name, broker_config, updated_at')
      .eq('project_id', projectId)
      .eq('platform', platform)
      .order('updated_at', { ascending: false })

    if (!includeAll) {
      query = query.eq('status', 'active')
    }

    const { data, error } = await query
    if (error) {
      return errorResponse(`Falha ao listar contas: ${error.message}`, 500)
    }

    const rows = (data || []) as AccountRow[]

    const accounts = rows.map((row) => {
      const brokerConfig = row.broker_config || {}
      const instanceId = typeof brokerConfig.instanceId === 'string' ? brokerConfig.instanceId : null
      const instanceName = typeof brokerConfig.instanceName === 'string'
        ? brokerConfig.instanceName
        : row.account_name

      return {
        account_id: row.id,
        broker_type: row.broker_type,
        status: mapAccountStatus(row.status),
        phone_number: parsePhoneNumber(row.account_identifier),
        profile_name: row.account_name || null,
        instance_id: instanceId,
        instance_name: instanceName || null,
        updated_at: row.updated_at,
      }
    })

    return successResponse({ accounts }, 200)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Erro ao listar contas',
      500
    )
  }
}

