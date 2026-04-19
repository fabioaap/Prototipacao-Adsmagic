import type { ContactIdentifier } from './identifier-normalizer.ts'

export interface StorablePhoneParts {
  phone: string
  countryCode: string
}

/**
 * Política de qualidade para gravação em contacts.phone/country_code:
 * - exige telefone nacional com pelo menos 10 dígitos (DDD + número).
 * - quando não atende, mantemos apenas canonical_identifier/jid/lid.
 */
export function getStorablePhoneParts(
  identifier: ContactIdentifier
): StorablePhoneParts | null {
  const normalized = identifier.normalizedPhone
  if (!normalized) return null

  const phone = String(normalized.phone || '').replace(/\D/g, '')
  const countryCode = String(normalized.countryCode || '').replace(/\D/g, '')
  if (!phone || !countryCode) return null

  if (phone.length < 10) {
    return null
  }

  return { phone, countryCode }
}
