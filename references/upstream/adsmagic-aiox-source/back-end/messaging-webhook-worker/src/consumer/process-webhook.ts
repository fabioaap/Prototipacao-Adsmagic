/**
 * Consumer Orchestrator — processes a single queued webhook message
 *
 * Steps:
 * 1. Resolve messaging account
 * 2. Validate account (active, broker match)
 * 3. Validate webhook signature (if configured)
 * 4. Filter messages (ignore status-only, etc.)
 * 5. Normalize via broker
 * 6. Process: origin tracking, funnel matching, message processing, protocol attribution
 * 7. Update account stats
 */
import type { SupabaseRestClient } from '../lib/supabase.js'
import type { MessagingWebhookQueueMessage } from '../types.js'
import type { MessagingAccount, NormalizedMessage } from '../types/messaging.js'
import type { StandardizedSourceData } from '../types/contact-origin-types.js'

import { AccountResolverFactory } from './account-resolver.js'
import { extractSignatureFromHeaders, validateWebhookSignature } from './signature-validator.js'
import { MessageFilterFactory } from '../utils/message-filters.js'
import { WhatsAppBrokerFactory } from '../brokers/broker-factory.js'
import { WhatsAppNormalizer } from '../core/normalizer.js'
import { WhatsAppProcessor } from '../core/processor.js'
import { ContactOriginService } from '../services/contact-origin.service.js'
import { FunnelMessageMatcherService } from '../services/funnel-matcher.service.js'
import { WhatsAppProtocolAttributionService } from '../services/protocol-attribution.service.js'
import { MessagingAccountRepository } from '../repositories/messaging-account.repo.js'
import {
  decodeWhatsAppProtocol,
  stripInvisibleProtocolChars,
  stripWhatsAppProtocol,
} from '../utils/whatsapp-protocol.js'

/**
 * Main consumer entry point — called from queue handler in index.ts
 * Throws on transient errors (triggers retry), silently returns on permanent errors.
 */
