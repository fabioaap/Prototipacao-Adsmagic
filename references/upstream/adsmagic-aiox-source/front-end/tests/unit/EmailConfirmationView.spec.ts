/**
 * Component tests for EmailConfirmationView
 *
 * Covers loading → success and loading → error/expired states and actions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import EmailConfirmationView from '@/views/auth/EmailConfirmationView.vue'
import pt from '@/locales/pt.json'

const mockGetSessionForConfirmation = vi.fn()
const mockResendVerificationEmail = vi.fn()

vi.mock('@/services/api/authService', () => ({
  getSessionForConfirmation: () => mockGetSessionForConfirmation(),
  resendVerificationEmail: (email: string) => mockResendVerificationEmail(email),
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
        path: '/:locale/email-confirmation',
        name: 'email-confirmation',
        component: EmailConfirmationView,
      },
      {
        path: '/:locale/login',
        name: 'login',
        component: { template: '<div>Login</div>' },
      },
    ],
  })
}

describe('EmailConfirmationView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows verifying state then success with Go to Login button when session exists', async () => {
    mockGetSessionForConfirmation.mockResolvedValueOnce({
      session: { access_token: 'token', user: { id: '1', email: 'u@e.com' } },
      error: null,
    })

    const router = createTestRouter()
    const pinia = createPinia()
    await router.push('/pt/email-confirmation')

    const wrapper = mount(EmailConfirmationView, {
      global: {
        plugins: [router, i18n, pinia],
      },
    })

    expect(wrapper.text()).toMatch(/Verificando|verifying/i)

    await vi.advanceTimersByTimeAsync(700)
    await flushPromises()

    expect(wrapper.text()).toMatch(/confirmado|confirmed/i)
    const goToLogin = wrapper.find('button')
    expect(goToLogin.exists()).toBe(true)
    expect(goToLogin.attributes('aria-label')).toBeTruthy()
  })

  it('shows verifying then error/expired state with Resend and Back to Login when no session', async () => {
    mockGetSessionForConfirmation.mockResolvedValueOnce({
      session: null,
      error: null,
    })

    const router = createTestRouter()
    const pinia = createPinia()
    await router.push('/pt/email-confirmation')

    const wrapper = mount(EmailConfirmationView, {
      global: {
        plugins: [router, i18n, pinia],
      },
    })

    await vi.advanceTimersByTimeAsync(700)
    await flushPromises()

    expect(wrapper.text()).toMatch(/expirado|expired|erro|error/i)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
    const resendButton = buttons.find((b) => b.text().match(/Reenviar|resend/i))
    expect(resendButton).toBeTruthy()
    const errorBlock = wrapper.find('[role="alert"]')
    expect(errorBlock.exists()).toBe(true)
  })

  it('shows error state when getSessionForConfirmation returns error', async () => {
    mockGetSessionForConfirmation.mockResolvedValueOnce({
      session: null,
      error: new Error('Network error'),
    })

    const router = createTestRouter()
    const pinia = createPinia()
    await router.push('/pt/email-confirmation')

    const wrapper = mount(EmailConfirmationView, {
      global: {
        plugins: [router, i18n, pinia],
      },
    })

    await vi.advanceTimersByTimeAsync(700)
    await flushPromises()

    expect(wrapper.text()).toMatch(/erro|error|Network error/i)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })
})
