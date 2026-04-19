/**
 * Validation utilities for the Producer
 */

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const SUPPORTED_BROKERS = ['uazapi', 'gupshup', 'official_whatsapp', 'evolution'] as const

export type SupportedBroker = typeof SUPPORTED_BROKERS[number]

export function isValidBrokerType(brokerType: string): brokerType is SupportedBroker {
  return (SUPPORTED_BROKERS as readonly string[]).includes(brokerType)
}

export function isValidUUID(uuid: string): boolean {
  return UUID_V4_REGEX.test(uuid)
}

export function validateBody(rawBody: string): { valid: true; parsed: Record<string, unknown> } | { valid: false; error: string } {
  if (!rawBody || rawBody.trim().length === 0) {
    return { valid: false, error: 'Body da requisição é obrigatório' }
  }

  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>
    return { valid: true, parsed }
  } catch {
    return { valid: false, error: 'Body inválido: JSON malformado' }
  }
}
