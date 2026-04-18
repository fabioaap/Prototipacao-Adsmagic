/**
 * Handler para webhook por conta
 * 
 * Identifica conta por UUID na URL
 * Usado por brokers que permitem URL customizada por conta (ex: Gupshup)
 * 
 * Rota: POST /messaging-webhooks/webhook/{brokerType}/{accountId}
 * 
 * Exemplo:
 * POST /messaging-webhooks/webhook/gupshup/550e8400-e29b-41d4-a716-446655440000
 * Body: { "message": {...} }
 */

import { errorResponse } from '../../messaging/utils/response.ts'
import { MessagingAccountRepository } from '../../messaging/repositories/MessagingAccountRepository.ts'
import { processWebhookCommon } from '../../messaging/utils/webhook-processor.ts'
import { isValidUUID, isValidBrokerType } from '../../messaging/utils/validation.ts'
import { WebhookLogger, measureTime } from '../../messaging/utils/logger.ts'
import { RateLimiter, RATE_LIMIT_CONFIGS } from '../../messaging/utils/rate-limiter.ts'
import { corsHeaders } from '../../messaging/utils/cors.ts'
import { WebhookEventRepository } from '../../messaging/repositories/WebhookEventRepository.ts'
import { sanitizeHeaders, sanitizeWebhookPayload, sha256 } from '../../messaging/utils/webhook-sanitizer.ts'
import type { WebhookDTO } from '../../messaging/types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export async function handleWebhookByAccount(
  req: Request,
  supabaseClient: SupabaseDbClient,
  brokerType: string,
  accountId: string
): Promise<Response> {
  const logger = new WebhookLogger({
    handler: 'webhook-by-account',
    brokerType,
    accountId,
  })
  
  const startTime = performance.now()
  const eventRepo = new WebhookEventRepository(supabaseClient)
  let webhookEventId: string | null = null
  
  try {
    logger.info('Webhook by account received', {
      method: req.method,
      url: new URL(req.url).pathname,
    })
    
    // Validar formato UUID
    if (!isValidUUID(accountId)) {
      logger.warn('Invalid UUID format', { accountId })
      return errorResponse(
        `Formato de UUID inválido: ${accountId}. O UUID deve estar no formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`,
        400
      )
    }
    
    // Validar broker type
    if (!isValidBrokerType(brokerType)) {
      logger.warn('Invalid broker type', { brokerType })
      return errorResponse(
        `Broker não suportado: ${brokerType}. Brokers suportados: uazapi, gupshup, official_whatsapp, evolution`,
        400
      )
    }
    
    // Rate limiting por conta (usando accountId da URL)
    const rateLimiter = new RateLimiter(supabaseClient, RATE_LIMIT_CONFIGS.byAccount)
    const rateLimitKey = `webhook:account:${accountId}`
    
    const rateLimitResult = await rateLimiter.check(rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', {
        key: rateLimitKey,
        accountId,
        retryAfter: rateLimitResult.retryAfter,
      })
      
      return new Response('', {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': String(rateLimitResult.retryAfter || 60),
          'X-RateLimit-Limit': String(RATE_LIMIT_CONFIGS.byAccount.maxRequests),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetAt / 1000)),
        },
      })
    }
    
    // Ler body como texto primeiro (para validação de assinatura e parsing)
    const rawBody = await req.text()
    
    if (!rawBody || rawBody.trim().length === 0) {
      logger.warn('Empty request body')
      return errorResponse('Body da requisição é obrigatório', 400)
    }
    
    // Parse do body como JSON
    let body: WebhookDTO['data']
    try {
      body = JSON.parse(rawBody) as WebhookDTO['data']
    } catch (error) {
      logger.error('Invalid JSON in request body', error, {
        bodyLength: rawBody.length,
        bodyPreview: rawBody.substring(0, 100),
      })
      return errorResponse('Body inválido: JSON malformado', 400)
    }

    const payloadHash = await sha256(rawBody)
    webhookEventId = await eventRepo.create({
      brokerType,
      webhookType: 'by_account',
      endpointPath: new URL(req.url).pathname,
      payloadRaw: sanitizeWebhookPayload(body),
      payloadHash,
      requestHeaders: sanitizeHeaders(req.headers),
      parseStatus: 'received',
      messagingAccountId: accountId,
      resolvedBy: 'account_id',
    })
    logger.info('Webhook audit event created', { webhookEventId })
    
    // Buscar conta por ID
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    
    const { result: account, timeMs: lookupTime } = await measureTime(
      () => accountRepo.findById(accountId),
      logger.withContext({ step: 'account_lookup' })
    )
    
    if (!account) {
      if (webhookEventId) {
        await eventRepo.update(webhookEventId, {
          parseStatus: 'failed',
          errorMessage: `Conta não encontrada com ID: ${accountId}`,
          messagingAccountId: accountId,
          resolvedBy: 'account_id',
        })
      }
      logger.warn('Account not found', {
        accountId,
        brokerType,
        lookupTimeMs: lookupTime,
      })
      return errorResponse(
        `Conta não encontrada com ID: ${accountId}`,
        404
      )
    }
    
    // Validar que broker type da conta corresponde ao da URL
    if (account.broker_type !== brokerType) {
      if (webhookEventId) {
        await eventRepo.update(webhookEventId, {
          parseStatus: 'failed',
          errorMessage: `Broker mismatch: account=${account.broker_type}, url=${brokerType}`,
          messagingAccountId: account.id,
          projectId: account.project_id,
          resolvedBy: 'account_id',
        })
      }
      logger.warn('Broker type mismatch', {
        accountId: account.id,
        accountBrokerType: account.broker_type,
        urlBrokerType: brokerType,
      })
      return errorResponse(
        `Broker type da conta (${account.broker_type}) não corresponde ao da URL (${brokerType})`,
        400
      )
    }
    
    // Validar que conta está ativa
    if (account.status !== 'active') {
      if (webhookEventId) {
        await eventRepo.update(webhookEventId, {
          parseStatus: 'failed',
          errorMessage: `Conta inativa (${account.status})`,
          messagingAccountId: account.id,
          projectId: account.project_id,
          resolvedBy: 'account_id',
        })
      }
      logger.warn('Account not active', {
        accountId: account.id,
        status: account.status,
      })
      return errorResponse(
        `Conta não está ativa. Status: ${account.status}. Apenas contas com status 'active' podem receber webhooks.`,
        400
      )
    }
    
    const accountLogger = logger.withContext({
      accountId: account.id,
    })
    
    accountLogger.info('Account resolved successfully', {
      brokerType: account.broker_type,
      method: 'uuid_in_url',
      lookupTimeMs: lookupTime,
    })
    
    // Processar webhook usando lógica comum
    const { result: response, timeMs: processingTime } = await measureTime(
      () => processWebhookCommon({
        account,
        body,
        rawBody,
        req,
        supabaseClient,
      }),
      accountLogger.withContext({ step: 'webhook_processing' })
    )
    
    const totalTime = performance.now() - startTime
    if (webhookEventId) {
      await eventRepo.update(webhookEventId, {
        parseStatus: 'processed',
        messagingAccountId: account.id,
        projectId: account.project_id,
        resolvedBy: 'account_id',
        processingTimeMs: Math.round(totalTime),
      })
    }

    accountLogger.metrics('Webhook processed successfully', {
      processingTimeMs: processingTime,
      totalTimeMs: totalTime,
      webhookType: 'by_account',
      lookupTimeMs: lookupTime,
      webhookEventId,
    })
    
    return response
    
  } catch (error) {
    const totalTime = performance.now() - startTime
    if (webhookEventId) {
      await eventRepo.update(webhookEventId, {
        parseStatus: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        processingTimeMs: Math.round(totalTime),
      })
    }
    
    logger.error('Error processing webhook by account', error, {
      totalTimeMs: totalTime,
      webhookEventId,
    })
    
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao processar webhook',
      500
    )
  }
}
