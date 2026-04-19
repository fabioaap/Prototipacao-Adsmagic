/**
 * Handler para criar instância WhatsApp Multi-Broker e salvar no banco
 * POST /messaging/instances
 * 
 * Generalizado para suportar múltiplos brokers usando WhatsAppBrokerFactory.
 * Corrige violações OCP e DIP: aberto para extensão, fechado para modificação.
 * 
 * Fluxo:
 * 1. Validar autenticação e acesso ao projeto
 * 2. Buscar broker do banco usando brokerId
 * 3. Validar que broker existe, está ativo e é para plataforma 'whatsapp'
 * 4. Buscar admin_token do broker no banco (descriptografar)
 * 5. Criar instância usando WhatsAppBrokerFactory (apenas brokers que suportam)
 * 6. Salvar conta no banco de dados
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import { MessagingBrokerRepository } from '../repositories/MessagingBrokerRepository.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { validateAccountAccess } from '../utils/connection-helpers.ts'
import { createInstanceSchema, extractValidationErrors } from '../validators/whatsappSchemas.ts'
import { BROKER_TYPES, BROKER_DEFAULTS } from '../constants/brokers.ts'
import type { BrokerConfig } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import type { Database } from '../../../types/database.types.ts'

// Criar cliente admin para descriptografar admin_token
function createAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

export async function handleCreateInstance(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }
    
    // Parse e validação
    const body = await req.json()
    const validationResult = createInstanceSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }
    
    const data = validationResult.data
    
    // Verificar acesso ao projeto usando helper compartilhado
    // Precisamos validar acesso ao projeto (não temos conta ainda, então validar diretamente)
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('project_users')
      .select('project_id')
      .eq('project_id', data.projectId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    
    if (projectError || !projectCheck) {
      return errorResponse('Acesso negado ao projeto ou projeto não encontrado', 403)
    }
    
    // Buscar broker do banco
    const brokerRepo = new MessagingBrokerRepository(supabaseClient)
    const { data: brokerData, error: brokerError } = await supabaseClient
      .from('messaging_brokers')
      .select('*')
      .eq('id', data.brokerId)
      .eq('is_active', true)
      .single()
    
    if (brokerError || !brokerData) {
      return errorResponse('Broker não encontrado ou inativo', 404)
    }
    
    // Validar que broker é para plataforma 'whatsapp'
    if (brokerData.platform !== 'whatsapp') {
      return errorResponse('Broker não é para plataforma WhatsApp', 400)
    }
    
    // Validar se broker suporta criação de instância prévia
    // Apenas uazapi suporta criação de instância prévia
    if (brokerData.name !== BROKER_TYPES.UAZAPI) {
      return errorResponse(
        `Broker não suporta criação prévia de instância. Use o fluxo de configuração de credenciais.`,
        400
      )
    }
    
    // Buscar admin_token do broker no banco e descriptografar
    if (!brokerData.admin_token) {
      return errorResponse('Admin token não configurado para este broker', 400)
    }
    
    // Descriptografar admin_token usando cliente admin
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
    const adminClient = createAdminClient()
    
    let adminToken: string
    try {
      const { data: decryptedToken, error: decryptError } = await adminClient.rpc('decrypt_token', {
        encrypted_data: brokerData.admin_token,
        encryption_key: encryptionKey,
      })
      
      if (decryptError || !decryptedToken) {
        console.error('[Create Instance] Error decrypting admin_token:', decryptError)
        return errorResponse('Erro ao descriptografar admin token', 500)
      }
      
      adminToken = decryptedToken
    } catch (rpcError) {
      console.error('[Create Instance] Exception decrypting admin_token:', rpcError)
      return errorResponse(
        `Erro ao descriptografar admin token: ${rpcError instanceof Error ? rpcError.message : 'Erro desconhecido'}`,
        500
      )
    }
    
    // Criar broker temporário usando Factory (sem instanceId ainda)
    const apiBaseUrl = data.apiBaseUrl || brokerData.api_base_url || BROKER_DEFAULTS.UAZAPI_BASE_URL
    const tempBrokerConfig: BrokerConfig = {
      apiBaseUrl,
      apiKey: adminToken, // Admin Token é usado para criar instâncias
      instanceId: '', // Vazio porque ainda não existe
      accountName: data.instanceName || `instance-${Date.now()}`,
    }
    
    const tempBroker = WhatsAppBrokerFactory.create(
      brokerData.name, // 'uazapi'
      tempBrokerConfig,
      'temp' // ID temporário
    )
    
    // Verificar se broker tem método createInstance
    if (!('createInstance' in tempBroker) || typeof (tempBroker as any).createInstance !== 'function') {
      return errorResponse('Broker não suporta criação de instância', 400)
    }
    
    // 1. Criar instância no broker
    console.log('[Create Instance] Creating instance on broker:', {
      brokerName: brokerData.name,
      instanceName: data.instanceName,
      systemName: data.systemName || 'apilocal',
    })
    
    const instanceResult = await (tempBroker as any).createInstance({
      name: data.instanceName || `instance-${Date.now()}`,
      adminToken, // Admin Token necessário para criar instância
      systemName: data.systemName || 'apilocal',
      adminField01: data.adminField01,
      adminField02: data.adminField02,
    })
    
    console.log('[Create Instance] Instance created successfully:', {
      instanceId: instanceResult.instanceId,
      instanceName: instanceResult.instanceName,
      hasApikey: !!instanceResult.apikey,
      hasToken: !!instanceResult.token,
      apikeyValue: instanceResult.apikey ? `${instanceResult.apikey.substring(0, 10)}...` : 'null',
      tokenValue: instanceResult.token ? `${instanceResult.token.substring(0, 10)}...` : 'null',
      status: instanceResult.status,
    })
    
    // Verificar se temos token válido
    if (!instanceResult.apikey && !instanceResult.token) {
      console.warn('[Create Instance] WARNING: Neither apikey nor token returned from UAZAPI!')
      console.warn('[Create Instance] Response data:', JSON.stringify(instanceResult.instanceData, null, 2))
    }
    
    // 2. Salvar no banco de dados
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    
    // Salvar informações completas da instância
    const accountData: Record<string, unknown> = {
      project_id: data.projectId,
      // integration_account_id é opcional - deixar NULL para UAZAPI direto
      platform: 'whatsapp',
      broker_type: 'uazapi',
      account_identifier: data.phone || instanceResult.instanceName,
      account_name: data.accountName || instanceResult.instanceName,
      account_display_name: data.accountName || instanceResult.instanceName,
      broker_config: {
        instanceId: instanceResult.instanceId, // ID da instância na UAZAPI
        instanceName: instanceResult.instanceName,
        apiBaseUrl: apiBaseUrl,
        systemName: data.systemName || 'apilocal',
        adminField01: data.adminField01,
        adminField02: data.adminField02,
        // Salvar dados completos da instância para referência futura
        instanceData: instanceResult.instanceData,
      },
      // IMPORTANTE: Não usar adminToken como fallback! 
      // Se não tiver apikey ou token da instância, deixar null e logar erro
      api_key: instanceResult.apikey || instanceResult.token || null, // API key/token da instância (NUNCA usar adminToken)
      access_token: instanceResult.token || instanceResult.apikey || null, // Token da instância (priorizar token, depois apikey)
      status: instanceResult.status || 'disconnected', // Status retornado pela API
      is_primary: false,
      platform_config: {},
      total_messages: 0,
      total_contacts: 0,
    }
    
    const { data: createdAccount, error: createError } = await supabaseClient
      .from('messaging_accounts')
      .insert(accountData)
      .select()
      .single()
    
    if (createError) {
      console.error('[Create Instance] Error saving to database:', createError)
      
      // Se falhou ao salvar, tentar deletar a instância na UAZAPI (cleanup)
      try {
        // TODO: Implementar método deleteInstance no broker se necessário
        console.warn('[Create Instance] Instance created on UAZAPI but failed to save. Manual cleanup may be required.')
      } catch (cleanupError) {
        console.error('[Create Instance] Error during cleanup:', cleanupError)
      }
      
      return errorResponse(`Falha ao salvar conta no banco: ${createError.message}`, 500)
    }
    
    console.log('[Create Instance] Account saved successfully:', {
      accountId: createdAccount.id,
      instanceName: instanceResult.instanceName,
    })
    
    // 3. Retornar resposta com dados criados (formato esperado pelo frontend)
    // O frontend espera: { instance: BackendWhatsAppInstance, qrcode?: string, account_id: string }
    return successResponse({
      instance: {
        instance_id: instanceResult.instanceId,
        instance_name: instanceResult.instanceName,
        broker_type: brokerData.name,
        status: instanceResult.status || 'disconnected',
        account_id: createdAccount.id,
        broker_specific_data: {
          hasToken: !!instanceResult.token,
          hasApikey: !!instanceResult.apikey,
        },
      },
      account_id: createdAccount.id,
      // qrcode será obtido na etapa de conexão (connect-instance)
    }, 201)
    
  } catch (error) {
    console.error('[Create Instance Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao criar instância',
      500
    )
  }
}

