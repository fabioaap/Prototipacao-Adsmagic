import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { companiesService } from '@/services/api/companiesService'
import { settingsService } from '@/services/api/settingsService'
import { cacheService } from '@/services/cache/cacheService'
import { useAuthStore } from './auth'
import type { Company, CompanySettings, CreateCompanyDTO, UpdateCompanyDTO, InviteUserDTO } from '@/types'

type FetchCompaniesReason = 'bootstrap' | 'guard' | 'view' | 'mutation'

interface FetchCompaniesOptions {
  force?: boolean
  reason?: FetchCompaniesReason
}

const COMPANIES_CACHE_TTL_MS = 10000

export const useCompaniesStore = defineStore('companies', () => {
  let inFlightFetchPromise: Promise<void> | null = null
  let lastCompaniesFetchAt = 0
  let lastCompaniesFetchUserId: string | null = null

  // State
  const companies = ref<Company[]>([])
  const currentCompany = ref<Company | null>(null)
  const companySettings = ref<CompanySettings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const userCompanies = computed(() => companies.value)
  const hasCompanies = computed(() => companies.value.length > 0)
  const currentCompanyId = computed(() => currentCompany.value?.id || null)

  // Actions
  async function fetchCompanies(options: FetchCompaniesOptions = {}): Promise<void> {
    const { force = false } = options
    const authStore = useAuthStore()
    const currentUserId = authStore.user?.id ?? null
    const canUseCache =
      !force &&
      Boolean(authStore.token) &&
      currentUserId !== null &&
      lastCompaniesFetchUserId === currentUserId &&
      Date.now() - lastCompaniesFetchAt < COMPANIES_CACHE_TTL_MS

    if (canUseCache) {
      return
    }

    if (!force && inFlightFetchPromise) {
      return await inFlightFetchPromise
    }

    const runFetch = async (): Promise<void> => {
      try {
        isLoading.value = true
        error.value = null

        // Evitar chamadas ao backend sem autenticação válida
        if (!authStore.token || !currentUserId) {
          if (import.meta.env.DEV) {
            console.warn('[Companies Store] ⚠️ No authenticated user/token, skipping companies fetch')
          }
          companies.value = []
          lastCompaniesFetchAt = 0
          lastCompaniesFetchUserId = null
          error.value = 'Sessão não autenticada'
          return
        }

        // Buscar empresas via API
        const companiesData = await companiesService.getUserCompanies(currentUserId)

        companies.value = companiesData
        lastCompaniesFetchAt = Date.now()
        lastCompaniesFetchUserId = currentUserId
      } catch (err) {
        console.error('[Companies Store] ❌ Erro ao carregar empresas:', err)

        // Em caso de erro, definir array vazio para permitir que a inicialização continue
        companies.value = []

        // Armazenar mensagem de erro apenas para debug (não bloquear UX)
        if (err instanceof Error) {
          error.value = err.message
          console.error('[Companies Store] ❌ Error message:', err.message)
          if (err.stack) {
            console.error('[Companies Store] ❌ Error stack:', err.stack)
          }
        } else {
          error.value = 'Erro desconhecido ao carregar empresas'
          console.error('[Companies Store] ❌ Unknown error:', err)
        }

        // Log detalhado apenas em DEV
        if (import.meta.env.DEV) {
          console.error('[Companies Store] ❌ Error details:', {
            message: error.value,
            error: err
          })
        }
      } finally {
        isLoading.value = false
      }
    }

    inFlightFetchPromise = runFetch()
    try {
      await inFlightFetchPromise
    } finally {
      inFlightFetchPromise = null
    }
  }

  async function createCompany(companyData: CreateCompanyDTO) {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    isLoading.value = true
    error.value = null

    try {
      const company = await companiesService.createCompany(companyData, authStore.user.id)

      // Invalidar cache de empresas
      cacheService.invalidatePattern(`companies:${authStore.user.id}`)

      // Recarregar empresas
      await fetchCompanies({ force: true, reason: 'mutation' })

      // Selecionar a nova empresa
      await setCurrentCompany(company)

      return company
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateCompany(companyId: string, updates: UpdateCompanyDTO) {
    isLoading.value = true
    error.value = null

    try {
      const updated = await companiesService.updateCompany(companyId, updates)

      // Invalidar cache de empresas
      const authStore = useAuthStore()
      if (authStore.user) {
        cacheService.invalidatePattern(`companies:${authStore.user.id}`)
      }

      // Atualizar cache local
      const index = companies.value.findIndex(c => c.id === companyId)
      if (index !== -1) {
        companies.value[index] = { ...companies.value[index], ...updated }
      }

      if (currentCompany.value?.id === companyId) {
        currentCompany.value = { ...currentCompany.value, ...updated }
      }

      return updated
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCompany(companyId: string) {
    isLoading.value = true
    error.value = null

    try {
      await companiesService.deleteCompany(companyId)

      // Invalidar cache de empresas
      const authStore = useAuthStore()
      if (authStore.user) {
        cacheService.invalidatePattern(`companies:${authStore.user.id}`)
      }

      // Remover do cache
      companies.value = companies.value.filter(c => c.id !== companyId)

      // Se era a empresa atual, limpar
      if (currentCompany.value?.id === companyId) {
        currentCompany.value = companies.value[0] || null
        if (currentCompany.value) {
          await setCurrentCompany(currentCompany.value)
        }
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function setCurrentCompany(company: Company) {
    currentCompany.value = company
    localStorage.setItem('current_company_id', company.id)

    // Carregar configurações da empresa
    await loadCompanySettings(company.id)
  }

  async function loadCompanySettings(companyId: string) {
    try {
      const settings = await settingsService.getCompanySettings(companyId)
      // Transformar valores null em boolean para compatibilidade de tipo
      const transformedSettings = {
        ...settings,
        notifications_enabled: settings.notifications_enabled ?? false,
        auto_track_events: settings.auto_track_events ?? false
      }
      companySettings.value = transformedSettings as CompanySettings
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err)
    }
  }

  async function updateCompanySettings(updates: Partial<CompanySettings>) {
    if (!currentCompany.value) {
      throw new Error('Nenhuma empresa selecionada')
    }

    isLoading.value = true
    error.value = null

    try {
      const updated = await settingsService.updateCompanySettings(
        currentCompany.value.id,
        updates
      )
      // Normalizar todas propriedades que podem ser null
      const normalizedSettings: CompanySettings = {
        id: updated.id,
        company_id: updated.company_id,
        theme: updated.theme ?? null,
        language: updated.language ?? null,
        timezone: updated.timezone ?? null,
        date_format: updated.date_format ?? null,
        time_format: updated.time_format ?? null,
        decimal_separator: updated.decimal_separator ?? null,
        thousands_separator: updated.thousands_separator ?? null,
        notifications_enabled: updated.notifications_enabled ?? false,
        notification_email: updated.notification_email ?? null,
        digest_frequency: updated.digest_frequency ?? null,
        digest_time: updated.digest_time ?? null,
        default_attribution_model: updated.default_attribution_model ?? null,
        auto_track_events: updated.auto_track_events ?? false,
        include_company_info: updated.include_company_info ?? false,
        include_contact_info: updated.include_contact_info ?? false,
        report_timezone: updated.report_timezone ?? null,
        created_at: updated.created_at ?? '',
        updated_at: updated.updated_at ?? ''
      }
      companySettings.value = normalizedSettings
      return normalizedSettings
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function inviteUser(inviteData: InviteUserDTO) {
    const authStore = useAuthStore()
    if (!currentCompany.value || !authStore.user) {
      throw new Error('Empresa ou usuário não encontrado')
    }

    isLoading.value = true
    error.value = null

    try {
      await companiesService.inviteUser(
        currentCompany.value.id,
        inviteData,
        authStore.user.id
      )
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetForUserSwitch() {
    companies.value = []
    currentCompany.value = null
    companySettings.value = null
    error.value = null
    isLoading.value = false
    inFlightFetchPromise = null
    lastCompaniesFetchAt = 0
    lastCompaniesFetchUserId = null
    localStorage.removeItem('current_company_id')
  }

  /**
   * Inicializa empresa a partir do localStorage de forma robusta
   * Retorna true se empresa foi carregada com sucesso
   */
  async function initializeFromStorage(): Promise<boolean> {
    const storedCompanyId = localStorage.getItem('current_company_id')
    if (!storedCompanyId) {
      return false
    }

    try {

      // Primeiro, buscar todas as empresas do usuário
      await fetchCompanies({ reason: 'bootstrap' })

      // Procurar a empresa armazenada na lista
      const company = companies.value.find(c => c.id === storedCompanyId)

      if (company) {
        currentCompany.value = company

        // Carregar configurações da empresa
        try {
          await loadCompanySettings(company.id)
        } catch (settingsError) {
          console.warn('[Companies Store] ⚠️ Could not load company settings:', settingsError)
          // Não falhar por causa das configurações
        }

        return true
      } else {
        console.warn('[Companies Store] ⚠️ Stored company not found in user companies')
        localStorage.removeItem('current_company_id')
        return false
      }
    } catch (error) {
      console.error('[Companies Store] ❌ Error loading company from storage:', error)
      console.error('[Companies Store] ❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      localStorage.removeItem('current_company_id')
      return false
    }
  }

  /**
   * Inicialização completa da store
   * Carrega empresas e define a atual se necessário
   */
  async function initialize(): Promise<void> {
    try {

      // Sempre buscar empresas do backend primeiro
      await fetchCompanies({ reason: 'bootstrap' })

      // Verificar se há empresa armazenada no localStorage
      const storedCompanyId = localStorage.getItem('current_company_id')
      if (storedCompanyId) {

        // Procurar a empresa armazenada na lista
        const storedCompany = companies.value.find(c => c.id === storedCompanyId)

        if (storedCompany) {
          currentCompany.value = storedCompany

          // Carregar configurações da empresa
          try {
            await loadCompanySettings(storedCompany.id)
          } catch (settingsError) {
            console.warn('[Companies Store] ⚠️ Could not load company settings:', settingsError)
          }
        } else {
          console.warn('[Companies Store] ⚠️ Stored company not found in user companies')
          localStorage.removeItem('current_company_id')
        }
      }

      // Se não tem empresa atual, definir a primeira
      if (!currentCompany.value && companies.value.length > 0) {
        const firstCompany = companies.value[0]
        if (firstCompany) {
          await setCurrentCompany(firstCompany)
        }
      } else if (companies.value.length === 0) {
        console.warn('[Companies Store] ⚠️ No companies found for user')
      }

    } catch (err) {
      console.error('[Companies Store] ❌ Initialization failed:', err)
      console.error('[Companies Store] ❌ Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      })
      error.value = 'Erro ao inicializar empresas'
    }
  }

  return {
    // State
    companies,
    currentCompany,
    companySettings,
    isLoading,
    error,

    // Getters
    userCompanies,
    hasCompanies,
    currentCompanyId,

    // Actions
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    setCurrentCompany,
    loadCompanySettings,
    updateCompanySettings,
    inviteUser,
    clearError,
    resetForUserSwitch,
    initialize,
    initializeFromStorage
  }
})
