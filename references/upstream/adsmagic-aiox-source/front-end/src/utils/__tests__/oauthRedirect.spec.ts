/**
 * Unit tests for getOAuthRedirectUri
 *
 * Tests covering:
 * - Happy path: locale provided returns correct URL
 * - Edge case: empty string locale falls back to 'pt'
 * - Edge case: undefined locale uses default 'pt'
 * - Edge case: different origins (localhost, production)
 */

import { describe, it, expect, afterEach } from 'vitest'
import { getOAuthRedirectUri } from '../oauthRedirect'

describe('getOAuthRedirectUri', () => {
  const originalOrigin = window.location.origin

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: originalOrigin },
      writable: true,
    })
  })

  it('should return URL with locale when provided', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://app.adsmagic.com.br' },
      writable: true,
    })

    const result = getOAuthRedirectUri('pt')
    expect(result).toBe('https://app.adsmagic.com.br/pt/auth/oauth/callback')

    const resultEn = getOAuthRedirectUri('en')
    expect(resultEn).toBe('https://app.adsmagic.com.br/en/auth/oauth/callback')

    const resultEs = getOAuthRedirectUri('es')
    expect(resultEs).toBe('https://app.adsmagic.com.br/es/auth/oauth/callback')
  })

  it('should use default "pt" when locale is empty string', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5173' },
      writable: true,
    })

    const result = getOAuthRedirectUri('')
    expect(result).toBe('http://localhost:5173/pt/auth/oauth/callback')
  })

  it('should use default "pt" when locale is undefined', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5173' },
      writable: true,
    })

    const result = getOAuthRedirectUri(undefined as unknown as string)
    expect(result).toBe('http://localhost:5173/pt/auth/oauth/callback')
  })

  it('should handle different origins correctly', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5173' },
      writable: true,
    })
    expect(getOAuthRedirectUri('pt')).toBe(
      'http://localhost:5173/pt/auth/oauth/callback'
    )

    Object.defineProperty(window, 'location', {
      value: { origin: 'https://adsmagic-first-ai.pages.dev' },
      writable: true,
    })
    expect(getOAuthRedirectUri('pt')).toBe(
      'https://adsmagic-first-ai.pages.dev/pt/auth/oauth/callback'
    )
  })

  it('should trim whitespace from locale and fallback to pt if result is empty', () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://app.example.com' },
      writable: true,
    })

    const result = getOAuthRedirectUri('   ')
    expect(result).toBe('https://app.example.com/pt/auth/oauth/callback')
  })
})
