import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import {
  normalizeUtmSourceValue,
  resolveBestOriginUtmSourceMatch,
} from '../services/CustomOriginUtmMatcher.ts'

Deno.test('normalizeUtmSourceValue should trim and lowercase values', () => {
  assertEquals(normalizeUtmSourceValue('  ChatGPT.COM  '), 'chatgpt.com')
  assertEquals(normalizeUtmSourceValue('   '), null)
  assertEquals(normalizeUtmSourceValue(null), null)
})

Deno.test('resolveBestOriginUtmSourceMatch should prioritize exact over contains', () => {
  const result = resolveBestOriginUtmSourceMatch(
    [
      {
        id: 'origin-contains',
        utm_source_match_mode: 'contains',
        utm_source_match_value: 'chatgpt',
        created_at: '2026-02-10T10:00:00.000Z',
      },
      {
        id: 'origin-exact',
        utm_source_match_mode: 'exact',
        utm_source_match_value: 'chatgpt.com',
        created_at: '2026-02-11T10:00:00.000Z',
      },
    ],
    'chatgpt.com'
  )

  assertEquals(result?.originId, 'origin-exact')
  assertEquals(result?.mode, 'exact')
  assertEquals(result?.value, 'chatgpt.com')
})

Deno.test('resolveBestOriginUtmSourceMatch should use longest contains value', () => {
  const result = resolveBestOriginUtmSourceMatch(
    [
      {
        id: 'origin-short',
        utm_source_match_mode: 'contains',
        utm_source_match_value: 'chat',
        created_at: '2026-02-10T10:00:00.000Z',
      },
      {
        id: 'origin-long',
        utm_source_match_mode: 'contains',
        utm_source_match_value: 'chatgpt',
        created_at: '2026-02-11T10:00:00.000Z',
      },
    ],
    'chatgpt.com'
  )

  assertEquals(result?.originId, 'origin-long')
  assertEquals(result?.mode, 'contains')
  assertEquals(result?.value, 'chatgpt')
})

Deno.test('resolveBestOriginUtmSourceMatch should break contains ties by oldest created_at', () => {
  const result = resolveBestOriginUtmSourceMatch(
    [
      {
        id: 'origin-newer',
        utm_source_match_mode: 'contains',
        utm_source_match_value: 'chatgpt',
        created_at: '2026-02-20T10:00:00.000Z',
      },
      {
        id: 'origin-older',
        utm_source_match_mode: 'contains',
        utm_source_match_value: 'chatgpt',
        created_at: '2026-02-10T10:00:00.000Z',
      },
    ],
    'chatgpt.com'
  )

  assertEquals(result?.originId, 'origin-older')
  assertEquals(result?.mode, 'contains')
})

Deno.test('resolveBestOriginUtmSourceMatch should return null when there is no match', () => {
  const result = resolveBestOriginUtmSourceMatch(
    [
      {
        id: 'origin-google',
        utm_source_match_mode: 'exact',
        utm_source_match_value: 'google',
        created_at: '2026-02-10T10:00:00.000Z',
      },
    ],
    'chatgpt.com'
  )

  assertEquals(result, null)
})
