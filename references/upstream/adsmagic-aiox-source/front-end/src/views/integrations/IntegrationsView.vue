<template>
  <AppShell container-size="2xl">
    <div class="w-full section-stack-md">
      <!-- Header -->
      <PageHeader
        title="Integrações"
        description="Conecte suas plataformas e configure o rastreamento do seu site"
      />

      <div class="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div class="flex flex-col items-stretch gap-3 border-b bg-muted/30 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <IntegrationsSummaryCards
            :connected-count="connectedIntegrations.length"
          />

          <Button
            variant="outline"
            size="sm"
            class="w-full sm:w-auto"
            @click="handleRefresh"
            :disabled="isLoading"
            :loading="isLoading"
          >
            <RefreshCw class="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <Tabs v-model="activeTab" class="w-full p-6">
          <TabsList class="grid w-full grid-cols-3 rounded-control bg-muted p-1 text-muted-foreground h-10 gap-1">
            <TabsTrigger value="site">Site</TabsTrigger>
            <TabsTrigger value="channels">Canais</TabsTrigger>
            <TabsTrigger value="ads">Anúncios</TabsTrigger>
          </TabsList>

          <!-- Tab 1: Tag do Site -->
          <TabsContent value="site" class="mt-6">
            <IntegrationsSiteTab
              :project-id="currentProjectId"
              :script-code="tagInstallation?.scriptCode"
              :is-installed="isTagInstalled"
              :loading="isLoading"
              :events-received="eventsReceived"
              :last-ping="tagInstallation?.lastPing"
              @copy="handleTagCopy"
              @check-installation="handleCheckTagInstallation"
            />
          </TabsContent>

          <!-- Tab 2: Canais e Plataformas -->
          <TabsContent value="channels" class="mt-6">
            <IntegrationsChannelsTab
              :platform-integrations="platformIntegrations"
              :loading="isLoading"
              :whatsapp-connecting="whatsappConnecting"
              :ad-metrics="adMetrics"
              :metrics-loading="metricsLoading"
              :whatsapp-accounts="whatsappAccounts"
              :whatsapp-accounts-loading="whatsappAccountsLoading"
              :get-whatsapp-status-label="getWhatsAppStatusLabel"
              :get-whatsapp-status-class="getWhatsAppStatusClass"
              :is-primary-connected-instance="isPrimaryConnectedInstance"
              @action="handleChannelsAction"
            />
          </TabsContent>

          <!-- Tab 3: Anuncios -->
          <TabsContent value="ads" class="mt-6">
            <IntegrationsAdsTab
              :templates="adTrackingTemplates"
              @copy-template="({ template, title }) => handleCopyAdTemplate(template, title)"
            />
          </TabsContent>
        </Tabs>
      </div>

    <!-- Modals -->
    <!-- Meta Account + Pixel Modal -->
    <MetaAccountPixelModal
      :open="isMetaConnectionModalOpen"
      :project-id="(route.params.projectId as string) || currentProjectId"
      @update:open="isMetaConnectionModalOpen = $event"
      @success="handleMetaConnectionSuccess"
    />
    <!-- Google Account Modal -->
    <GoogleAccountModal
      :open="isGoogleConnectionModalOpen"
      :project-id="(route.params.projectId as string) || currentProjectId"
      @update:open="isGoogleConnectionModalOpen = $event"
      @success="handleGoogleConnectionSuccess"
    />
    <!-- WhatsApp QR Modal -->
    <WhatsAppQRModal
      :open="isWhatsAppQRModalOpen"
      :qr-code="whatsappQR"
      :expires-at="qrExpiresAt"
      :is-connecting="whatsappConnecting"
      :is-connected="isWhatsAppConnected"
      @update:open="isWhatsAppQRModalOpen = $event"
      @generate-qr="handleGenerateWhatsAppQR"
      @check-connection="handleCheckWhatsAppConnection"
    />

    <!-- Account Selector Modal -->
    <AccountSelector
      :open="isAccountSelectorOpen"
      :accounts="availableAccounts"
      :selected-ids="selectedAccountIds"
      :loading="isLoading"
      :platform="selectedPlatform"
      @update:open="isAccountSelectorOpen = $event"
      @update:selected-ids="selectedAccountIds = $event"
      @confirm="handleConfirmAccountSelection"
    />

    <Modal
      :model-value="isTagVerificationModalOpen"
      title="Verificar instalação da tag"
      description="Informe a URL do site onde a tag foi instalada para iniciar a validação one-shot."
      @update:model-value="(value) => { if (!value) closeTagVerificationModal() }"
    >
      <template #content>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="tag-verification-url">URL do site</Label>
            <Input
              id="tag-verification-url"
              v-model="tagVerificationSiteUrl"
              type="url"
              placeholder="https://seusite.com.br"
              :disabled="isTagVerificationSubmitting || isTagVerificationPolling"
            />
            <p class="text-xs text-muted-foreground">
              O sistema abrirá essa URL com um token temporário para validar a tag uma única vez.
            </p>
          </div>

          <div
            v-if="activeTagVerificationStatus"
            class="text-xs text-muted-foreground"
          >
            Status atual: {{ activeTagVerificationStatus }}
          </div>

          <div class="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              @click="closeTagVerificationModal"
              :disabled="isTagVerificationSubmitting || isTagVerificationPolling"
            >
              Cancelar
            </Button>
            <Button
              @click="handleStartTagVerification"
              :loading="isTagVerificationSubmitting || isTagVerificationPolling"
              :disabled="!tagVerificationSiteUrl.trim() || isTagVerificationSubmitting || isTagVerificationPolling"
            >
              Verificar agora
            </Button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Connection Info Modal -->
    <Modal
      :model-value="isConnectionInfoOpen"
      title="Detalhes da conexão"
      :description="selectedConnection ? `Revise a configuração atual de ${selectedConnection.accountName}.` : 'Revise a configuração atual da integração.'"
      size="md"
      @update:model-value="isConnectionInfoOpen = $event"
    >
      <template #content>
        <ConnectionInfo
          v-if="selectedConnection"
          :connection="selectedConnection"
          :platform="selectedPlatform"
          :show-google-conversion-actions="selectedPlatform === 'google'"
          @view-logs="handleViewConnectionLogs"
          @refresh="handleRefreshConnection"
          @disconnect="handleDisconnectConnection"
          @manage-google-conversion-actions="handleOpenGoogleConversionActions"
        />
      </template>
    </Modal>

    <GoogleConversionActionsDrawer
      :open="isGoogleConversionDrawerOpen"
      :loading="isGoogleConversionActionsLoading"
      :saving="isGoogleConversionActionsSaving"
      :error="googleConversionActionsError"
      :account-id="googleConversionActionsAccountId"
      :conversion-actions="googleConversionActions"
      :selected-ids="selectedConversionActionIds"
      :enhanced-conversions-for-leads-enabled="googleEnhancedConversionsForLeadsEnabled"
      :enhanced-conversions-for-leads-checked-at="googleEnhancedConversionsForLeadsCheckedAt"
      @update:open="(value) => { if (!value) closeGoogleConversionActionsDrawer() }"
      @update:selected-ids="setSelectedGoogleConversionActionIds"
      @retry="handleReloadGoogleConversionActions"
      @save="handleSaveGoogleConversionActions"
    />

    <!-- Modal de confirmação para desconexão de integração -->
    <AlertDialog
      v-model="isDisconnectDialogOpen"
      variant="destructive"
      :title="`Desconectar ${getPlatformDisplayName(disconnectPlatformTarget)}?`"
      :description="`Você tem certeza que deseja desconectar ${getPlatformDisplayName(disconnectPlatformTarget)}? Você precisará reconectar a conta para usar esta integração novamente.`"
      confirm-text="Desconectar"
      cancel-text="Cancelar"
      :loading="disconnectLoading"
      @confirm="confirmDisconnect"
      @cancel="cancelDisconnect"
    />
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { RefreshCw } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import AppShell from '@/components/layout/AppShell.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import TabsContent from '@/components/ui/TabsContent.vue'
import Modal from '@/components/ui/Modal.vue'
import IntegrationsSummaryCards from '@/components/integrations/IntegrationsSummaryCards.vue'
import IntegrationsSiteTab from '@/components/integrations/tabs/IntegrationsSiteTab.vue'
import IntegrationsChannelsTab from '@/components/integrations/tabs/IntegrationsChannelsTab.vue'
import IntegrationsAdsTab from '@/components/integrations/tabs/IntegrationsAdsTab.vue'
import WhatsAppQRModal from '@/components/integrations/WhatsAppQRModal.vue'
import MetaAccountPixelModal from '@/components/integrations/MetaAccountPixelModal.vue'
import GoogleAccountModal from '@/components/integrations/GoogleAccountModal.vue'
import GoogleConversionActionsDrawer from '@/components/integrations/GoogleConversionActionsDrawer.vue'
import AccountSelector from '@/components/integrations/AccountSelector.vue'
import ConnectionInfo from '@/components/integrations/ConnectionInfo.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import { useGoogleConversionActions } from '@/composables/useGoogleConversionActions'
import { useIntegrationsDataLoader } from '@/composables/useIntegrationsDataLoader'
import { useTagVerification } from '@/composables/useTagVerification'
import { useAdTrackingTemplates } from '@/composables/useAdTrackingTemplates'
import { useIntegrationsPlatformActions } from '@/composables/useIntegrationsPlatformActions'
import { integrationsService } from '@/services/api/integrations'
import { useIntegrationsStore } from '@/stores/integrations'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/components/ui/toast/use-toast'
import type { Integration } from '@/types/models'
import type { IntegrationActionPayload } from '@/types/integrations'

