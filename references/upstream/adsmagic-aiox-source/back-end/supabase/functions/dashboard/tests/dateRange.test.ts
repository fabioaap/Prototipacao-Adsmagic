/**
 * Testes unitários para utils/dateRange.ts (dashboard).
 * AAA pattern; nomenclatura clara (describe/it).
 */

import { assertEquals, assert } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import {
  getDateRangeFromRequest,
  toStartOfDay,
  toEndOfDay
} from '../utils/dateRange.ts'

Deno.test('getDateRangeFromRequest - com start_date e end_date válidos (ISO) retorna start e end normalizados (início/fim do dia)', () => {
  const url = new URL('https://example.com/dashboard/summary?period=30d&start_date=2026-02-07&end_date=2026-02-07')
  const result = getDateRangeFromRequest(url, '30d')

  assert(result.ok === true)
  if (result.ok) {
    assertEquals(result.start.getHours(), 0)
    assertEquals(result.start.getMinutes(), 0)
    assertEquals(result.start.getSeconds(), 0)
    assertEquals(result.start.getMilliseconds(), 0)

    assertEquals(result.end.getHours(), 23)
    assertEquals(result.end.getMinutes(), 59)
    assertEquals(result.end.getSeconds(), 59)
    assertEquals(result.end.getMilliseconds(), 999)

    assert(result.start.getTime() <= result.end.getTime())
    assertEquals(result.start.getFullYear(), result.end.getFullYear())
    assertEquals(result.start.getMonth(), result.end.getMonth())
    assertEquals(result.start.getDate(), result.end.getDate())
  }
})

Deno.test('getDateRangeFromRequest - com start_date > end_date retorna erro de validação', () => {
  const url = new URL('https://example.com/dashboard?start_date=2026-02-10&end_date=2026-02-07')
  const result = getDateRangeFromRequest(url, '30d')

  assert(result.ok === false)
  if (!result.ok) {
    assertEquals(result.message, 'A data inicial deve ser anterior ou igual à data final.')
  }
})

Deno.test('getDateRangeFromRequest - com start_date malformado retorna erro', () => {
  const url = new URL('https://example.com/dashboard?start_date=invalid&end_date=2026-02-07')
  const result = getDateRangeFromRequest(url, '30d')

  assert(result.ok === false)
  if (!result.ok) {
    assertEquals(result.message, 'Data inicial inválida. Use o formato AAAA-MM-DD.')
  }
})

Deno.test('getDateRangeFromRequest - com end_date malformado retorna erro', () => {
  const url = new URL('https://example.com/dashboard?start_date=2026-02-07&end_date=not-a-date')
  const result = getDateRangeFromRequest(url, '30d')

  assert(result.ok === false)
  if (!result.ok) {
    assertEquals(result.message, 'Data final inválida. Use o formato AAAA-MM-DD.')
  }
})

Deno.test('getDateRangeFromRequest - sem start_date e end_date retorna intervalo derivado de period (últimos 30 dias)', () => {
  const url = new URL('https://example.com/dashboard?period=30d')
  const result = getDateRangeFromRequest(url, '30d')

  assert(result.ok === true)
  if (result.ok) {
    const diffMs = result.end.getTime() - result.start.getTime()
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
    assert(diffDays >= 29 && diffDays <= 30, `expected ~30 days, got ${diffDays}`)
  }
})

Deno.test('getDateRangeFromRequest - sem start_date e end_date com period 7d retorna intervalo de 7 dias', () => {
  const url = new URL('https://example.com/dashboard?period=7d')
  const result = getDateRangeFromRequest(url, '7d')

  assert(result.ok === true)
  if (result.ok) {
    const diffMs = result.end.getTime() - result.start.getTime()
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
    assert(diffDays >= 6 && diffDays <= 7, `expected ~7 days, got ${diffDays}`)
  }
})

Deno.test('toStartOfDay - normaliza para 00:00:00.000', () => {
  const date = new Date(2026, 1, 7, 14, 30, 45, 100)
  const start = toStartOfDay(date)

  assertEquals(start.getFullYear(), 2026)
  assertEquals(start.getMonth(), 1)
  assertEquals(start.getDate(), 7)
  assertEquals(start.getHours(), 0)
  assertEquals(start.getMinutes(), 0)
  assertEquals(start.getSeconds(), 0)
  assertEquals(start.getMilliseconds(), 0)
})

Deno.test('toEndOfDay - normaliza para 23:59:59.999', () => {
  const date = new Date(2026, 1, 7, 8, 0, 0, 0)
  const end = toEndOfDay(date)

  assertEquals(end.getFullYear(), 2026)
  assertEquals(end.getMonth(), 1)
  assertEquals(end.getDate(), 7)
  assertEquals(end.getHours(), 23)
  assertEquals(end.getMinutes(), 59)
  assertEquals(end.getSeconds(), 59)
  assertEquals(end.getMilliseconds(), 999)
})
