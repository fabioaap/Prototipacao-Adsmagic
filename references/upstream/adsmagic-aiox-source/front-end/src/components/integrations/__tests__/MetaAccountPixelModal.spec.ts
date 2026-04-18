/**
 * Component tests for MetaAccountPixelModal
 *
 * Covers states: loading → success → error (guardralis-prod requirement)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import MetaAccountPixelModal from '../MetaAccountPixelModal.vue'

const mockIntegrationId = ref<string | null>(null)
const mockAvailableAccounts = ref<Array<{ accountId: string; name: string }>>([])
const mockAvailablePixels = ref<Array<{ id: string; name: string }>>([])
const mockIsConnecting = ref(false)
const mockIsSelectingAccounts = ref(false)
const mockError = ref<string | null>(null)

const mockStartOAuth = vi.fn()
const mockLoadPixels = vi.fn()
const mockFinalizeSelection = vi.fn()
const mockReset = vi.fn()

vi.mock('@/composables/useMetaIntegration', () => ({
  useMetaIntegration: () => ({
    integrationId: mockIntegrationId,
    availableAccounts: mockAvailableAccounts,
    availablePixels: mockAvailablePixels,
    isConnecting: mockIsConnecting,
    isSelectingAccounts: mockIsSelectingAccounts,
    error: mockError,
    startOAuth: mockStartOAuth,
    loadPixels: mockLoadPixels,
    finalizeSelection: mockFinalizeSelection,
    reset: mockReset,
  }),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { locale: 'pt' }, query: {} }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'projectWizard.step4.meta.selectAccount': 'Selecione a conta',
        'projectWizard.step4.meta.selectPixel': 'Selecione o pixel',
      }
      return map[key] ?? key
    },
  }),
}))

const defaultMountProps = { open: true, projectId: 'proj-123', disablePortal: true }

describe('MetaAccountPixelModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIntegrationId.value = null
    mockAvailableAccounts.value = []
    mockAvailablePixels.value = []
    mockIsConnecting.value = false
    mockIsSelectingAccounts.value = false
    mockError.value = null
    mockStartOAuth.mockReset()
    mockLoadPixels.mockReset().mockResolvedValue(undefined)
    mockLoadPixels.mockImplementation(async () => {
      mockAvailablePixels.value = [{ id: 'px-1', name: 'Pixel 1' }]
    })
    mockFinalizeSelection.mockReset()
    mockReset.mockReset()
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('shows connect button when not connected', () => {
      const wrapper = mount(MetaAccountPixelModal, {
        props: defaultMountProps,
      })
      expect(wrapper.text()).toContain('Conectar com Meta Ads')
      expect(wrapper.find('#meta-connect-btn').exists()).toBe(true)
    })

    it('does not render content when closed', () => {
      const wrapper = mount(MetaAccountPixelModal, {
        props: { ...defaultMountProps, open: false },
      })
      expect(wrapper.find('#meta-modal-title').exists()).toBe(false)
    })
  })

  describe('Loading state', () => {
    it('shows loading when isConnecting is true', async () => {
      mockIsConnecting.value = true
      const wrapper = mount(MetaAccountPixelModal, {
        props: defaultMountProps,
      })
      expect(wrapper.text()).toContain('Conectando...')
      expect(wrapper.find('#meta-connect-btn').attributes('disabled')).toBeDefined()
    })

    it('shows saving state when isSelectingAccounts is true', async () => {
      mockIntegrationId.value = 'int-1'
      mockAvailableAccounts.value = [{ accountId: 'act-1', name: 'Account 1' }]
      mockAvailablePixels.value = [{ id: 'px-1', name: 'Pixel 1' }]
      mockIsSelectingAccounts.value = true

      const wrapper = mount(MetaAccountPixelModal, {
        props: defaultMountProps,
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Salvando...')
    })
  })

  describe('Error state', () => {
    it('displays error message when error is set', async () => {
      mockError.value = 'Sessão expirada'
      const wrapper = mount(MetaAccountPixelModal, {
        props: defaultMountProps,
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Sessão expirada')
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })
  })

  describe('Success flow', () => {
    it('shows account and pixel selects after OAuth and emits success on save', async () => {
      mockIntegrationId.value = 'int-1'
      mockAvailableAccounts.value = [{ accountId: 'act-1', name: 'Account 1' }]
      mockAvailablePixels.value = [{ id: 'px-1', name: 'Pixel 1' }]
      mockFinalizeSelection.mockResolvedValue(undefined)

      const wrapper = mount(MetaAccountPixelModal, {
        props: defaultMountProps,
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Autenticação concluída')
      expect(wrapper.text()).toContain('Conta')
      expect(wrapper.text()).toContain('Pixel')

      const selects = wrapper.findAll('select')
      expect(selects.length).toBeGreaterThanOrEqual(1)
      const accountSelect = selects[0]
      expect(accountSelect).toBeDefined()
      await accountSelect!.setValue('act-1')
      await flushPromises()
      await wrapper.vm.$nextTick()

      const selectsAfter = wrapper.findAll('select')
      expect(selectsAfter.length).toBeGreaterThanOrEqual(2)
      const pixelSelect = selectsAfter[1]
      expect(pixelSelect).toBeDefined()
      await pixelSelect!.setValue('px-1')
      await wrapper.vm.$nextTick()

      const saveBtn = wrapper.find('#meta-save-btn')
      expect(saveBtn.attributes('disabled')).toBeUndefined()
      await saveBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(mockFinalizeSelection).toHaveBeenCalledWith(['act-1'], 'px-1')
      expect(wrapper.emitted('success')).toBeTruthy()
      expect(wrapper.emitted('update:open')).toEqual([[false]])
    })

    it('calls startOAuth when connect button is clicked', async () => {
      const wrapper = mount(MetaAccountPixelModal, {
        props: defaultMountProps,
      })
      await wrapper.find('#meta-connect-btn').trigger('click')
      expect(mockStartOAuth).toHaveBeenCalled()
      expect(localStorage.getItem('current_project_id')).toBe('proj-123')
    })
  })

  describe('Empty state', () => {
    it('shows empty message when no accounts after OAuth', async () => {
      mockIntegrationId.value = 'int-1'
      mockAvailableAccounts.value = []
      const wrapper = mount(MetaAccountPixelModal, {
        props: defaultMountProps,
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Nenhuma conta de anúncios encontrada')
    })
  })
})