const route = useRoute()
const integrationsStore = useIntegrationsStore()
const projectsStore = useProjectsStore()
const { toast } = useToast()

const {
  isDrawerOpen: isGoogleConversionDrawerOpen,
  isLoading: isGoogleConversionActionsLoading,
  isSaving: isGoogleConversionActionsSaving,
  error: googleConversionActionsError,
  accountId: googleConversionActionsAccountId,
  conversionActions: googleConversionActions,
  selectedConversionActionIds,
  enhancedConversionsForLeadsEnabled: googleEnhancedConversionsForLeadsEnabled,
  enhancedConversionsForLeadsCheckedAt: googleEnhancedConversionsForLeadsCheckedAt,
  openDrawer: openGoogleConversionActionsDrawer,
  closeDrawer: closeGoogleConversionActionsDrawer,
  reload: reloadGoogleConversionActions,
  saveSelection: saveGoogleConversionActionsSelection,
  setSelectedIds: setSelectedGoogleConversionActionIds,
} = useGoogleConversionActions()

const getInitialTab = (): 'site' | 'channels' | 'ads' => {
  const tabParam = route.query.tab as string | undefined
  if (tabParam === 'channels' || tabParam === 'ads') {
    return tabParam
  }
  return 'site'
}

const activeTab = ref<'site' | 'channels' | 'ads'>(getInitialTab())

