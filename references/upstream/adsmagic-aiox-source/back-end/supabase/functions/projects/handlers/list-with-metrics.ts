/**
 * Handler para listagem de projetos com métricas (GET /projects?with_metrics=true)
 *
 * Lista projetos do usuário com métricas calculadas:
 * - revenue: Soma de vendas com status 'completed'
 * - contacts_count: Total de contatos
 * - sales_count: Total de vendas com status 'completed'
 * - conversion_rate: (sales_count / contacts_count) * 100
 * - average_ticket: revenue / sales_count
 * - investment: Investimento em ads (Meta/Google) via getAdMetricsForDashboard
 * - impressions, clicks: Métricas de tráfego das integrações de ads
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { listProjectsQuerySchema, extractValidationErrors } from '../validators/project.ts'
import type { ProjectWithMetrics, ProjectsListResponse } from '../types.ts'
import { getAdMetricsForDashboard } from '../../dashboard/services/ad-metrics.ts'
import { toStartOfDay, toEndOfDay } from '../../dashboard/utils/dateRange.ts'
import type { SupabaseDbClient } from '../types-db.ts'

type DateRange = { start: Date; end: Date }

/**
 * Calcula métricas para um projeto específico.
 * Quando dateRange é informado, métricas são calculadas apenas no período (contacts por created_at, sales por date).
 */
async function calculateProjectMetrics(
  projectId: string,
  supabaseClient: SupabaseDbClient,
  dateRange?: DateRange
): Promise<{
  revenue: number
  contacts_count: number
  sales_count: number
  conversion_rate: number
  average_ticket: number
}> {
  const startISO = dateRange?.start.toISOString()
  const endISO = dateRange?.end.toISOString()

  let contactsQuery = supabaseClient
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
  if (startISO && endISO) {
    contactsQuery = contactsQuery.gte('created_at', startISO).lte('created_at', endISO)
  }
  const { count: contactsCount, error: contactsError } = await contactsQuery

  if (contactsError) {
    console.error('[Calculate Metrics - Contacts Error]', contactsError)
  }

  let salesQuery = supabaseClient
    .from('sales')
    .select('id, value')
    .eq('project_id', projectId)
    .eq('status', 'completed')
  if (startISO && endISO) {
    salesQuery = salesQuery.gte('date', startISO).lte('date', endISO)
  }
  const { data: salesData, error: salesError } = await salesQuery

  if (salesError) {
    console.error('[Calculate Metrics - Sales Error]', salesError)
    // Em caso de erro, retornar métricas zeradas
    return {
      revenue: 0,
      contacts_count: contactsCount || 0,
      sales_count: 0,
      conversion_rate: 0,
      average_ticket: 0
    }
  }

  const salesCount = salesData?.length || 0
  const revenue = salesData?.reduce((sum, sale) => sum + Number(sale.value || 0), 0) || 0
  const totalContactsCount = contactsCount || 0
  const conversionRate = totalContactsCount > 0 ? (salesCount / totalContactsCount) * 100 : 0
  const averageTicket = salesCount > 0 ? revenue / salesCount : 0

  return {
    revenue: Math.round(revenue * 100) / 100, // 2 casas decimais
    contacts_count: totalContactsCount,
    sales_count: salesCount,
    conversion_rate: Math.round(conversionRate * 100) / 100, // 2 casas decimais
    average_ticket: Math.round(averageTicket * 100) / 100 // 2 casas decimais
  }
}

/**
 * Lista projetos do usuário com métricas calculadas
 */
export async function handleListWithMetrics(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    // Parse query parameters
    const url = new URL(req.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Validação dos query parameters
    const validationResult = listProjectsQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { status, search, sort = 'created_at', limit = 50, offset = 0, start_date, end_date } = validationResult.data

    let metricsDateRange: DateRange | undefined
    let adsStartDate: Date
    let adsEndDate: Date

    if (start_date && end_date) {
      const start = toStartOfDay(new Date(start_date))
      const end = toEndOfDay(new Date(end_date))
      metricsDateRange = { start, end }
      adsStartDate = start
      adsEndDate = end
    } else {
      adsEndDate = new Date()
      adsStartDate = new Date()
      adsStartDate.setDate(adsStartDate.getDate() - 30)
    }

    // Construir query base (RLS automaticamente filtra por empresa do usuário)
    let query = supabaseClient
      .from('projects')
      .select(`
        id,
        company_id,
        created_by,
        name,
        description,
        company_type,
        franchise_count,
        country,
        language,
        currency,
        timezone,
        attribution_model,
        whatsapp_connected,
        meta_ads_connected,
        google_ads_connected,
        tiktok_ads_connected,
        status,
        wizard_progress,
        wizard_current_step,
        wizard_completed_at,
        created_at,
        updated_at
      `, { count: 'exact' })

    // Aplicar filtro de status
    if (status) {
      query = query.eq('status', status)
    }

    // Aplicar filtro de pesquisa (busca case-insensitive em name e description)
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Aplicar ordenação dinâmica
    switch (sort) {
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'name_desc':
        query = query.order('name', { ascending: false })
        break
      case 'created_at':
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: projects, error, count } = await query

    if (error) {
      console.error('[List Projects with Metrics Error]', error)
      return errorResponse('Failed to fetch projects', 500)
    }

    // Calcular métricas base e de ads para cada projeto em paralelo
    const projectsWithMetrics = await Promise.all(
      (projects || []).map(async (project) => {
        const [baseMetrics, adMetrics] = await Promise.all([
          calculateProjectMetrics(project.id, supabaseClient, metricsDateRange),
          getAdMetricsForDashboard(supabaseClient, project.id, adsStartDate, adsEndDate)
        ])
        return {
          ...project,
          ...baseMetrics,
          investment: adMetrics.spend,
          impressions: adMetrics.impressions,
          clicks: adMetrics.clicks
        } as ProjectWithMetrics
      })
    )

    const response: ProjectsListResponse = {
      data: projectsWithMetrics,
      meta: {
        total: count || 0,
        limit,
        offset
      }
    }

    console.log('[List Projects with Metrics Success]', {
      count: projectsWithMetrics.length,
      total: count,
      filters: { status, search, sort, limit, offset, start_date, end_date }
    })

    return successResponse(response, 200)

  } catch (error) {
    console.error('[List Projects with Metrics Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
