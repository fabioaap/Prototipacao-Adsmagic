<!--
  View principal do onboarding
  Container que gerencia navegação entre steps e botões de ação
-->

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useOnboardingStore } from '@/stores/onboarding'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/toast/use-toast'
import { onboardingService } from '@/services/onboarding'
import { supabase } from '@/services/api/supabaseClient'
import { ensureSession } from '@/services/api/client'
import { analytics } from '@/services/analytics'
import { isCompanyAlreadyExistsError, isRlsForbiddenError } from '@/services/api/companiesService'
import OnboardingLayout from '@/components/features/onboarding/OnboardingLayout.vue'
import Button from '@/components/ui/Button.vue'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import type { CreateCompanyDTO } from '@/types'
import type { OnboardingData } from '@/types/onboarding'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

// Importa os steps
import StepCompanyType from './steps/StepCompanyType.vue'
import StepFranchiseCount from './steps/StepFranchiseCount.vue'
import StepFranchiseName from './steps/StepFranchiseName.vue'

// ============================================================================
// COMPONENTES DOS STEPS
// ============================================================================

const stepComponents = {
  1: StepCompanyType,
  2: StepFranchiseCount,
  3: StepFranchiseName,
}

// ============================================================================
// STORES E ROUTER
// ============================================================================

const router = useRouter()
const onboardingStore = useOnboardingStore()
const authStore = useAuthStore()
const { toast } = useToast()

// ============================================================================
// ESTADO LOCAL
// ============================================================================

/**
 * Referência para o componente step atual
 */
const currentStepRef = ref<any>(null)

/**
 * Se está finalizando o onboarding
 */
const isCompleting = ref(false)

function getOnboardingErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as {
      message?: string
      code?: string
      response?: { status?: number; data?: { message?: string; error?: string; code?: string } }
      status?: number
    }

    const status = err.response?.status ?? err.status
    if (status === 401) {
      return 'Sua sessão expirou. Faça login novamente.'
    }

    const errorCode = err.response?.data?.code ?? err.code
    if (status === 403 && (errorCode === 'RLS_FORBIDDEN' || errorCode === 'FORBIDDEN')) {
      return 'Você não tem permissão para criar empresa no momento. Tente novamente mais tarde ou contate o suporte.'
    }

    if (err.response?.data?.error) {
      return err.response.data.error
    }

    if (err.response?.data?.message) {
      return err.response.data.message
    }

    if (err.message) {
      return err.message
    }
  }

  return t('onboarding.errors.completeError')
}

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Step atual
 */
const currentStep = computed(() => onboardingStore.currentStep)

/**
 * Componente do step atual
 */
const currentStepComponent = computed(() => stepComponents[currentStep.value as keyof typeof stepComponents])

/**
 * Se pode avançar
 */
const canProceed = computed(() => {
  return onboardingStore.canProceed && !isCompleting.value
})

/**
 * Se pode voltar
 */
const canGoBack = computed(() => {
  return onboardingStore.canGoBack && !isCompleting.value
})

/**
 * Se pode pular o step atual (G1.7: skip opcional)
 */
const canSkip = computed(() => {
  return onboardingStore.canSkip && !isCompleting.value
})

/**
 * Se pode finalizar
 */
const canComplete = computed(() => {
  return onboardingStore.canComplete && !isCompleting.value
})

/**
 * Se está carregando
 */
const isLoading = computed(() => {
  return onboardingStore.isLoading || isCompleting.value
})

/**
 * Labels dos steps para o stepper
 */
const stepLabels = computed(() => [
  t('onboarding.steps.companyType'),
  t('onboarding.steps.franchiseCount'),
  t('onboarding.steps.franchiseName')
])

/**
 * Texto do botão principal
 */
const primaryButtonText = computed(() => {
  if (isLoading.value) {
    return currentStep.value === 3 ? t('onboarding.finishing') : t('onboarding.loading')
  }
  return currentStep.value === 3 ? t('onboarding.finish') : t('onboarding.continue')
})


