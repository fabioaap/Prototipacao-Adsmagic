import { computed, ref } from 'vue'
import { integrationsService } from '@/services/api/integrations'
import type { GoogleConversionAction } from '@/types/models'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function extractSavedIdsFromMetadata(accountMetadata: unknown): string[] {
  if (!isRecord(accountMetadata)) {
    return []
  }

  const googleAdsRaw = accountMetadata.google_ads
  if (!isRecord(googleAdsRaw)) {
    return []
  }

  const selectedRaw = googleAdsRaw.selected_conversion_action_ids
  if (!Array.isArray(selectedRaw)) {
    return []
  }

  return [...new Set(
    selectedRaw
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  )]
}

function normalizeSelectedIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0))]
}

export function useGoogleConversionActions() {
  const isDrawerOpen = ref(false)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const integrationId = ref<string | null>(null)
  const accountId = ref<string>('')
  const conversionActions = ref<GoogleConversionAction[]>([])
  const selectedConversionActionIds = ref<string[]>([])
  const enhancedConversionsForLeadsEnabled = ref<boolean | null>(null)
  const enhancedConversionsForLeadsCheckedAt = ref<string | null>(null)

  const selectedConversionActions = computed(() => {
    const selectedSet = new Set(selectedConversionActionIds.value)
    return conversionActions.value.filter((action) => selectedSet.has(action.id))
  })

  const setSelectedIds = (ids: string[]) => {
    selectedConversionActionIds.value = normalizeSelectedIds(ids)
  }

  const loadByIntegrationId = async (targetIntegrationId: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    integrationId.value = targetIntegrationId
    enhancedConversionsForLeadsEnabled.value = null
    enhancedConversionsForLeadsCheckedAt.value = null

    try {
      const accountsData = await integrationsService.getIntegrationAccounts(targetIntegrationId)
      const activeAccounts = accountsData.accounts.filter(account => account.status === 'active')
      const primaryAccount = activeAccounts.find(account => account.is_primary) || activeAccounts[0]

      if (!primaryAccount) {
        throw new Error('Nenhuma conta ativa encontrada para esta integração do Google Ads')
      }

      accountId.value = primaryAccount.external_account_id
      const savedFromMetadata = extractSavedIdsFromMetadata(primaryAccount.account_metadata)

      const response = await integrationsService.getGoogleConversionActions(
        targetIntegrationId,
        primaryAccount.external_account_id
      )

      conversionActions.value = response.conversionActions
      enhancedConversionsForLeadsEnabled.value =
        typeof response.enhancedConversionsForLeadsEnabled === 'boolean'
          ? response.enhancedConversionsForLeadsEnabled
          : null
      enhancedConversionsForLeadsCheckedAt.value =
        typeof response.enhancedConversionsForLeadsCheckedAt === 'string'
          ? response.enhancedConversionsForLeadsCheckedAt
          : null

      const selectedFromApi = normalizeSelectedIds(response.selectedConversionActionIds || [])
      if (selectedFromApi.length > 0) {
        setSelectedIds(selectedFromApi)
      } else {
        setSelectedIds(savedFromMetadata)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar conversion actions'
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

  const toggleConversionAction = (actionId: string, selected: boolean): void => {
    const current = new Set(selectedConversionActionIds.value)

    if (selected) {
      current.add(actionId)
    } else {
      current.delete(actionId)
    }

    selectedConversionActionIds.value = [...current]
  }

  const saveSelection = async (): Promise<void> => {
    if (!integrationId.value) {
      throw new Error('Integration ID não encontrado')
    }

    if (!accountId.value) {
      throw new Error('Conta Google Ads não encontrada')
    }

    isSaving.value = true
    error.value = null

    try {
      await integrationsService.saveGoogleConversionActions(
        integrationId.value,
        accountId.value,
        selectedConversionActionIds.value,
        selectedConversionActions.value
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao salvar conversion actions'
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
    integrationId,
    accountId,
    conversionActions,
    selectedConversionActionIds,
    selectedConversionActions,
    enhancedConversionsForLeadsEnabled,
    enhancedConversionsForLeadsCheckedAt,
    openDrawer,
    closeDrawer,
    reload,
    toggleConversionAction,
    saveSelection,
    setSelectedIds,
  }
}
