import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FeaturebaseMessenger from '@/components/layout/FeaturebaseMessenger.vue'
import type { Locale } from '@/stores/language'

const mockLanguageStore = reactive({
  currentLocale: 'pt' as Locale,
})

vi.mock('@/stores/language', () => ({
  useLanguageStore: () => mockLanguageStore,
}))

describe('FeaturebaseMessenger', () => {
  const featurebaseSpy = vi.fn()
  const originalCreateElement = document.createElement.bind(document)

  beforeEach(() => {
    mockLanguageStore.currentLocale = 'pt'
    document.documentElement.classList.remove('dark')
    document.getElementById('featurebase-sdk')?.remove()
    featurebaseSpy.mockReset()
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      if (tagName.toLowerCase() === 'script') {
        return originalCreateElement('div') as unknown as HTMLScriptElement
      }

      return originalCreateElement(tagName)
    }) as typeof document.createElement)
    ;(window as Window & { Featurebase?: typeof featurebaseSpy }).Featurebase = featurebaseSpy
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.getElementById('featurebase-sdk')?.remove()
    Reflect.deleteProperty(window, 'Featurebase')
  })

  it('boots the messenger when mounted inside the sidebar layout', () => {
    const wrapper = mount(FeaturebaseMessenger)

    expect(document.getElementById('featurebase-sdk')).not.toBeNull()
    expect(featurebaseSpy).toHaveBeenCalledWith(
      'boot',
      expect.objectContaining({
        appId: '69da5e66750b00fc471266c6',
        theme: 'light',
        language: 'pt',
      }),
    )

    wrapper.unmount()

    expect(featurebaseSpy).toHaveBeenCalledWith('shutdown')
  })

  it('updates the messenger language after boot', async () => {
    mount(FeaturebaseMessenger)

    mockLanguageStore.currentLocale = 'en'
    await nextTick()

    expect(featurebaseSpy).toHaveBeenCalledWith('setLanguage', 'en')
  })
})
