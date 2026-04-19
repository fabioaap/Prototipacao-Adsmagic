<!--
  View principal do assistente de criação de projeto
  Container que gerencia navegação entre steps e botões de ação
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProjectWizardStore } from '@/stores/projectWizard'
import { useProjectNavigation } from '@/composables/useProjectNavigation'
import { useProjectsStore } from '@/stores/projects'
import { supabase } from '@/services/api/supabaseClient'
import OnboardingLayout from '@/components/features/onboarding/OnboardingLayout.vue'
import Button from '@/components/ui/Button.vue'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

// Importa os steps
import StepProjectInfo from './steps/StepProjectInfo.vue'
import StepPlatformSelection from './steps/StepPlatformSelection.vue'
import StepMetaCampaignType from './steps/StepMetaCampaignType.vue'
import StepPlatformConfig from './steps/StepPlatformConfig.vue'
import StepTrackableLinks from './steps/StepTrackableLinks.vue'
import StepWhatsApp from './steps/StepWhatsApp.vue'

// ============================================================================
// COMPONENTES DOS STEPS
// ============================================================================

const stepComponents = {
  1: StepProjectInfo,
  2: StepPlatformSelection,
  3: StepMetaCampaignType,
  4: StepPlatformConfig,
  5: StepTrackableLinks,
  6: StepWhatsApp,
}

// ============================================================================
// STORES E ROUTER
// ============================================================================

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const wizardStore = useProjectWizardStore()
const { goToDashboard } = useProjectNavigation()
const projectsStore = useProjectsStore()

// ============================================================================
// ESTADO LOCAL
// ============================================================================

/**
 * Referência para o componente step atual
 */
const currentStepRef = ref<any>(null)

/**
 * Se está finalizando o wizard
 */
const isCompleting = ref(false)

/**
 * Se está salvando rascunho
 */
const isSaving = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Step atual
 */
const currentStep = computed(() => wizardStore.currentStep)

/**
 * Componente do step atual
 */
const currentStepComponent = computed(() => stepComponents[currentStep.value as keyof typeof stepComponents])

/**
 * Se pode avançar
 */
const canProceed = computed(() => {
  return wizardStore.canProceed && !isCompleting.value
})

/**
 * Se pode voltar
 */
const canGoBack = computed(() => {
  return wizardStore.canGoBack && !isCompleting.value
})

/**
 * Se pode finalizar
 */
const canComplete = computed(() => {
  return wizardStore.canComplete && !isCompleting.value
})

/**
 * Se está carregando
 */
const isLoading = computed(() => {
  return wizardStore.isLoading || isCompleting.value
})

/**
 * Texto do botão principal
 */
const primaryButtonText = computed(() => {
  if (isLoading.value) {
    return wizardStore.isLastStep ? t('projectWizard.finishing') : t('projectWizard.loading')
  }
  return wizardStore.isLastStep ? t('projectWizard.finish') : t('projectWizard.continue')
})

/**
 * Progresso (0-100) para a barra do topo (dinâmico)
 */
const progress = computed(() => wizardStore.progress)

/**
 * Total de steps (dinâmico: 5-6)
 */
const totalSteps = computed(() => wizardStore.totalSteps)

/**
 * Steps ativos (visíveis)
 */
const activeSteps = computed(() => wizardStore.activeSteps)

/**
 * Índice atual no array de steps ativos
 */
const currentStepIndex = computed(() => wizardStore.currentStepIndex)

/**
 * Labels dos steps para o stepper (dinâmico)
 */
const stepLabels = computed(() => {
  const allLabels: Record<number, string> = {
    1: t('projectWizard.steps.project'),
    2: t('projectWizard.steps.platforms'),
    3: t('projectWizard.steps.metaCampaign'),
    4: t('projectWizard.steps.config'),
    5: t('projectWizard.steps.trackableLinks'),
    6: t('projectWizard.steps.whatsapp'),
  }

  // Retorna apenas os labels dos steps ativos
  return activeSteps.value.map(stepNumber => allLabels[stepNumber])
})

// ============================================================================
// MÉTODOS
// ============================================================================

/**
 * Manipula ação do botão principal (avançar ou finalizar)
 */
