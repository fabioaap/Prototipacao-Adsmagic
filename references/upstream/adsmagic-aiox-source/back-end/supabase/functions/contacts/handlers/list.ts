/**
 * Handler para listagem de contatos (GET /contacts)
 * 
 * Lista contatos com filtros opcionais e busca full-text
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { listContactsQuerySchema, extractValidationErrors } from '../validators/contact.ts'
import type { Contact, ContactsListResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Lista contatos do usuário
 */
export async function handleList(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Parse query parameters
    const url = new URL(req.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Validação dos query parameters
    const validationResult = listContactsQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { 
      project_id, 
      search, 
      origin_id, 
      stage_id, 
      tag_ids,
      is_favorite, 
      sort = 'created_at', 
      limit = 50, 
      offset = 0 
    } = validationResult.data

    // Construir query base (RLS automaticamente filtra por projeto do usuário)
    let query = supabaseClient
      .from('contacts')
      .select(`
        id,
        project_id,
        name,
        phone,
        country_code,
        email,
        company,
        location,
        notes,
        avatar_url,
        is_favorite,
        main_origin_id,
        current_stage_id,
        metadata,
        created_at,
        updated_at
      `, { count: 'exact' })

    // Aplicar filtro de projeto (se fornecido)
    if (project_id) {
      query = query.eq('project_id', project_id)
    }

    // Aplicar filtro de origem
    if (origin_id) {
      query = query.eq('main_origin_id', origin_id)
    }

    // Aplicar filtro de estágio
    if (stage_id) {
      query = query.eq('current_stage_id', stage_id)
    }

    // Aplicar filtro por tags (qualquer uma das tags selecionadas)
    if (tag_ids && tag_ids.length > 0) {
      const { data: contactTags, error: contactTagsError } = await supabaseClient
        .from('contact_tags')
        .select('contact_id')
        .in('tag_id', tag_ids)

      if (contactTagsError) {
        console.error('[List Contacts] Error fetching contact tags:', contactTagsError)
        return errorResponse('Failed to fetch contact tags', 500)
      }

      const contactIds = Array.from(
        new Set((contactTags || []).map((item: { contact_id: string }) => item.contact_id))
      )

      if (contactIds.length === 0) {
        const emptyResponse: ContactsListResponse = {
          data: [],
          meta: {
            total: 0,
            limit,
            offset
          }
        }

        return successResponse(emptyResponse, 200)
      }

      query = query.in('id', contactIds)
    }

    // Aplicar filtro de favoritos
    if (is_favorite !== undefined) {
      query = query.eq('is_favorite', is_favorite)
    }

    // Aplicar busca full-text (busca em name, email, company)
    if (search) {
      // Busca usando ilike para compatibilidade
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Aplicar ordenação dinâmica
    switch (sort) {
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'name_desc':
        query = query.order('name', { ascending: false })
        break
      case 'updated_at':
        query = query.order('updated_at', { ascending: false })
        break
      case 'created_at':
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: contacts, error, count } = await query

    if (error) {
      console.error('[List Contacts Error]', error)
      return errorResponse('Failed to fetch contacts', 500)
    }

    const response: ContactsListResponse = {
      data: contacts || [],
      meta: {
        total: count || 0,
        limit,
        offset
      }
    }

    console.log('[List Contacts Success]', { 
      count: contacts?.length || 0, 
      total: count,
      filters: { project_id, search, origin_id, stage_id, tag_ids, is_favorite, sort, limit, offset }
    })

    return successResponse(response, 200)

  } catch (error) {
    console.error('[List Contacts Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}

