/**
 * Handler para atualização de empresa (PATCH /companies/:id)
 * 
 * Atualiza uma empresa existente com validação
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { updateCompanySchema, extractValidationErrors, validateUUID } from '../validators/company.ts'
import type { UpdateCompanyDTO, CompanyResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Atualiza uma empresa existente
 */
export async function handleUpdate(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  companyId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(companyId)) {
      return errorResponse('Invalid company ID format', 400)
    }

    // Parse do body
    const body = await req.json()
    
    // Validação com Zod
    const validationResult = updateCompanySchema.safeParse(body)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const updateData: UpdateCompanyDTO = validationResult.data
    const userId = (await supabaseClient.auth.getUser()).data.user?.id

    if (!userId) {
      return errorResponse('User not found', 401)
    }

    // Verificar se empresa existe e usuário tem acesso
    const { data: companyCheck, error: companyError } = await supabaseClient
      .from('company_users')
      .select('role, companies(id, name)')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (companyError || !companyCheck) {
      console.error('[Update Company] Company access check failed:', { companyError, companyCheck })
      return errorResponse('Company not found or access denied', 404)
    }

    // Verificar permissão (owner ou admin)
    if (!['owner', 'admin'].includes(companyCheck.role)) {
      console.error('[Update Company] Insufficient permissions:', { role: companyCheck.role })
      return errorResponse('Insufficient permissions to update company', 403)
    }

    console.log('[Update Company] Company access verified:', { companyId, role: companyCheck.role })

    // Preparar dados para atualização
    const updateFields: any = {
      updated_at: new Date().toISOString()
    }

    // Adicionar apenas campos que foram fornecidos
    if (updateData.name !== undefined) updateFields.name = updateData.name
    if (updateData.description !== undefined) updateFields.description = updateData.description
    if (updateData.country !== undefined) updateFields.country = updateData.country
    if (updateData.currency !== undefined) updateFields.currency = updateData.currency
    if (updateData.timezone !== undefined) updateFields.timezone = updateData.timezone
    if (updateData.industry !== undefined) updateFields.industry = updateData.industry
    if (updateData.size !== undefined) updateFields.size = updateData.size
    if (updateData.website !== undefined) updateFields.website = updateData.website
    if (updateData.logo_url !== undefined) updateFields.logo_url = updateData.logo_url

    // Atualizar empresa
    const { data: updatedCompany, error: updateError } = await supabaseClient
      .from('companies')
      .update(updateFields)
      .eq('id', companyId)
      .select(`
        id,
        name,
        description,
        country,
        currency,
        timezone,
        industry,
        size,
        website,
        logo_url,
        is_active,
        created_at,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('[Update Company] Update failed:', updateError)
      return errorResponse('Failed to update company', 500)
    }

    const response: CompanyResponse = {
      data: {
        ...updatedCompany,
        userRole: companyCheck.role,
        permissions: null
      }
    }

    console.log('[Update Company] Company updated successfully:', updatedCompany.name)

    return successResponse(response, 200)

  } catch (error) {
    console.error('[Update Company Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
