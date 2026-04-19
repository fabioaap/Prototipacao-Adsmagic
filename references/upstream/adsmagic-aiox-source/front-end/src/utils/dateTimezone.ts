/**
 * Date helpers that preserve calendar day semantics in a target IANA timezone.
 */
import { parseDate } from '@internationalized/date'

const DEFAULT_TIMEZONE = 'America/Sao_Paulo'

function getDatePartsInTimezone(date: Date, timezone: string): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  return { year, month, day }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * Validates whether a timezone identifier is a valid IANA timezone.
 */
export function isValidIanaTimezone(timezone: string | undefined | null): boolean {
  if (!timezone) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date())
    return true
  } catch {
    return false
  }
}

/**
 * Resolves a safe timezone string.
 */
export function resolveTimezone(timezone: string | undefined | null): string {
  if (typeof timezone === 'string' && isValidIanaTimezone(timezone)) {
    return timezone
  }

  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (isValidIanaTimezone(browserTimezone)) {
    return browserTimezone
  }

  return DEFAULT_TIMEZONE
}

/**
 * Converts a Date to YYYY-MM-DD based on the requested timezone.
 */
export function toISODateInTimezone(date: Date, timezone: string): string {
  const safeTimezone = resolveTimezone(timezone)
  const { year, month, day } = getDatePartsInTimezone(date, safeTimezone)
  return `${year}-${pad(month)}-${pad(day)}`
}

/**
 * Returns today's YYYY-MM-DD using the requested timezone.
 */
export function todayISOInTimezone(timezone: string): string {
  return toISODateInTimezone(new Date(), timezone)
}

/**
 * Converts an ISO day string (YYYY-MM-DD) into a Date anchored to the same
 * calendar day in the requested timezone.
 */
export function isoDateToDateInTimezone(isoDate: string, timezone: string): Date | undefined {
  const safeTimezone = resolveTimezone(timezone)
  const isIsoDay = /^\d{4}-\d{2}-\d{2}$/.test(isoDate)

  if (!isIsoDay) {
    return undefined
  }

  try {
    return parseDate(isoDate).toDate(safeTimezone)
  } catch {
    return undefined
  }
}
