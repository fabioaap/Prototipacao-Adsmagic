/**
 * Handler para breakdown de performance por origem (GET /dashboard/origin-breakdown)
 *
 * Query params: period (ex: 7d, 30d, 90d); opcionalmente start_date e end_date (YYYY-MM-DD).
 * Se start_date e end_date forem fornecidos, usa esse intervalo; caso contrário, usa period.
 *
 * Retorna performance detalhada por origem:
 * - Spend (investimento)
 * - Contacts (contatos gerados)
 * - Sales (vendas geradas)
 * - Conversion Rate (taxa de conversão)
 * - CAC (Custo de Aquisição de Cliente)
 * - ROI (Retorno sobre Investimento)
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { getDateRangeFromRequest } from '../utils/dateRange.ts'
import { getAdMetricsPerPlatform } from '../services/ad-metrics.ts'
import type { SupabaseDbClient } from '../types-db.ts'

interface OriginBreakdown {
  originId: string
  originName: string
  originType: string
  spend: number // Investimento (vem das integrações de ads)
  contacts: number // Contatos gerados
  sales: number // Vendas geradas
  revenue: number // Receita gerada
  conversionRate: number // Taxa de conversão (contacts -> sales)
  cac: number // Custo de Aquisição de Cliente (spend / contacts)
  roi: number // Retorno sobre Investimento ((revenue - spend) / spend) * 100
}

/**
 * Calcula breakdown de performance por origem
 */
export async function handleOriginBreakdown(
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
    const { start: startDate, end: endDate } = dateRangeResult

    // Buscar origens do projeto (system + custom)
    const { data: origins, error: originsError } = await supabaseClient
      .from('origins')
      .select('id, name, type')
      .or(`project_id.is.null,project_id.eq.${projectId}`)
      .or('is_active.eq.true,is_active.is.null')

    if (originsError) {
      console.error('[Origin Breakdown] Error fetching origins:', originsError)
      return errorResponse('Failed to fetch origins', 500)
    }

    if (!origins || origins.length === 0) {
      return successResponse([], 200)
    }

    // Buscar contatos por origem (criados no período)
    const { data: contacts, error: contactsError } = await supabaseClient
      .from('contacts')
      .select('id, main_origin_id, created_at')
      .eq('project_id', projectId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (contactsError) {
      console.error('[Origin Breakdown] Error fetching contacts:', contactsError)
      return errorResponse('Failed to fetch contacts', 500)
    }

    // Buscar vendas por origem (via contatos ou origin_id direto)
    const { data: sales, error: salesError } = await supabaseClient
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
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())

    if (salesError) {
      console.error('[Origin Breakdown] Error fetching sales:', salesError)
    }

    // Agrupar vendas por origem (via contato, com fallback para sale.origin_id)
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

    // Agrupar contatos por origem
    const contactsByOrigin: Record<string, number> = {}
    for (const contact of contacts || []) {
      if (contact.main_origin_id) {
        contactsByOrigin[contact.main_origin_id] = (contactsByOrigin[contact.main_origin_id] || 0) + 1
      }
    }

    // Buscar spend real das integrações de ads, agrupado por plataforma→origem
    const adMetricsByPlatform = await getAdMetricsPerPlatform(supabaseClient, projectId, startDate, endDate)

    // Mapear spend por origin ID (usando nome da origem para match)
    const spendByOrigin: Record<string, number> = {}
    for (const origin of origins) {
      const platformMetrics = adMetricsByPlatform[origin.name]
      spendByOrigin[origin.id] = platformMetrics?.spend ?? 0
    }

    // Calcular breakdown por origem
    const breakdown: OriginBreakdown[] = []

    for (const origin of origins) {
      const originId = origin.id
      const contacts = contactsByOrigin[originId] || 0
      const sales = salesByOrigin[originId]?.count || 0
      const revenue = salesByOrigin[originId]?.revenue || 0
      const spend = spendByOrigin[originId] || 0

      const conversionRate = contacts > 0 ? (sales / contacts) * 100 : 0
      const cac = contacts > 0 ? spend / contacts : 0
      const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0

      breakdown.push({
        originId,
        originName: origin.name,
        originType: origin.type || 'custom',
        spend,
        contacts,
        sales,
        revenue,
        conversionRate,
        cac,
        roi
      })
    }

    // Filtrar origens sem atividade e ordenar por revenue (decrescente)
    const filteredBreakdown = breakdown.filter(row =>
      row.contacts > 0 || row.sales > 0 || row.spend > 0
    )
    filteredBreakdown.sort((a, b) => b.revenue - a.revenue)

    console.log('[Dashboard Origin Breakdown]', {
      projectId,
      period: periodParam,
      originsCount: filteredBreakdown.length,
      totalContacts: filteredBreakdown.reduce((sum, o) => sum + o.contacts, 0),
      totalSales: filteredBreakdown.reduce((sum, o) => sum + o.sales, 0),
      totalRevenue: filteredBreakdown.reduce((sum, o) => sum + o.revenue, 0)
    })

    return successResponse(filteredBreakdown, 200)
  } catch (error) {
    console.error('[Dashboard Origin Breakdown Error]', error)
    return errorResponse('Failed to fetch origin breakdown', 500)
  }
}
