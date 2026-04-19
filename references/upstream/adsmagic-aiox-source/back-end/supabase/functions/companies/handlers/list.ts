/**
 * Handler para listagem de empresas (GET /companies)
 * 
 * Lista empresas do usuário com filtros opcionais
 */

import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { listCompaniesQuerySchema, extractValidationErrors } from '../validators/company.ts'
import type { Company, CompaniesListResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

interface CompanyUserWithCompany {
  role: string
  permissions: Record<string, boolean> | null
  companies: Company | Company[] | null
}

/**
 * Lista empresas do usuário
 */
export async function handleList(
  req: Request, 
  supabaseClient: SupabaseDbClient,
  userId: string
) {
  try {
    // Parse query parameters
    const url = new URL(req.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Validação dos query parameters
    const validationResult = listCompaniesQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return validationErrorResponse(errors, 400)
    }

    const { limit = 50, offset = 0 } = validationResult.data

    // Buscar empresas via company_users join com companies
    const { data: companies, error, count } = await supabaseClient
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
      `, { count: 'estimated' })
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('companies.is_active', true)
      .order('created_at', { ascending: false, referencedTable: 'companies' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[List Companies Error]', error)
      return errorResponse('Failed to fetch companies', 500)
    }

    // Transformar dados para incluir role e permissions
    const transformedCompanies: CompaniesListResponse['data'] = (companies || [])
      .map((item) => {
        const typedItem = item as unknown as CompanyUserWithCompany
        const company = Array.isArray(typedItem.companies)
          ? typedItem.companies[0]
          : typedItem.companies

        if (!company) {
          return null
        }

        return {
          ...company,
          userRole: typedItem.role,
          permissions: typedItem.permissions,
        }
      })
      .filter((company): company is CompaniesListResponse['data'][number] => company !== null)

    const response: CompaniesListResponse = {
      data: transformedCompanies,
      meta: {
        total: count || 0,
        limit,
        offset
      }
    }

    console.log('[List Companies Success]', { 
      count: transformedCompanies.length, 
      total: count,
      filters: { limit, offset }
    })

    return successResponse(response, 200)

  } catch (error) {
    console.error('[List Companies Handler Error]', error)
    return errorResponse('Internal server error', 500)
  }
}
