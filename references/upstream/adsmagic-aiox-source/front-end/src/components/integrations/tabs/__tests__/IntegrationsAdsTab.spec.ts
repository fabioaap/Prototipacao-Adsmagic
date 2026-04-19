import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IntegrationsAdsTab from '../IntegrationsAdsTab.vue'
import type { AdTrackingTemplate } from '@/types/integrations'

const templates: readonly AdTrackingTemplate[] = [
  {
    platform: 'google',
    title: 'Google Ads',
    template: 'google-template',
    copyEnabled: true,
  },
  {
    platform: 'meta',
    title: 'Meta Ads',
    template: 'meta-template',
    copyEnabled: true,
  },
  {
    platform: 'tiktok',
    title: 'TikTok Ads',
    template: 'Em breve',
    copyEnabled: false,
  },
]

describe('IntegrationsAdsTab', () => {
  it('renders all ad template cards', () => {
    const wrapper = mount(IntegrationsAdsTab, {
      props: {
        templates,
      },
    })

    expect(wrapper.find('[data-testid="ads-card-google"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="ads-card-meta"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="ads-card-tiktok"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('google-template')
    expect(wrapper.text()).toContain('meta-template')
    expect(wrapper.text()).toContain('Em breve')
  })

  it('emits copy-template for enabled templates', async () => {
    const wrapper = mount(IntegrationsAdsTab, {
      props: {
        templates,
      },
    })

    await wrapper.find('[data-testid="copy-google"]').trigger('click')
    await wrapper.find('[data-testid="copy-meta"]').trigger('click')

    expect(wrapper.emitted('copy-template')).toEqual([
      [{ template: 'google-template', title: 'Google Ads' }],
      [{ template: 'meta-template', title: 'Meta Ads' }],
    ])
  })

  it('keeps TikTok copy button disabled', () => {
    const wrapper = mount(IntegrationsAdsTab, {
      props: {
        templates,
      },
    })

    const tiktokButton = wrapper.find('[data-testid="copy-tiktok"]')
    expect(tiktokButton.attributes('disabled')).toBeDefined()
  })
})
