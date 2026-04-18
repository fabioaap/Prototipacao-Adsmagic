/**
 * Handler para métricas do dashboard (GET /dashboard/metrics)
 * 
 * Retorna métricas agregadas do projeto
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export async function handleMetrics(
  req: Request,
  supabaseClient: SupabaseDbClient
) {
  try {
    // Parse query parameters
    const url = new URL(req.url)
    const period = url.searchParams.get('period') || '30d'

    // Obter projectId do header (definido pelo apiClient)
    const projectId = req.headers.get('x-project-id')
    
    if (!projectId) {
      return errorResponse('Project ID is required', 400)
    }

    // TODO: Implementar lógica real de cálculo de métricas
    // Por enquanto, retornar estrutura vazia para evitar erros
    const metrics = {
      totalRevenue: 0,
      totalSales: 0,
      totalContacts: 0,
      roi: {
        current: 0,
        change: 0
      },
      revenueGrowth: 0,
      salesGrowth: 0,
      contactsGrowth: 0
    }

    console.log('[Dashboard Metrics]', { projectId, period, metrics })

    return successResponse(metrics, 200)
  } catch (error) {
    console.error('[Dashboard Metrics Error]', error)
    return errorResponse('Failed to fetch metrics', 500)
  }
}

