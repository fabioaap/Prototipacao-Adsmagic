/**
 * Handler para performance por origem (GET /dashboard/origin-performance)
 *
 * Query params: period (ex: 7d, 30d, 90d); opcionalmente start_date e end_date (YYYY-MM-DD).
 * Se start_date e end_date forem fornecidos, usa esse intervalo; caso contrário, usa period.
 * Retorna 400 se start_date/end_date forem inválidos (formato ou start > end).
 *
 * Retorna dados de performance agrupados por origem (contatos e vendas no período).
 * Formato compatível com o front (adapter mapeia para OriginPerformance).
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { getDateRangeFromRequest } from '../utils/dateRange.ts'
import { getAdMetricsPerPlatform } from '../services/ad-metrics.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export interface BackendOriginPerformanceRow {
  originId: string
  originName: string
  originType: string
  spend: number
  contacts: number
  sales: number
  revenue: number
  conversionRate: number
  cac: number
  roi: number
}

export async function handleOriginPerformance(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    const url = new URL(req.url)
    const periodParam = url.searchParams.get('period') || '30d'

    const projectId = req.headers.get('x-project-id')
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    const dateRangeResult = getDateRangeFromRequest(url, periodParam)
    if (!dateRangeResult.ok) {
      return errorResponse(dateRangeResult.message, 400)
    }
    const { start, end } = dateRangeResult
    const startISO = start.toISOString()
    const endISO = end.toISOString()

    const originId = url.searchParams.get('origin') || null

    let originsQuery = supabaseClient
      .from('origins')
      .select('id, name, type')
      .or(`project_id.is.null,project_id.eq.${projectId}`)
      .or('is_active.eq.true,is_active.is.null')

    if (originId && originId !== 'all') {
      originsQuery = originsQuery.eq('id', originId)
    }

    const { data: origins, error: originsError } = await originsQuery

    if (originsError) {
      console.error('[Dashboard Origin Performance] Error fetching origins:', originsError)
      return errorResponse('Failed to fetch origins', 500)
    }

    if (!origins || origins.length === 0) {
      return successResponse([], 200)
    }

    // Paralelizar contacts, sales e ad metrics (independentes entre si)
    const [contactsResult, salesResult, adMetricsByPlatform] = await Promise.all([
      supabaseClient
        .from('contacts')
        .select('id, main_origin_id, created_at')
        .eq('project_id', projectId)
        .gte('created_at', startISO)
        .lte('created_at', endISO),
      supabaseClient
        .from('sales')
        .select(`
          id,
          value,
          origin_id,
          contact_id,
          status,
          contacts(main_origin_id)
        `)
        .eq('project_id', projectId)
        .eq('status', 'completed')
        .gte('date', startISO)
        .lte('date', endISO),
      getAdMetricsPerPlatform(supabaseClient, projectId, start, end),
    ])

    const { data: contacts, error: contactsError } = contactsResult
    if (contactsError) {
      console.error('[Dashboard Origin Performance] Error fetching contacts:', contactsError)
      return errorResponse('Failed to fetch contacts', 500)
    }

    const { data: sales, error: salesError } = salesResult
    if (salesError) {
      console.error('[Dashboard Origin Performance] Error fetching sales:', salesError)
    }

    const salesByOrigin: Record<string, { count: number; revenue: number }> = {}
    for (const sale of sales || []) {
      const contact = Array.isArray(sale.contacts) ? sale.contacts[0] : sale.contacts
      const originId = contact?.main_origin_id || sale.origin_id

      if (originId) {
        if (!salesByOrigin[originId]) {
          salesByOrigin[originId] = { count: 0, revenue: 0 }
        }
        salesByOrigin[originId].count++
        salesByOrigin[originId].revenue += Number(sale.value || 0)
      }
    }

    const contactsByOrigin: Record<string, number> = {}
    for (const contact of contacts || []) {
      if (contact.main_origin_id) {
        contactsByOrigin[contact.main_origin_id] =
          (contactsByOrigin[contact.main_origin_id] || 0) + 1
      }
    }

    // Mapear spend por origin ID (usando nome da origem para match)
    const spendByOrigin: Record<string, number> = {}
    for (const origin of origins) {
      const platformMetrics = adMetricsByPlatform[origin.name]
      spendByOrigin[origin.id] = platformMetrics?.spend ?? 0
    }

    const result: BackendOriginPerformanceRow[] = []

    for (const origin of origins) {
      const originId = origin.id
      const contactsCount = contactsByOrigin[originId] || 0
      const salesCount = salesByOrigin[originId]?.count || 0
      const revenue = salesByOrigin[originId]?.revenue || 0
      const spend = spendByOrigin[originId] || 0

      const conversionRate = contactsCount > 0 ? (salesCount / contactsCount) * 100 : 0
      const cac = salesCount > 0 ? spend / salesCount : 0
      const roi = spend > 0 ? revenue / spend : 0

      result.push({
        originId,
        originName: origin.name,
        originType: origin.type || 'custom',
        spend,
        contacts: contactsCount,
        sales: salesCount,
        revenue,
        conversionRate,
        cac,
        roi
      })
    }

    const filteredResult = result.filter(row =>
      row.contacts > 0 || row.sales > 0 || row.spend > 0
    )
    filteredResult.sort((a, b) => b.revenue - a.revenue)

    console.log('[Dashboard Origin Performance]', {
      projectId,
      period: periodParam,
      originsCount: filteredResult.length,
      totalContacts: filteredResult.reduce((sum, o) => sum + o.contacts, 0),
      totalSales: filteredResult.reduce((sum, o) => sum + o.sales, 0),
      totalRevenue: filteredResult.reduce((sum, o) => sum + o.revenue, 0)
    })

    return successResponse(filteredResult, 200)
  } catch (error) {
    console.error('[Dashboard Origin Performance Error]', error)
    return errorResponse('Failed to fetch origin performance data', 500)
  }
}