const {
  tagInstallation,
  isLoading,
  qrExpiresAt,
  whatsappConnecting,
  isTagInstalled,
  eventsReceived,
  getIntegrationByPlatform,
  connectedIntegrations,
} = integrationsStore

const whatsappQR = computed(() => integrationsStore.whatsappQR)

const isWhatsAppConnected = computed(() => {
  const whatsappIntegration = getIntegrationByPlatform('whatsapp')
  return whatsappIntegration?.status === 'connected'
})

const currentProjectId = computed(() => {
  const routeProjectId = route.params.projectId as string | undefined
  return (
    routeProjectId ||
    projectsStore.currentProject?.id ||
    localStorage.getItem('current_project_id') ||
    ''
  )
})

const platformIntegrations = computed(() => ({
  whatsapp: (getIntegrationByPlatform('whatsapp') as Integration | undefined) || null,
  meta: (getIntegrationByPlatform('meta') as Integration | undefined) || null,
  google: (getIntegrationByPlatform('google') as Integration | undefined) || null,
  tiktok: (getIntegrationByPlatform('tiktok') as Integration | undefined) || null,
}))

const {
  adMetrics,
  metricsLoading,
  whatsappAccounts,
  whatsappAccountsLoading,
  loadData,
  loadWhatsAppAccounts,
  refreshPlatformMetrics,
  getWhatsAppStatusLabel,
  getWhatsAppStatusClass,
  isPrimaryConnectedInstance,
} = useIntegrationsDataLoader({
  currentProjectId,
  fetchIntegrations: () => integrationsStore.fetchIntegrations(),
  getTagScript: (projectId: string) => integrationsStore.getTagScript(projectId),
  getIntegrationByPlatform: (platform) => getIntegrationByPlatform(platform),
})

