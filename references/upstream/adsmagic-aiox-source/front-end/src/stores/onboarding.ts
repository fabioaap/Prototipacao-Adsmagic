/**
 * Store do wizard de onboarding
 * Gerencia estado dos steps e dados temporários durante o processo
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ZodError } from 'zod'
import type {
  OnboardingData,
  OnboardingState,
  CompanyType,
  FranchiseCount
} from '@/types/onboarding'
import {
  onboardingDataSchema,
  isOnboardingDataComplete
} from '@/types/onboarding'
import { onboardingApiService } from '@/services/api/onboardingService'

// ============================================================================
// CONSTANTES
// ============================================================================

const TOTAL_STEPS = 3
const STORAGE_KEY = 'adsmagic_onboarding_data'

// ============================================================================
// HELPERS DE PERSISTÊNCIA
// ============================================================================

/**
 * Salva dados no localStorage
 */
function saveToLocalStorage(data: {
  currentStep: number
  companyType: string | null
  franchiseCount: string | null
  franchiseName: string
}): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString()
    }))
  } catch (error) {
    console.warn('[Onboarding] Erro ao salvar no localStorage:', error)
  }
}

/**
 * Carrega dados do localStorage
 */
function loadFromLocalStorage(): {
  currentStep: number
  companyType: string | null
  franchiseCount: string | null
  franchiseName: string
} | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null

    const data = JSON.parse(saved)

    // Verificar se dados não são muito antigos (7 dias)
    if (data.savedAt) {
      const savedDate = new Date(data.savedAt)
      const now = new Date()
      const diffDays = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays > 7) {
        clearLocalStorage()
        return null
      }
    }

    return data
  } catch (error) {
    console.warn('[Onboarding] Erro ao carregar do localStorage:', error)
    return null
  }
}

/**
 * Limpa dados do localStorage
 */
function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('[Onboarding] Erro ao limpar localStorage:', error)
  }
}

// ============================================================================
// STORE DEFINITION
// ============================================================================

