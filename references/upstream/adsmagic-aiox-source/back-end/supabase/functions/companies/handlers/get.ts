/**
 * Handler para obtenção de empresa específica (GET /companies/:id)
 * 
 * Retorna uma empresa específica com validação de acesso
 */

import { successResponse, errorResponse } from '../utils/response.ts'
import { validateUUID } from '../validators/company.ts'
import type { Company, CompanyResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

interface CompanyUserWithCompany {
  role: string
  permissions: Record<string, boolean> | null
  companies: Company | Company[] | null
}

/**
 * Obtém uma empresa específica
 */
export async function handleGet(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  companyId: string
) {
  try {
    // Validar UUID
    if (!validateUUID(companyId)) {
      return errorResponse('Invalid company ID format', 400)
    }

    // Buscar empresa via company_users join com companies (RLS validará automaticamente se usuário tem acesso)
    const { data: companyData, error } = await supabaseClient
      .from('company_users')
      .select(`
        role,
        permissions,
        companies (
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
        )
      `)
      .eq('company_id', companyId)
      .eq('user_id', (await supabaseClient.auth.getUser()).data.user?.id)
      .eq('is_active', true)
      .eq('companies.is_active', true)
      .single()

    if (error || !companyData) {
      console.error('[Get Company Error]', error)
      return errorResponse('Company not found or access denied', 404)
    }

    // Transformar dados para incluir role e permissions
    const typedCompanyData = companyData as unknown as CompanyUserWithCompany
    const companyRecord = Array.isArray(typedCompanyData.companies)
      ? typedCompanyData.companies[0]
      : typedCompanyData.companies

    if (!companyRecord) {
      return errorResponse('Company not found or access denied', 404)
    }

    const company = {
      ...companyRecord,
      userRole: typedCompanyData.role,
      permissions: typedCompanyData.permissions
    }

    const response: CompanyResponse = {
      data: company
    }

    console.log('[Get Company Success]', { companyId: company.id, userRole: typedCompanyData.role })

    return successResponse(response, 200)

  } catch (error) {
    console.error('[Get Company Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
