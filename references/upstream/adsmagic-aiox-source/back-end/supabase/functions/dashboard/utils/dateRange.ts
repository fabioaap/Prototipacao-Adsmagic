/**
 * Utilitários de intervalo de datas para handlers do dashboard.
 * Responsabilidade única: resolver e validar intervalo a partir da URL (query params)
 * e normalizar para uso em queries (início/fim do dia, consistente com timeSeries).
 */

/** Hora/minuto/segundo para início do dia (evita magic numbers). */
const START_OF_DAY_HOUR = 0
const START_OF_DAY_MINUTE = 0
const START_OF_DAY_SECOND = 0
const START_OF_DAY_MS = 0

/** Hora/minuto/segundo/ms para fim do dia. */
const END_OF_DAY_HOUR = 23
const END_OF_DAY_MINUTE = 59
const END_OF_DAY_SECOND = 59
const END_OF_DAY_MS = 999

/** Regex para formato ISO date YYYY-MM-DD. */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export type DateRangeSuccess = { ok: true; start: Date; end: Date }
export type DateRangeValidationError = { ok: false; message: string }
export type DateRangeResult = DateRangeSuccess | DateRangeValidationError

/**
 * Normaliza uma data para o início do dia (00:00:00.000) em horário local.
 * Usado para consistência em queries e evitar diferenças de fuso.
 */
export function toStartOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    START_OF_DAY_HOUR,
    START_OF_DAY_MINUTE,
    START_OF_DAY_SECOND,
    START_OF_DAY_MS
  )
}

/**
 * Normaliza uma data para o fim do dia (23:59:59.999) em horário local.
 * Consistente com timeSeries (getDateRange / endDay).
 */
export function toEndOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    END_OF_DAY_HOUR,
    END_OF_DAY_MINUTE,
    END_OF_DAY_SECOND,
    END_OF_DAY_MS
  )
}

/**
 * Valida se a string está no formato ISO date (YYYY-MM-DD) e retorna Date ou null.
 */
function parseISODate(value: string): Date | null {
  if (!ISO_DATE_REGEX.test(value)) return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Resolve o intervalo de datas a partir da URL (query params).
 * Se start_date e end_date estiverem presentes e válidos, usa esse intervalo;
 * caso contrário, usa period (últimos N dias).
 *
 * @param url - URL da requisição (query params: start_date, end_date, period)
 * @param periodParam - Valor do query param period (ex: '7d', '30d', '90d')
 * @returns Result com { start, end } normalizados (início/fim do dia) ou erro de validação com mensagem amigável para resposta 400
 *
 * @example
 * // Custom range
 * const result = getDateRangeFromRequest(url, '30d')
 * if (!result.ok) return errorResponse(result.message, 400)
 * const { start, end } = result
 *
 * @example
 * // Fallback por period
 * const result = getDateRangeFromRequest(new URL('https://x/dashboard?period=7d'), '7d')
 * if (result.ok) { ... result.start ... result.end }
 */
export function getDateRangeFromRequest(
  url: URL,
  periodParam: string
): DateRangeResult {
  const startParam = url.searchParams.get('start_date')
  const endParam = url.searchParams.get('end_date')

  const hasCustomRange = startParam !== null && startParam !== '' && endParam !== null && endParam !== ''

  if (hasCustomRange && startParam !== null && endParam !== null) {
    const startDate = parseISODate(startParam)
    const endDate = parseISODate(endParam)

    if (!startDate) {
      console.error('[dateRange] Invalid start_date format:', startParam)
      return { ok: false, message: 'Data inicial inválida. Use o formato AAAA-MM-DD.' }
    }
    if (!endDate) {
      console.error('[dateRange] Invalid end_date format:', endParam)
      return { ok: false, message: 'Data final inválida. Use o formato AAAA-MM-DD.' }
    }
    if (startDate.getTime() > endDate.getTime()) {
      console.error('[dateRange] start_date after end_date:', { startParam, endParam })
      return { ok: false, message: 'A data inicial deve ser anterior ou igual à data final.' }
    }

    return {
      ok: true,
      start: toStartOfDay(startDate),
      end: toEndOfDay(endDate)
    }
  }

  const now = new Date()
  const periodDays = parseInt(periodParam.replace('d', ''), 10) || 30
  const end = toEndOfDay(now)
  const start = toStartOfDay(
    new Date(now.getTime() - Math.max(0, periodDays - 1) * 24 * 60 * 60 * 1000)
  )

  return { ok: true, start, end }
}