/**
 * Progresso (0-100) para a barra do topo
 */
const progress = computed(() => (currentStep.value / 3) * 100)

// ============================================================================
// CRIAÇÃO DE EMPRESA
// ============================================================================

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_COUNTRY = 'BR' as const
const DEFAULT_CURRENCY = 'BRL' as const
const DEFAULT_TIMEZONE = 'America/Sao_Paulo' as const
const DEFAULT_INDUSTRY = 'general' as const
const DEFAULT_COMPANY_SIZE = 'small' as const
const DEFAULT_COMPANY_NAME = 'Minha Empresa' as const

// ============================================================================
// TIPOS
// ============================================================================

type OnboardingFinalData = OnboardingData & {
  name?: string
  [key: string]: unknown
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Cria empresa mock para modo de desenvolvimento
 */
async function createMockCompany(finalData: OnboardingFinalData): Promise<void> {
  const { useCompaniesStore } = await import('@/stores/companies')
  const companiesStore = useCompaniesStore()

  const mockCompany = {
    id: `mock-company-${Date.now()}`,
    name: finalData?.franchiseName || finalData?.name || DEFAULT_COMPANY_NAME,
    description: 'Empresa mock criada no onboarding',
    country: DEFAULT_COUNTRY,
    currency: DEFAULT_CURRENCY,
    timezone: DEFAULT_TIMEZONE,
    industry: DEFAULT_INDUSTRY,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  companiesStore.companies = [mockCompany as any]
  companiesStore.currentCompany = mockCompany as any
  localStorage.setItem('current_company_id', mockCompany.id)
}

/**
 * Mapeia dados do onboarding para CreateCompanyDTO
 */
function mapOnboardingDataToCompanyData(finalData: OnboardingFinalData): CreateCompanyDTO {
  return {
    name: finalData?.franchiseName ?? finalData?.name ?? DEFAULT_COMPANY_NAME,
    description: 'Empresa criada durante onboarding',
    country: DEFAULT_COUNTRY,
    currency: DEFAULT_CURRENCY,
    timezone: DEFAULT_TIMEZONE,
    industry: DEFAULT_INDUSTRY,
    size: DEFAULT_COMPANY_SIZE
  }
}

/**
 * Verifica se usuário já tem empresa, usando cache do store quando disponível
 */
async function checkExistingCompany(): Promise<{ hasCompany: boolean; companyId?: string }> {
  const { useCompaniesStore } = await import('@/stores/companies')
  const companiesStore = useCompaniesStore()

  // Usa dados já carregados no store (do login) em vez de re-buscar na API
  if (companiesStore.companies.length > 0) {
    const existingCompany = companiesStore.companies[0]
    if (!existingCompany) return { hasCompany: false }
    companiesStore.setCurrentCompany(existingCompany)
    return { hasCompany: true, companyId: existingCompany.id }
  }

  return { hasCompany: false }
}

/**
 * Em caso de conflito 409, busca a empresa existente na API
 */
async function ensureCompanyAvailableAfterConflict(): Promise<string> {
  const { useCompaniesStore } = await import('@/stores/companies')
  const companiesStore = useCompaniesStore()

  await companiesStore.fetchCompanies({ force: true, reason: 'mutation' })

  const existingCompany = companiesStore.companies[0]
  if (!existingCompany) {
    throw new Error('Conflito ao criar empresa, mas nenhuma empresa vinculada foi encontrada.')
  }

  return existingCompany.id
}

/**
 * Atualiza progresso do onboarding com company_id
 */
async function updateOnboardingProgress(userId: string, companyId: string): Promise<void> {
  if (!supabase) return
  
  const { onboardingApiService } = await import('@/services/api/onboardingService')
  try {
    await onboardingApiService.updateProgress(userId, {
      company_id: companyId,
      company_setup: true
    })
    console.log('[Onboarding] ✅ Onboarding progress updated with company_id')
  } catch (progressError) {
    // Não bloquear o fluxo se falhar ao atualizar progresso
    console.warn('[Onboarding] Failed to update progress with company_id:', progressError)
  }
}

/**
 * Verifica se o erro é de conflito (usuário já tem empresa)
 */
async function createCompanyFromOnboarding(finalData: OnboardingFinalData): Promise<string> {
  try {
    console.log('[Onboarding] 🏢 Creating company from onboarding data...')
    
    if (!authStore.user?.id) {
      throw new Error('Usuário não autenticado')
    }
    
    // Modo mock: se Supabase estiver desabilitado, criar empresa fake localmente
    if (!supabase) {
      console.warn('[Onboarding] Supabase desabilitado - criando empresa mock')
      await createMockCompany(finalData)
      const { hasCompany, companyId } = await checkExistingCompany()
      if (!hasCompany || !companyId) {
        throw new Error('Falha ao criar empresa mock')
      }
      return companyId
    }

    // Verificar se usuário já tem empresa (idempotência)
    const { hasCompany, companyId } = await checkExistingCompany()
    if (hasCompany && companyId) {
      console.log('[Onboarding] ✅ User already has company, using existing')
      return companyId
    }
    
    // Mapear e criar empresa
    const { companiesService } = await import('@/services/api/companiesService')
    const companyData = mapOnboardingDataToCompanyData(finalData)
    
    console.log('[Onboarding] Company data:', companyData)
    
    const company = await companiesService.createCompany(companyData, authStore.user.id)
    
    if (!company?.id) {
      throw new Error('Empresa criada mas ID não retornado')
    }
    
    console.log('[Onboarding] ✅ Company created successfully:', company.id)

    // Setar empresa diretamente no store (evita re-fetch da API)
    const { useCompaniesStore } = await import('@/stores/companies')
    const companiesStore = useCompaniesStore()
    companiesStore.companies = [company]
    companiesStore.setCurrentCompany(company)
    return company.id
    
  } catch (error: unknown) {
    console.error('[Onboarding] ❌ Error creating company:', error)

    if (isCompanyAlreadyExistsError(error)) {
      console.log('[Onboarding] Conflict indicates existing company; validating link...')
      const existingCompanyId = await ensureCompanyAvailableAfterConflict()
      return existingCompanyId
    }

    if (isRlsForbiddenError(error)) {
      throw new Error('Permissão insuficiente para criar empresa.')
    }
    
    throw new Error('Erro ao criar empresa. Tente novamente.')
  }
}

// ============================================================================
// MÉTODOS
// ============================================================================

/**
 * Manipula ação do botão principal (avançar ou finalizar)
 */
const handlePrimaryAction = async (): Promise<void> => {
  if (currentStep.value === 3) {
    await handleComplete()
  } else {
    handleContinue()
  }
}

/**
 * Avança para o próximo step
 */
const handleContinue = (): void => {
  if (currentStepRef.value?.handleContinue) {
    currentStepRef.value.handleContinue()
  } else {
    onboardingStore.nextStep()
  }
}

/**
 * Volta para o step anterior
 */
const handleBack = (): void => {
  if (currentStepRef.value?.handleBack) {
    currentStepRef.value.handleBack()
  } else {
    onboardingStore.previousStep()
  }
}

/**
 * Pula o step atual (G1.7: skip opcional)
 */
const handleSkip = (): void => {
  onboardingStore.skipStep()
}

/**
 * Finaliza o onboarding
 */
const handleComplete = async (): Promise<void> => {
  if (!canComplete.value) return

  isCompleting.value = true
  onboardingStore.clearError()
  const locale = String(router.currentRoute.value.params.locale || 'pt')

  try {
    // Exigir sessão válida para finalizar onboarding
    const session = await ensureSession()
    if (!session?.access_token) {
      toast({
        title: 'Sessão expirada',
        description: 'Sua sessão expirou. Faça login novamente.',
        variant: 'destructive',
      })
      authStore.clearAuthData()
      await router.push(`/${locale}/login`)
      return
    }

    const userId = authStore.user?.id
    if (!userId) {
      throw new Error('Usuário não autenticado')
    }

    // Modo mock: não chamar backend quando Supabase está desabilitado
    if (!supabase) {
      const finalData = (onboardingStore.collectedData || {}) as OnboardingFinalData
      await onboardingService.saveOnboardingData(finalData as any)
      const companyId = await createCompanyFromOnboarding(finalData)
      // Fire-and-forget: não bloqueia navegação
      updateOnboardingProgress(userId, companyId)
      await authStore.markOnboardingCompleted()
      analytics.track('onboarding_completed', {})
      localStorage.removeItem('current_project_id')
      await router.push(`/${locale}/projects`)
      return
    }

    // Chama método do step se disponível
    if (currentStepRef.value?.handleComplete) {
      await currentStepRef.value.handleComplete()
    } else {
      await onboardingStore.complete()
    }

    // Salva dados no serviço
    const finalData = (onboardingStore.collectedData || {}) as OnboardingFinalData
    await onboardingService.saveOnboardingData(finalData as any)

    // Criar empresa real no banco de dados
    const companyId = await createCompanyFromOnboarding(finalData)

    // Fire-and-forget: atualiza progresso sem bloquear navegação
    updateOnboardingProgress(userId, companyId)

    // Marca onboarding como completado e limpa project_id stale
    await authStore.markOnboardingCompleted()
    analytics.track('onboarding_completed', {})
    localStorage.removeItem('current_project_id')
    await router.push(`/${locale}/projects`)
  } catch (error) {
    console.error('Erro ao finalizar onboarding:', error)
    toast({
      title: t('onboarding.errors.title', 'Erro'),
      description: getOnboardingErrorMessage(error),
      variant: 'destructive',
    })
  } finally {
    isCompleting.value = false
  }
}

/**
 * Callback antes de sair do step
 */
const onBeforeLeave = (): void => {
  // Limpa erros ao trocar de step
  onboardingStore.clearError()
}

/**
 * Callback após entrar no step
 */
const onAfterEnter = async (): Promise<void> => {
  // Foca no primeiro elemento interativo se disponível
  await nextTick()
  
  const firstInput = document.querySelector('input, button') as HTMLElement
  if (firstInput && currentStep.value === 3) {
    firstInput.focus()
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================

/**
 * Inicialização do componente
 */
onMounted(() => {
  // Carrega dados salvos se existirem
  try {
    const savedData = (onboardingService as any).loadLocalOnboardingData?.()
    if (savedData) {
      onboardingStore.loadSavedData(savedData)
    }
  } catch (error) {
    console.warn('[Onboarding] Não foi possível carregar dados salvos:', error)
  }
})
</script>

<template>
  <!-- Language Selector - Fixed Position -->
  <div class="language-selector-wrapper">
    <LanguageSelector />
  </div>

  <OnboardingLayout :show-progress="true" :progress="progress" :split="false" :centered="true">
    <!-- Stepper Header -->
    <template #stepper>
      <div class="bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div class="w-full max-w-[800px] mx-auto px-4 sm:px-6 py-6">
          <!-- Stepper horizontal (desktop) -->
          <div class="hidden sm:block">
            <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div
            v-for="(label, index) in stepLabels"
            :key="index"
            class="flex flex-col items-center relative"
          >
            <!-- Container com linhas de fundo -->
            <div class="relative w-full flex items-center justify-center">
              <!-- Linha de fundo completa -->
              <div class="absolute inset-0 flex items-center z-0">
                <!-- Linha esquerda -->
                <div
                  v-if="index > 0"
                  :class="[
                    'flex-1 h-0.5 transition-colors duration-200',
                    index <= currentStep - 1 ? 'bg-primary' : 'bg-muted',
                  ]"
                />
                
                <!-- Espaço do círculo -->
                <div class="w-10 shrink-0" />
                
                <!-- Linha direita -->
                <div
                  v-if="index < stepLabels.length - 1"
                  :class="[
                    'flex-1 h-0.5 transition-colors duration-200',
                    index + 1 < currentStep ? 'bg-primary' : 'bg-muted',
                  ]"
                />
              </div>
              
              <!-- Círculo centralizado com fundo opaco -->
              <div class="relative z-20 flex items-center justify-center">
                <div
                  :class="[
                    'relative z-20 w-10 h-10 rounded-full border-2 flex items-center justify-center font-medium transition-all duration-200',
                    index + 1 === currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : index + 1 < currentStep
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-background text-muted-foreground',
                  ]"
                >
                  {{ index + 1 }}
                </div>
              </div>
            </div>

            <!-- Label do step -->
            <p
              :class="[
                'mt-2 text-sm font-medium text-center',
                index + 1 === currentStep
                  ? 'text-foreground'
                  : 'text-muted-foreground',
              ]"
            >
              {{ label }}
            </p>
          </div>
        </div>
      </div>

      <!-- Stepper mobile (simplificado) -->
      <div class="sm:hidden">
        <p class="text-sm text-muted-foreground text-center">
          {{ t('onboarding.stepProgress', { current: currentStep, total: 3 }) }}
        </p>
      </div>
        </div>
      </div>
    </template>

    <!-- Conteúdo principal -->
    <template #default>
      <Transition
        name="step-transition"
        mode="out-in"
        @before-leave="onBeforeLeave"
        @after-enter="onAfterEnter"
      >
        <component
          :is="currentStepComponent"
          :key="currentStep"
          ref="currentStepRef"
        />
      </Transition>
    </template>

    <!-- Footer com botões -->
    <template #footer>
      <div class="w-full max-w-[800px] mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
        <div class="flex items-center justify-between gap-4">
          <!-- Botão voltar (sempre outline) -->
          <Button
            v-if="canGoBack"
            variant="outline"
            size="default"
            :disabled="isLoading"
            @click="handleBack"
          >
            ← {{ t('onboarding.back') }}
          </Button>
          
          <!-- Spacer quando não tem botão voltar -->
          <div v-else></div>

          <!-- Botão pular (secondary, mais visível que ghost) -->
          <Button
            v-if="canSkip"
            variant="secondary"
            size="default"
            :disabled="isLoading"
            @click="handleSkip"
          >
            {{ t('onboarding.skip', 'Pular') }}
          </Button>

          <!-- Botão avançar/finalizar (apenas no passo 3, primary) -->
          <Button
            v-if="currentStep === 3 && (canProceed || canComplete)"
            variant="default"
            size="default"
            :disabled="!canProceed && !canComplete"
            @click="handlePrimaryAction"
          >
            {{ primaryButtonText }}
          </Button>
        </div>

        <!-- Mensagem de erro (se houver) -->
        <div
          v-if="onboardingStore.error"
          class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
        >
          <p class="text-sm text-destructive">
            {{ onboardingStore.error }}
          </p>
        </div>
      </div>
    </template>
  </OnboardingLayout>
  
  <!-- Announcer de acessibilidade para mudança de etapa -->
  <span class="sr-only" aria-live="polite">{{ t('onboarding.stepProgress', { step: currentStep }) }}</span>
</template>

<style scoped>
.language-selector-wrapper {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 100;
}

/* Header do stepper */
.onboarding-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

/* Transições entre steps */
.step-transition-enter-active,
.step-transition-leave-active {
  transition: all 0.3s ease-in-out;
}

.step-transition-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.step-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Animações dos botões */
button {
  transition: all 0.2s ease-out;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* Responsividade dos botões - removido pois agora usamos layout separado */

/* Indicador de progresso */
.space-x-2 > div {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .language-selector-wrapper {
    top: 1rem;
    right: 1rem;
  }
}
</style>
