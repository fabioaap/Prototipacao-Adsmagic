/**
 * Component tests for OnboardingView
 *
 * Covers loading → success → error states when completing onboarding (guardrails).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import OnboardingView from '@/views/onboarding/OnboardingView.vue'
import pt from '@/locales/pt.json'

const mockToast = vi.fn()

vi.mock('@/services/api/supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({
        data: { session: { access_token: 'mock-token', user: { id: 'user-1' } } },
        error: null,
      })),
    },
    from: vi.fn(() => ({
      upsert: vi.fn(() => Promise.resolve({ error: null })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })),
    })),
  },
  supabaseEnabled: true,
}))

vi.mock('@/services/api/onboardingService', () => ({
  onboardingApiService: {
    completeOnboarding: vi.fn(),
    updateProgress: vi.fn(() => Promise.resolve({})),
  },
}))

vi.mock('@/services/api/companiesService', () => ({
  companiesService: {
    createCompany: vi.fn(() => Promise.resolve({ id: 'company-1' })),
  },
}))

vi.mock('@/services/onboarding', () => ({
  onboardingService: {
    saveOnboardingData: vi.fn(() => Promise.resolve()),
    loadLocalOnboardingData: vi.fn(() => null),
  },
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
      { path: '/:locale/onboarding', name: 'onboarding', component: OnboardingView },
      { path: '/:locale/project/new', name: 'project-new', component: { template: '<div>Project New</div>' } },
      { path: '/:locale/projects', name: 'projects', component: { template: '<div>Projects</div>' } },
    ],
  })
}

async function setupStores() {
  const { useOnboardingStore } = await import('@/stores/onboarding')
  const { useAuthStore } = await import('@/stores/auth')
  const { useCompaniesStore } = await import('@/stores/companies')
  const onboardingStore = useOnboardingStore()
  const authStore = useAuthStore()
  const companiesStore = useCompaniesStore()

  onboardingStore.currentStep = 3
  onboardingStore.companyType = 'ecommerce'
  onboardingStore.franchiseCount = '1'
  onboardingStore.franchiseName = 'Minha Franquia'
  authStore.token = 'mock-token'
  authStore.user = { id: 'user-1', email: 'u@e.com', name: 'User' }
  companiesStore.companies = []
  companiesStore.fetchCompanies = vi.fn().mockResolvedValue(undefined)
}

describe('OnboardingView', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('completes onboarding asynchronously (loading then success after resolve)', async () => {
    const { onboardingApiService } = await import('@/services/api/onboardingService')
    let resolveDeferred: (value: unknown) => void
    const completePromise = new Promise((resolve) => {
      resolveDeferred = resolve
    })
    vi.mocked(onboardingApiService.completeOnboarding).mockImplementation(() => completePromise as Promise<unknown>)

    const router = createTestRouter()
    await router.push('/pt/onboarding')
    await setupStores()

    const wrapper = mount(OnboardingView, {
      global: { plugins: [router, i18n, pinia] },
    })

    const buttons = wrapper.findAll('button')
    const finishButton = buttons.find((b) => b.text().match(/Finalizar|finalizar/i))
    expect(finishButton).toBeDefined()
    await finishButton!.trigger('click')
    await wrapper.vm.$nextTick()

    // Still on onboarding (completeOnboarding promise not resolved yet)
    expect(router.currentRoute.value.path).toMatch(/onboarding/)

    resolveDeferred!({})
    await flushPromises()

    // After resolve, navigation to /projects
    expect(router.currentRoute.value.path).toMatch(/projects/)
  })

  it('on complete success navigates to project/new', async () => {
    const { onboardingApiService } = await import('@/services/api/onboardingService')
    const mockRow = { id: 'mock-id', user_id: 'user-1', is_completed: true, completed_at: new Date().toISOString() }
    vi.mocked(onboardingApiService.completeOnboarding).mockResolvedValueOnce(mockRow as Awaited<ReturnType<typeof onboardingApiService.completeOnboarding>>)

    const router = createTestRouter()
    await router.push('/pt/onboarding')
    await setupStores()

    const wrapper = mount(OnboardingView, {
      global: { plugins: [router, i18n, pinia] },
    })

    const buttons = wrapper.findAll('button')
    const finishButton = buttons.find((b) => b.text().match(/Finalizar|finalizar/i))
    expect(finishButton).toBeDefined()
    await finishButton!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toMatch(/projects/)
  })

  it('shows error feedback (toast) when complete fails', async () => {
    const { onboardingApiService } = await import('@/services/api/onboardingService')
    vi.mocked(onboardingApiService.completeOnboarding).mockRejectedValueOnce(new Error('Network error'))

    const router = createTestRouter()
    await router.push('/pt/onboarding')
    await setupStores()

    const wrapper = mount(OnboardingView, {
      global: { plugins: [router, i18n, pinia] },
    })

    const buttons = wrapper.findAll('button')
    const finishButton = buttons.find((b) => b.text().match(/Finalizar|finalizar/i))
    expect(finishButton).toBeDefined()
    await finishButton!.trigger('click')
    await flushPromises()

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        title: expect.any(String),
        description: expect.any(String),
      })
    )
  })
})
