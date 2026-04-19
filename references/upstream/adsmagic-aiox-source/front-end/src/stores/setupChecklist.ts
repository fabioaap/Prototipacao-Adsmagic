/**
 * Setup Checklist Store
 *
 * Gerencia o estado do checklist de ativação do projeto.
 * Deriva o status de cada etapa reativamente dos stores existentes
 * e dispara eventos PostHog para tracking de ativação.
 *
 * @module stores/setupChecklist
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useStagesStore } from '@/stores/stages'
import { useIntegrationsStore } from '@/stores/integrations'
import { useCurrentProjectId } from '@/composables/useCurrentProjectId'
import { analytics } from '@/services/analytics'
import type {
  SetupStepId,
  SetupStep,
  SetupStepWithStatus,
  StepStatus,
} from '@/types/setupChecklist'

const STEP_DEFINITIONS: SetupStep[] = [
  {
    id: 'connect_whatsapp',
    titleKey: 'setupChecklist.steps.connectWhatsapp.title',
    tooltipKey: 'setupChecklist.steps.connectWhatsapp.tooltip',
    iconName: 'Phone',
    routeName: 'integrations',
    routeQuery: { tab: 'channels' },
    ctaKey: 'setupChecklist.steps.connectWhatsapp.cta',
    order: 1,
  },
  {
    id: 'connect_ads',
    titleKey: 'setupChecklist.steps.connectAds.title',
    tooltipKey: 'setupChecklist.steps.connectAds.tooltip',
    iconName: 'Target',
    routeName: 'integrations',
    routeQuery: { tab: 'channels' },
    ctaKey: 'setupChecklist.steps.connectAds.cta',
    order: 2,
  },
  {
    id: 'configure_funnel',
    titleKey: 'setupChecklist.steps.configureFunnel.title',
    tooltipKey: 'setupChecklist.steps.configureFunnel.tooltip',
    iconName: 'Layers',
    routeName: 'settings-funnel',
    ctaKey: 'setupChecklist.steps.configureFunnel.cta',
    order: 3,
  },
  {
    id: 'receive_lead',
    titleKey: 'setupChecklist.steps.receiveLead.title',
    tooltipKey: 'setupChecklist.steps.receiveLead.tooltip',
    iconName: 'UserPlus',
    routeName: 'contacts',
    ctaKey: 'setupChecklist.steps.receiveLead.cta',
    order: 4,
  },
]

const TOTAL_STEPS = STEP_DEFINITIONS.length
const INTEGRATION_STATUS_CONNECTED = 'connected'
const STORAGE_PREFIX_DISMISSED = 'adsmagic_setup_dismissed'
const STORAGE_PREFIX_VIEWED_AT = 'adsmagic_setup_viewed_at'

function getDismissKey(projectId: string): string {
  return `${STORAGE_PREFIX_DISMISSED}:${projectId}`
}

function getViewedAtKey(projectId: string): string {
  return `${STORAGE_PREFIX_VIEWED_AT}:${projectId}`
}

export const useSetupChecklistStore = defineStore('setupChecklist', () => {
  const projectsStore = useProjectsStore()
  const stagesStore = useStagesStore()
  const integrationsStore = useIntegrationsStore()
  const { currentProjectId } = useCurrentProjectId()

  // ========================================================================
  // STATE
  // ========================================================================

  const isDismissed = ref(false)
  const firstViewedAt = ref<number | null>(null)
  const hasTrackedView = ref(false)
  const previousCompletionMap = ref<Record<SetupStepId, boolean> | null>(null)

  // ========================================================================
  // HELPERS
  // ========================================================================

  /** Retorna o projectId atual ou null (guard contra chamadas sem contexto) */
  function requireProjectId(): string | null {
    return currentProjectId.value ?? null
  }

  function isPlatformConnected(platform: string): boolean {
    const integration = integrationsStore.getIntegrationByPlatform(platform)
    return integration?.status === INTEGRATION_STATUS_CONNECTED
  }

  // ========================================================================
  // COMPUTED — Step Completion Detection
  // ========================================================================

  const currentProject = computed(() => projectsStore.currentProject)

  const stepCompletionMap = computed<Record<SetupStepId, boolean>>(() => ({
    connect_whatsapp: isPlatformConnected('whatsapp'),
    connect_ads: isPlatformConnected('meta') || isPlatformConnected('google'),
    configure_funnel: stagesStore.stages.some((s) => s.type === 'normal'),
    receive_lead: (currentProject.value?.contacts_count ?? 0) > 0,
  }))

  const completedCount = computed(() =>
    Object.values(stepCompletionMap.value).filter(Boolean).length,
  )

  const progressPercent = computed(() =>
    Math.round((completedCount.value / TOTAL_STEPS) * 100),
  )

  const isAllComplete = computed(() => completedCount.value === TOTAL_STEPS)

  const stepsWithStatus = computed<SetupStepWithStatus[]>(() => {
    const firstIncompleteIndex = STEP_DEFINITIONS.findIndex(
      (s) => !stepCompletionMap.value[s.id],
    )

    return STEP_DEFINITIONS.map((step, index) => {
      const completed = stepCompletionMap.value[step.id]
      let status: StepStatus = 'pending'
      if (completed) {
        status = 'completed'
      } else if (index === firstIncompleteIndex) {
        status = 'active'
      }
      return { ...step, status, completed }
    })
  })

  const shouldShow = computed(() => !isDismissed.value && !isAllComplete.value)

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /** Carrega estado de dismiss e timestamp do localStorage para o projeto atual */
  function initFromStorage(): void {
    const pid = requireProjectId()
    if (!pid) return

    isDismissed.value = localStorage.getItem(getDismissKey(pid)) === 'true'

    const viewedAt = localStorage.getItem(getViewedAtKey(pid))
    firstViewedAt.value = viewedAt ? Number(viewedAt) : null

    hasTrackedView.value = false
    previousCompletionMap.value = null
  }

  /** Fecha o checklist e persiste a decisão no localStorage */
  function dismiss(): void {
    const pid = requireProjectId()
    if (!pid) return

    isDismissed.value = true
    localStorage.setItem(getDismissKey(pid), 'true')

    analytics.track('setup_checklist_dismissed', {
      completedSteps: completedCount.value,
      totalSteps: TOTAL_STEPS,
      projectId: pid,
    })
  }

  /** Registra visualização do checklist (deduplica por sessão) */
  function trackViewed(): void {
    if (hasTrackedView.value) return
    const pid = requireProjectId()
    if (!pid) return

    hasTrackedView.value = true

    if (!firstViewedAt.value) {
      firstViewedAt.value = Date.now()
      localStorage.setItem(getViewedAtKey(pid), String(firstViewedAt.value))
    }

    analytics.track('setup_checklist_viewed', {
      completedSteps: completedCount.value,
      totalSteps: TOTAL_STEPS,
      projectId: pid,
    })
  }

  /** Registra clique em um CTA do checklist */
  function trackStepClicked(stepId: SetupStepId): void {
    const pid = requireProjectId()
    if (!pid) return

    const step = STEP_DEFINITIONS.find((s) => s.id === stepId)
    if (!step) return

    analytics.track('setup_checklist_step_clicked', {
      stepId,
      stepOrder: step.order,
      projectId: pid,
    })
  }

  // ========================================================================
  // WATCHERS
  // ========================================================================

  // Detect step completion transitions
  watch(
    stepCompletionMap,
    (newMap) => {
      const pid = currentProjectId.value
      if (!pid || !previousCompletionMap.value) {
        previousCompletionMap.value = { ...newMap }
        return
      }

      const prev = previousCompletionMap.value
      for (const step of STEP_DEFINITIONS) {
        if (newMap[step.id] && !prev[step.id]) {
          analytics.track('setup_checklist_step_completed', {
            stepId: step.id,
            stepOrder: step.order,
            projectId: pid,
            completedSteps: completedCount.value,
            totalSteps: TOTAL_STEPS,
          })
        }
      }

      previousCompletionMap.value = { ...newMap }
    },
    { deep: true },
  )

  // Detect all steps complete
  watch(isAllComplete, (complete) => {
    if (!complete) return
    const pid = currentProjectId.value
    if (!pid) return

    const elapsed = firstViewedAt.value
      ? Date.now() - firstViewedAt.value
      : null

    analytics.track('setup_checklist_completed', {
      projectId: pid,
      timeToCompleteMs: elapsed,
    })
  })

  /**
   * Garante que as integrações do projeto atual estejam carregadas no
   * `integrationsStore`. Sem isso, o checklist é montado no dashboard antes
   * de qualquer fetch e exibe WhatsApp/Ads como desconectados mesmo quando
   * o projeto já tem essas integrações ativas.
   */
  async function ensureIntegrationsLoaded(): Promise<void> {
    const pid = requireProjectId()
    if (!pid) return

    const hasRealData = integrationsStore.integrations.some(
      (i) => !i.id.startsWith('placeholder-'),
    )
    if (hasRealData) return

    try {
      await integrationsStore.fetchIntegrations()
    } catch (err) {
      console.warn('[setupChecklist] Failed to load integrations:', err)
    }
  }

  // Reset on project change
  watch(currentProjectId, () => {
    initFromStorage()
    ensureIntegrationsLoaded()
  })

  // Initialize on store creation
  initFromStorage()
  ensureIntegrationsLoaded()

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  return {
    // State
    isDismissed,
    // Getters
    stepsWithStatus,
    completedCount,
    totalSteps: TOTAL_STEPS,
    progressPercent,
    isAllComplete,
    shouldShow,
    // Actions
    dismiss,
    trackViewed,
    trackStepClicked,
    initFromStorage,
  }
})
