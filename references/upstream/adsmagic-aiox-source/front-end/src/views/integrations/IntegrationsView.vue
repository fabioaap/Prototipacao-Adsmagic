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
    <!-- WhatsApp Connection Method Modal -->
    <WhatsAppConnectionMethodModal
      :open="isWhatsAppConnectionMethodModalOpen"
      @update:open="isWhatsAppConnectionMethodModalOpen = $event"
      @select-qr="handleSelectQR"
      @select-webhook="handleSelectWebhook"
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
      @share-qr="handleShareWhatsAppQR"
    />
    <!-- WhatsApp Webhook Modal -->
    <WhatsAppWebhookModal
      :open="isWhatsAppWebhookModalOpen"
      @update:open="isWhatsAppWebhookModalOpen = $event"
      @connected="handleWebhookConnected"
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

          <!-- Polling: aguardando resposta -->
          <div
            v-if="isTagVerificationPolling"
            class="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 class="h-4 w-4 animate-spin" />
            Aguardando resposta da tag no site...
          </div>

          <!-- Timeout: checklist de troubleshooting -->
          <div
            v-else-if="hasPollingTimedOut"
            class="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2"
          >
            <div class="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle class="h-4 w-4 shrink-0" />
              A tag não respondeu no tempo esperado
            </div>
            <ul class="text-xs text-muted-foreground space-y-1 pl-6 list-disc">
              <li>Verifique se o script da tag está no HTML do site (ou no GTM)</li>
              <li>Verifique se o <code class="font-mono bg-muted px-1 rounded">projectId</code> corresponde ao projeto atual</li>
              <li>Se usa GTM, confirme que o script e a config são carregados juntos</li>
            </ul>
          </div>

          <!-- Status genérico (expired, failed, etc.) -->
          <div
            v-else-if="activeTagVerificationStatus && activeTagVerificationStatus !== 'pending'"
            class="text-xs text-muted-foreground"
          >
            Status: {{ activeTagVerificationStatus }}
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
          :loading="connectionDetailsLoading"
          :show-google-conversion-actions="selectedPlatform === 'google'"
          :show-meta-pixel-management="selectedPlatform === 'meta'"
          :show-token-renewal="selectedPlatform === 'meta' || selectedPlatform === 'google'"
          :show-change-account="selectedPlatform === 'meta' || selectedPlatform === 'google'"
          @disconnect="handleDisconnectConnection"
          @manage-google-conversion-actions="handleOpenGoogleConversionActions"
          @manage-meta-pixels="handleOpenMetaPixels"
          @renew-token="handleRenewToken"
          @change-account="handleChangeAccount"
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

    <MetaPixelsDrawer
      :open="isMetaPixelsDrawerOpen"
      :loading="isMetaPixelsLoading"
      :saving="isMetaPixelsSaving"
      :error="metaPixelsError"
      :fetch-error="metaPixelsFetchError"
      :account-id="metaPixelsAccountId"
      :pixels="metaPixels"
      :selected-pixel-id="metaSelectedPixelId"
      :pixel-access-token="metaPixelAccessToken"
      :pixel-access-token-set="metaPixelAccessTokenSet"
      @update:open="(value) => { if (!value) closeMetaPixelsDrawer() }"
      @update:selected-pixel-id="selectMetaPixel"
      @update:pixel-access-token="metaPixelAccessToken = $event"
      @retry="handleReloadMetaPixels"
      @save="handleSaveMetaPixels"
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
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { RefreshCw, Loader2, AlertTriangle } from '@/composables/useIcons'
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
import WhatsAppConnectionMethodModal from '@/components/integrations/WhatsAppConnectionMethodModal.vue'
import WhatsAppWebhookModal from '@/components/integrations/WhatsAppWebhookModal.vue'
import MetaAccountPixelModal from '@/components/integrations/MetaAccountPixelModal.vue'
import GoogleAccountModal from '@/components/integrations/GoogleAccountModal.vue'
import GoogleConversionActionsDrawer from '@/components/integrations/GoogleConversionActionsDrawer.vue'
import MetaPixelsDrawer from '@/components/integrations/MetaPixelsDrawer.vue'
import AccountSelector from '@/components/integrations/AccountSelector.vue'
import ConnectionInfo from '@/components/integrations/ConnectionInfo.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import { useGoogleConversionActions } from '@/composables/useGoogleConversionActions'
import { useMetaPixels } from '@/composables/useMetaPixels'
import { useIntegrationsDataLoader } from '@/composables/useIntegrationsDataLoader'
import { useTagVerification } from '@/composables/useTagVerification'
import { useAdTrackingTemplates } from '@/composables/useAdTrackingTemplates'
import { useIntegrationsPlatformActions } from '@/composables/useIntegrationsPlatformActions'
import { useTokenRenewal } from '@/composables/useTokenRenewal'
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

