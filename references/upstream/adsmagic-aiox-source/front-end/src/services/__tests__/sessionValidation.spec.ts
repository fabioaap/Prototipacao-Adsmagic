import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  recordSessionValidation,
  resetSessionValidation,
  shouldValidateSession,
  SESSION_VALIDATION_TTL_MS,
} from '../sessionValidation'

describe('sessionValidation', () => {
  beforeEach(() => {
    resetSessionValidation()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('requires validation when there is no user', () => {
    expect(shouldValidateSession(null)).toBe(true)
  })

  it('skips validation while the TTL is fresh for the same user', () => {
    recordSessionValidation('user-1')
    expect(shouldValidateSession('user-1')).toBe(false)
  })

  it('requires validation when the TTL expires', () => {
    vi.useFakeTimers()
    const now = Date.now()
    vi.setSystemTime(now)
    recordSessionValidation('user-1')
    vi.setSystemTime(now + SESSION_VALIDATION_TTL_MS + 1)
    expect(shouldValidateSession('user-1')).toBe(true)
  })

  it('requires validation when the user changes', () => {
    recordSessionValidation('user-1')
    expect(shouldValidateSession('user-2')).toBe(true)
  })

  it('resetSessionValidation clears cached state', () => {
    recordSessionValidation('user-1')
    resetSessionValidation()
    expect(shouldValidateSession('user-1')).toBe(true)
  })
})