const { adTrackingTemplates, copyAdTrackingTemplate } = useAdTrackingTemplates()

const {
  isTagVerificationModalOpen,
  tagVerificationSiteUrl,
  isTagVerificationSubmitting,
  isTagVerificationPolling,
  activeTagVerificationStatus,
  closeTagVerificationModal,
  handleStartTagVerification,
  handleCheckTagInstallation,
  cancelPolling,
} = useTagVerification({
  currentProjectId,
  getDefaultSiteUrl: () => tagInstallation?.lastVerifiedUrl?.trim() || '',
  startTagVerification: (siteUrl: string) => integrationsStore.startTagVerification(siteUrl),
  getTagVerificationStatus: (verificationId: string) =>
    integrationsStore.getTagVerificationStatus(verificationId),
  checkTagInstallation: (projectId: string) => integrationsStore.checkTagInstallation(projectId),
})

const {
  isWhatsAppQRModalOpen,
  isMetaConnectionModalOpen,
  isGoogleConnectionModalOpen,
  isAccountSelectorOpen,
  isConnectionInfoOpen,
  selectedPlatform,
  selectedAccountIds,
  availableAccounts,
  selectedConnection,
  isDisconnectDialogOpen,
  disconnectPlatformTarget,
  disconnectLoading,
  handleMetaConnect,
  handleMetaConnectionSuccess,
  handleGoogleConnect,
  handleGoogleConnectionSuccess,
  handleTikTokConnect,
  handleConfirmAccountSelection,
  handleMetaDisconnect,
  handleGoogleDisconnect,
  handleTikTokDisconnect,
  handleWhatsAppDisconnect,
  confirmDisconnect,
  cancelDisconnect,
  getPlatformDisplayName,
  handleMetaReconnect,
  handleGoogleReconnect,
  handleTikTokReconnect,
  handleWhatsAppReconnect,
  handleMetaSync,
  handleGoogleSync,
  handleTikTokSync,
  handleWhatsAppSync,
  handleMetaViewDetails,
  handleGoogleViewDetails,
  handleTikTokViewDetails,
  handleWhatsAppViewDetails,
  handleViewConnectionLogs,
  handleRefreshConnection,
  handleDisconnectConnection,
  handleWhatsAppConnect,
  handleGenerateWhatsAppQR,
  handleCheckWhatsAppConnection,
} = useIntegrationsPlatformActions({
  route,
  getIntegrationByPlatform: (platform: string) => getIntegrationByPlatform(platform),
  integrationsStore: {
    initiateOAuth: (platform, options) => integrationsStore.initiateOAuth(platform, options),
    fetchIntegrations: () => integrationsStore.fetchIntegrations(),
    saveAccounts: (platform, accountIds) => integrationsStore.saveAccounts(platform, accountIds),
    disconnectPlatform: (platform) => integrationsStore.disconnectPlatform(platform),
    refreshConnection: (platform) => integrationsStore.refreshConnection(platform),
    getIntegrationAccounts: (integrationId) => integrationsService.getIntegrationAccounts(integrationId),
    generateWhatsAppQR: () => integrationsStore.generateWhatsAppQR(),
    checkWhatsAppConnection: (qrCode) => integrationsStore.checkWhatsAppConnection(qrCode),
  },
  refreshPlatformMetrics,
  openGoogleConversionActionsDrawer,
  loadWhatsAppAccounts,
  isWhatsAppConnected,
  whatsappQR,
})