const handlePrimaryAction = async (): Promise<void> => {
  console.log('[ProjectWizardView] handlePrimaryAction chamado:', {
    currentStep: currentStep.value,
    isLastStep: wizardStore.isLastStep,
    canProceed: canProceed.value,
    canComplete: canComplete.value,
  })
  
  if (wizardStore.isLastStep) {
    await handleComplete()
  } else {
    await handleContinue()
  }
}

/**
 * Avança para o próximo step
 */
const handleContinue = async (): Promise<void> => {
  console.log('[ProjectWizardView] handleContinue chamado - Estado:', {
    currentStep: currentStep.value,
    canProceed: canProceed.value,
    canComplete: canComplete.value,
    hasHandleContinue: !!currentStepRef.value?.handleContinue,
    metaAdsConnected: wizardStore.projectData.metaAds?.connected,
    platformsMetaAds: wizardStore.projectData.platforms.metaAds,
  })
  
  try {
    if (currentStepRef.value?.handleContinue) {
      await currentStepRef.value.handleContinue()
      console.log('[ProjectWizardView] handleContinue do step concluído sem erros')
    }
    
    // Verificar canProceed novamente após handleContinue do step
    console.log('[ProjectWizardView] Estado antes de nextStep:', {
      canProceed: canProceed.value,
      canComplete: canComplete.value,
      metaAdsConnected: wizardStore.projectData.metaAds?.connected,
    })
    
    // Avança para o próximo step após salvar (se necessário)
    wizardStore.nextStep()
    
    console.log('[ProjectWizardView] nextStep() chamado - Novo step:', wizardStore.currentStep)
  } catch (error) {
    console.error('[ProjectWizardView] Erro ao avançar:', error)
    // Erro já foi definido no step component
    // Não avançar se houver erro
  }
}

/**
 * Volta para o step anterior
 */
const handleBack = (): void => {
  if (currentStepRef.value?.handleBack) {
    currentStepRef.value.handleBack()
  } else {
    wizardStore.previousStep()
  }
}

/**
 * Finaliza o wizard
 */
const handleComplete = async (): Promise<void> => {
  if (!canComplete.value) return

  isCompleting.value = true
  wizardStore.clearError()

  try {
    // Chama método do step se disponível
    if (currentStepRef.value?.handleComplete) {
      await currentStepRef.value.handleComplete()
    }

    // Completar wizard e obter projectId
    const projectId = await wizardStore.complete()

    if (projectId) {
      console.log('[ProjectWizardView] ✅ Wizard completado, redirecionando para dashboard:', projectId)
      
      // Garantir que o projeto está carregado na store antes de navegar
      // Isso ajuda o projectGuard a encontrar o projeto
      try {
        await projectsStore.loadProject(projectId)
        const project = projectsStore.projects.find(p => p.id === projectId)
        if (project) {
          projectsStore.setCurrentProject(project)
          console.log('[ProjectWizardView] ✅ Projeto carregado na store antes de navegar')
        }
      } catch (error) {
        console.warn('[ProjectWizardView] ⚠️ Não foi possível pré-carregar projeto, continuando navegação:', error)
      }

      // Aguardar um tick para garantir que tudo foi processado
      await nextTick()

      // Redirecionar para o dashboard do projeto criado
      goToDashboard(projectId)
    } else {
      // Se não conseguiu completar, mostrar erro
      wizardStore.setError(t('projectWizard.errors.completionFailed'))
    }
  } catch (error) {
    console.error('[ProjectWizardView] Erro ao finalizar wizard:', error)
    wizardStore.setError(t('projectWizard.errors.completionFailed'))
  } finally {
    isCompleting.value = false
  }
}

/**
 * Salva e sai
 */
