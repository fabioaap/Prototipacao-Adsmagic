/**
 * Handler para configurar broker com credenciais (Gupshup, API Oficial)
 * POST /messaging/configure-broker
 * 
 * Valida credenciais fornecidas pelo usuário testando conexão com o broker.
 * Não salva credenciais ainda - apenas valida.
 * 
 * Fluxo:
 * 1. Validar autenticação e acesso ao projeto
 * 2. Buscar broker do banco e validar que está ativo
 * 3. Validar credenciais baseado em required_fields do broker
 * 4. Criar instância temporária do broker usando WhatsAppBrokerFactory
 * 5. Testar conexão fazendo chamada de validação ao broker
 * 6. Retornar resultado da validação (sucesso ou erro)
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { MessagingBrokerRepository } from '../repositories/MessagingBrokerRepository.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { configureBrokerSchema, extractValidationErrors } from '../validators/whatsappSchemas.ts'
import { validateAccountAccess } from '../utils/connection-helpers.ts'
import type { BrokerConfig } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Valida credenciais de broker fazendo chamada de teste
 * 
 * @param req - Request object
 * @param supabaseClient - Cliente Supabase autenticado
 * @returns Response com resultado da validação
 */
export async function handleConfigureBroker(
  req: Request,
  supabaseClient: SupabaseDbClient
): Promise<Response> {
  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse e validação do body
    const body = await req.json()
    const validationResult = configureBrokerSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { projectId, brokerId, credentials } = validationResult.data

    // Verificar acesso ao projeto usando helper compartilhado
    // Precisamos buscar uma conta temporária ou criar validação específica
    // Por enquanto, validar diretamente
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

    // Buscar broker do banco
    const brokerRepo = new MessagingBrokerRepository(supabaseClient)
    
    // Buscar broker por ID (precisa adicionar método no repository ou usar busca direta)
    const { data: brokerData, error: brokerError } = await supabaseClient
      .from('messaging_brokers')
      .select('*')
      .eq('id', brokerId)
      .eq('is_active', true)
      .single()

    if (brokerError || !brokerData) {
      return errorResponse('Broker não encontrado ou inativo', 404)
    }

    // Validar que broker é para plataforma WhatsApp
    if (brokerData.platform !== 'whatsapp') {
      return errorResponse('Broker não é para plataforma WhatsApp', 400)
    }

    // Validar que todas as credenciais obrigatórias foram fornecidas
    const requiredFields = brokerData.required_fields || []
    const missingFields = requiredFields.filter(
      (field: string) => !credentials[field] || credentials[field].trim() === ''
    )

    if (missingFields.length > 0) {
      return validationErrorResponse(
        [`Campos obrigatórios faltando: ${missingFields.join(', ')}`],
        400
      )
    }

    // Criar configuração do broker baseada nas credenciais fornecidas
    const brokerConfig: BrokerConfig = {
      accountName: `temp-${Date.now()}`, // Nome temporário para validação
      ...credentials,
    }

    // Adicionar apiBaseUrl se disponível no broker
    if (brokerData.api_base_url) {
      brokerConfig.apiBaseUrl = brokerData.api_base_url
    }

    // Criar instância temporária do broker usando Factory
    let broker
    try {
      broker = WhatsAppBrokerFactory.create(
        brokerData.name, // Usar 'name' do broker (ex: 'gupshup', 'official_whatsapp')
        brokerConfig,
        'temp' // ID temporário
      )
    } catch (factoryError) {
      console.error('[Configure Broker] Error creating broker instance:', factoryError)
      return errorResponse(
        `Erro ao criar instância do broker: ${factoryError instanceof Error ? factoryError.message : 'Erro desconhecido'}`,
        500
      )
    }

    // Testar conexão fazendo chamada de validação ao broker
    let connectionTestResult
    try {
      // Usar método validateConfiguration se disponível
      if ('validateConfiguration' in broker && typeof broker.validateConfiguration === 'function') {
        connectionTestResult = await broker.validateConfiguration(brokerConfig)
      } else {
        // Fallback: Tentar fazer uma chamada de teste real
        // Para Gupshup: Tentar obter informações da conta
        // Para API Oficial: Validar token e phoneNumberId
        if (brokerData.name === 'gupshup') {
          // Gupshup: Fazer request de teste à API
          const testUrl = `${brokerConfig.apiBaseUrl || 'https://api.gupshup.io/sm/api/v1'}/apps`
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'apikey': credentials.apiKey as string,
            },
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${errorText}`)
          }

          connectionTestResult = { valid: true }
        } else if (brokerData.name === 'official_whatsapp') {
          // API Oficial: Validar token fazendo request à Graph API
          const testUrl = `https://graph.facebook.com/v18.0/${credentials.phoneNumberId}`
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
            },
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`)
          }

          const phoneData = await response.json()
          connectionTestResult = {
            valid: true,
            accountInfo: {
              phoneNumber: phoneData.display_phone_number || credentials.phoneNumberId,
              accountName: phoneData.verified_name || undefined,
            },
          }
        } else {
          // Outros brokers: Usar validação básica
          connectionTestResult = { valid: true }
        }
      }
    } catch (testError) {
      console.error('[Configure Broker] Error testing connection:', testError)
      
      // Tratar erros específicos
      const errorMessage = testError instanceof Error ? testError.message : 'Erro desconhecido'
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return errorResponse('Credenciais inválidas: Token ou chave de API incorretos', 401)
      }
      
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        return errorResponse('Recurso não encontrado: Verifique se phoneNumberId (API Oficial) ou appName (Gupshup) estão corretos', 404)
      }
      
      if (errorMessage.includes('fetch')) {
        return errorResponse('Erro de conexão: Não foi possível conectar ao broker. Verifique sua internet.', 503)
      }
      
      return errorResponse(`Erro ao validar credenciais: ${errorMessage}`, 500)
    }

    // Verificar resultado da validação
    if (!connectionTestResult.valid) {
      return errorResponse(
        connectionTestResult.errors?.join(', ') || 'Credenciais inválidas',
        400
      )
    }

    // Retornar resultado da validação bem-sucedida
    console.log('[Configure Broker] Credentials validated successfully:', {
      brokerId,
      brokerName: brokerData.name,
      userId: user.id,
    })

    return successResponse({
      valid: true,
      message: 'Credenciais validadas com sucesso',
      accountInfo: (connectionTestResult as any).accountInfo || undefined,
    }, 200)

  } catch (error) {
    console.error('[Configure Broker Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao configurar broker',
      500
    )
  }
}
