/**
 * Handler para listar brokers WhatsApp disponíveis
 * GET /messaging/brokers
 * 
 * Retorna lista de brokers ativos para plataforma 'whatsapp'.
 * Não expõe tokens ou dados sensíveis.
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { MessagingBrokerRepository } from '../repositories/MessagingBrokerRepository.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Lista brokers WhatsApp disponíveis
 * 
 * Retorna apenas dados públicos dos brokers ativos.
 * Não expõe: admin_token, api_base_url com tokens, dados sensíveis.
 * 
 * @param req - Request object
 * @param supabaseClient - Cliente Supabase autenticado
 * @returns Response com lista de brokers disponíveis
 */
export async function handleListWhatsAppBrokers(
  req: Request,
  supabaseClient: SupabaseDbClient
): Promise<Response> {
  try {
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Criar repositório
    const brokerRepo = new MessagingBrokerRepository(supabaseClient)

    // Buscar brokers ativos para plataforma 'whatsapp'
    const brokers = await brokerRepo.findByPlatform('whatsapp')

    // Filtrar apenas brokers com is_active = true (já filtrado pelo repository, mas garantir)
    const activeBrokers = brokers.filter(broker => broker.is_active === true)

    // Formatar resposta com apenas dados públicos
    const publicBrokers = activeBrokers.map(broker => ({
      id: broker.id,
      name: broker.name,
      displayName: broker.display_name,
      description: broker.description || undefined,
      brokerType: broker.broker_type,
      supportsMedia: broker.supports_media,
      supportsTemplates: broker.supports_templates,
      supportsWebhooks: broker.supports_webhooks,
      supportsAutomation: broker.supports_automation,
      documentationUrl: broker.documentation_url || undefined,
      supportUrl: broker.support_url || undefined,
      version: broker.version || undefined,
      requiredFields: broker.required_fields || [],
      optionalFields: broker.optional_fields || [],
      maxConnections: broker.max_connections,
    }))

    console.log('[List WhatsApp Brokers] Found brokers:', {
      count: publicBrokers.length,
      brokerIds: publicBrokers.map(b => b.id),
      userId: user.id,
    })

    return successResponse({
      brokers: publicBrokers,
    }, 200)

  } catch (error) {
    console.error('[List WhatsApp Brokers Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao listar brokers',
      500
    )
  }
}
