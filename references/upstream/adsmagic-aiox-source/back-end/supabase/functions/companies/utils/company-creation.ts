/**
 * Utilitários para criação de empresa
 * 
 * Funções auxiliares que seguem SRP (Single Responsibility Principle)
 * para operações relacionadas à criação de empresas
 */

import type { CreateCompanyDTO } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

// Constantes para evitar magic strings
const DEFAULT_COMPANY_ROLE = 'owner' as const
const DEFAULT_THEME = 'light' as const
const DEFAULT_LANGUAGE = 'pt' as const

/**
 * Cria o registro da empresa no banco de dados
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @param companyData - Dados da empresa a ser criada
 * @returns Promise com o ID da empresa criada ou erro
 */
/**
 * Normaliza o valor de website para inserção no banco
 * Converte string vazia ou undefined para null
 * 
 * @param website - Valor do website (pode ser URL, string vazia ou undefined)
 * @returns URL válida ou null
 */
function normalizeWebsite(website?: string): string | null {
  if (!website || website.trim() === '') {
    return null
  }
  return website
}

/**
 * Cria o registro da empresa no banco de dados
 * 
 * Segue SRP: Responsabilidade única de criar registro de empresa
 * Trata campos opcionais de forma type-safe
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @param companyData - Dados da empresa a ser criada
 * @returns Promise com o ID da empresa criada ou erro
 */
