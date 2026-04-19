import { describe, it, expect } from 'vitest'
import { shallowMount, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import IntegrationsChannelsTab from '../IntegrationsChannelsTab.vue'
import type { Integration } from '@/types/models'
import type { AdMetricsLoadingMap, AdMetricsMap } from '@/types/integrations'

const i18n = createI18n({
  legacy: false,
  locale: 'pt',
  messages: { pt: {} },
})

const withI18n = {
  global: {
    plugins: [i18n],
  },
}

const createIntegration = (platform: Integration['platform']): Integration => ({
  id: `${platform}-id`,
  projectId: 'project-id',
  platform,
  platformType: platform === 'whatsapp' ? 'messaging' : 'advertising',
  status: 'connected',
  platformConfig: {},
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
})

const adMetrics: AdMetricsMap = {
  meta: null,
  google: null,
  tiktok: null,
}

const metricsLoading: AdMetricsLoadingMap = {
  meta: false,
  google: false,
  tiktok: false,
}

describe('IntegrationsChannelsTab', () => {
  it('renders connected whatsapp integration', () => {
    const wrapper = shallowMount(IntegrationsChannelsTab, {
      ...withI18n,
      props: {
        platformIntegrations: {
          whatsapp: createIntegration('whatsapp'),
          meta: null,
          google: null,
          tiktok: null,
        },
        loading: false,
        whatsappConnecting: false,
        adMetrics,
        metricsLoading,
      },
    })

    expect(wrapper.text()).toContain('WhatsApp Business')
    expect(wrapper.text()).toContain('Conectadas')
  })

  it('emits action payload when user clicks Conectar on an available integration', async () => {
    const whatsappDisconnected: Integration = {
      ...createIntegration('whatsapp'),
      status: 'disconnected',
    }

    const wrapper = mount(IntegrationsChannelsTab, {
      ...withI18n,
      props: {
        platformIntegrations: {
          whatsapp: whatsappDisconnected,
          meta: createIntegration('meta'),
          google: createIntegration('google'),
          tiktok: null,
        },
        loading: false,
        whatsappConnecting: false,
        adMetrics,
        metricsLoading,
      },
    })

    const connectButtons = wrapper.findAll('button').filter((btn) => btn.text().includes('Conectar'))
    expect(connectButtons.length).toBeGreaterThan(0)
    const connectBtn = connectButtons[0]
    if (!connectBtn) {
      throw new Error('Conectar button not found')
    }
    await connectBtn.trigger('click')

    expect(wrapper.emitted('action')).toEqual([
      [{ platform: 'whatsapp', action: 'connect' }],
    ])
  })
})
