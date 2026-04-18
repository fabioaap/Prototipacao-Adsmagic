/**
 * Handler para webhook global
 * 
 * Identifica conta por token (ou outro campo) no body do webhook
 * Usado por brokers que têm webhook único para todas as instâncias (ex: UAZAPI)
 * 
 * Rota: POST /messaging/webhook/{brokerType}
 * 
 * Exemplo:
 * POST /messaging/webhook/uazapi
 * Body: { "token": "abc123...", "EventType": "messages", ... }
 */

import { successResponse, errorResponse, emptySuccessResponse } from '../utils/response.ts'
import { AccountResolverFactory } from '../utils/account-resolver.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import { processWebhookCommon } from '../utils/webhook-processor.ts'
import { isValidBrokerType } from '../utils/validation.ts'
import { WebhookLogger, measureTime } from '../utils/logger.ts'
import { RateLimiter, RATE_LIMIT_CONFIGS } from '../utils/rate-limiter.ts'
import { corsHeaders } from '../utils/cors.ts'
import type { WebhookDTO } from '../types.ts'
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
    
    // Resolver conta usando Strategy Pattern (identifica por token no body)
    const accountRepo = new MessagingAccountRepository(supabaseClient)
    
    const { result: accountResolution, timeMs: resolutionTime } = await measureTime(
      () => AccountResolverFactory.resolve(req, body, accountRepo),
      logger.withContext({ step: 'account_resolution' })
    )
    
    const { account, strategy } = accountResolution
    
    if (!account) {
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
    
    accountLogger.metrics('Webhook processed successfully', {
      processingTimeMs: processingTime,
      totalTimeMs: totalTime,
      webhookType: 'global',
      resolutionTimeMs: resolutionTime,
    })
    
    return response
    
  } catch (error) {
    const totalTime = performance.now() - startTime
    
    logger.error('Error processing webhook global', error, {
      totalTimeMs: totalTime,
    })
    
    return errorResponse(
      error instanceof Error ? error.message : 'Erro desconhecido ao processar webhook',
      500
    )
  }
}
