/**
 * Lógica comum de processamento de webhooks
 * 
 * Extraída para reutilização entre diferentes handlers de webhook
 * Segue DRY (Don't Repeat Yourself) e SRP (Single Responsibility Principle)
 */

import { successResponse, errorResponse, emptySuccessResponse } from './response.ts'
import { WhatsAppNormalizer } from '../core/normalizer.ts'
import { WhatsAppProcessor } from '../core/processor.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'
import { MessagingAccountRepository } from '../repositories/MessagingAccountRepository.ts'
import { MessageFilterFactory } from './message-filters.ts'
import { WebhookLogger, measureTime } from './logger.ts'
import { ContactOriginService } from '../services/ContactOriginService.ts'
import { FunnelMessageMatcherService } from '../services/FunnelMessageMatcherService.ts'
import { WhatsAppProtocolAttributionService } from '../services/WhatsAppProtocolAttributionService.ts'
import {
  decodeWhatsAppProtocol,
  stripInvisibleProtocolChars,
  stripWhatsAppProtocol,
} from '../../_shared/whatsapp-protocol.ts'
import { ConversationPersistenceService } from '../services/ConversationPersistenceService.ts'
import { SupabaseContactRepository } from '../repositories/ContactRepository.ts'
import type { StandardizedSourceData } from '../types/contact-origin-types.ts'
import type { MessagingAccount, NormalizedMessage, WebhookDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Parâmetros para processamento comum de webhook
 */
export interface ProcessWebhookParams {
  account: MessagingAccount
  body: WebhookDTO['data']
  rawBody: string
  req: Request
  supabaseClient: SupabaseDbClient
}

/**
 * Processa webhook comum (normalização, filtros, processamento, stats)
 * 
 * Esta função encapsula toda a lógica comum de processamento de webhook,
 * permitindo que diferentes handlers (global, por conta) reutilizem o código.
 * 
 * @param params - Parâmetros de processamento
 * @returns Resposta de sucesso ou erro
 */
export async function processWebhookCommon(
  params: ProcessWebhookParams
): Promise<Response> {
  const { account, body, rawBody, req, supabaseClient } = params
  
  const logger = new WebhookLogger({
    handler: 'webhook-processor',
    accountId: account.id,
    brokerType: account.broker_type,
  })
  
  try {
    logger.info('Starting webhook processing', {
      accountId: account.id,
      brokerType: account.broker_type,
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
      const signature = req.headers.get('x-hub-signature-256') || // WhatsApp Business API
                        req.headers.get('x-signature') || // UAZAPI
                        req.headers.get('x-webhook-signature') || // Gupshup
                        req.headers.get('signature') ||
                        null
      
      if (signature) {
        const { result: isValid, timeMs: validationTime } = await measureTime(
          () => broker.validateWebhookSignature!(
            rawBody,
            signature,
            account.webhook_secret!
          ),
          logger.withContext({ step: 'signature_validation' })
        )
        
        if (!isValid) {
          logger.warn('Invalid webhook signature', {
            validationTimeMs: validationTime,
          })
          return errorResponse('Invalid webhook signature', 401)
        }
        
        logger.info('Webhook signature validated', {
          validationTimeMs: validationTime,
        })
      } else {
        // Se há secret configurado mas não há assinatura, logamos warning
        logger.warn('Webhook secret configured but no signature provided', {
          hasSecret: !!account.webhook_secret,
        })
      }
    }
    
    // Verificar se mensagem deve ser ignorada usando Strategy Pattern
    const messageFilter = MessageFilterFactory.create(account.broker_type)
    if (messageFilter.shouldIgnore(body)) {
      const reason = messageFilter.getReason(body)
      logger.info('Message ignored by filter', {
        reason,
        eventType: (body as { EventType?: string })?.EventType || 'unknown',
      })
      return successResponse({ 
        processed: false, 
        ignored: true, 
        reason 
      })
    }
    
    // Normaliza dados do webhook
    const normalizer = new WhatsAppNormalizer([broker])
    
    const { result: normalized, timeMs: normalizationTime } = await measureTime(
      () => normalizer.normalizeWebhook(account.broker_type, body),
      logger.withContext({ step: 'normalization' })
    )
    
    logger.info('Webhook data normalized', {
      eventType: normalized.eventType,
      normalizationTimeMs: normalizationTime,
    })
    
    // Processa mensagem normalizada
    const processor = new WhatsAppProcessor(supabaseClient)
    
    if (normalized.eventType === 'message' && normalized.message) {
      const brokerProtocolRaw = normalized.message.context?.metadata?.protocolNumber
      const brokerProtocol = typeof brokerProtocolRaw === 'string' && brokerProtocolRaw.trim().length > 0
        ? brokerProtocolRaw.trim().toUpperCase()
        : null

      logger.info('Pre-protocol extraction debug', {
        hasText: !!normalized.message.content?.text,
        textLength: normalized.message.content?.text?.length || 0,
        textPreview: (normalized.message.content?.text || '').substring(0, 50),
        brokerProtocol,
        brokerIsProtocol: normalized.message.context?.metadata?.isProtocol === true,
      })

      const { protocol: decodedProtocol, sanitizedMessage } = extractProtocolPayload(normalized.message)
      const protocol = decodedProtocol || brokerProtocol
      const message: NormalizedMessage = {
        ...sanitizedMessage,
        content: {
          ...sanitizedMessage.content,
          text: sanitizedMessage.content.text
            ? stripInvisibleProtocolChars(sanitizedMessage.content.text)
            : sanitizedMessage.content.text,
          caption: sanitizedMessage.content.caption
            ? stripInvisibleProtocolChars(sanitizedMessage.content.caption)
            : sanitizedMessage.content.caption,
        },
      }

      if (protocol && !decodedProtocol) {
        logger.warn('Protocol fallback used from broker metadata', {
          protocol,
          messageId: normalized.message.messageId,
          brokerType: account.broker_type,
        })
      }

      const funnelMatcherService = new FunnelMessageMatcherService(supabaseClient)
      const protocolAttributionService = new WhatsAppProtocolAttributionService(supabaseClient)
      let fromMe = false
      let incomingContactId: string | null = null
      let nativeSourceData: StandardizedSourceData | null = null
      
      // FASE 6: Integração de rastreamento de origem
      // Processar origem ANTES de processar a mensagem
      // Apenas para mensagens recebidas (isGroup=false, fromMe=false)
      if (!message.isGroup) {
        // Verificar fromMe do webhook original (diferentes brokers têm estruturas diferentes)
        fromMe = extractFromMe(body, account.broker_type)
        
        if (!fromMe) {
          // Mensagem recebida de contato individual - processar origem
          try {
            const contactOriginService = new ContactOriginService(supabaseClient)
            
            const { result: originResult, timeMs: originProcessingTime } = await measureTime(
              () => contactOriginService.processIncomingContact({
                normalizedMessage: message,
                projectId: account.project_id,
                supabaseClient,
                skipOriginPersistence: Boolean(protocol),
              }),
              logger.withContext({ step: 'contact_origin_processing' })
            )

            incomingContactId = originResult.contactId
            nativeSourceData = originResult.sourceData || null
            
            logger.info('Contact origin processed', {
              phone: message.from.phoneNumber,
              jid: message.from.jid,
              lid: message.from.lid,
              projectId: account.project_id,
              originProcessingTimeMs: originProcessingTime,
            })
          } catch (error) {
            // Log erro mas não falha o processamento da mensagem
            // O rastreamento de origem é importante mas não crítico
            const errorMsg = error instanceof Error ? error.message : String(error)
            logger.error('Error processing contact origin (non-blocking)', error, {
              phone: message.from.phoneNumber,
              jid: message.from.jid,
              lid: message.from.lid,
              projectId: account.project_id,
              errorMessage: errorMsg,
            })
          }
        }
        
        if (fromMe) {
          try {
            const { result: matchResult, timeMs: matchTime } = await measureTime(
              () => funnelMatcherService.processOutgoingMessage({
                projectId: account.project_id,
                accountId: account.id,
                brokerType: account.broker_type,
                message,
              }),
              logger.withContext({ step: 'funnel_match_processing' })
            )
            
            logger.info('Outgoing message funnel evaluation finished', {
              matched: matchResult.matched,
              contactId: matchResult.contactId,
              stageId: matchResult.stageId,
              matchedPhrase: matchResult.matchedPhrase,
              processingTimeMs: matchTime,
            })
          } catch (error) {
            logger.error('Error processing outgoing funnel match (non-blocking)', error, {
              messageId: message.messageId,
              projectId: account.project_id,
              accountId: account.id,
            })
          }
        }
      }
      
      // Processar mensagem normalmente (fluxo principal)
      let processingTime = 0
      if (!fromMe) {
        const processingResult = await measureTime(
          () => processor.processMessage(message, account.project_id),
          logger.withContext({ step: 'message_processing' })
        )
        processingTime = processingResult.timeMs
        incomingContactId = processingResult.result.contactId || incomingContactId
      }

      if (!fromMe && protocol && incomingContactId) {
        const resolvedContactId = incomingContactId
        try {
          const { result: attributionResult, timeMs: attributionTime } = await measureTime(
            () => protocolAttributionService.attributeByProtocol({
              protocol,
              projectId: account.project_id,
              contactId: resolvedContactId,
              nativeSourceData,
            }),
            logger.withContext({ step: 'protocol_attribution' })
          )

          if (attributionResult.status === 'attributed' || attributionResult.status === 'already_attributed') {
            logger.info('Protocol attribution processed', {
              protocol,
              status: attributionResult.status,
              linkAccessId: attributionResult.linkAccessId,
              contactId: resolvedContactId,
              processingTimeMs: attributionTime,
            })
          } else {
            logger.warn('Protocol attribution skipped', {
              protocol,
              status: attributionResult.status,
              reason: attributionResult.message,
              linkAccessId: attributionResult.linkAccessId,
              processingTimeMs: attributionTime,
            })
          }
        } catch (error) {
          logger.error('Error attributing protocol to contact (non-blocking)', error, {
            protocol,
            contactId: resolvedContactId,
            projectId: account.project_id,
          })
        }
      }

      if (!fromMe && protocol && !incomingContactId) {
        logger.warn('Protocol detected but no contact resolved for attribution', {
          protocol,
          messageId: message.messageId,
          projectId: account.project_id,
        })
      }
      
      // Persistir mensagem no histórico de conversas (non-blocking)
      const conversationPersistence = new ConversationPersistenceService(supabaseClient)

      if (!fromMe && incomingContactId) {
        // Mensagem recebida (inbound)
        try {
          await conversationPersistence.persistMessage({
            normalizedMessage: message,
            direction: 'inbound',
            projectId: account.project_id,
            contactId: incomingContactId,
            messagingAccountId: account.id,
          })
          logger.info('Inbound message persisted to conversation history', {
            contactId: incomingContactId,
            messageId: message.messageId,
          })
        } catch (error) {
          logger.error('Error persisting inbound message (non-blocking)', error, {
            contactId: incomingContactId,
            messageId: message.messageId,
          })
        }
      } else if (fromMe) {
        // Mensagem enviada (outbound) detectada via webhook
        try {
          const contactRepo = new SupabaseContactRepository(supabaseClient)
          const recipientContact = await contactRepo.findByAnyIdentifier({
            projectId: account.project_id,
            jid: message.from.jid,
            lid: message.from.lid,
            canonicalIdentifier: message.from.canonicalIdentifier,
          })

          if (recipientContact) {
            await conversationPersistence.persistMessage({
              normalizedMessage: message,
              direction: 'outbound',
              projectId: account.project_id,
              contactId: recipientContact.id,
              messagingAccountId: account.id,
            })
            logger.info('Outbound message persisted to conversation history', {
              contactId: recipientContact.id,
              messageId: message.messageId,
            })
          }
        } catch (error) {
          logger.error('Error persisting outbound message (non-blocking)', error, {
            messageId: message.messageId,
          })
        }
      }

      // Atualizar estatísticas
      const accountRepo = new MessagingAccountRepository(supabaseClient)
      await accountRepo.updateStats(account.id, {
        totalMessages: account.total_messages + 1,
        lastWebhookAt: new Date().toISOString(),
      })
      
      logger.metrics('Message processed successfully', {
        processingTimeMs: processingTime,
        eventType: 'message',
        totalMessages: account.total_messages + 1,
      })
    } else if (normalized.eventType === 'status' && normalized.status) {
      const { timeMs: processingTime } = await measureTime(
        () => processor.processStatusUpdate(normalized.status!),
        logger.withContext({ step: 'status_processing' })
      )

      // Atualizar status da mensagem no histórico de conversas (non-blocking)
      try {
        const conversationPersistence = new ConversationPersistenceService(supabaseClient)
        await conversationPersistence.updateStatus(
          normalized.status.messageId,
          normalized.status.status as 'sent' | 'delivered' | 'read' | 'failed'
        )
      } catch (error) {
        logger.error('Error updating conversation message status (non-blocking)', error, {
          messageId: normalized.status.messageId,
          status: normalized.status.status,
        })
      }

      logger.metrics('Status update processed successfully', {
        processingTimeMs: processingTime,
        eventType: 'status',
      })
    }
    
    // Retornar resposta vazia 2xx para webhooks que requerem isso
    // Alguns brokers (ex: UAZAPI) requerem HTTP 2xx com resposta vazia
    // para confirmar recebimento do webhook
    return emptySuccessResponse(200)
    
  } catch (error) {
    logger.error('Error processing webhook', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro ao processar webhook',
      500
    )
  }
}

function extractProtocolPayload(message: NormalizedMessage): {
  protocol: string | null
  sanitizedMessage: NormalizedMessage
} {
  const textProtocol = decodeWhatsAppProtocol(message.content.text || '')
  const captionProtocol = textProtocol ? null : decodeWhatsAppProtocol(message.content.caption || '')
  const protocol = textProtocol || captionProtocol

  if (!protocol) {
    return {
      protocol: null,
      sanitizedMessage: message,
    }
  }

  return {
    protocol,
    sanitizedMessage: {
      ...message,
      content: {
        ...message.content,
        text: message.content.text ? stripWhatsAppProtocol(message.content.text) : message.content.text,
        caption: message.content.caption ? stripWhatsAppProtocol(message.content.caption) : message.content.caption,
      },
    },
  }
}

/**
 * Extrai campo fromMe do webhook original baseado no broker
 * 
 * Diferentes brokers têm estruturas diferentes:
 * - UAZAPI: body.message.fromMe
 * - Gupshup: body.payload.fromMe ou body.fromMe
 * - Official WhatsApp: body.entry[0].changes[0].value.messages[0].from (comparar com phone_number_id)
 * 
 * @param body - Body do webhook original
 * @param brokerType - Tipo do broker
 * @returns true se mensagem foi enviada por nós, false caso contrário
 */
function extractFromMe(
  body: WebhookDTO['data'],
  brokerType: string
): boolean {
  try {
    // UAZAPI: fromMe está em message.fromMe
    if (brokerType === 'uazapi') {
      const uazapiBody = body as { message?: { fromMe?: boolean } }
      return uazapiBody.message?.fromMe === true
    }
    
    // Gupshup: fromMe pode estar em payload.fromMe ou body.fromMe
    if (brokerType === 'gupshup') {
      const gupshupBody = body as { payload?: { fromMe?: boolean }; fromMe?: boolean }
      return gupshupBody.payload?.fromMe === true || gupshupBody.fromMe === true
    }
    
    // Official WhatsApp Business API: comparar from com phone_number_id
    // Se from === phone_number_id, então foi enviada por nós
    // Por enquanto, assumimos false (mensagem recebida) se não conseguir determinar
    if (brokerType === 'official_whatsapp') {
      // TODO: Implementar lógica específica do Official WhatsApp
      // Comparar body.entry[0].changes[0].value.messages[0].from com phone_number_id
      return false
    }
    
    // Fallback: assumir mensagem recebida (fromMe = false)
    return false
  } catch (error) {
    // Em caso de erro, assumir mensagem recebida (fromMe = false)
    // É mais seguro processar origem do que perder o rastreamento
    return false
  }
}
