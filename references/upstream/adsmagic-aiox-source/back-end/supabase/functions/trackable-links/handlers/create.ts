/**
 * Handler para criação de links rastreáveis (POST /trackable-links)
 * 
 * Cria um novo link UUID-only (slug/short_code descontinuados no contrato)
 * 
 * @module trackable-links/handlers/create
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createLinkSchema, extractValidationErrors } from '../validators/link.ts'
import { generateUUID, buildTrackingUrl } from '../utils/slug.ts'
import { resolveTrackingBaseUrl } from '../utils/tracking-base-url.ts'
import type { CreateTrackableLinkDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/** URL base para links de tracking */
const TRACKING_BASE_URL = resolveTrackingBaseUrl()
const LINK_SELECT_COLUMNS = 'id, project_id, name, destination_url, tracking_url, initial_message, origin_id, whatsapp_number, whatsapp_message_template, link_type, utm_source, utm_medium, utm_campaign, utm_content, utm_term, is_active, clicks_count, contacts_count, sales_count, revenue, created_at, updated_at'

/**
 * Cria um novo link rastreável
 */
export async function handleCreate(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  try {
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return errorResponse('Authentication required', 401)
    }

    // Parse do body e bloqueio explícito de campos descontinuados
    const rawBody: unknown = await req.json()
    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    const body = rawBody as Record<string, unknown>
    if (Object.prototype.hasOwnProperty.call(body, 'slug')) {
      return errorResponse('Field "slug" has been discontinued. Use UUID-only redirect.', 400)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'generate_short_code')) {
      return errorResponse('Field "generate_short_code" has been discontinued.', 400)
    }
    
    // Validação com Zod
    const validationResult = createLinkSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[Create Link] Validation failed:', validationResult.error)
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const linkData: CreateTrackableLinkDTO = validationResult.data
    
    // Verificar se o usuário tem acesso ao projeto
    const { data: projectCheck, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, company_id')
      .eq('id', linkData.project_id)
      .single()

    if (projectError || !projectCheck) {
      console.error('[Create Link] Project access check failed:', { projectError, projectCheck })
      return errorResponse('Project not found or access denied', 403)
    }

    // Verificar se o usuário tem acesso à empresa do projeto
    const { data: companyCheck, error: companyError } = await supabaseClient
      .from('company_users')
      .select('company_id, role')
      .eq('company_id', projectCheck.company_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (companyError || !companyCheck) {
      console.error('[Create Link] Company access check failed:', { companyError, companyCheck })
      return errorResponse('Company access denied', 403)
    }

    // Verificar se origin_id existe e pertence ao projeto (se fornecido)
    if (linkData.origin_id) {
      const { data: originCheck, error: originError } = await supabaseClient
        .from('origins')
        .select('id, project_id')
        .eq('id', linkData.origin_id)
        .single()

      if (originError || !originCheck) {
        return errorResponse('Invalid origin ID', 400)
      }

      // Origin deve ser do sistema (project_id IS NULL) ou do projeto
      if (originCheck.project_id !== null && originCheck.project_id !== linkData.project_id) {
        return errorResponse('Origin does not belong to this project', 400)
      }
    }

    const linkId = generateUUID()
    // Compatibilidade temporária com schema atual: slug continua em banco, mas não no contrato público.
    const internalSlug = `legacy-${linkId}`

    // Montar URL de tracking usando id como chave pública canônica
    const trackingUrl = buildTrackingUrl(TRACKING_BASE_URL, linkId, {
      utm_source: linkData.utm_source ?? undefined,
      utm_medium: linkData.utm_medium ?? undefined,
      utm_campaign: linkData.utm_campaign ?? undefined,
      utm_content: linkData.utm_content ?? undefined,
      utm_term: linkData.utm_term ?? undefined
    })

    console.log('[Create Link] Access verified:', {
      projectId: linkData.project_id,
      userId: user.id
    })

    // Criar link (RLS validará automaticamente)
    const { data: link, error } = await supabaseClient
      .from('trackable_links')
      .insert({
        id: linkId,
        project_id: linkData.project_id,
        name: linkData.name,
        slug: internalSlug,
        destination_url: linkData.destination_url,
        tracking_url: trackingUrl,
        initial_message: linkData.initial_message,
        origin_id: linkData.origin_id,
        whatsapp_number: linkData.whatsapp_number,
        whatsapp_message_template: linkData.whatsapp_message_template,
        link_type: linkData.link_type,
        utm_source: linkData.utm_source,
        utm_medium: linkData.utm_medium,
        utm_campaign: linkData.utm_campaign,
        utm_content: linkData.utm_content,
        utm_term: linkData.utm_term,
        is_active: true
      })
      .select(LINK_SELECT_COLUMNS)
      .single()

    if (error) {
      console.error('[Create Link Error]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Tratar erros específicos
      if (error.code === '23505') {
        if (error.message.includes('name')) {
          return errorResponse('Link with this name already exists in this project', 409)
        }
        return errorResponse('Link already exists', 409)
      }
      
      if (error.code === '23503') {
        return errorResponse('Invalid project or origin reference', 400)
      }
      
      if (error.code === '42501') {
        return errorResponse('Permission denied - check RLS policies', 403)
      }
      
      return errorResponse(`Failed to create link: ${error.message}`, 500)
    }

    console.log('[Create Link Success]', { linkId: link.id, projectId: link.project_id })

    return successResponse(link, 201)

  } catch (error) {
    console.error('[Create Link Handler Error]', error)
    
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400)
    }
    
    return errorResponse('Internal server error', 500)
  }
}
