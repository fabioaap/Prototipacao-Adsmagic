/**
 * Handler para receber webhooks dos brokers
 * POST /messaging/webhook
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { WhatsAppNormalizer } from '../core/normalizer.ts'
import { WhatsAppProcessor } from '../core/processor.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import { MessageFilterFactory } from '../utils/message-filters.ts'
import { AccountResolverFactory } from '../utils/account-resolver.ts'
import type { WebhookDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export async function handleWebhook(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    // Ler body como texto primeiro (para validação de assinatura e parsing)
    const rawBody = await req.text()
    
    if (!rawBody) {
      return errorResponse('Body da requisição é obrigatório', 400)
    }
    
    // Parse do body como JSON
    let body: WebhookDTO['data']
    try {
      body = JSON.parse(rawBody) as WebhookDTO['data']
    } catch (error) {
      return errorResponse('Body inválido: JSON malformado', 400)
    }
    
    // Resolver conta usando Strategy Pattern
    // Suporta dois métodos:
    // 1. Por header x-account-id (webhooks específicos por conta)
    // 2. Por token no body (webhooks globais, ex: UAZAPI)
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    const { account, strategy } = await AccountResolverFactory.resolve(req, body, accountRepo)
    
    if (!account) {
      console.warn('[Webhook Handler] Account not found', {
        strategy,
        hasHeader: !!req.headers.get('x-account-id'),
        hasTokenInBody: !!(body && typeof body === 'object' && 'token' in body),
      })
      return errorResponse('Conta não encontrada. Verifique x-account-id header ou token no body.', 404)
    }
    
    console.log('[Webhook Handler] Account resolved', {
      accountId: account.id,
      brokerType: account.broker_type,
      strategy,
    })
    
    // Criar broker específico
    const broker = WhatsAppBrokerFactory.create(
      account.broker_type,
      {
        ...account.broker_config,
        accountName: account.account_name,
        apiKey: account.api_key || undefined,
        accessToken: account.access_token || undefined,
      },
      account.id
    )
    
    // Validar assinatura do webhook (se configurado)
    if (account.webhook_secret && broker.validateWebhookSignature) {
      // Tentar extrair assinatura de diferentes headers comuns
      const signature = req.headers.get('x-hub-signature-256') || // WhatsApp Business API
                        req.headers.get('x-signature') || // UAZAPI
                        req.headers.get('x-webhook-signature') || // Gupshup
                        req.headers.get('signature') ||
                        null
      
      if (signature) {
        const isValid = await broker.validateWebhookSignature(
          rawBody,
          signature,
          account.webhook_secret
        )
        
        if (!isValid) {
          console.warn('[Webhook Handler] Invalid webhook signature', {
            accountId: account.id,
            brokerType: account.broker_type,
          })
          return errorResponse('Invalid webhook signature', 401)
        }
      } else {
        // Se há secret configurado mas não há assinatura, pode ser um problema
        // Por enquanto, apenas logamos um warning (pode ser configurado como opcional)
        console.warn('[Webhook Handler] Webhook secret configured but no signature provided', {
          accountId: account.id,
          brokerType: account.broker_type,
        })
      }
    }
    
    // Verificar se mensagem deve ser ignorada usando Strategy Pattern
    const messageFilter = MessageFilterFactory.create(account.broker_type)
    if (messageFilter.shouldIgnore(body)) {
      const reason = messageFilter.getReason(body)
      console.log('[Webhook Handler] Message ignored', {
        accountId: account.id,
        brokerType: account.broker_type,
        reason,
      })
      return successResponse({ 
        processed: false, 
        ignored: true, 
        reason 
      })
    }
    
    // Normaliza dados do webhook
    const normalizer = new WhatsAppNormalizer([broker])
    const normalized = await normalizer.normalizeWebhook(
      account.broker_type,
      body
    )
    
    // Processa mensagem normalizada
    const processor = new WhatsAppProcessor(supabaseClient)
    
    if (normalized.eventType === 'message' && normalized.message) {
      await processor.processMessage(normalized.message, account.project_id)
      
      // Atualizar estatísticas
      await accountRepo.updateStats(account.id, {
        totalMessages: account.total_messages + 1,
        lastWebhookAt: new Date().toISOString(),
      })
    } else if (normalized.eventType === 'status' && normalized.status) {
      await processor.processStatusUpdate(normalized.status)
    }
    
    return successResponse({ processed: true })
    
  } catch (error) {
    console.error('[Webhook Handler] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido',
      500
    )
  }
}
