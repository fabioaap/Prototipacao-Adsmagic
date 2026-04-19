/**
 * Handler para drill-down de entidades (GET /dashboard/drill-down)
 * 
 * Retorna entidades (contatos ou vendas) filtradas por critérios para análise detalhada:
 * - Filtros por origem, estágio, período, etc.
 * - Suporta paginação
 * - Retorna dados agregados se necessário
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import type { SupabaseDbClient } from '../types-db.ts'

interface DrillDownFilters {
  entityType: 'contacts' | 'sales' // Tipo de entidade para filtrar
  originId?: string // Filtrar por origem
  stageId?: string // Filtrar por estágio
  period?: string // Período (ex: '30d')
  dateFrom?: string // Data inicial (ISO)
  dateTo?: string // Data final (ISO)
  limit?: number // Limite de resultados (padrão: 50)
  offset?: number // Offset para paginação (padrão: 0)
  search?: string // Busca por nome/telefone
}

interface DrillDownResponse {
  data: Array<Record<string, unknown>>
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Busca contatos com filtros
 */
async function fetchContacts(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  filters: DrillDownFilters
): Promise<{ data: Array<Record<string, unknown>>; total: number }> {
  const limit = filters.limit || 50
  const offset = filters.offset || 0

  // Calcular período
  let dateFrom: Date | null = null
  let dateTo: Date | null = null

  if (filters.period) {
    const periodDays = parseInt(filters.period.replace('d', ''), 10) || 30
    dateTo = new Date()
    dateFrom = new Date(dateTo.getTime() - periodDays * 24 * 60 * 60 * 1000)
  } else if (filters.dateFrom || filters.dateTo) {
    dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null
    dateTo = filters.dateTo ? new Date(filters.dateTo) : null
  }

  // Construir query
  let query = supabaseClient
    .from('contacts')
    .select(`
      id,
      name,
      phone,
      email,
      current_stage_id,
      main_origin_id,
      created_at,
      origins:main_origin_id(name),
      stages:current_stage_id(name)
    `, { count: 'exact' })
    .eq('project_id', projectId)

  // Aplicar filtros
  if (filters.originId) {
    query = query.eq('main_origin_id', filters.originId)
  }

  if (filters.stageId) {
    query = query.eq('current_stage_id', filters.stageId)
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom.toISOString())
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo.toISOString())
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
  }

  // Aplicar paginação
  query = query.order('created_at', { ascending: false })
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('[Drill Down] Error fetching contacts:', error)
    throw error
  }

  return {
    data: (data as Array<Record<string, unknown>>) || [],
    total: count || 0
  }
}

/**
 * Busca vendas com filtros
 */
async function fetchSales(
  supabaseClient: SupabaseDbClient,
  projectId: string,
  filters: DrillDownFilters
): Promise<{ data: Array<Record<string, unknown>>; total: number }> {
  const limit = filters.limit || 50
  const offset = filters.offset || 0

  // Calcular período
  let dateFrom: Date | null = null
  let dateTo: Date | null = null

  if (filters.period) {
    const periodDays = parseInt(filters.period.replace('d', ''), 10) || 30
    dateTo = new Date()
    dateFrom = new Date(dateTo.getTime() - periodDays * 24 * 60 * 60 * 1000)
  } else if (filters.dateFrom || filters.dateTo) {
    dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null
    dateTo = filters.dateTo ? new Date(filters.dateTo) : null
  }

  // Construir query
  let query = supabaseClient
    .from('sales')
    .select(`
      id,
      value,
      currency,
      date,
      status,
      contact_id,
      origin_id,
      contacts!inner(
        id,
        name,
        phone,
        current_stage_id,
        main_origin_id,
        origins:main_origin_id(name),
        stages:current_stage_id(name)
      ),
      origins:origin_id(name)
    `, { count: 'exact' })
    .eq('project_id', projectId)

  // Aplicar filtros
  if (filters.originId) {
    // Filtrar por origin_id da venda ou origin_id do contato
    query = query.or(`origin_id.eq.${filters.originId},contacts.main_origin_id.eq.${filters.originId}`)
  }

  if (filters.stageId) {
    // Filtrar por estágio do contato
    query = query.eq('contacts.current_stage_id', filters.stageId)
  }

  if (dateFrom) {
    query = query.gte('date', dateFrom.toISOString())
  }

  if (dateTo) {
    query = query.lte('date', dateTo.toISOString())
  }

  // Aplicar paginação
  query = query.order('date', { ascending: false })
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('[Drill Down] Error fetching sales:', error)
    throw error
  }

  return {
    data: (data as Array<Record<string, unknown>>) || [],
    total: count || 0
  }
}

export async function handleDrillDown(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    const url = new URL(req.url)
    const projectId = req.headers.get('x-project-id')
    
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    // Parse query parameters
    const filters: DrillDownFilters = {
      entityType: (url.searchParams.get('entityType') || 'contacts') as 'contacts' | 'sales',
      originId: url.searchParams.get('originId') || undefined,
      stageId: url.searchParams.get('stageId') || undefined,
      period: url.searchParams.get('period') || '30d',
      dateFrom: url.searchParams.get('dateFrom') || undefined,
      dateTo: url.searchParams.get('dateTo') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '50', 10),
      offset: parseInt(url.searchParams.get('offset') || '0', 10),
      search: url.searchParams.get('search') || undefined
    }

    // Validar entityType
    if (filters.entityType !== 'contacts' && filters.entityType !== 'sales') {
      return errorResponse('Invalid entityType. Must be "contacts" or "sales"', 400)
    }

    // Buscar dados conforme tipo
    let result: { data: Array<Record<string, unknown>>; total: number }

    if (filters.entityType === 'contacts') {
      result = await fetchContacts(supabaseClient, projectId, filters)
    } else {
      result = await fetchSales(supabaseClient, projectId, filters)
    }

    const limit = filters.limit || 50
    const offset = filters.offset || 0
    const hasMore = (offset + limit) < result.total

    const response: DrillDownResponse = {
      data: result.data,
      meta: {
        total: result.total,
        limit,
        offset,
        hasMore
      }
    }

    console.log('[Dashboard Drill Down]', {
      projectId,
      entityType: filters.entityType,
      filters: {
        originId: filters.originId,
        stageId: filters.stageId,
        period: filters.period
      },
      total: result.total,
      returned: result.data.length
    })

    return successResponse(response, 200)
  } catch (error) {
    console.error('[Dashboard Drill Down Error]', error)
    return errorResponse('Failed to fetch drill-down data', 500)
  }
}
