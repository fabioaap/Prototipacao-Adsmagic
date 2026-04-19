/**
 * WhatsApp invisible protocol — ported from _shared/whatsapp-protocol.ts
 */

const ZERO_WIDTH_ZERO = "\u200B"
const ZERO_WIDTH_ONE = "\u200C"
const ZERO_WIDTH_TWO = "\u200D"
const ZERO_WIDTH_THREE = "\u2060"
const PROTOCOL_REGEX = /^WA-[A-Z0-9-]{6,64}$/

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const DIGIT_TO_CHAR: Record<string, string> = {
  "0": ZERO_WIDTH_ZERO, "1": ZERO_WIDTH_ONE, "2": ZERO_WIDTH_TWO, "3": ZERO_WIDTH_THREE,
}

const CHAR_TO_DIGIT: Record<string, string> = {
  [ZERO_WIDTH_ZERO]: "0", [ZERO_WIDTH_ONE]: "1", [ZERO_WIDTH_TWO]: "2", [ZERO_WIDTH_THREE]: "3",
}

const INVISIBLE_PROTOCOL_CHARS = new Set([ZERO_WIDTH_ZERO, ZERO_WIDTH_ONE, ZERO_WIDTH_TWO, ZERO_WIDTH_THREE])
const INVISIBLE_PROTOCOL_REGEX = /[\u200B\u200C\u200D\u2060]/g
const MIN_PROTOCOL_DIGITS = "WA-XXXXXX".length * 4

function encodeBase4(value: Uint8Array): string {
  let digits = ""
  for (const byte of value) digits += byte.toString(4).padStart(4, "0")
  return digits
}

function decodeBase4(digits: string): Uint8Array | null {
  if (!digits || digits.length % 4 !== 0) return null
  const bytes = new Uint8Array(digits.length / 4)
  for (let i = 0; i < digits.length; i += 4) {
    const chunk = digits.slice(i, i + 4)
    const value = Number.parseInt(chunk, 4)
    if (Number.isNaN(value) || value < 0 || value > 255) return null
    bytes[i / 4] = value
  }
  return bytes
}

function encodeInvisibleDigits(base4Digits: string): string {
  let token = ""
  for (const digit of base4Digits) {
    const char = DIGIT_TO_CHAR[digit]
    if (!char) continue
    token += char
  }
  return token
}

function decodeInvisibleDigits(token: string): string {
  let digits = ""
  for (const char of token) {
    const digit = CHAR_TO_DIGIT[char]
    if (digit === undefined) break
    digits += digit
  }
  return digits
}

function isInvisibleProtocolChar(char: string): boolean {
  return INVISIBLE_PROTOCOL_CHARS.has(char)
}

function findProtocolToken(text: string): { protocol: string; start: number; end: number } | null {
  function tryDecodeProtocolFromDigits(candidateDigits: string): string | null {
    const maxUsableDigitsLength = Math.floor(candidateDigits.length / 4) * 4
    if (maxUsableDigitsLength < MIN_PROTOCOL_DIGITS) return null
    for (let usableDigitsLength = maxUsableDigitsLength; usableDigitsLength >= MIN_PROTOCOL_DIGITS; usableDigitsLength -= 4) {
      const bytes = decodeBase4(candidateDigits.slice(0, usableDigitsLength))
      if (!bytes) continue
      const protocol = textDecoder.decode(bytes).trim().toUpperCase()
      if (PROTOCOL_REGEX.test(protocol)) return protocol
    }
    return null
  }

  for (let start = 0; start < text.length; start += 1) {
    if (!isInvisibleProtocolChar(text[start])) continue
    let runEnd = start
    while (runEnd < text.length && isInvisibleProtocolChar(text[runEnd])) runEnd += 1
    const candidate = text.slice(start, runEnd)
    const candidateDigits = decodeInvisibleDigits(candidate)
    const protocol = tryDecodeProtocolFromDigits(candidateDigits)
    if (protocol) return { protocol, start, end: runEnd }
  }
  return null
}

export function generateWhatsAppProtocol(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `WA-${timestamp}-${random}`.toUpperCase()
}

export function encodeWhatsAppProtocol(protocol: string): string {
  const normalizedProtocol = protocol.trim().toUpperCase()
  const bytes = textEncoder.encode(normalizedProtocol)
  const base4Digits = encodeBase4(bytes)
  return encodeInvisibleDigits(base4Digits)
}

export function decodeWhatsAppProtocol(text: string): string | null {
  if (!text) return null
  const token = findProtocolToken(text)
  return token?.protocol || null
}

export function stripWhatsAppProtocol(text: string): string {
  if (!text) return text
  const token = findProtocolToken(text)
  if (!token) return text
  return `${text.slice(0, token.start)}${text.slice(token.end)}`
}

export function stripInvisibleProtocolChars(text: string): string {
  if (!text) return text
  return text.replace(INVISIBLE_PROTOCOL_REGEX, "")
}

export function buildWhatsAppTrackedMessage(
  message: string | null | undefined,
  protocol: string,
  options?: { timezone?: string | null; now?: Date }
): string {
  const token = encodeWhatsAppProtocol(protocol)
  const trimmedMessage = message?.trim() ?? ""
  const safeMessage = stripInvisibleProtocolChars(trimmedMessage)
  const VALID_TIMEZONE_REGEX = /^[A-Za-z_]+(?:\/[A-Za-z0-9_\-+]+)+$/
  function resolveHour(tz?: string | null, now: Date = new Date()): number {
    const value = tz?.trim() || ""
    if (!value || !VALID_TIMEZONE_REGEX.test(value)) return now.getHours()
    try {
      const parts = new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: value }).formatToParts(now)
      const hourPart = parts.find(p => p.type === "hour")?.value
      const parsed = Number.parseInt(hourPart || "", 10)
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 23) return parsed
    } catch { /* fallback */ }
    return now.getHours()
  }
  function resolveGreeting(tz?: string | null, now?: Date): string {
    const hour = resolveHour(tz, now)
    if (hour >= 5 && hour < 12) return "Ola, bom dia"
    if (hour >= 12 && hour < 18) return "Ola, boa tarde"
    return "Ola, boa noite"
  }
  const baseMessage = safeMessage || resolveGreeting(options?.timezone, options?.now)
  const chars = Array.from(baseMessage)
  if (chars.length === 0) return token
  const [firstChar, ...remainingChars] = chars
  return `${firstChar}${token}${remainingChars.join("")}`
}
