import { describe, expect, it } from 'vitest'
import {
  isValidIanaTimezone,
  isoDateToDateInTimezone,
  resolveTimezone,
  toISODateInTimezone
} from '../dateTimezone'

describe('dateTimezone', () => {
  it('should return true for valid IANA timezone', () => {
    expect(isValidIanaTimezone('America/Sao_Paulo')).toBe(true)
  })

  it('should return false for invalid timezone', () => {
    expect(isValidIanaTimezone('Invalid/Timezone')).toBe(false)
  })

  it('should format date by timezone calendar day', () => {
    const date = new Date('2026-02-19T07:59:59.000Z') // 2026-02-18 23:59:59 PST
    const iso = toISODateInTimezone(date, 'America/Los_Angeles')
    expect(iso).toBe('2026-02-18')
  })

  it('should resolve fallback timezone when invalid timezone is provided', () => {
    const resolved = resolveTimezone('Invalid/Timezone')
    expect(typeof resolved).toBe('string')
    expect(resolved.length).toBeGreaterThan(0)
  })

  it('should parse ISO day preserving calendar day for Sao Paulo', () => {
    const parsed = isoDateToDateInTimezone('2026-02-18', 'America/Sao_Paulo')
    if (!parsed) {
      throw new Error('Expected parsed date for Sao Paulo')
    }
    expect(toISODateInTimezone(parsed, 'America/Sao_Paulo')).toBe('2026-02-18')
  })

  it('should parse ISO day preserving calendar day for Los Angeles', () => {
    const parsed = isoDateToDateInTimezone('2026-02-18', 'America/Los_Angeles')
    if (!parsed) {
      throw new Error('Expected parsed date for Los Angeles')
    }
    expect(toISODateInTimezone(parsed, 'America/Los_Angeles')).toBe('2026-02-18')
  })

  it('should return undefined for invalid date input', () => {
    const parsed = isoDateToDateInTimezone('18/02/2026', 'America/Sao_Paulo')
    expect(parsed).toBeUndefined()
  })
})