const handleRefresh = async () => {
  await loadData()
  toast({
    title: 'Atualizado',
    description: 'Dados das integrações atualizados com sucesso',
  })
}

const handleTagCopy = () => {
  toast({
    title: 'Copiado!',
    description: 'Código da tag copiado para a área de transferência',
  })
}

const handleCopyAdTemplate = async (template: string, platformLabel: string) => {
  await copyAdTrackingTemplate(template, platformLabel)
}

const handleChannelsAction = async ({
  platform,
  action,
}: IntegrationActionPayload): Promise<void> => {
  if (platform === 'whatsapp') {
    if (action === 'connect') return handleWhatsAppConnect()
    if (action === 'disconnect') return handleWhatsAppDisconnect()
    if (action === 'reconnect') return handleWhatsAppReconnect()
    if (action === 'sync') return handleWhatsAppSync()
    if (action === 'view-details') return handleWhatsAppViewDetails()
    return
  }

  if (platform === 'meta') {
    if (action === 'connect') return handleMetaConnect()
    if (action === 'disconnect') return handleMetaDisconnect()
    if (action === 'reconnect') return handleMetaReconnect()
    if (action === 'sync') return handleMetaSync()
    if (action === 'view-details') return handleMetaViewDetails()
    return
  }

  if (platform === 'google') {
    if (action === 'connect') return handleGoogleConnect()
    if (action === 'disconnect') return handleGoogleDisconnect()
    if (action === 'reconnect') return handleGoogleReconnect()
    if (action === 'sync') return handleGoogleSync()
    if (action === 'view-details') return handleGoogleViewDetails()
    return
  }

  if (platform === 'tiktok') {
    if (action === 'connect') return handleTikTokConnect()
    if (action === 'disconnect') return handleTikTokDisconnect()
    if (action === 'reconnect') return handleTikTokReconnect()
    if (action === 'sync') return handleTikTokSync()
    if (action === 'view-details') return handleTikTokViewDetails()
  }
}

const handleOpenGoogleConversionActions = async () => {
  const googleIntegration = getIntegrationByPlatform('google')

  if (!googleIntegration?.id) {
    toast({
      title: 'Google Ads indisponível',
      description: 'Não foi possível localizar a conexão do Google Ads para este projeto.',
      variant: 'destructive',
    })
    return
  }

  isConnectionInfoOpen.value = false
  await openGoogleConversionActionsDrawer(googleIntegration.id)
}

const handleSaveGoogleConversionActions = async () => {
  try {
    await saveGoogleConversionActionsSelection()
    toast({
      title: 'Configuração salva',
      description: 'Conversion actions do Google Ads atualizadas com sucesso',
    })
  } catch (error) {
    toast({
      title: 'Erro',
      description: error instanceof Error ? error.message : 'Não foi possível salvar a seleção',
      variant: 'destructive',
    })
  }
}

const handleReloadGoogleConversionActions = async () => {
  try {
    await reloadGoogleConversionActions()
  } catch (error) {
    toast({
      title: 'Erro',
      description:
        error instanceof Error
          ? error.message
          : 'Não foi possível recarregar conversion actions',
      variant: 'destructive',
    })
  }
}

onMounted(async () => {
  await loadData()
})

onUnmounted(() => {
  cancelPolling()
})
</script>
