/**
 * Handler para webhook global
 * 
 * Identifica conta por token (ou outro campo) no body do webhook
 * Usado por brokers que têm webhook único para todas as instâncias (ex: UAZAPI)
 * 
 * Rota: POST /messaging-webhooks/webhook/{brokerType}
 * 
 * Exemplo:
 * POST /messaging-webhooks/webhook/uazapi
 * Body: { "token": "abc123...", "EventType": "messages", ... }
 */

import { errorResponse } from '../../messaging/utils/response.ts'
import { AccountResolverFactory } from '../../messaging/utils/account-resolver.ts'
import { MessagingAccountRepository } from '../../messaging/repositories/MessagingAccountRepository.ts'
import { processWebhookCommon } from '../../messaging/utils/webhook-processor.ts'
import { isValidBrokerType } from '../../messaging/utils/validation.ts'
import { WebhookLogger, measureTime } from '../../messaging/utils/logger.ts'
import { RateLimiter, RATE_LIMIT_CONFIGS } from '../../messaging/utils/rate-limiter.ts'
import { corsHeaders } from '../../messaging/utils/cors.ts'
import { WebhookEventRepository } from '../../messaging/repositories/WebhookEventRepository.ts'
import { sanitizeHeaders, sanitizeWebhookPayload, sha256 } from '../../messaging/utils/webhook-sanitizer.ts'
import type { WebhookDTO } from '../../messaging/types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export async function handleWebhookGlobal(
  req: Request,
  supabaseClient: SupabaseDbClient,
  brokerType: string
): Promise<Response> {
  const logger = new WebhookLogger({
    handler: 'webhook-global',
    brokerType,
  })
  
  const startTime = performance.now()
  const eventRepo = new WebhookEventRepository(supabaseClient)
  let webhookEventId: string | null = null
  
  try {
    logger.info('Webhook global received', {
      method: req.method,
      url: new URL(req.url).pathname,
    })
    
    // Validar broker type
    if (!isValidBrokerType(brokerType)) {
      logger.warn('Invalid broker type', { brokerType })
      return errorResponse(
        `Broker não suportado: ${brokerType}. Brokers suportados: uazapi, gupshup, official_whatsapp, evolution`,
        400
      )
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
      webhookType: 'global',
      endpointPath: new URL(req.url).pathname,
      payloadRaw: sanitizeWebhookPayload(body),
      payloadHash,
      requestHeaders: sanitizeHeaders(req.headers),
      parseStatus: 'received',
    })
    logger.info('Webhook audit event created', { webhookEventId })
    
    // Resolver conta usando Strategy Pattern (identifica por token no body)
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    
    const { result: accountResolution, timeMs: resolutionTime } = await measureTime(
      () => AccountResolverFactory.resolve(req, body, accountRepo),
      logger.withContext({ step: 'account_resolution' })
    )
    
    const { account, strategy } = accountResolution
    
    if (!account) {
      if (webhookEventId) {
        await eventRepo.update(webhookEventId, {
          parseStatus: 'failed',
          errorMessage: 'Conta não encontrada (resolução por token/header)',
          resolvedBy: strategy,
        })
      }
      logger.warn('Account not found', {
        strategy,
        hasHeader: !!req.headers.get('x-account-id'),
        hasTokenInBody: !!(body && typeof body === 'object' && 'token' in body),
        resolutionTimeMs: resolutionTime,
      })
      return errorResponse(
        'Conta não encontrada. Verifique se o token no body corresponde a uma conta ativa.',
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
          resolvedBy: strategy,
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
          resolvedBy: strategy,
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
      strategy,
    })
    
    accountLogger.info('Account resolved successfully', {
      brokerType: account.broker_type,
      resolutionTimeMs: resolutionTime,
    })
    
    // Rate limiting por conta (após identificar a conta)
    const rateLimiter = new RateLimiter(supabaseClient, RATE_LIMIT_CONFIGS.global)
    const rateLimitKey = `webhook:global:${account.id}`
    
    const rateLimitResult = await rateLimiter.check(rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      if (webhookEventId) {
        await eventRepo.update(webhookEventId, {
          parseStatus: 'failed',
          errorMessage: 'Rate limit exceeded',
          messagingAccountId: account.id,
          projectId: account.project_id,
          resolvedBy: strategy,
        })
      }
      accountLogger.warn('Rate limit exceeded', {
        key: rateLimitKey,
        retryAfter: rateLimitResult.retryAfter,
      })
      
      return new Response('', {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': String(rateLimitResult.retryAfter || 60),
          'X-RateLimit-Limit': String(RATE_LIMIT_CONFIGS.global.maxRequests),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetAt / 1000)),
        },
      })
    }
    
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
        resolvedBy: strategy,
        processingTimeMs: Math.round(totalTime),
      })
    }

    accountLogger.metrics('Webhook processed successfully', {
      processingTimeMs: processingTime,
      totalTimeMs: totalTime,
      webhookType: 'global',
      resolutionTimeMs: resolutionTime,
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
    
    logger.error('Error processing webhook global', error, {
      totalTimeMs: totalTime,
      webhookEventId,
    })
    
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao processar webhook',
      500
    )
  }
}
