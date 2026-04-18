/**
 * Handler para criação de empresa (POST /companies)
 * 
 * Cria uma nova empresa com validação seguindo princípios SOLID:
 * - SRP: Delega operações específicas para funções utilitárias
 * - DIP: Depende de abstrações (funções utilitárias)
 * - Clean Code: Funções pequenas e focadas
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { successResponse, errorResponse, validationErrorResponse } from '../utils/response.ts'
import { createCompanySchema, extractValidationErrors } from '../validators/company.ts'
import type { CreateCompanyDTO, CompanyResponse } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'
import type { Database } from '../../../types/database.types.ts'
import {
  createCompanyRecord,
  createCompanyUser,
  createCompanySettings,
  rollbackCompanyCreation,
  fetchCreatedCompany
} from '../utils/company-creation.ts'

const DEFAULT_USER_ROLE = 'owner' as const
const OWNER_ADMIN_ROLES = ['owner', 'admin'] as const
const RLS_POLICY_ERROR_CODES = ['42501'] as const
const CONFLICT_ERROR_CODES = ['23505'] as const
const FORBIDDEN_ERROR_CODES = ['28000'] as const

function createRequestId(): string {
  return crypto.randomUUID()
}

function isRlsPolicyError(errorCode?: string, errorMessage?: string): boolean {
  const normalizedMessage = (errorMessage ?? '').toLowerCase()
  return (
    Boolean(errorCode && RLS_POLICY_ERROR_CODES.includes(errorCode as typeof RLS_POLICY_ERROR_CODES[number])) ||
    normalizedMessage.includes('policy') ||
    normalizedMessage.includes('row-level security')
  )
}

function isConflictError(errorCode?: string, errorMessage?: string): boolean {
  const normalizedMessage = (errorMessage ?? '').toLowerCase()
  return (
    Boolean(errorCode && CONFLICT_ERROR_CODES.includes(errorCode as typeof CONFLICT_ERROR_CODES[number])) ||
    normalizedMessage.includes('already exists') ||
    normalizedMessage.includes('duplicate key')
  )
}

function isForbiddenError(errorCode?: string, errorMessage?: string): boolean {
  const normalizedMessage = (errorMessage ?? '').toLowerCase()
  return (
    Boolean(errorCode && FORBIDDEN_ERROR_CODES.includes(errorCode as typeof FORBIDDEN_ERROR_CODES[number])) ||
    normalizedMessage.includes('permission denied') ||
    normalizedMessage.includes('forbidden')
  )
}

function createAdminClient(): SupabaseDbClient | null {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

/**
 * Valida e extrai dados do request
 * 
 * @param req - Request HTTP
 * @returns Dados validados ou erro de validação
 */
async function validateRequest(req: Request) {
  try {
    const body = await req.json()
    const validationResult = createCompanySchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = extractValidationErrors(validationResult.error)
      return { success: false, errors, data: null }
    }

    return { success: true, errors: null, data: validationResult.data }
  } catch (error) {
    return { 
      success: false, 
      errors: ['Invalid JSON in request body'], 
      data: null 
    }
  }
}

/**
 * Obtém o ID do usuário autenticado
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @returns ID do usuário ou null
 */
async function getAuthenticatedUserId(
  supabaseClient: SupabaseDbClient
): Promise<string | null> {
  const { data: { user } } = await supabaseClient.auth.getUser()
  return user?.id ?? null
}

/**
 * Cria uma nova empresa
 * 
 * Segue princípios SOLID:
 * - SRP: Coordena o fluxo de criação, delegando operações específicas
 * - Error Handling: Tratamento robusto com rollback automático
 * 
 * @param req - Request HTTP
 * @param supabaseClient - Cliente Supabase autenticado
 * @returns Response HTTP com empresa criada ou erro
 */
