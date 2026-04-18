/**
 * Helpers para protocolo invisivel do WhatsApp.
 *
 * Port 1:1 de back-end/supabase/functions/_shared/whatsapp-protocol.ts
 * Contrato unico de encode/decode usado no redirect e no webhook.
 */

const ZERO_WIDTH_ZERO = '\u200B'
const ZERO_WIDTH_ONE = '\u200C'
const ZERO_WIDTH_TWO = '\u200D'
const ZERO_WIDTH_THREE = '\u2060'
const VALID_TIMEZONE_REGEX = /^[A-Za-z_]+(?:\/[A-Za-z0-9_\-+]+)+$/
const INVISIBLE_PROTOCOL_REGEX = /[\u200B\u200C\u200D\u2060]/g

const textEncoder = new TextEncoder()

const DIGIT_TO_CHAR: Record<string, string> = {
  '0': ZERO_WIDTH_ZERO,
  '1': ZERO_WIDTH_ONE,
  '2': ZERO_WIDTH_TWO,
  '3': ZERO_WIDTH_THREE,
}

function encodeBase4(value: Uint8Array): string {
  let digits = ''
  for (const byte of value) {
    digits += byte.toString(4).padStart(4, '0')
  }
  return digits
}

function encodeInvisibleDigits(base4Digits: string): string {
  let token = ''
  for (const digit of base4Digits) {
    const char = DIGIT_TO_CHAR[digit]
    if (!char) continue
    token += char
  }
  return token
}

function normalizeTimezone(timezone?: string | null): string | null {
  const value = timezone?.trim() || ''
  if (!value) return null
  if (!VALID_TIMEZONE_REGEX.test(value)) return null
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: value }).format(new Date())
    return value
  } catch {
    return null
  }
}

function resolveHourInTimezone(timezone?: string | null, now: Date = new Date()): number {
  const normalizedTimezone = normalizeTimezone(timezone)
  if (!normalizedTimezone) return now.getHours()

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: normalizedTimezone,
    }).formatToParts(now)
    const hourPart = parts.find((part) => part.type === 'hour')?.value
    const parsedHour = Number.parseInt(hourPart || '', 10)
    if (!Number.isNaN(parsedHour) && parsedHour >= 0 && parsedHour <= 23) {
      return parsedHour
    }
  } catch {
    // fallback below
  }

  return now.getHours()
}

function resolveDefaultGreeting(timezone?: string | null, now?: Date): string {
  const hour = resolveHourInTimezone(timezone, now)
  if (hour >= 5 && hour < 12) return 'Ola, bom dia'
  if (hour >= 12 && hour < 18) return 'Ola, boa tarde'
  return 'Ola, boa noite'
}

export function generateWhatsAppProtocol(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `WA-${timestamp}-${random}`.toUpperCase()
}

export function encodeWhatsAppProtocol(protocol: string): string {
  const normalizedProtocol = protocol.trim().toUpperCase()
  const bytes = textEncoder.encode(normalizedProtocol)
  return encodeInvisibleDigits(encodeBase4(bytes))
}

export function stripInvisibleProtocolChars(text: string): string {
  if (!text) return text
  return text.replace(INVISIBLE_PROTOCOL_REGEX, '')
}

export function buildWhatsAppTrackedMessage(
  message: string | null | undefined,
  protocol: string,
  options?: {
    timezone?: string | null
    now?: Date
  }
): string {
  const token = encodeWhatsAppProtocol(protocol)
  const trimmedMessage = message?.trim() ?? ''
  const safeMessage = stripInvisibleProtocolChars(trimmedMessage)
  const baseMessage = safeMessage || resolveDefaultGreeting(options?.timezone, options?.now)
  const chars = Array.from(baseMessage)

  if (chars.length === 0) return token

  const [firstChar, ...remainingChars] = chars
  return `${firstChar}${token}${remainingChars.join('')}`
}
