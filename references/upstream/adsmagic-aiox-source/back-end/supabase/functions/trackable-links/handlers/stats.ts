/**
 * Handler para estatísticas de links (GET /trackable-links/:id/stats)
 * 
 * Retorna estatísticas detalhadas de um link
 * 
 * @module trackable-links/handlers/stats
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/link.ts'
import type { LinkStats } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Obtém estatísticas detalhadas de um link
 */
export async function handleStats(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  linkId: string
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Validar UUID
    if (!validateUUID(linkId)) {
      return errorResponse('Invalid link ID format', 400)
    }

    console.log('[Link Stats] Fetching stats:', { linkId, userId: user.id })

    // Buscar link para obter contadores básicos
    const { data: link, error: linkError } = await supabaseClient
      .from('trackable_links')
      .select('id, clicks_count, contacts_count, sales_count, revenue')
      .eq('id', linkId)
      .single()

    if (linkError) {
      if (linkError.code === 'PGRST116') {
        return errorResponse('Link not found', 404)
      }
      return errorResponse(`Failed to fetch link: ${linkError.message}`, 500)
    }

    // Calcular métricas derivadas
    const conversionRate = link.clicks_count > 0 
      ? (link.contacts_count / link.clicks_count) * 100 
      : 0
    const avgTicket = link.sales_count > 0 
      ? link.revenue / link.sales_count 
      : 0

    // Buscar acessos por dia (últimos 30 dias)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: accessesByDay, error: accessesByDayError } = await supabaseClient
      .rpc('get_link_accesses_by_day', { 
        p_link_id: linkId, 
        p_start_date: thirtyDaysAgo.toISOString() 
      })

    // Se a RPC não existir, fazer query manual
    let accessesByDayData: Array<{ date: string; count: number }> = []
    if (accessesByDayError) {
      console.warn('[Link Stats] RPC not available, using manual query')
      // Query manual simplificada
      const { data: accesses } = await supabaseClient
        .from('link_accesses')
        .select('created_at')
        .eq('link_id', linkId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (accesses) {
        // Agrupar por dia manualmente
        const dayMap = new Map<string, number>()
        accesses.forEach(access => {
          const date = access.created_at.split('T')[0]
          dayMap.set(date, (dayMap.get(date) || 0) + 1)
        })
        accessesByDayData = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }))
      }
    } else {
      accessesByDayData = accessesByDay || []
    }

    // Buscar acessos por dispositivo
    const { data: accessesByDevice } = await supabaseClient
      .from('link_accesses')
      .select('device')
      .eq('link_id', linkId)
      .not('device', 'is', null)

    const deviceMap = new Map<string, number>()
    accessesByDevice?.forEach(access => {
      const device = access.device || 'unknown'
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })
    const accessesByDeviceData = Array.from(deviceMap.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)

    // Buscar acessos por país
    const { data: accessesByCountry } = await supabaseClient
      .from('link_accesses')
      .select('country')
      .eq('link_id', linkId)
      .not('country', 'is', null)

    const countryMap = new Map<string, number>()
    accessesByCountry?.forEach(access => {
      const country = access.country || 'unknown'
      countryMap.set(country, (countryMap.get(country) || 0) + 1)
    })
    const accessesByCountryData = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 países

    // Buscar top UTM sources
    const { data: accessesByUtm } = await supabaseClient
      .from('link_accesses')
      .select('utm_source')
      .eq('link_id', linkId)
      .not('utm_source', 'is', null)

    const utmMap = new Map<string, number>()
    accessesByUtm?.forEach(access => {
      const utmSource = access.utm_source || 'direct'
      utmMap.set(utmSource, (utmMap.get(utmSource) || 0) + 1)
    })
    const topUtmSources = Array.from(utmMap.entries())
      .map(([utm_source, count]) => ({ utm_source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 UTM sources

    const stats: LinkStats = {
      link_id: linkId,
      clicks_count: link.clicks_count,
      contacts_count: link.contacts_count,
      sales_count: link.sales_count,
      revenue: link.revenue,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      avg_ticket: Math.round(avgTicket * 100) / 100,
      accesses_by_day: accessesByDayData,
      accesses_by_device: accessesByDeviceData,
      accesses_by_country: accessesByCountryData,
      top_utm_sources: topUtmSources
    }

    console.log('[Link Stats Success]', { linkId, stats: { ...stats, accesses_by_day: `${stats.accesses_by_day.length} days` } })

    return successResponse(stats)

  } catch (error) {
    console.error('[Link Stats Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