export const useOnboardingStore = defineStore('onboarding', () => {
  // ============================================================================
  // ESTADO REATIVO
  // ============================================================================

  /**
   * Step atual do wizard (1-3)
   */
  const currentStep = ref<number>(1)

  /**
   * Tipo de empresa selecionado
   */
  const companyType = ref<CompanyType | null>(null)

  /**
   * Quantidade de franquias selecionada
   */
  const franchiseCount = ref<FranchiseCount | null>(null)

  /**
   * Nome da primeira franquia
   */
  const franchiseName = ref<string>('')

  /**
   * Estado de carregamento durante operações assíncronas
   */
  const isLoading = ref(false)

  /**
   * Mensagem de erro da última operação
   */
  const error = ref<string | null>(null)

  /**
   * Indica se o onboarding foi completado com sucesso
   */
  const isCompleted = ref(false)

  // ============================================================================
  // GETTERS COMPUTADOS
  // ============================================================================

  /**
   * Estado completo do onboarding
   */
  const state = computed<OnboardingState>(() => ({
    currentStep: currentStep.value,
    companyType: companyType.value,
    franchiseCount: franchiseCount.value,
    franchiseName: franchiseName.value,
    isCompleted: isCompleted.value,
  }))

  /**
   * Dados coletados até o momento
   */
  const collectedData = computed(() => ({
    companyType: companyType.value || undefined,
    franchiseCount: franchiseCount.value || undefined,
    franchiseName: franchiseName.value,
  }))

  /**
   * Verifica se o step atual é válido
   */
  const isCurrentStepValid = computed(() => {
    switch (currentStep.value) {
      case 1:
        return companyType.value !== null
      case 2:
        return franchiseCount.value !== null
      case 3:
        return franchiseName.value.trim().length >= 2
      default:
        return false
    }
  })

  /**
   * Verifica se pode avançar para o próximo step
   */
  const canProceed = computed(() => {
    return isCurrentStepValid.value && currentStep.value < TOTAL_STEPS
  })

  /**
   * Verifica se pode voltar para o step anterior
   */
  const canGoBack = computed(() => {
    return currentStep.value > 1
  })

  /**
   * Verifica se o step atual pode ser pulado
   * Step 2 (quantidade de franquias) pode ser pulado
   */
  const canSkip = computed(() => {
    return currentStep.value === 2
  })

  /**
   * Verifica se pode finalizar o onboarding
   */
  const canComplete = computed(() => {
    return isCurrentStepValid.value &&
      currentStep.value === TOTAL_STEPS &&
      isOnboardingDataComplete(collectedData.value)
  })

  /**
   * Progresso do onboarding (0-100)
   */
  const progress = computed(() => {
    return Math.round((currentStep.value / TOTAL_STEPS) * 100)
  })

  /**
   * Verifica se todos os dados necessários foram coletados
   */
  const isDataComplete = computed(() => {
    const data = collectedData.value
    return !!(
      data.companyType &&
      data.franchiseCount &&
      data.franchiseName &&
      data.franchiseName.trim().length >= 2
    )
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Avança para o próximo step
   */
  const nextStep = (): boolean => {
    if (!canProceed.value) {
      return false
    }

    if (currentStep.value < TOTAL_STEPS) {
      currentStep.value++
      clearError()
      persistCurrentState() // G1.2: Persistir ao avançar step
      return true
    }

    return false
  }

  /**
   * Volta para o step anterior
   */
  const previousStep = (): boolean => {
    if (!canGoBack.value) {
      return false
    }

    currentStep.value--
    clearError()
    persistCurrentState() // G1.2: Persistir ao voltar step
    return true
  }

  /**
   * Vai para um step específico
   */
  const goToStep = (step: number): boolean => {
    if (step < 1 || step > TOTAL_STEPS) {
      error.value = 'Step inválido'
      return false
    }

    currentStep.value = step
    clearError()
    persistCurrentState() // G1.2: Persistir ao ir para step específico
    return true
  }

  /**
   * Pula o step atual e avança para o próximo (G1.7: skip opcional)
   */
  const skipStep = (): boolean => {
    if (!canSkip.value) {
      return false
    }

    // Define valor padrão para o step pulado
    if (currentStep.value === 2 && franchiseCount.value === null) {
      franchiseCount.value = '2-5' // Valor padrão
    }

    if (currentStep.value < TOTAL_STEPS) {
      currentStep.value++
      clearError()
      persistCurrentState()
      return true
    }

    return false
  }

  /**
   * Atualiza o tipo de empresa selecionado
   */
  const setCompanyType = (type: CompanyType): void => {
    companyType.value = type
    clearError()
    persistCurrentState()
  }

  /**
   * Atualiza a quantidade de franquias selecionada
   */
  const setFranchiseCount = (count: FranchiseCount): void => {
    franchiseCount.value = count
    clearError()
    persistCurrentState()
  }

  /**
   * Atualiza o nome da franquia
   */
  const setFranchiseName = (name: string): void => {
    franchiseName.value = name
    clearError()
    // Não persistir em cada keystroke, apenas no blur ou submit
  }

  /**
   * Persiste o estado atual no localStorage (G1.2)
   */
  const persistCurrentState = (): void => {
    saveToLocalStorage({
      currentStep: currentStep.value,
      companyType: companyType.value,
      franchiseCount: franchiseCount.value,
      franchiseName: franchiseName.value
    })
  }

  /**
   * Interface para dados parciais de atualização
   */
  interface PartialOnboardingData {
    companyType?: CompanyType
    franchiseCount?: FranchiseCount
    franchiseName?: string
  }

  /**
   * Atualiza múltiplos dados de uma vez
   */
  const updateData = (data: PartialOnboardingData): void => {
    if (data.companyType !== undefined) {
      companyType.value = data.companyType
    }
    if (data.franchiseCount !== undefined) {
      franchiseCount.value = data.franchiseCount
    }
    if (data.franchiseName !== undefined) {
      franchiseName.value = data.franchiseName
    }
    clearError()
  }

  /**
   * Valida os dados coletados usando schema Zod
   */
  const validateData = (): { isValid: boolean; errors: string[] } => {
    try {
      // Converte null para undefined para compatibilidade com o schema
      const dataToValidate = {
        ...collectedData.value,
        companyType: collectedData.value.companyType || undefined,
        franchiseCount: collectedData.value.franchiseCount || undefined,
      }
      onboardingDataSchema.parse(dataToValidate)
      return { isValid: true, errors: [] }
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => issue.message)
        return { isValid: false, errors }
      }
      return { isValid: false, errors: ['Erro de validação desconhecido'] }
    }
  }

  /**
   * Finaliza o onboarding e marca como completado
   */
  const complete = async (): Promise<OnboardingData> => {
    if (!canComplete.value) {
      throw new Error('Dados incompletos para finalizar onboarding')
    }

    isLoading.value = true
    error.value = null

    // Cria dados finais (fora do try para estar disponível no catch)
    const finalData: OnboardingData = {
      companyType: companyType.value!,
      franchiseCount: franchiseCount.value!,
      franchiseName: franchiseName.value.trim(),
      completedAt: new Date(),
    }

    try {
      // Importar stores dinamicamente para evitar dependência circular
      const { useAuthStore } = await import('./auth')

      const authStore = useAuthStore()

      if (!authStore.user) {
        throw new Error('Usuário não autenticado')
      }

      // Valida dados finais
      const validation = validateData()
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // NOTA: A criação da empresa é feita no OnboardingView após este método
      // para garantir que seja criada apenas uma vez no final do onboarding
      
      // Marcar onboarding como completo no backend (apenas se Supabase ativo)
      const { supabaseEnabled } = await import('@/services/api/supabaseClient')
      if (supabaseEnabled) {
        await onboardingApiService.completeOnboarding(authStore.user.id, finalData)
        
        // O company_id será atualizado depois que a empresa for criada
        // no createCompanyFromOnboarding() do OnboardingView
      } else {
      }

      // Marca como completado
      isCompleted.value = true

      // G1.2: Limpar localStorage após sucesso
      clearLocalStorage()

      return finalData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao finalizar onboarding'
      error.value = errorMessage

      // Log detalhado para debug
      console.error('[Onboarding] Erro ao completar:', {
        error: err,
        step: 'create_company',
        data: finalData
      })

      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reseta o estado do onboarding
   */
  const reset = (): void => {
    currentStep.value = 1
    companyType.value = null
    franchiseCount.value = null
    franchiseName.value = ''
    isCompleted.value = false
    error.value = null
    clearLocalStorage() // G1.2: Limpar localStorage ao resetar
  }

  /**
   * Inicializa a store carregando dados salvos (G1.2)
   * Prioridade: localStorage > backend
   */
  const initialize = (): void => {
    // Primeiro tenta carregar do localStorage (mais rápido)
    const savedData = loadFromLocalStorage()
    if (savedData) {
      currentStep.value = savedData.currentStep || 1
      companyType.value = savedData.companyType as CompanyType | null
      franchiseCount.value = savedData.franchiseCount as FranchiseCount | null
      franchiseName.value = savedData.franchiseName || ''
    }
  }

  /**
   * Carrega dados salvos (do localStorage ou backend)
   */
  const loadSavedData = (data: any): void => {
    if (data.companyType) {
      companyType.value = data.companyType
    }
    if (data.franchiseCount) {
      franchiseCount.value = data.franchiseCount
    }
    if (data.franchiseName) {
      franchiseName.value = data.franchiseName
    }
  }

  /**
   * Limpa mensagens de erro
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * Carrega progresso do backend
   */
  const loadProgress = async (): Promise<void> => {
    // Importar stores dinamicamente para evitar dependência circular
    const { useAuthStore } = await import('./auth')
    const authStore = useAuthStore()

    if (!authStore.user) {
      throw new Error('Usuário não autenticado')
    }

    isLoading.value = true
    error.value = null

    try {
      const progress = await onboardingApiService.getProgress(authStore.user.id)

      if (progress) {
        // Se já completou, marcar como completo
        if (progress.is_completed) {
          isCompleted.value = true
          return
        }

        // Restaurar dados salvos
        if (progress.onboarding_data) {
          loadSavedData(progress.onboarding_data)
        }
      } else {
        // Criar registro inicial
        await onboardingApiService.createProgress(authStore.user.id, {})
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar progresso'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Salva progresso no backend
   */
  const saveProgress = async (): Promise<void> => {
    // Importar stores dinamicamente para evitar dependência circular
    const { useAuthStore } = await import('./auth')
    const authStore = useAuthStore()

    if (!authStore.user) return

    try {
      await onboardingApiService.updateProgress(authStore.user.id, {
        onboarding_data: collectedData.value
      })
    } catch (err) {
      console.error('Erro ao salvar progresso:', err)
    }
  }

  // ============================================================================
  // RETORNO DA STORE
  // ============================================================================

  return {
    // Estado
    currentStep,
    companyType,
    franchiseCount,
    franchiseName,
    isLoading,
    error,
    isCompleted,

    // Getters
    state,
    collectedData,
    isCurrentStepValid,
    canProceed,
    canGoBack,
    canSkip,
    canComplete,
    progress,
    isDataComplete,

    // Actions
    nextStep,
    previousStep,
    skipStep,
    goToStep,
    setCompanyType,
    setFranchiseCount,
    setFranchiseName,
    updateData,
    validateData,
    complete,
    reset,
    initialize,
    persistCurrentState,
    loadSavedData,
    clearError,
    loadProgress,
    saveProgress,
  }
})