export async function processWebhookMessage(
  msg: MessagingWebhookQueueMessage,
  supabase: SupabaseRestClient
): Promise<void> {
  const { broker_type, webhook_type, account_id, parsed_body, request_headers, raw_body } = msg

  // 1. RESOLVE ACCOUNT
  const { account, strategy } = await AccountResolverFactory.resolve({
    accountId: account_id,
    parsedBody: parsed_body,
    requestHeaders: request_headers,
    supabase,
  })

  if (!account) {
    // Permanent error — no retry
    console.warn('[consumer] Account not found', {
      webhookEventId: msg.webhook_event_id,
      brokerType: broker_type,
      webhookType: webhook_type,
      strategy,
    })
    return
  }

  // 2. VALIDATE ACCOUNT
  if (account.broker_type !== broker_type) {
    console.warn('[consumer] Broker type mismatch', {
      accountBrokerType: account.broker_type,
      urlBrokerType: broker_type,
    })
    return // Permanent — no retry
  }

  if (account.status !== 'active') {
    console.warn('[consumer] Account not active', {
      accountId: account.id,
      status: account.status,
    })
    return // Permanent — no retry
  }

  // 3. VALIDATE SIGNATURE (if configured)
  if (account.webhook_secret) {
    const signature = extractSignatureFromHeaders(request_headers)
    if (signature) {
      const isValid = await validateWebhookSignature({
        rawBody: raw_body,
        signature,
        secret: account.webhook_secret,
        brokerType: broker_type,
      })

      if (!isValid) {
        console.warn('[consumer] Invalid webhook signature', {
          accountId: account.id,
          webhookEventId: msg.webhook_event_id,
        })
        return // Permanent — no retry
      }
    }
  }

  // 4. FILTER MESSAGE
  const messageFilter = MessageFilterFactory.create(broker_type)
  if (messageFilter.shouldIgnore(parsed_body)) {
    const reason = messageFilter.getReason(parsed_body)
    console.info('[consumer] Message filtered', { reason, webhookEventId: msg.webhook_event_id })
    return
  }

  // 5. NORMALIZE via broker
  const broker = WhatsAppBrokerFactory.create(
    broker_type,
    {
      ...((account.broker_config as Record<string, unknown>) || {}),
      accountName: account.account_name,
      apiKey: account.api_key || undefined,
      accessToken: account.access_token || undefined,
    },
    account.id
  )

  const normalizer = new WhatsAppNormalizer([broker])
  const normalized = await normalizer.normalizeWebhook(broker_type, parsed_body)

  // 6. PROCESS
  if (normalized.eventType === 'message' && normalized.message) {
    await processMessageEvent(account, normalized.message, parsed_body, supabase)
  } else if (normalized.eventType === 'status' && normalized.status) {
    const processor = new WhatsAppProcessor(supabase)
    await processor.processStatusUpdate(normalized.status)
  }

  // 7. UPDATE STATS
  const accountRepo = new MessagingAccountRepository(supabase)
  try {
    await accountRepo.updateStats(account.id, {
      totalMessages: (account.total_messages || 0) + 1,
      lastWebhookAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[consumer] Failed to update account stats:', err)
  }
}

/**
 * Process a message event — origin tracking, funnel matching, protocol attribution
 */
async function processMessageEvent(
  account: MessagingAccount,
  rawMessage: NormalizedMessage,
  originalBody: Record<string, unknown>,
  supabase: SupabaseRestClient
): Promise<void> {
  // Extract protocol from text
  const { protocol, sanitizedMessage } = extractProtocolPayload(rawMessage)

  // Strip invisible chars from text/caption
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

  // Check broker protocol from metadata
  const brokerProtocolRaw = message.context?.metadata?.protocolNumber
  const brokerProtocol = typeof brokerProtocolRaw === 'string' && brokerProtocolRaw.trim().length > 0
    ? brokerProtocolRaw.trim().toUpperCase()
    : null
  const resolvedProtocol = protocol || brokerProtocol

  const fromMe = extractFromMe(originalBody, account.broker_type)
  let incomingContactId: string | null = null
  let nativeSourceData: StandardizedSourceData | null = null

  if (!message.isGroup) {
    if (!fromMe) {
      // Incoming message — process contact origin
      try {
        const contactOriginService = new ContactOriginService(supabase)
        const originResult = await contactOriginService.processIncomingContact({
          normalizedMessage: message,
          projectId: account.project_id,
          skipOriginPersistence: Boolean(resolvedProtocol),
        })

        incomingContactId = originResult.contactId
        nativeSourceData = originResult.sourceData || null
      } catch (error) {
        console.error('[consumer] Error processing contact origin (non-blocking):', error)
      }
    }

    if (fromMe) {
      // Outgoing message — funnel matching
      try {
        const funnelMatcher = new FunnelMessageMatcherService(supabase)
        const matchResult = await funnelMatcher.processOutgoingMessage({
          projectId: account.project_id,
          accountId: account.id,
          brokerType: account.broker_type,
          message,
        })

        console.info('[consumer] Funnel match result', {
          matched: matchResult.matched,
          contactId: matchResult.contactId,
          stageId: matchResult.stageId,
        })
      } catch (error) {
        console.error('[consumer] Error processing funnel match (non-blocking):', error)
      }
    }
  }

  // Process message (find/create contact)
  if (!fromMe) {
    const processor = new WhatsAppProcessor(supabase)
    const result = await processor.processMessage(message, account.project_id)
    if (result.contactId) {
      incomingContactId = incomingContactId || result.contactId
    }
  }

  // Protocol attribution
  if (!fromMe && resolvedProtocol && incomingContactId) {
    try {
      const protocolService = new WhatsAppProtocolAttributionService(supabase)
      const attributionResult = await protocolService.attributeByProtocol({
        protocol: resolvedProtocol,
        projectId: account.project_id,
        contactId: incomingContactId,
        nativeSourceData,
      })

      if (attributionResult.status === 'attributed' || attributionResult.status === 'already_attributed') {
        console.info('[consumer] Protocol attribution:', {
          protocol: resolvedProtocol,
          status: attributionResult.status,
          linkAccessId: attributionResult.linkAccessId,
        })
      } else {
        console.warn('[consumer] Protocol attribution skipped:', {
          protocol: resolvedProtocol,
          status: attributionResult.status,
          reason: attributionResult.message,
        })
      }
    } catch (error) {
      console.error('[consumer] Error attributing protocol (non-blocking):', error)
    }
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
    return { protocol: null, sanitizedMessage: message }
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

function extractFromMe(body: Record<string, unknown>, brokerType: string): boolean {
  try {
    if (brokerType === 'uazapi') {
      const uazapiBody = body as { message?: { fromMe?: boolean } }
      return uazapiBody.message?.fromMe === true
    }

    if (brokerType === 'gupshup') {
      const gupshupBody = body as { payload?: { fromMe?: boolean }; fromMe?: boolean }
      return gupshupBody.payload?.fromMe === true || gupshupBody.fromMe === true
    }

    if (brokerType === 'official_whatsapp') {
      return false
    }

    return false
  } catch {
    return false
  }
}