const handleSaveAndExit = async (): Promise<void> => {
  isSaving.value = true

  try {
    // ✅ Salvar integração Meta antes de salvar progresso (se no step 4)
    if (currentStep.value === 4 && currentStepRef.value?.handleComplete) {
      try {
        await currentStepRef.value.handleComplete()
      } catch (error) {
        console.error('Erro ao salvar integração Meta antes de salvar e sair:', error)
        wizardStore.setError('Não foi possível salvar a integração Meta. Tente novamente.')
        return // Não prosseguir se não conseguir salvar integração
      }
    }
    
    // ✅ Verificar se usuário tem empresa antes de salvar
    const { useCompaniesStore } = await import('@/stores/companies')
    const companiesStore = useCompaniesStore()

    // Modo mock: pular checagens de backend
    if (!supabase) {
      await wizardStore.saveToBackend()
      await router.push(`/${locale.value}/projects`)
      return
    }

    // Garantir que empresas estão carregadas
    if (!companiesStore.currentCompanyId) {
      await companiesStore.fetchCompanies()
    }
    
    // Se não tem empresa, redirecionar para onboarding
    if (!companiesStore.hasCompanies) {
      const locale = route.params.locale as string || 'pt'
      await router.push(`/${locale}/onboarding`)
      return
    }
    
    // Usuário tem empresa - continuar com salvamento
    await wizardStore.saveToBackend()
    
    // Mostrar toast de sucesso
    // TODO: Implementar toast notification
    console.log('Progresso salvo com sucesso!')
    
    await router.push(`/${locale.value}/projects`)
  } catch (error) {
    console.error('Erro ao salvar:', error)
    
    // Tratamento específico para falta de empresa
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('empresa')) {
      wizardStore.setError(t('projectWizard.errors.noCompany'))
      
      // Redirecionar para criar empresa após 3s
      setTimeout(() => {
        router.push(`/${locale.value}/onboarding`)
      }, 3000)
    } else {
      wizardStore.setError(t('projectWizard.errors.saveFailed'))
    }
  } finally {
    isSaving.value = false
  }
}

/**
 * Callback antes de sair do step
 */
const onBeforeLeave = (): void => {
  wizardStore.clearError()
}

/**
 * Callback após entrar no step
 */
const onAfterEnter = async (): Promise<void> => {
  await nextTick()

  const firstInput = document.querySelector('input, button') as HTMLElement
  if (firstInput) {
    firstInput.focus()
  }
}

/**
 * Navega para um step específico (apenas anteriores)
 */
const handleStepClick = (step: number): void => {
  wizardStore.goToStep(step)
}

// ============================================================================
// LIFECYCLE
// ============================================================================

/**
 * Inicialização do componente
 */
onMounted(async () => {
  const projectId = router.currentRoute.value.query.projectId as string
  
  // ✅ GARANTIR que projectId está no localStorage ANTES de qualquer requisição
  // Isso é crítico para que o apiClient inclua o header X-Project-ID
  if (projectId) {
    localStorage.setItem('current_project_id', projectId)
    console.log('[ProjectWizardView] ProjectId definido no localStorage imediatamente:', projectId)
    
    // Carregar do backend
    await wizardStore.loadFromBackend(projectId)
  } else {
    // Tentar restaurar do localStorage (G2.2)
    const restored = wizardStore.loadFromLocalStorage()
    if (!restored) {
      // Resetar para garantir estado limpo para novo projeto
      wizardStore.reset()
    }
  }

  // Query param tem PRIORIDADE
  const nameFromOnboarding = router.currentRoute.value.query.name as string
  const segmentFromOnboarding = router.currentRoute.value.query.segment as string
  const skipStep1 = router.currentRoute.value.query.skipStep1 === 'true'
  
  if (nameFromOnboarding || segmentFromOnboarding) {
    wizardStore.updateProjectData({
      name: nameFromOnboarding || '',
      segment: segmentFromOnboarding || '',
    })
  }
  
  // Se vindo do onboarding com dados completos, pular step 1
  if (skipStep1 && nameFromOnboarding && segmentFromOnboarding) {
    console.log('[ProjectWizardView] Pulando step 1 - dados já coletados no onboarding')
    wizardStore.goToStep(2) // Ir direto para Plataformas
  }
  
  // G2.2: Iniciar auto-save periódico (30s)
  wizardStore.startAutoSave()
})

/**
 * Cleanup ao desmontar componente
 */
onUnmounted(() => {
  // G2.2: Parar auto-save ao sair do wizard
  wizardStore.stopAutoSave()
})
</script>