export async function handleCreate(
  req: Request, 
  supabaseClient: SupabaseDbClient
) {
  const requestId = createRequestId()

  try {
    // 1. Validar request
    const validation = await validateRequest(req)
    if (!validation.success) {
      return validationErrorResponse(validation.errors!, 400)
    }

    const companyData: CreateCompanyDTO = validation.data!

    // 2. Obter usuário autenticado
    const userId = await getAuthenticatedUserId(supabaseClient)
    if (!userId) {
      return errorResponse('User not found', 401)
    }

    const adminClient = createAdminClient()
    if (!adminClient) {
      console.error('[Create Company] Missing SUPABASE_SERVICE_ROLE_KEY configuration', { requestId, userId })
      return errorResponse('Configuration error: service role not available', 500, 'INTERNAL_ERROR')
    }

    console.log('[Create Company] Starting company creation...', { 
      requestId,
      companyName: companyData.name, 
      userId 
    })

    // 3. Verificar se usuário já tem empresa como owner/admin (regra de negócio explícita)
    const { data: existingCompanies, error: checkError } = await adminClient
      .from('company_users')
      .select('company_id, role')
      .eq('user_id', userId)
      .eq('is_active', true)
      .in('role', OWNER_ADMIN_ROLES)

    if (checkError) {
      console.error('[Create Company] Error checking existing companies:', {
        requestId,
        userId,
        errorCode: checkError.code,
        errorMessage: checkError.message,
        details: checkError.details
      })
      return errorResponse('Failed to validate existing company membership', 500, 'INTERNAL_ERROR')
    }

    if (existingCompanies && existingCompanies.length > 0) {
      console.log('[Create Company] User already has company as owner/admin, blocking creation')
      return errorResponse(
        'User already has a company as owner or admin. Only one company per user is allowed.',
        409,
        'COMPANY_ALREADY_EXISTS'
      )
    }

    // 4. Criar empresa
    const { data: company, error: companyError } = await createCompanyRecord(
      adminClient,
      companyData
    )

    if (companyError || !company) {
      const errorMessage = companyError?.message ?? 'Unknown error'
      const errorCode = companyError?.code
      
      console.error('[Create Company] Error creating company record:', {
        requestId,
        userId,
        code: errorCode,
        message: errorMessage,
        details: companyError?.details,
        hint: companyError?.hint,
        companyName: companyData.name
      })

      if (isRlsPolicyError(errorCode, errorMessage) || isForbiddenError(errorCode, errorMessage)) {
        console.warn('[Create Company] Mapped error to FORBIDDEN', {
          requestId,
          userId,
          mappedStatus: 403,
          mappedCode: 'FORBIDDEN'
        })
        return errorResponse(
          'Not allowed to create company with current permissions.',
          403,
          'FORBIDDEN'
        )
      }

      if (isConflictError(errorCode, errorMessage)) {
        console.warn('[Create Company] Mapped error to COMPANY_ALREADY_EXISTS', {
          requestId,
          userId,
          mappedStatus: 409,
          mappedCode: 'COMPANY_ALREADY_EXISTS'
        })
        return errorResponse(
          'User already has a company as owner or admin. Only one company per user is allowed.',
          409,
          'COMPANY_ALREADY_EXISTS'
        )
      }

      console.error('[Create Company] Mapped error to INTERNAL_ERROR', {
        requestId,
        userId,
        mappedStatus: 500,
        mappedCode: 'INTERNAL_ERROR'
      })
      return errorResponse(
        `Failed to create company: ${errorMessage}`,
        500,
        'INTERNAL_ERROR'
      )
    }

    console.log('[Create Company] Company created:', { requestId, companyId: company.id, userId })

    // 5. Criar relacionamento usuário-empresa
    const { error: userError } = await createCompanyUser(
      adminClient,
      company.id,
      userId
    )

    if (userError) {
      await rollbackCompanyCreation(adminClient, company.id, 1)
      return errorResponse(
        `Failed to create company user: ${userError.message}`,
        500,
        'INTERNAL_ERROR'
      )
    }

    console.log('[Create Company] Company user created')

    // 6. Criar configurações padrão
    const { error: settingsError } = await createCompanySettings(
      adminClient,
      company.id,
      companyData.timezone
    )

    if (settingsError) {
      await rollbackCompanyCreation(adminClient, company.id, 2)
      return errorResponse(
        `Failed to create company settings: ${settingsError.message}`,
        500,
        'INTERNAL_ERROR'
      )
    }

    console.log('[Create Company] Company settings created')

    // 7. Buscar empresa completa
    const { data: fullCompany, error: fetchError } = await fetchCreatedCompany(
      adminClient,
      company.id
    )

    if (fetchError || !fullCompany) {
      // Empresa foi criada, mas não conseguimos buscar
      // Não fazemos rollback aqui pois a empresa já existe
      return errorResponse(
        `Company created but failed to fetch: ${fetchError?.message ?? 'Unknown error'}`,
        500,
        'INTERNAL_ERROR'
      )
    }

    // 8. Montar resposta
    const response: CompanyResponse = {
      data: {
        ...fullCompany,
        userRole: DEFAULT_USER_ROLE,
        permissions: null
      }
    }

    console.log('[Create Company] Company creation completed successfully:', {
      requestId,
      userId,
      companyName: fullCompany.name
    })

    return successResponse(response, 201)

  } catch (error) {
    console.error('[Create Company Handler Error]', {
      requestId,
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : typeof error
    })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return errorResponse(`Internal server error: ${errorMessage}`, 500, 'INTERNAL_ERROR')
  }
}
