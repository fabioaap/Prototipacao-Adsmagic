import { ref } from 'vue'
import { integrationsService } from '@/services/api/integrations'
import type { MetaPixel } from '@/types/models'

export function useMetaPixels() {
  const isDrawerOpen = ref(false)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const fetchError = ref<string | null>(null)

  const integrationId = ref<string | null>(null)
  const accountId = ref<string>('')
  const availablePixels = ref<MetaPixel[]>([])
  const selectedPixelId = ref<string>('')
  const selectedPixelName = ref<string>('')
  const pixelAccessToken = ref<string>('')
  const pixelAccessTokenSet = ref(false)

  const loadByIntegrationId = async (targetIntegrationId: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    fetchError.value = null
    integrationId.value = targetIntegrationId

    try {
      const accountsData = await integrationsService.getIntegrationAccounts(targetIntegrationId)
      const activeAccounts = accountsData.accounts.filter(account => account.status === 'active')
      const primaryAccount = activeAccounts.find(account => account.is_primary) || activeAccounts[0]

      if (!primaryAccount) {
        throw new Error('Nenhuma conta ativa encontrada para esta integração do Meta Ads')
      }

      accountId.value = primaryAccount.external_account_id

      const response = await integrationsService.getMetaPixelConfig(
        targetIntegrationId,
        primaryAccount.external_account_id
      )

      availablePixels.value = response.pixels
      selectedPixelId.value = response.selectedPixelId || ''
      selectedPixelName.value = response.selectedPixelName || ''
      pixelAccessTokenSet.value = response.pixelAccessTokenSet
      pixelAccessToken.value = ''
      fetchError.value = response.fetchError || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar configuração de pixels'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const openDrawer = async (targetIntegrationId: string): Promise<void> => {
    isDrawerOpen.value = true
    await loadByIntegrationId(targetIntegrationId)
  }

  const closeDrawer = (): void => {
    isDrawerOpen.value = false
  }

  const reload = async (): Promise<void> => {
    if (!integrationId.value) {
      throw new Error('Integration ID não encontrado')
    }
    await loadByIntegrationId(integrationId.value)
  }

  const selectPixel = (pixelId: string): void => {
    selectedPixelId.value = pixelId
    const pixel = availablePixels.value.find(p => p.id === pixelId)
    selectedPixelName.value = pixel?.name || ''
  }

  const saveSelection = async (): Promise<void> => {
    if (!integrationId.value) {
      throw new Error('Integration ID não encontrado')
    }

    if (!accountId.value) {
      throw new Error('Conta Meta Ads não encontrada')
    }

    if (!selectedPixelId.value) {
      throw new Error('Selecione um pixel')
    }

    isSaving.value = true
    error.value = null

    try {
      await integrationsService.saveMetaPixelConfig(
        integrationId.value,
        accountId.value,
        selectedPixelId.value,
        selectedPixelName.value,
        pixelAccessToken.value || undefined
      )
      // After save, mark token as set if one was provided
      if (pixelAccessToken.value) {
        pixelAccessTokenSet.value = true
        pixelAccessToken.value = ''
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao salvar configuração de pixel'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  return {
    isDrawerOpen,
    isLoading,
    isSaving,
    error,
    fetchError,
    integrationId,
    accountId,
    availablePixels,
    selectedPixelId,
    selectedPixelName,
    pixelAccessToken,
    pixelAccessTokenSet,
    openDrawer,
    closeDrawer,
    reload,
    selectPixel,
    saveSelection,
  }
}
