import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import IntegrationsChannelsTab from '../IntegrationsChannelsTab.vue'
import type { Integration } from '@/types/models'
import type { ConnectedAccount } from '@/types/whatsapp'
import type { AdMetricsLoadingMap, AdMetricsMap } from '@/types/integrations'

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

const whatsappAccounts: ConnectedAccount[] = [
  {
    accountId: 'acc-1',
    phoneNumber: '+5511999999999',
    brokerType: 'uazapi',
    status: 'connected',
    profileName: 'Conta Principal',
    connectedAt: '2026-02-01T00:00:00.000Z',
  },
]

describe('IntegrationsChannelsTab', () => {
  it('renders whatsapp account details', () => {
    const wrapper = shallowMount(IntegrationsChannelsTab, {
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
        whatsappAccounts,
        whatsappAccountsLoading: false,
        getWhatsappStatusLabel: () => 'Conectada',
        getWhatsappStatusClass: () => 'status-class',
        isPrimaryConnectedInstance: () => true,
      },
    })

    expect(wrapper.text()).toContain('Instâncias WhatsApp')
    expect(wrapper.text()).toContain('Conta Principal')
    expect(wrapper.text()).toContain('Conectada')
  })

  it('emits action payload when integration card emits connect', async () => {
    const wrapper = shallowMount(IntegrationsChannelsTab, {
      props: {
        platformIntegrations: {
          whatsapp: createIntegration('whatsapp'),
          meta: createIntegration('meta'),
          google: createIntegration('google'),
          tiktok: createIntegration('tiktok'),
        },
        loading: false,
        whatsappConnecting: false,
        adMetrics,
        metricsLoading,
        whatsappAccounts,
        whatsappAccountsLoading: false,
        getWhatsappStatusLabel: () => 'Conectada',
        getWhatsappStatusClass: () => 'status-class',
        isPrimaryConnectedInstance: () => true,
      },
    })

    const cards = wrapper.findAllComponents({ name: 'IntegrationCard' })
    expect(cards.length).toBeGreaterThan(0)
    const firstCard = cards[0]
    if (!firstCard) {
      throw new Error('IntegrationCard not found')
    }
    await firstCard.vm.$emit('connect')

    expect(wrapper.emitted('action')).toEqual([
      [{ platform: 'whatsapp', action: 'connect' }],
    ])
  })
})
