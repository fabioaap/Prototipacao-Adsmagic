/**
 * Handler para salvar conta WhatsApp conectada via webhook (API Oficial)
 * POST /messaging/save-connected-account
 *
 * Permite que usuários com a API Oficial do Meta WhatsApp Business
 * registrem sua conta via webhook, sem precisar do fluxo QR Code.
 *
 * Fluxo:
 * 1. Validar autenticação e acesso ao projeto
 * 2. Validar body com saveConnectedAccountSchema
 * 3. Se accessToken fornecido: validar via Graph API
 * 4. Buscar broker official_whatsapp na tabela messaging_brokers
 * 5. INSERT em messaging_accounts com status = 'active'
 * 6. UPSERT em integrations para (project_id, 'whatsapp') → status = 'connected'
 * 7. Retornar { account_id, webhook_url, phone_number, account_name }
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { saveConnectedAccountSchema, extractValidationErrors } from '../validators/whatsappSchemas.ts'
import type { SupabaseDbClient } from '../types-db.ts'

type RuntimeGlobalWithDeno = typeof globalThis & {
  Deno?: {
    env?: {
      get?: (key: string) => string | undefined
    }
  }
}

function getRuntimeEnv(key: string): string | undefined {
  return (globalThis as RuntimeGlobalWithDeno).Deno?.env?.get?.(key)
}

/**
 * Salva conta WhatsApp conectada via webhook
 */
export async function handleSaveConnectedAccount(
  req: Request,
  supabaseClient: SupabaseDbClient
): Promise<Response> {
  try {
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // 2. Parse e validação do body
    const body = await req.json()
    const validationResult = saveConnectedAccountSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { projectId, brokerType, phoneNumberId, accessToken, accountName, phoneNumber } = validationResult.data

    // 3. Verificar acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('project_users')
      .select('project_id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (projectError || !projectCheck) {
      return errorResponse('Acesso negado ao projeto ou projeto não encontrado', 403)
    }

    // 4. Se accessToken fornecido, validar via Graph API
    let resolvedPhoneNumber = phoneNumber || undefined
    let resolvedAccountName = accountName || undefined

    if (accessToken) {
      try {
        const graphResponse = await fetch(
          `https://graph.facebook.com/v18.0/${phoneNumberId}`,
          {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        )

        if (graphResponse.ok) {
          const phoneData = await graphResponse.json()
          if (phoneData.display_phone_number) {
            resolvedPhoneNumber = phoneData.display_phone_number
          }
          if (phoneData.verified_name && !resolvedAccountName) {
            resolvedAccountName = phoneData.verified_name
          }
        } else {
          console.warn('[SaveConnectedAccount] Graph API validation failed, proceeding without:', graphResponse.status)
        }
      } catch (graphError) {
        console.warn('[SaveConnectedAccount] Graph API validation error, proceeding without:', graphError)
      }
    }

    // 5. Buscar broker official_whatsapp
    const { data: brokerData, error: brokerError } = await supabaseClient
      .from('messaging_brokers')
      .select('id')
      .eq('name', 'official_whatsapp')
      .eq('is_active', true)
      .single()

    if (brokerError || !brokerData) {
      return errorResponse('Broker official_whatsapp não encontrado ou inativo', 404)
    }

    // 6. UPSERT em messaging_accounts (schema atual)
    const accountIdentifier = phoneNumberId || resolvedPhoneNumber || phoneNumber
    const resolvedName = resolvedAccountName || accountName || `WhatsApp ${accountIdentifier}`
    const accountInsert: Record<string, unknown> = {
      project_id: projectId,
      platform: 'whatsapp',
      broker_type: brokerType || 'official_whatsapp',
      account_identifier: accountIdentifier,
      account_name: resolvedName,
      account_display_name: resolvedAccountName || null,
      status: 'active',
      broker_config: {
        phoneNumberId: phoneNumberId || null,
        connectionMethod: 'webhook',
        apiBaseUrl: 'https://graph.facebook.com/v18.0',
        ...(resolvedPhoneNumber ? { displayPhoneNumber: resolvedPhoneNumber } : {}),
        ...(accessToken ? { hasAccessToken: true } : {}),
      },
      platform_config: {},
      is_primary: false,
    }

    // Armazena access token para uso no broker oficial (compatível com schema atual)
    if (accessToken) {
      accountInsert.access_token = accessToken
    }

    const { data: accountData, error: accountError } = await supabaseClient
      .from('messaging_accounts')
      .upsert(accountInsert, {
        onConflict: 'project_id,platform,account_identifier,broker_type',
      })
      .select('id')
      .single()

    if (accountError || !accountData) {
      console.error('[SaveConnectedAccount] Error inserting account:', accountError)
      return errorResponse(
        `Erro ao criar conta: ${accountError?.message || 'Erro desconhecido'}`,
        500
      )
    }

    const accountId = accountData.id

    // 7. UPSERT integrations para (project_id, 'whatsapp')
    const { error: integrationError } = await supabaseClient
      .from('integrations')
      .upsert(
        {
          project_id: projectId,
          platform: 'whatsapp',
          platform_type: 'messaging',
          status: 'connected',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,platform' }
      )

    if (integrationError) {
      console.warn('[SaveConnectedAccount] Integration upsert warning:', integrationError)
    }

    // 8. Build webhook URL
    const supabaseUrl = getRuntimeEnv('SUPABASE_URL') || ''
    const webhookUrl = `${supabaseUrl}/functions/v1/messaging-webhooks/webhook/official_whatsapp/${accountId}`

    console.log('[SaveConnectedAccount] Account created successfully:', {
      accountId,
      phoneNumberId,
      projectId,
      userId: user.id,
    })

    return successResponse({
      account_id: accountId,
      webhook_url: webhookUrl,
      phone_number: resolvedPhoneNumber || null,
      account_name: resolvedName,
    }, 201)

  } catch (error) {
    console.error('[SaveConnectedAccount Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao salvar conta',
      500
    )
  }
}