<template>
  <div class="project-wizard">
    <!-- Header -->
    <div class="wizard-header bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div class="w-full max-w-[800px] mx-auto px-4 sm:px-6 py-6">
        <!-- Stepper horizontal -->
        <div class="hidden sm:block">
          <div class="grid grid-cols-6 gap-2 max-w-4xl mx-auto">
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
                      index <= currentStepIndex ? 'bg-primary' : 'bg-muted',
                    ]"
                  />
                  
                  <!-- Espaço do círculo -->
                  <div class="w-10 shrink-0" />
                  
                  <!-- Linha direita -->
                  <div
                    v-if="index < stepLabels.length - 1"
                    :class="[
                      'flex-1 h-0.5 transition-colors duration-200',
                      index + 1 < currentStepIndex ? 'bg-primary' : 'bg-muted',
                    ]"
                  />
                </div>
                
                <!-- Círculo centralizado com fundo opaco -->
                <div class="relative z-20 flex items-center justify-center">
                  <button
                    :class="[
                      'relative z-20 w-10 h-10 rounded-full border-2 flex items-center justify-center font-medium transition-all duration-200 bg-background',
                      index === currentStepIndex
                        ? 'border-primary bg-primary text-primary-foreground'
                        : index < currentStepIndex
                        ? 'border-primary bg-background text-primary cursor-pointer hover:bg-primary/10'
                        : 'border-muted bg-background text-muted-foreground cursor-not-allowed',
                    ]"
                    :disabled="index >= currentStepIndex"
                    @click="handleStepClick(activeSteps[index]!)"
                    :aria-current="index === currentStepIndex ? 'step' : undefined"
                  >
                    {{ index + 1 }}
                  </button>
                </div>
              </div>

              <!-- Label do step -->
              <p
                :class="[
                  'mt-2 text-sm font-medium text-center',
                  index === currentStepIndex
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
        <div class="mt-4 sm:hidden">
          <p class="text-sm text-muted-foreground text-center">
            {{ t('projectWizard.stepProgress', { current: currentStepIndex + 1, total: totalSteps }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Conteúdo principal -->
    <OnboardingLayout :show-progress="true" :progress="progress" :split="false">
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
          <!-- Mensagem de orientação -->
          <div class="mb-4 text-center">
            <p class="text-sm text-muted-foreground">
              <template v-if="wizardStore.isLastStep">
                {{ t('projectWizard.finishHint') }}
              </template>
              <template v-else>
                {{ t('projectWizard.continueHint') }}
              </template>
            </p>
          </div>
          
          <div class="flex items-center justify-center gap-4">
            <!-- Botão voltar (sempre outline) -->
            <Button
              v-if="canGoBack"
              variant="outline"
              size="default"
              :disabled="isLoading"
              @click="handleBack"
            >
              ← {{ t('projectWizard.back') }}
            </Button>

            <!-- Botão salvar e sair (secondary, mais visível) -->
            <Button
              variant="secondary"
              size="default"
              :disabled="isLoading || isSaving"
              @click="handleSaveAndExit"
              :title="t('projectWizard.saveAndExitHint')"
            >
              <span class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {{ t('projectWizard.saveAndExit') }}
              </span>
            </Button>

            <!-- Botão avançar/finalizar (default/primary) -->
            <Button
              variant="default"
              size="default"
              :disabled="!canProceed && !canComplete"
              :title="wizardStore.isLastStep ? t('projectWizard.finishHint') : t('projectWizard.continueHint')"
              @click="() => {
                  console.log('[ProjectWizardView] Botão Próximo clicado!', {
                    currentStep: currentStep,
                    canProceed: canProceed,
                    canComplete: canComplete,
                    isLastStep: wizardStore.isLastStep,
                    disabled: !canProceed && !canComplete
                  })
                  handlePrimaryAction()
                }"
              >
                <span class="flex items-center gap-2">
                  {{ primaryButtonText }}
                  <svg v-if="!wizardStore.isLastStep" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              </Button>
          </div>

          <!-- Mensagem de erro (se houver) -->
          <div
            v-if="wizardStore.error"
            class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p class="text-sm text-destructive">
              {{ wizardStore.error }}
            </p>
          </div>
        </div>
      </template>
    </OnboardingLayout>

    <!-- Announcer de acessibilidade para mudança de etapa -->
    <span class="sr-only" aria-live="polite">
      {{ t('projectWizard.stepProgress', { current: currentStepIndex + 1, total: totalSteps }) }}
    </span>
  </div>
</template>

<style scoped>
.wizard-header {
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--background));
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
</style>
