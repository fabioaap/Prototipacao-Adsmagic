/**
 * Component tests for FunnelView (Configuração do Funil)
 *
 * Covers loading → success → error states (guardralis §5).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { ref, computed } from 'vue'
import FunnelView from '@/views/settings/FunnelView.vue'
import StagesList from '@/components/settings/StagesList.vue'
import pt from '@/locales/pt.json'
import type { Stage } from '@/types'

const mockToast = vi.fn()

const mockStage: Stage = {
  id: 'stage-1',
  name: 'Contato Iniciado',
  order: 0,
  type: 'normal',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const storeState = vi.hoisted(() => {
  const { ref } = require('vue')
  const stages = ref<Stage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const fetchStages = vi.fn()
  return { stages, isLoading, error, fetchStages }
})

vi.mock('@/stores/stages', () => {
  const { computed } = require('vue')
  return {
    useStagesStore: () => ({
      get stages() { return storeState.stages.value },
      get isLoading() { return storeState.isLoading.value },
      get error() { return storeState.error.value },
      fetchStages: storeState.fetchStages,
      createStage: vi.fn(),
    updateStage: vi.fn(),
    deleteStage: vi.fn(),
    reorderStages: vi.fn(),
    activeStages: computed(() => storeState.stages.value.filter((s: Stage) => s.isActive)),
    kanbanStages: computed(() => [...storeState.stages.value]),
    stageById: (id: string) => storeState.stages.value.find((s: Stage) => s.id === id),
    totalStages: computed(() => storeState.stages.value.length),
    canCreateSaleStage: computed(() => !storeState.stages.value.some((s: Stage) => s.type === 'sale')),
    canCreateLostStage: computed(() => !storeState.stages.value.some((s: Stage) => s.type === 'lost')),
    defaultStage: computed(() => storeState.stages.value[0]),
    }),
  }
})

vi.mock('@/services/api/contacts', () => ({
  countContactsByStage: vi.fn(() => Promise.resolve({ ok: true as const, value: 0 })),
}))

vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'pt',
  messages: { pt: pt as Record<string, unknown> },
})

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/:locale/projects/:projectId/settings/funnel',
        name: 'settings-funnel',
        component: FunnelView,
      },
      {
        path: '/:locale/projects/:projectId/settings/general',
        name: 'settings-general',
        component: { template: '<div>Settings General</div>' },
      },
      {
        path: '/:locale/projects/:projectId/settings/origins',
        name: 'settings-origins',
        component: { template: '<div>Settings Origins</div>' },
      },
    ],
  })
}

describe('FunnelView', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    vi.clearAllMocks()
    storeState.stages.value = []
    storeState.isLoading.value = false
    storeState.error.value = null
    storeState.fetchStages.mockReset()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('shows loading state when store is loading', async () => {
    storeState.isLoading.value = true
    storeState.fetchStages.mockResolvedValue(undefined)

    const router = createTestRouter()
    await router.push({ name: 'settings-funnel', params: { locale: 'pt', projectId: 'proj-1' } })

    const wrapper = mount(FunnelView, {
      global: { plugins: [router, i18n, pinia] },
    })

    await wrapper.vm.$nextTick()

    const stagesList = wrapper.findComponent(StagesList)
    expect(stagesList.exists()).toBe(true)
    expect(stagesList.props('loading')).toBe(true)
  })

  it('shows success state with stages list when store has data', async () => {
    storeState.isLoading.value = false
    storeState.stages.value = [mockStage]
    storeState.fetchStages.mockResolvedValue(undefined)

    const router = createTestRouter()
    await router.push({ name: 'settings-funnel', params: { locale: 'pt', projectId: 'proj-1' } })

    const wrapper = mount(FunnelView, {
      global: { plugins: [router, i18n, pinia] },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Contato Iniciado')
  })

  it('shows error toast when fetchStages fails', async () => {
    storeState.fetchStages.mockRejectedValueOnce(new Error('Network error'))

    const router = createTestRouter()
    await router.push({ name: 'settings-funnel', params: { locale: 'pt', projectId: 'proj-1' } })

    mount(FunnelView, {
      global: { plugins: [router, i18n, pinia] },
    })

    await flushPromises()

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar as etapas. Tente novamente.',
      })
    )
  })
})
