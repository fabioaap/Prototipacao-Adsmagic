/**
 * Handler para obter atividades de um contato (GET /contacts/:id/activities)
 * 
 * Retorna o histórico de atividades de um contato específico
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/contact.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Obtém atividades de um contato
 * 
 * Busca atividades do banco de dados e converte de snake_case para camelCase
 */
export async function handleGetActivities(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  contactId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(contactId)) {
      return errorResponse('Invalid contact ID format', 400)
    }

    // Verificar se o contato existe e o usuário tem acesso (RLS)
    const { data: contact, error: contactError } = await supabaseClient
      .from('contacts')
      .select('id, project_id')
      .eq('id', contactId)
      .single()

    if (contactError) {
      console.error('[Get Activities - Contact Check Error]', contactError)
      
      if (contactError.code === 'PGRST116') {
        return errorResponse('Contact not found', 404)
      }
      
      if (contactError.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse('Failed to verify contact access', 500)
    }

    // Parse query parameters
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)
    const typesParam = url.searchParams.get('types')

    // Validar parâmetros
    if (limit < 1 || limit > 100) {
      return errorResponse('Invalid limit: must be between 1 and 100', 400)
    }

    if (offset < 0) {
      return errorResponse('Invalid offset: must be >= 0', 400)
    }

    // Construir query
    let query = supabaseClient
      .from('contact_activities')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtrar por tipos se especificado
    if (typesParam) {
      const types = typesParam.split(',').map(t => t.trim()).filter(Boolean)
      if (types.length > 0) {
        query = query.in('type', types)
      }
    }

    // Buscar atividades do banco
    const { data: activitiesData, error: activitiesError } = await query

    if (activitiesError) {
      console.error('[Get Activities - Database Error]', activitiesError)
      return errorResponse('Failed to fetch activities', 500)
    }

    // Converter de snake_case (banco) para camelCase (frontend)
    const activities = (activitiesData || []).map((activity: {
      id: string
      contact_id: string
      project_id: string
      type: string
      title: string
      description: string | null
      metadata: unknown
      performed_by: string | null
      performed_by_name: string | null
      created_at: string
    }) => ({
      id: activity.id,
      contactId: activity.contact_id,
      projectId: activity.project_id,
      type: activity.type,
      title: activity.title,
      description: activity.description || undefined,
      metadata: activity.metadata || {},
      performedBy: activity.performed_by || undefined,
      performedByName: activity.performed_by_name || undefined,
      createdAt: activity.created_at
    }))

    console.log('[Get Activities Success]', { 
      contactId, 
      activitiesCount: activities.length,
      limit,
      offset 
    })

    return successResponse(activities, 200)

  } catch (error) {
    console.error('[Get Activities Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
