/**
 * Events Adapter
 *
 * Converte entre o contrato snake_case do backend
 * e o formato camelCase usado no frontend.
 *
 * @module services/api/adapters/eventsAdapter
 */

import type { Event } from '@/types'

/**
 * Converte um evento do formato backend (snake_case) para frontend (camelCase)
 */
export function adaptEvent(raw: Record<string, unknown>): Event {
  // Extract contact data from join (if available)
  const contacts = raw.contacts as { name?: string; phone?: string; country_code?: string } | null
  const existingMetadata = (raw.metadata ?? {}) as Record<string, unknown>

  // Enrich metadata with contact info from join
  const metadata: Record<string, unknown> = {
    ...existingMetadata,
    ...(contacts?.name && { contactName: contacts.name }),
    ...(contacts?.phone && {
      contactPhone: contacts.country_code
        ? `+${contacts.country_code} ${contacts.phone}`
        : contacts.phone
    }),
  }

  return {
    id: raw.id as string,
    projectId: (raw.project_id ?? raw.projectId) as string,
    platform: (raw.platform) as Event['platform'],
    type: (raw.event_type ?? raw.type) as string,
    eventName: (raw.event_name ?? raw.eventName) as string | undefined,
    contactId: (raw.contact_id ?? raw.contactId) as string,
    saleId: (raw.sale_id ?? raw.saleId) as string | undefined,
    stage: (raw.stage) as string | undefined,
    description: (raw.description) as string | undefined,
    entityId: (raw.entity_id ?? raw.entityId) as string | undefined,
    entityType: (raw.entity_type ?? raw.entityType) as Event['entityType'],
    metadata,
    payload: raw.payload,
    response: raw.response,
    error: (raw.error) as string | undefined,
    retryCount: (raw.retry_count ?? raw.retryCount ?? 0) as number,
    processedAt: (raw.processed_at ?? raw.processedAt) as string | undefined,
    status: (raw.status) as Event['status'],
    lastRetryAt: (raw.last_retry_at ?? raw.lastRetryAt) as string | undefined,
    errorMessage: (raw.error_message ?? raw.errorMessage) as string | undefined,
    createdAt: (raw.created_at ?? raw.createdAt) as string,
    updatedAt: (raw.updated_at ?? raw.updatedAt) as string,
    sentAt: (raw.sent_at ?? raw.sentAt) as string | undefined,
  }
}

/**
 * Converte um array de eventos do formato backend para frontend
 */
export function adaptEvents(rawEvents: Record<string, unknown>[]): Event[] {
  return rawEvents.map(adaptEvent)
}
