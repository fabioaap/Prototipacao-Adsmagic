import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import IntegrationsView from '../IntegrationsView.vue'

const loadDataMock = vi.fn().mockResolvedValue(undefined)
const copyAdTrackingTemplateMock = vi.fn().mockResolvedValue(true)

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { projectId: 'project-123', locale: 'pt' },
    query: { tab: 'ads' },
  }),
}))

vi.mock('@/stores/projects', () => ({
  useProjectsStore: () => ({
    currentProject: { id: 'project-123' },
  }),
}))

vi.mock('@/stores/integrations', () => ({
  useIntegrationsStore: () => ({
    tagInstallation: {
      scriptCode: '<script></script>',
      lastPing: null,
      lastVerifiedUrl: 'https://example.com',
    },
    isLoading: false,
    qrExpiresAt: null,
    whatsappConnecting: false,
    isTagInstalled: false,
    eventsReceived: 0,
    connectedIntegrations: [{ id: 'int-1' }],
    whatsappQR: null,
    getIntegrationByPlatform: vi.fn(() => undefined),
    fetchIntegrations: vi.fn().mockResolvedValue(undefined),
    getTagScript: vi.fn().mockResolvedValue(undefined),
    startTagVerification: vi.fn(),
    getTagVerificationStatus: vi.fn(),
    checkTagInstallation: vi.fn(),
    initiateOAuth: vi.fn(),
    saveAccounts: vi.fn(),
    disconnectPlatform: vi.fn(),
    refreshConnection: vi.fn(),
    generateWhatsAppQR: vi.fn(),
    checkWhatsAppConnection: vi.fn(),
  }),
}))

vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

vi.mock('@/composables/useGoogleConversionActions', () => ({
  useGoogleConversionActions: () => ({
    isDrawerOpen: ref(false),
    isLoading: ref(false),
    isSaving: ref(false),
    error: ref(null),
    accountId: ref(null),
    conversionActions: ref([]),
    selectedConversionActionIds: ref([]),
    enhancedConversionsForLeadsEnabled: ref(false),
    enhancedConversionsForLeadsCheckedAt: ref(null),
    openDrawer: vi.fn(),
    closeDrawer: vi.fn(),
    reload: vi.fn(),
    saveSelection: vi.fn(),
    setSelectedIds: vi.fn(),
  }),
}))

vi.mock('@/composables/useIntegrationsDataLoader', () => ({
  useIntegrationsDataLoader: () => ({
    adMetrics: ref({ meta: null, google: null, tiktok: null }),
    metricsLoading: ref({ meta: false, google: false, tiktok: false }),
    whatsappAccounts: ref([]),
    whatsappAccountsLoading: ref(false),
    loadData: loadDataMock,
    loadWhatsAppAccounts: vi.fn(),
    loadAdMetrics: vi.fn(),
    refreshPlatformMetrics: vi.fn(),
    getWhatsAppStatusLabel: vi.fn(),
    getWhatsAppStatusClass: vi.fn(),
    isPrimaryConnectedInstance: vi.fn(),
  }),
}))

vi.mock('@/composables/useTagVerification', () => ({
  useTagVerification: () => ({
    isTagVerificationModalOpen: ref(false),
    tagVerificationSiteUrl: ref(''),
    isTagVerificationSubmitting: ref(false),
    isTagVerificationPolling: ref(false),
    activeTagVerificationStatus: ref(null),
    closeTagVerificationModal: vi.fn(),
    handleStartTagVerification: vi.fn(),
    handleCheckTagInstallation: vi.fn(),
    cancelPolling: vi.fn(),
  }),
}))

vi.mock('@/composables/useIntegrationsPlatformActions', () => ({
  useIntegrationsPlatformActions: () => ({
    isWhatsAppQRModalOpen: ref(false),
    isMetaConnectionModalOpen: ref(false),
    isGoogleConnectionModalOpen: ref(false),
    isAccountSelectorOpen: ref(false),
    isConnectionInfoOpen: ref(false),
    selectedPlatform: ref(''),
    selectedAccountIds: ref([]),
    availableAccounts: ref([]),
    selectedConnection: ref(null),
    isDisconnectDialogOpen: ref(false),
    disconnectPlatformTarget: ref(''),
    disconnectLoading: ref(false),
    handleMetaConnect: vi.fn(),
    handleMetaConnectionSuccess: vi.fn(),
    handleGoogleConnect: vi.fn(),
    handleGoogleConnectionSuccess: vi.fn(),
    handleTikTokConnect: vi.fn(),
    handleConfirmAccountSelection: vi.fn(),
    handleMetaDisconnect: vi.fn(),
    handleGoogleDisconnect: vi.fn(),
    handleTikTokDisconnect: vi.fn(),
    handleWhatsAppDisconnect: vi.fn(),
    confirmDisconnect: vi.fn(),
    cancelDisconnect: vi.fn(),
    getPlatformDisplayName: vi.fn((platform: string) => platform),
    handleMetaReconnect: vi.fn(),
    handleGoogleReconnect: vi.fn(),
    handleTikTokReconnect: vi.fn(),
    handleWhatsAppReconnect: vi.fn(),
    handleMetaSync: vi.fn(),
    handleGoogleSync: vi.fn(),
    handleTikTokSync: vi.fn(),
    handleWhatsAppSync: vi.fn(),
    handleMetaViewDetails: vi.fn(),
    handleGoogleViewDetails: vi.fn(),
    handleTikTokViewDetails: vi.fn(),
    handleWhatsAppViewDetails: vi.fn(),
    handleDisconnectConnection: vi.fn(),
    handleWhatsAppConnect: vi.fn(),
    handleGenerateWhatsAppQR: vi.fn(),
    handleCheckWhatsAppConnection: vi.fn(),
  }),
}))

vi.mock('@/composables/useAdTrackingTemplates', () => ({
  useAdTrackingTemplates: () => ({
    adTrackingTemplates: [
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
    ],
    copyAdTrackingTemplate: copyAdTrackingTemplateMock,
  }),
}))

describe('IntegrationsView - Ads Tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountView = () =>
    shallowMount(IntegrationsView, {
      global: {
        stubs: {
          AppShell: { template: '<div><slot /></div>' },
          WhatsAppQRModal: { template: '<div />' },
          IntegrationsAdsTab: false,
          Tabs: { template: '<div><slot /></div>' },
          TabsList: { template: '<div><slot /></div>' },
          TabsTrigger: { template: '<button><slot /></button>' },
          TabsContent: { template: '<div><slot /></div>' },
        },
      },
    })

  it('renders Ads tab content when query tab is ads', async () => {
    const wrapper = mountView()

    expect(loadDataMock).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Anúncios')
    expect(wrapper.find('[data-testid="ads-card-google"]').exists()).toBe(true)
  })

  it('forwards copy-template event to copyAdTrackingTemplate', async () => {
    const wrapper = mountView()
    await (wrapper.vm as unknown as { handleCopyAdTemplate: (template: string, title: string) => Promise<void> })
      .handleCopyAdTemplate('google-template', 'Google Ads')

    expect(copyAdTrackingTemplateMock).toHaveBeenCalledWith('google-template', 'Google Ads')
  })
})
