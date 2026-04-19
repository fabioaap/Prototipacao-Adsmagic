/**
 * Store para gerenciar o estado do assistente de criação de projetos
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cacheService } from '@/services/cache/cacheService'
import { supabase } from '@/services/api/supabaseClient'

export interface ProjectData {
  // Step 1 - Informações básicas
  name: string
  segment: string

  // Step 2 - Plataformas selecionadas
  platforms: {
    metaAds: boolean
    googleAds: boolean
  }

  // Step 3 - Tipo de campanha Meta (condicional)
  metaCampaignType?: 'messages' | 'traffic' | ''

  // Step 4 - Configurações das plataformas
  metaAds?: {
    connected: boolean
    accountId?: string
    pixelId?: string
  }
  googleAds?: {
    connected: boolean
    accountId?: string
    events: Array<{
      id: string
      name: string
      defaultValue: number
      allowMultiplePurchases: boolean
    }>
  }

  // Step 5 - Links rastreáveis (condicional - movido para raiz)
  trackableLinks?: Array<{
    id: string
    name: string
    url: string
    message: string
  }>

  // Step 6 - WhatsApp (Multi-Broker)
  whatsapp?: {
    connected: boolean
    phoneNumber?: string
    qrCode?: string
    /** ID do broker selecionado */
    selectedBrokerId?: string
    /** Tipo do broker (uazapi, gupshup, official_whatsapp) */
    brokerType?: 'uazapi' | 'gupshup' | 'official_whatsapp'
    /** ID da instância (para uazapi) */
    instanceId?: string
    /** ID da conta no banco (messaging_accounts.id) */
    accountId?: string
  }
}