const {
  startRenewal: startTokenRenewal,
} = useTokenRenewal()

const {
  isDrawerOpen: isMetaPixelsDrawerOpen,
  isLoading: isMetaPixelsLoading,
  isSaving: isMetaPixelsSaving,
  error: metaPixelsError,
  fetchError: metaPixelsFetchError,
  accountId: metaPixelsAccountId,
  availablePixels: metaPixels,
  selectedPixelId: metaSelectedPixelId,
  pixelAccessToken: metaPixelAccessToken,
  pixelAccessTokenSet: metaPixelAccessTokenSet,
  openDrawer: openMetaPixelsDrawer,
  closeDrawer: closeMetaPixelsDrawer,
  reload: reloadMetaPixels,
  selectPixel: selectMetaPixel,
  saveSelection: saveMetaPixelsSelection,
} = useMetaPixels()

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
  connectedIntegrations,
} = storeToRefs(integrationsStore)

const { getIntegrationByPlatform } = integrationsStore

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
  loadData,
  loadWhatsAppAccounts,
  refreshPlatformMetrics,
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
  hasPollingTimedOut,
  closeTagVerificationModal,
  handleStartTagVerification,
  handleCheckTagInstallation,
  cancelPolling,
} = useTagVerification({
  currentProjectId,
  getDefaultSiteUrl: () => tagInstallation.value?.lastVerifiedUrl?.trim() || '',
  startTagVerification: (siteUrl: string) => integrationsStore.startTagVerification(siteUrl),
  getTagVerificationStatus: (verificationId: string) =>
    integrationsStore.getTagVerificationStatus(verificationId),
  checkTagInstallation: (projectId: string) => integrationsStore.checkTagInstallation(projectId),
})

const {
  isWhatsAppQRModalOpen,
  isWhatsAppConnectionMethodModalOpen,
  isWhatsAppWebhookModalOpen,
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
  connectionDetailsLoading,
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
  handleDisconnectConnection,
  handleWhatsAppConnect,
  handleSelectQR,
  handleSelectWebhook,
  handleWebhookConnected,
  handleGenerateWhatsAppQR,
  handleCheckWhatsAppConnection,
  handleShareWhatsAppQR,
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
    createShareLink: () => integrationsStore.createShareLink(),
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

const handleRenewToken = async () => {
  const integration = getIntegrationByPlatform(selectedPlatform.value)
  if (!integration?.id) return

  const success = await startTokenRenewal(integration.id)
  if (success) {
    await integrationsStore.fetchIntegrations()
    toast({
      title: 'Token renovado',
      description: 'O token foi renovado com sucesso. Conta e pixel preservados.',
    })
    isConnectionInfoOpen.value = false
  } else {
    toast({
      title: 'Erro',
      description: 'Não foi possível renovar o token. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleChangeAccount = () => {
  isConnectionInfoOpen.value = false
  const platform = selectedPlatform.value
  if (platform === 'meta') {
    isMetaConnectionModalOpen.value = true
  } else if (platform === 'google') {
    isGoogleConnectionModalOpen.value = true
  }
}

const handleOpenMetaPixels = async () => {
  const metaIntegration = getIntegrationByPlatform('meta')

  if (!metaIntegration?.id) {
    toast({
      title: 'Meta Ads indisponível',
      description: 'Não foi possível localizar a conexão do Meta Ads para este projeto.',
      variant: 'destructive',
    })
    return
  }

  isConnectionInfoOpen.value = false
  await openMetaPixelsDrawer(metaIntegration.id)
}

const handleSaveMetaPixels = async () => {
  try {
    await saveMetaPixelsSelection()
    toast({
      title: 'Configuração salva',
      description: 'Pixel do Meta Ads atualizado com sucesso',
    })
  } catch (error) {
    toast({
      title: 'Erro',
      description: error instanceof Error ? error.message : 'Não foi possível salvar a configuração',
      variant: 'destructive',
    })
  }
}

const handleReloadMetaPixels = async () => {
  try {
    await reloadMetaPixels()
  } catch (error) {
    toast({
      title: 'Erro',
      description:
        error instanceof Error
          ? error.message
          : 'Não foi possível recarregar pixels',
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
