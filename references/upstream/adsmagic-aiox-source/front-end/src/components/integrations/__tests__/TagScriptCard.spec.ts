import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TagScriptCard from '../TagScriptCard.vue'

vi.mock('@/composables/useFormat', () => ({
  useFormat: () => ({
    formatDate: vi.fn(() => '14/03/2026'),
    formatRelativeTime: vi.fn(() => 'agora'),
    formatNumber: vi.fn((value: number) => String(value)),
  }),
}))

vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('TagScriptCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountCard = (props: Record<string, unknown> = {}) =>
    mount(TagScriptCard, {
      props: {
        projectId: 'project-123',
        isInstalled: false,
        ...props,
      },
      global: {
        stubs: {
          Button: {
            template: '<button><slot /></button>',
          },
          Badge: {
            template: '<div><slot /></div>',
          },
          Label: {
            template: '<label><slot /></label>',
          },
        },
      },
    })

  it('uses the official tag url when scriptCode is not provided', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('https://tag.adsmagic.com.br/v1/adsmagic-tag.js')
    expect(wrapper.text()).not.toContain('localhost')
  })

  it('preserves the provided scriptCode without replacing it', () => {
    const customScriptCode = '<script src="https://custom.example.com/tag.js"></script>'

    const wrapper = mountCard({
      scriptCode: customScriptCode,
    })

    expect(wrapper.text()).toContain(customScriptCode)
    expect(wrapper.text()).not.toContain('https://tag.adsmagic.com.br/v1/adsmagic-tag.js')
  })
})