export const useProjectWizardStore = defineStore('projectWizard', () => {
  // ============================================================================
  // ESTADO
  // ============================================================================

  const currentStep = ref(1)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentProjectId = ref<string | null>(null)
  const isSyncing = ref(false)

  // G2.2: Auto-save a cada 30 segundos
  let autoSaveIntervalId: ReturnType<typeof setInterval> | null = null
  const AUTO_SAVE_INTERVAL = 30000 // 30 segundos
  const STORAGE_KEY = 'adsmagic_wizard_data'

  const projectData = ref<ProjectData>({
    name: '',
    segment: '',
    platforms: {
      metaAds: false,
      googleAds: false,
    },
    metaCampaignType: '',
    trackableLinks: [],
  })

  // ============================================================================
  // COMPUTED - STEPS DINÂMICOS
  // ============================================================================

  /**
   * Verifica se deve mostrar a etapa de tipo de campanha Meta
   */
  const shouldShowMetaCampaignType = computed(() => {
    return projectData.value.platforms.metaAds
  })

  /**
   * Verifica se deve mostrar a etapa de links rastreáveis
   * Aparece se: Google Ads OU (Meta Ads E campanha de tráfego)
   */
  const shouldShowTrackableLinks = computed(() => {
    const googleSelected = projectData.value.platforms.googleAds
    const metaWithTraffic = projectData.value.platforms.metaAds &&
      projectData.value.metaCampaignType === 'traffic'

    return googleSelected || metaWithTraffic
  })

  /**
   * Retorna array com os steps ativos (visíveis)
   */
  const activeSteps = computed(() => {
    const steps = []

    steps.push(1) // Informações do Projeto
    steps.push(2) // Seleção de Plataformas

    if (shouldShowMetaCampaignType.value) {
      steps.push(3) // Tipo de Campanha Meta
    }

    steps.push(4) // Configurações das Plataformas

    if (shouldShowTrackableLinks.value) {
      steps.push(5) // Links Rastreáveis
    }

    steps.push(6) // WhatsApp

    return steps
  })

  /**
   * Total de steps (dinâmico: 5 ou 6)
   */
  const totalSteps = computed(() => activeSteps.value.length)

  /**
   * Índice do step atual no array de steps ativos
   */
  const currentStepIndex = computed(() => {
    return activeSteps.value.indexOf(currentStep.value)
  })

  /**
   * Verifica se é o último step
   */
  const isLastStep = computed(() => {
    return currentStep.value === activeSteps.value[activeSteps.value.length - 1]
  })

  // ============================================================================
  // COMPUTED - VALIDAÇÕES
  // ============================================================================

  /**
   * Verifica se pode avançar para o próximo passo
   */
  const canProceed = computed(() => {
    switch (currentStep.value) {
      case 1:
        // Step 1: Nome e Segmento
        return projectData.value.name.trim() !== '' && projectData.value.segment !== ''

      case 2:
        // Step 2: Pelo menos uma plataforma
        return projectData.value.platforms.metaAds || projectData.value.platforms.googleAds

      case 3:
        // Step 3: Tipo de campanha Meta (se ativo)
        if (shouldShowMetaCampaignType.value) {
          return projectData.value.metaCampaignType !== '' &&
            projectData.value.metaCampaignType !== undefined
        }
        return true

      case 4:
        // Step 4: Configurações das plataformas
        if (projectData.value.platforms.metaAds && !projectData.value.metaAds?.connected) {
          return false
        }
        if (projectData.value.platforms.googleAds && !projectData.value.googleAds?.connected) {
          return false
        }
        return true

      case 5:
        // Step 5: Links rastreáveis (se ativo) - pelo menos 1 link
        if (shouldShowTrackableLinks.value) {
          return (projectData.value.trackableLinks?.length ?? 0) > 0
        }
        return true

      case 6:
        // Step 6: WhatsApp (opcional)
        return true

      default:
        return false
    }
  })

  /**
   * Verifica se pode voltar
   */
  const canGoBack = computed(() => currentStep.value > 1)

  /**
   * Verifica se pode finalizar
   */
  const canComplete = computed(() => isLastStep.value && canProceed.value)

  /**
   * Progresso em porcentagem (dinâmico)
   */
  const progress = computed(() => {
    return ((currentStepIndex.value + 1) / totalSteps.value) * 100
  })

  // ============================================================================
  // AÇÕES - NAVEGAÇÃO
  // ============================================================================

  /**
   * Avança para o próximo passo ativo
   */
  function nextStep() {

    if (!canProceed.value) {
      console.warn('[ProjectWizard Store] nextStep bloqueado - canProceed é false')
      return
    }

    const currentIndex = currentStepIndex.value
    const nextIndex = currentIndex + 1

    if (nextIndex < activeSteps.value.length) {
      const nextStepNumber = activeSteps.value[nextIndex]
      currentStep.value = nextStepNumber!
    } else {
      console.warn('[ProjectWizard Store] nextStep bloqueado - já está no último step')
    }
  }

  /**
   * Volta para o passo anterior ativo
   */
  function previousStep() {
    if (!canGoBack.value) return

    const currentIndex = currentStepIndex.value
    const prevIndex = currentIndex - 1

    if (prevIndex >= 0) {
      currentStep.value = activeSteps.value[prevIndex]!
    }
  }

  /**
   * Vai para um passo específico (apenas passos anteriores e ativos)
   */
  function goToStep(step: number) {
    // Verifica se o step está no array de ativos
    if (!activeSteps.value.includes(step)) return

    // Só permite ir para steps anteriores
    const targetIndex = activeSteps.value.indexOf(step)
    const currentIndex = currentStepIndex.value

    if (targetIndex < currentIndex && targetIndex >= 0) {
      currentStep.value = step
    }
  }

  /**
   * Atualiza dados do projeto
   */
  function updateProjectData(data: Partial<ProjectData>) {
    projectData.value = {
      ...projectData.value,
      ...data,
    }
  }

  // ============================================================================
  // AÇÕES - ESTADO
  // ============================================================================

  /**
   * Define erro
   */
  function setError(message: string) {
    error.value = message
  }

  /**
   * Limpa erro
   */
  function clearError() {
    error.value = null
  }

  /**
   * Define estado de loading
   */
  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  // ============================================================================
  // G2.2: AUTO-SAVE E PERSISTÊNCIA LOCAL
  // ============================================================================

  /**
   * Salva estado no localStorage como backup
   */
  function saveToLocalStorage(): void {
    try {
      const data = {
        currentStep: currentStep.value,
        projectData: projectData.value,
        currentProjectId: currentProjectId.value,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.warn('[ProjectWizard] Erro ao salvar localStorage:', err)
    }
  }

  /**
   * Carrega estado do localStorage
   */
  function loadFromLocalStorage(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return false

      const data = JSON.parse(saved)

      // Verificar se dados não são muito antigos (24 horas)
      if (data.savedAt) {
        const savedDate = new Date(data.savedAt)
        const now = new Date()
        const diffHours = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60)
        if (diffHours > 24) {
          clearLocalStorage()
          return false
        }
      }

      if (data.currentStep) currentStep.value = data.currentStep
      if (data.projectData) projectData.value = { ...projectData.value, ...data.projectData }
      if (data.currentProjectId) currentProjectId.value = data.currentProjectId

      return true
    } catch (err) {
      console.warn('[ProjectWizard] Erro ao carregar localStorage:', err)
      return false
    }
  }

  /**
   * Limpa localStorage
   */
  function clearLocalStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.warn('[ProjectWizard] Erro ao limpar localStorage:', err)
    }
  }

  /**
   * Inicia auto-save periódico (30s)
   */
  function startAutoSave(): void {
    // Parar auto-save existente se houver
    stopAutoSave()

    autoSaveIntervalId = setInterval(async () => {
      // Salvar no localStorage sempre (sync)
      saveToLocalStorage()

      // Salvar no backend se tiver projeto criado
      if (currentProjectId.value && !isSyncing.value) {
        try {
          await saveToBackend()
        } catch (err) {
          console.warn('[ProjectWizard] Erro no auto-save backend:', err)
        }
      }
    }, AUTO_SAVE_INTERVAL)
  }

  /**
   * Para auto-save periódico
   */
  function stopAutoSave(): void {
    if (autoSaveIntervalId) {
      clearInterval(autoSaveIntervalId)
      autoSaveIntervalId = null
    }
  }

  // ============================================================================
  // AÇÕES - ESTADO E RESET
  // ============================================================================

  /**
   * Reseta o wizard para estado inicial
   */
  function reset() {
    stopAutoSave() // G2.2: Parar auto-save ao resetar
    currentStep.value = 1
    isLoading.value = false
    error.value = null
    currentProjectId.value = null
    projectData.value = {
      name: '',
      segment: '',
      platforms: {
        metaAds: false,
        googleAds: false,
      },
      metaCampaignType: '',
      trackableLinks: [],
    }
    clearLocalStorage() // G2.2: Limpar localStorage ao resetar
  }

  /**
   * Salva progresso no backend
   */
  async function saveToBackend() {
    isSyncing.value = true
    try {
      const { useCompaniesStore } = await import('@/stores/companies')
      const { useAuthStore } = await import('@/stores/auth')
      const { projectWizardService } = await import('@/services/api/projectWizardService')

      const companiesStore = useCompaniesStore()
      const authStore = useAuthStore()

      // Modo mock: se Supabase desabilitado, não chamar API real
      if (!supabase) {
        console.warn('[ProjectWizard] Supabase desabilitado - salvando progresso em modo mock')

        // Garantir empresa mock
        if (!companiesStore.currentCompanyId) {
          const mockCompany = {
            id: `mock-company-${Date.now()}`,
            name: 'Empresa Mock',
          }
          companiesStore.companies = [mockCompany as any]
          companiesStore.currentCompany = mockCompany as any
          localStorage.setItem('current_company_id', mockCompany.id)
        }

        // Criar/atualizar projeto mock
        const mockProjectId = currentProjectId.value || `mock-project-${Date.now()}`
        const mockProject = {
          id: mockProjectId,
          company_id: companiesStore.currentCompanyId || 'mock-company',
          name: projectData.value.name || 'Projeto Mock',
          wizard_progress: {
            current_step: currentStep.value,
            data: projectData.value,
            last_saved_at: new Date().toISOString()
          },
          wizard_current_step: currentStep.value,
          status: 'draft',
          created_at: new Date().toISOString()
        }

        currentProjectId.value = mockProjectId
        localStorage.setItem('current_project_id', mockProjectId)
        cacheService.invalidatePattern('projects:')
        return mockProject as any
      }

      // Garantir que empresas estão carregadas
      if (!companiesStore.currentCompanyId) {
        await companiesStore.fetchCompanies() // Usa cache de 5min se disponível
      }

      // Validação com mensagem amigável
      if (!companiesStore.currentCompanyId || !authStore.user) {
        throw new Error('Você precisa criar uma empresa antes de criar um projeto')
      }

      const project = await projectWizardService.saveProgress({
        projectId: currentProjectId.value || undefined,
        companyId: companiesStore.currentCompanyId,
        userId: authStore.user.id,
        currentStep: currentStep.value,
        projectData: projectData.value
      })

      currentProjectId.value = project.id

      // Salvar projectId no localStorage para que apiClient possa usar
      if (project.id) {
        localStorage.setItem('current_project_id', project.id)
      }

      // Invalidar cache de projetos para garantir que lista seja atualizada
      if (companiesStore.currentCompanyId) {
        cacheService.invalidatePattern(`projects:${companiesStore.currentCompanyId}`)
      }

      return project
    } catch (error) {
      console.error('Erro ao salvar no backend:', error)
      throw error
    } finally {
      isSyncing.value = false
    }
  }

  function inferStepFromProjectData(data: ProjectData): number {
    if (!data.name.trim() || !data.segment) {
      return 1
    }

    const hasSelectedPlatform = data.platforms.metaAds || data.platforms.googleAds
    if (!hasSelectedPlatform) {
      return 2
    }

    if (data.platforms.metaAds && !data.metaCampaignType) {
      return 3
    }

    if ((data.platforms.metaAds && !data.metaAds?.connected) || (data.platforms.googleAds && !data.googleAds?.connected)) {
      return 4
    }

    return 6
  }

  /**
   * Carrega progresso do backend
   */
  async function loadFromBackend(projectId: string) {
    isLoading.value = true
    clearError()

    try {
      const { projectWizardService } = await import('@/services/api/projectWizardService')
      const { projectWizardAdapter } = await import('@/services/adapters/projectWizardAdapter')

      const project = await projectWizardService.loadProgress(projectId)

      if (!project) {
        console.warn('[ProjectWizard Store] Projeto não encontrado:', projectId)
        setError('Projeto não encontrado. Criando novo wizard...')
        reset()
        return
      }

      // Verificar se projeto tem wizard_progress
      if (!project.wizard_progress) {
        console.warn('[ProjectWizard Store] Projeto sem wizard_progress. Aplicando fallback com snapshot do projeto.')
        projectData.value = projectWizardAdapter.fromProjectSnapshot(project)
        currentStep.value = inferStepFromProjectData(projectData.value)
        currentProjectId.value = project.id

        if (project.id) {
          localStorage.setItem('current_project_id', project.id)
        }
        return
      }

      // Tentar converter dados do banco
      const data = projectWizardAdapter.fromDatabase(project as any)

      if (!data) {
        console.error('[ProjectWizard Store] Adapter retornou null. Estrutura do wizard_progress pode estar inválida.')
        console.error('[ProjectWizard Store] wizard_progress recebido:', project.wizard_progress)

        // Fallback para snapshot do projeto quando wizard_progress estiver inconsistente
        projectData.value = projectWizardAdapter.fromProjectSnapshot(project)
        currentStep.value = inferStepFromProjectData(projectData.value)
        currentProjectId.value = project.id

        // Salvar projectId no localStorage para que apiClient possa usar
        if (project.id) {
          localStorage.setItem('current_project_id', project.id)
        }

        setError('Não foi possível carregar todos os dados salvos. Alguns campos foram reinicializados.')
        return
      }

      // Dados carregados com sucesso
      projectData.value = data
      currentStep.value = project.wizard_current_step || inferStepFromProjectData(data)
      currentProjectId.value = project.id

      // Salvar projectId no localStorage para que apiClient possa usar
      if (project.id) {
        localStorage.setItem('current_project_id', project.id)
      }

    } catch (error) {
      console.error('[ProjectWizard Store] ❌ Erro ao carregar do backend:', error)

      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[ProjectWizard Store] Mensagem de erro:', errorMessage)

      // Mensagem de erro amigável baseada no tipo de erro
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setError('Projeto não encontrado. Verifique se o projeto ainda existe.')
      } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        setError('Erro de conexão. Verificando dados salvos localmente...')
      } else {
        setError('Erro ao carregar dados do projeto.')
      }

      // Resetar para estado limpo em caso de erro
      reset()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Finaliza o assistente
   * @returns projectId do projeto completado ou null em caso de erro
   */
  async function complete(): Promise<string | null> {
    setLoading(true)
    clearError()

    try {
      const { projectWizardService } = await import('@/services/api/projectWizardService')

      if (!currentProjectId.value) {
        // Criar projeto se não existir
        await saveToBackend()
      }

      // Completar wizard e obter projeto atualizado
      const completedProject = await projectWizardService.completeWizard(
        currentProjectId.value!
      )

      // Salvar projectId no localStorage antes de resetar
      const projectId = completedProject.id
      if (projectId) {
        localStorage.setItem('current_project_id', projectId)
      }

      stopAutoSave() // G2.2: Parar auto-save ao completar
      clearLocalStorage() // G2.2: Limpar localStorage ao completar
      reset()
      return projectId
    } catch (err) {
      setError('Erro ao criar projeto. Tente novamente.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    // Estado
    currentStep,
    isLoading,
    error,
    projectData,
    currentProjectId,
    isSyncing,

    // Computed - Steps Dinâmicos
    shouldShowMetaCampaignType,
    shouldShowTrackableLinks,
    activeSteps,
    totalSteps,
    currentStepIndex,
    isLastStep,

    // Computed - Validações
    canProceed,
    canGoBack,
    canComplete,
    progress,

    // Ações
    nextStep,
    previousStep,
    goToStep,
    updateProjectData,
    setError,
    clearError,
    setLoading,
    reset,
    complete,
    saveToBackend,
    loadFromBackend,

    // G2.2: Auto-save
    startAutoSave,
    stopAutoSave,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
})
