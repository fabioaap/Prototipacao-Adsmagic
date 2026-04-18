/**
 * Handler para dados de série temporal (GET /dashboard/time-series)
 *
 * Retorna evolução diária de contacts, sales e revenue no período,
 * filtrada por project_id. Formato alinhado ao front (TimeSeriesPoint).
 */

import type { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse } from '../utils/response.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export interface TimeSeriesDay {
  date: string
  contacts: number
  sales: number
  revenue: number
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0] ?? ''
}

/**
 * Gera intervalo [start, end] em dias (inclusive).
 */
function getDateRange(period: string, startParam: string | null, endParam: string | null): {
  start: Date
  end: Date
} {
  const now = new Date()
  const end = endParam ? new Date(endParam) : now
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)

  let start: Date
  if (startParam) {
    start = new Date(startParam)
  } else {
    const days = parseInt(period.replace('d', ''), 10) || 30
    start = new Date(now)
    start.setDate(start.getDate() - Math.max(0, days - 1))
  }
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0)

  return { start: startDay, end: endDay }
}

/**
 * Itera sobre cada dia no intervalo [start, end] (inclusive).
 */
function* iterateDays(start: Date, end: Date): Generator<string> {
  const cur = new Date(start)
  const endTime = end.getTime()
  while (cur.getTime() <= endTime) {
    yield toISODate(cur)
    cur.setDate(cur.getDate() + 1)
  }
}

export async function handleTimeSeries(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    const url = new URL(req.url)
    const period = url.searchParams.get('period') || '30d'
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')

    const projectId = req.headers.get('x-project-id')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const { start, end } = getDateRange(period, startDate, endDate)
    const startISO = start.toISOString()
    const endISO = end.toISOString()

    const [contactsRes, salesRes] = await Promise.all([
      supabaseClient
        .from('contacts')
        .select('id, created_at')
        .eq('project_id', projectId)
        .gte('created_at', startISO)
        .lte('created_at', endISO),
      supabaseClient
        .from('sales')
        .select('id, value, date')
        .eq('project_id', projectId)
        .eq('status', 'completed')
        .gte('date', startISO)
        .lte('date', endISO)
    ])

    if (contactsRes.error) {
      console.error('[Dashboard Time Series] Error fetching contacts:', contactsRes.error)
      return errorResponse('Failed to fetch contacts for time series', 500)
    }
    if (salesRes.error) {
      console.error('[Dashboard Time Series] Error fetching sales:', salesRes.error)
      return errorResponse('Failed to fetch sales for time series', 500)
    }

    const contactsByDay: Record<string, number> = {}
    for (const c of contactsRes.data ?? []) {
      const created = c?.created_at
      if (!created) continue
      const day = toISODate(new Date(created))
      contactsByDay[day] = (contactsByDay[day] ?? 0) + 1
    }

    const salesByDay: Record<string, { count: number; revenue: number }> = {}
    for (const s of salesRes.data ?? []) {
      const day = s?.date ? toISODate(new Date(s.date)) : null
      if (!day) continue
      if (!salesByDay[day]) salesByDay[day] = { count: 0, revenue: 0 }
      salesByDay[day].count += 1
      salesByDay[day].revenue += Number(s?.value ?? 0)
    }

    const timeSeries: TimeSeriesDay[] = []
    for (const date of iterateDays(start, end)) {
      const s = salesByDay[date]
      timeSeries.push({
        date,
        contacts: contactsByDay[date] ?? 0,
        sales: s?.count ?? 0,
        revenue: s?.revenue ?? 0
      })
    }

    console.log('[Dashboard Time Series]', {
      projectId,
      period,
      start: startISO,
      end: endISO,
      dataPoints: timeSeries.length
    })

    return successResponse(timeSeries, 200)
  } catch (err) {
    console.error('[Dashboard Time Series Error]', err)
    return errorResponse('Failed to fetch time series data', 500)
  }
}
