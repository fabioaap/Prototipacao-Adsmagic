import type { ContactIdentifier } from './identifier-normalizer.js'

export interface StorablePhoneParts {
  phone: string
  countryCode: string
}

export function getStorablePhoneParts(identifier: ContactIdentifier): StorablePhoneParts | null {
  const normalized = identifier.normalizedPhone
  if (!normalized) return null
  const phone = String(normalized.phone || '').replace(/\D/g, '')
  const countryCode = String(normalized.countryCode || '').replace(/\D/g, '')
  if (!phone || !countryCode) return null
  if (phone.length < 10) return null
  return { phone, countryCode }
}