export async function createCompanyRecord(
  supabaseClient: SupabaseDbClient,
  companyData: CreateCompanyDTO
) {
  // Preparar dados para inserção de forma type-safe
  // Campos obrigatórios sempre presentes
  const insertData = {
    name: companyData.name,
    description: companyData.description || null,
    country: companyData.country,
    currency: companyData.currency,
    timezone: companyData.timezone,
    // Campos opcionais: incluir apenas se definidos, senão null
    industry: companyData.industry || null,
    size: companyData.size || null,
    website: normalizeWebsite(companyData.website)
  }

  console.log('[Create Company Record] Inserting company with data:', {
    name: insertData.name,
    country: insertData.country,
    currency: insertData.currency,
    hasIndustry: !!insertData.industry,
    hasSize: !!insertData.size,
    hasWebsite: !!insertData.website
  })

  const { data: company, error } = await supabaseClient
    .from('companies')
    .insert(insertData)
    .select('id')
    .single()

  if (error) {
    console.error('[Create Company Record] Failed:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    return { error, data: null }
  }

  console.log('[Create Company Record] Success:', company?.id)
  return { error: null, data: company }
}

/**
 * Cria o relacionamento entre usuário e empresa
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @param companyId - ID da empresa
 * @param userId - ID do usuário
 * @returns Promise com sucesso ou erro
 */
export async function createCompanyUser(
  supabaseClient: SupabaseDbClient,
  companyId: string,
  userId: string
) {
  const { error } = await supabaseClient
    .from('company_users')
    .insert({
      company_id: companyId,
      user_id: userId,
      role: DEFAULT_COMPANY_ROLE,
      is_active: true
    })

  if (error) {
    console.error('[Create Company User] Failed:', error)
    return { error }
  }

  return { error: null }
}

/**
 * Verifica se o erro é do tipo "not found" (esperado quando não existe registro)
 * 
 * @param error - Erro do Supabase
 * @returns true se for erro de "not found", false caso contrário
 */
function isNotFoundError(error: { code?: string; message?: string }): boolean {
  const NOT_FOUND_CODES = ['PGRST116']
  const NOT_FOUND_MESSAGES = ['No rows', 'not found']
  
  if (error.code && NOT_FOUND_CODES.includes(error.code)) {
    return true
  }
  
  if (error.message) {
    return NOT_FOUND_MESSAGES.some(msg => 
      error.message?.toLowerCase().includes(msg.toLowerCase())
    )
  }
  
  return false
}

/**
 * Resultado da verificação de settings existentes
 */
type SettingsCheckResult = 
  | { exists: true; error: null }
  | { exists: false; error: null }
  | { exists: false; error: { code?: string; message?: string } }

/**
 * Verifica se já existe configuração para a empresa
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @param companyId - ID da empresa
 * @returns Resultado da verificação com indicação de existência e possíveis erros
 */
async function checkExistingSettings(
  supabaseClient: SupabaseDbClient,
  companyId: string
): Promise<SettingsCheckResult> {
  const { data: existingSettings, error: checkError } = await supabaseClient
    .from('company_settings')
    .select('id')
    .eq('company_id', companyId)
    .maybeSingle()

  if (existingSettings) {
    return { exists: true, error: null }
  }

  if (checkError && !isNotFoundError(checkError)) {
    return { exists: false, error: checkError }
  }

  return { exists: false, error: null }
}

/**
 * Cria o registro de configurações padrão no banco de dados
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @param companyId - ID da empresa
 * @param timezone - Timezone da empresa
 * @returns Promise com sucesso ou erro
 */
async function insertCompanySettings(
  supabaseClient: SupabaseDbClient,
  companyId: string,
  timezone: string
) {
  return await supabaseClient
    .from('company_settings')
    .insert({
      company_id: companyId,
      theme: DEFAULT_THEME,
      language: DEFAULT_LANGUAGE,
      timezone,
      notifications_enabled: true,
      auto_track_events: true,
      include_company_info: true,
      include_contact_info: true
    })
}

/**
 * Cria as configurações padrão da empresa
 * 
 * Verifica se já existe configuração para a empresa antes de criar.
 * Se já existir, retorna sucesso (idempotente).
 * Trata race conditions onde settings podem ser criados concorrentemente.
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @param companyId - ID da empresa
 * @param timezone - Timezone da empresa
 * @returns Promise com sucesso ou erro
 */
export async function createCompanySettings(
  supabaseClient: SupabaseDbClient,
  companyId: string,
  timezone: string
) {
  // 1. Verificar se já existe configuração (idempotência)
  const checkResult = await checkExistingSettings(supabaseClient, companyId)
  
  if (checkResult.exists) {
    console.log('[Create Company Settings] Settings already exist, skipping creation')
    return { error: null }
  }

  if (checkResult.error) {
    console.error('[Create Company Settings] Failed to check existing settings:', checkResult.error)
    return { error: checkResult.error }
  }

  // 2. Criar novas configurações
  const { error: insertError } = await insertCompanySettings(
    supabaseClient,
    companyId,
    timezone
  )

  if (insertError) {
    // 3. Tratar race condition: se foi criado entre verificação e inserção
    // (código 23505 = unique constraint violation)
    if (insertError.code === '23505') {
      console.log('[Create Company Settings] Settings created concurrently, treating as success')
      return { error: null }
    }
    
    console.error('[Create Company Settings] Failed to insert:', insertError)
    return { error: insertError }
  }

  return { error: null }
}

/**
 * Realiza rollback da criação de empresa em caso de erro
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @param companyId - ID da empresa a ser removida
 * @param stepsCompleted - Número de passos completados (1=company, 2=company+user, 3=settings, 4=subscription)
 */
export async function rollbackCompanyCreation(
  supabaseClient: SupabaseDbClient,
  companyId: string,
  stepsCompleted: 1 | 2 | 3 | 4
) {
  console.log(`[Rollback] Rolling back company creation (steps: ${stepsCompleted})`, { companyId })

  try {
    // Passo 4: Deletar subscriptions se foram criadas
    if (stepsCompleted >= 4) {
      await supabaseClient
        .from('subscriptions')
        .delete()
        .eq('company_id', companyId)
    }

    // Passo 3: Deletar settings se foram criados
    if (stepsCompleted >= 3) {
      await supabaseClient
        .from('company_settings')
        .delete()
        .eq('company_id', companyId)
    }

    // Passo 2: Deletar company_users se foi criado
    if (stepsCompleted >= 2) {
      await supabaseClient
        .from('company_users')
        .delete()
        .eq('company_id', companyId)
    }

    // Passo 1: Deletar company
    if (stepsCompleted >= 1) {
      await supabaseClient
        .from('companies')
        .delete()
        .eq('id', companyId)
    }

    console.log('[Rollback] Company creation rolled back successfully')
  } catch (rollbackError) {
    console.error('[Rollback] Failed to rollback company creation:', rollbackError)
    // Não lançamos erro aqui para não mascarar o erro original
  }
}

/**
 * Busca a empresa completa criada
 * 
 * @param supabaseClient - Cliente Supabase autenticado
 * @param companyId - ID da empresa
 * @returns Promise com dados completos da empresa ou erro
 */
export async function fetchCreatedCompany(
  supabaseClient: SupabaseDbClient,
  companyId: string
) {
  const { data: fullCompany, error } = await supabaseClient
    .from('companies')
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
    .eq('id', companyId)
    .single()

  if (error) {
    console.error('[Fetch Created Company] Failed:', error)
    return { error, data: null }
  }

  return { error: null, data: fullCompany }
}
