<!--
  Step 3: Configurações das plataformas
  Renderiza configurações dinâmicas baseadas nas plataformas selecionadas
-->

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useProjectWizardStore } from '@/stores/projectWizard'
import { useMetaIntegration } from '@/composables/useMetaIntegration'
import { useGoogleIntegration } from '@/composables/useGoogleIntegration'
import { eventsService } from '@/services/api/events'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()
const route = useRoute()

// ============================================================================
// STORE
// ============================================================================

const wizardStore = useProjectWizardStore()

// ============================================================================
// META INTEGRATION COMPOSABLE
// ============================================================================

// Criar composable - cada instância do componente terá seu próprio estado
const metaIntegration = useMetaIntegration()

// ============================================================================
// GOOGLE INTEGRATION COMPOSABLE
// ============================================================================

const googleIntegration = useGoogleIntegration()

// ============================================================================
// ESTADO LOCAL - Meta Ads
// ============================================================================

// Computed para garantir reatividade correta
// No Vue 3, quando você retorna uma ref de um composable e acessa no template,
// o Vue faz unwrap automático. Mas no computed, precisamos acessar a ref diretamente
// e o Vue detecta a dependência automaticamente.
const hasMetaIntegrationId = computed(() => {
  // metaIntegration.integrationId é uma ref retornada do composable
  // PRECISAMOS acessar .value explicitamente (como fazemos com isConnecting.value e selectedAccountIds.value)
  const id = metaIntegration.integrationId.value
  const hasId = id !== null && id !== undefined && id !== ''
  
  if (import.meta.env.DEV) {
    console.log('[StepPlatformConfig] hasMetaIntegrationId computed:', {
      id,
      hasId,
    })
  }
  
  return hasId
})
const hasMetaAccounts = computed(() => {
  // metaIntegration.availableAccounts é uma ref array retornada do composable
  // PRECISAMOS acessar .value explicitamente para pegar o array
  const accounts = metaIntegration.availableAccounts.value
  const count = accounts.length
  const hasAccs = count > 0
  
  if (import.meta.env.DEV) {
    console.log('[StepPlatformConfig] hasMetaAccounts computed:', {
      accounts,
      count,
      hasAccs,
    })
  }
  
  return hasAccs
})

// Debug: verificar estado inicial (DEPOIS de definir os computeds)
if (import.meta.env.DEV) {
  watch([hasMetaIntegrationId, hasMetaAccounts], ([hasId, hasAccs]) => {
    console.log('[StepPlatformConfig] State changed:', {
      hasIntegrationId: hasId,
      hasAccounts: hasAccs,
      shouldShowAuth: !hasId,
    })
  }, { immediate: true })
}

const metaAdsConnected = computed(() => metaIntegration.selectedAccountIds.value.length > 0 && metaIntegration.selectedPixelId.value !== null)
const metaAdsConnecting = computed(() => metaIntegration.isConnecting.value || metaIntegration.isSelectingAccounts.value)
const metaAdsAccount = ref('')
const metaAdsPixel = ref('')

const metaAccountOptions = computed(() => {
  const options = [{ value: '', label: t('projectWizard.step4.meta.selectAccount') }]

  if (metaIntegration.availableAccounts.value.length > 0) {
    metaIntegration.availableAccounts.value.forEach(account => {
      options.push({
        value: account.accountId,
        label: `${account.name} (${account.accountId})`,
      })
    })
  }

  return options
})

const metaPixelOptions = computed(() => {
  const options = [{ value: '', label: t('projectWizard.step4.meta.selectPixel') }]

  if (metaIntegration.availablePixels.value.length > 0) {
    metaIntegration.availablePixels.value.forEach(pixel => {
      options.push({
        value: pixel.id,
        label: pixel.name,
      })
    })
  }

  return options
})

// Flag para prevenir execuções simultâneas do watch ao carregar pixels
const isLoadingPixels = ref(false)

// Flag para controlar se já carregou integração do banco
const hasLoadedFromBackend = ref(false)

// ============================================================================
// ESTADO LOCAL - Google Ads
// ============================================================================

// Estado gerenciado pelo composable googleIntegration
const googleAdsAccount = ref('')

const googleAccountOptions = computed(() => {
  const options = [{ value: '', label: t('projectWizard.step4.google.selectAccount') }]

  if (googleIntegration.availableAccounts.value.length > 0) {
    googleIntegration.availableAccounts.value.forEach(account => {
      options.push({
        value: account.accountId,
        label: account.name,
      })
    })
  }

  return options
})

// Eventos offline
const events = ref<Array<{
  id: string
  name: string
  defaultValue: number
  allowMultiplePurchases: boolean
}>>([])

const newEventName = ref('')
const newEventValue = ref(0)
const newEventMultiple = ref(false)
const isCreatingEvent = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

const showMetaAdsConfig = computed(() => wizardStore.projectData.platforms.metaAds)
const showGoogleAdsConfig = computed(() => wizardStore.projectData.platforms.googleAds)

// Computed para gerenciar estado de conexão Google
const hasGoogleIntegrationId = computed(() => {
  const id = googleIntegration.integrationId.value
  return id !== null && id !== undefined && id !== ''
})

const hasGoogleAccounts = computed(() => googleIntegration.availableAccounts.value.length > 0)
const googleAdsConnecting = computed(() => googleIntegration.isConnecting.value)
const googleAdsConnected = computed(() => hasGoogleIntegrationId.value && googleAdsAccount.value !== '')

const canCreateEvent = computed(() => {
  return newEventName.value.trim() !== '' && newEventValue.value > 0
})

// ============================================================================
// MÉTODOS - Meta Ads
// ============================================================================

const connectMetaAds = async () => {
  // Limpar erros anteriores
  wizardStore.clearError()
  metaIntegration.error.value = null
  
  try {
    // IMPORTANTE: Se o projeto ainda não foi salvo, salvar primeiro
    // O Meta OAuth requer um projectId para associar a integração
    if (!wizardStore.currentProjectId) {
      console.log('[StepPlatformConfig] Projeto ainda não salvo, salvando antes de conectar Meta Ads...')
      try {
        await wizardStore.saveToBackend()
        console.log('[StepPlatformConfig] Projeto salvo com sucesso, projectId:', wizardStore.currentProjectId)
      } catch (saveError) {
        console.error('[StepPlatformConfig] Erro ao salvar projeto antes de conectar Meta Ads:', saveError)
        const errorMessage = saveError instanceof Error 
          ? saveError.message 
          : 'Erro ao salvar projeto. Tente novamente.'
        wizardStore.setError(errorMessage)
        return
      }
    }

    await metaIntegration.startOAuth()
    // Se chegou aqui, OAuth foi bem-sucedido (não há erro)
    // O estado será atualizado automaticamente pelo composable
    console.log('[StepPlatformConfig] Meta OAuth concluído com sucesso')
  } catch (error) {
    console.error('[StepPlatformConfig] Erro ao conectar Meta Ads:', error)
    
    // Usar erro do composable se disponível, senão usar erro capturado
    const errorMessage = metaIntegration.error.value ||
                        (error instanceof Error ? error.message : t('projectWizard.step4.meta.connectionError'))
    
    // Definir erro tanto no composable quanto no store
    metaIntegration.error.value = errorMessage
    wizardStore.setError(errorMessage)
  }
}

const selectMetaAccounts = async () => {
  if (metaAdsAccount.value && metaAdsPixel.value) {
    try {
      // Salvar seleção no backend
      // Pixels não são carregados automaticamente - usuário pode criar novo ou carregar manualmente
      await metaIntegration.finalizeSelection(
        [metaAdsAccount.value],
        metaAdsPixel.value
      )

      // Atualizar store do wizard
      wizardStore.updateProjectData({
        metaAds: {
          connected: true,
          accountId: metaAdsAccount.value,
          pixelId: metaAdsPixel.value,
        },
      })
    } catch (error) {
      console.error('Erro ao selecionar contas:', error)
      wizardStore.setError(metaIntegration.error.value || 'Erro ao salvar seleção')
      throw error // Re-throw para impedir avanço se houver erro
    }
  }
}

/**
 * Verifica se há integração Meta pendente de salvamento
 */
const hasPendingMetaIntegration = computed(() => {
  // Se já carregou do banco, não há pendência (já está salvo)
  if (hasLoadedFromBackend.value) {
    return false
  }
  
  // Tem integrationId e tem conta/pixel selecionados mas ainda não salvos
  const hasSelection = metaAdsAccount.value && metaAdsPixel.value
  const isAlreadySaved = hasSelection && metaIntegration.selectedAccountIds.value.includes(metaAdsAccount.value)
  
  return (
    hasMetaIntegrationId.value &&
    hasSelection &&
    !isAlreadySaved
  )
})

/**
 * Salva automaticamente a integração Meta antes de avançar
 */
const ensureMetaIntegrationSaved = async (): Promise<void> => {
  if (hasPendingMetaIntegration.value) {
    console.log('[StepPlatformConfig] Salvando integração Meta automaticamente antes de avançar...', {
      account: metaAdsAccount.value,
      pixel: metaAdsPixel.value,
      integrationId: metaIntegration.integrationId.value
    })
    await selectMetaAccounts()
    console.log('[StepPlatformConfig] Integração Meta salva com sucesso!')
  } else {
    // Mesmo se não precisa salvar, garantir que store está atualizada
    // Isso garante que a validação do step 4 passe
    if (metaAdsAccount.value && metaAdsPixel.value && hasMetaIntegrationId.value) {
      wizardStore.updateProjectData({
        metaAds: {
          connected: true,
          accountId: metaAdsAccount.value,
          pixelId: metaAdsPixel.value,
        },
      })
      console.log('[StepPlatformConfig] Store atualizada para garantir validação (sem necessidade de salvar)')
    }
  }
}

/**
 * Método chamado pelo wizard antes de avançar
 */
const handleContinue = async (): Promise<void> => {
  console.log('[StepPlatformConfig] handleContinue chamado - Estado atual:', {
    hasIntegrationId: hasMetaIntegrationId.value,
    hasAccount: !!metaAdsAccount.value,
    hasPixel: !!metaAdsPixel.value,
    hasPendingMetaIntegration: hasPendingMetaIntegration.value,
    hasLoadedFromBackend: hasLoadedFromBackend.value,
    storeConnected: wizardStore.projectData.metaAds?.connected,
    platformsMetaAds: wizardStore.projectData.platforms.metaAds,
  })
  
  // Salvar integração Meta automaticamente se houver seleção pendente
  try {
    await ensureMetaIntegrationSaved()
    
    // Verificar estado após salvamento
    console.log('[StepPlatformConfig] Após ensureMetaIntegrationSaved:', {
      storeConnected: wizardStore.projectData.metaAds?.connected,
      canProceed: wizardStore.canProceed,
    })
  } catch (error) {
    console.error('[StepPlatformConfig] Erro ao salvar integração Meta antes de avançar:', error)
    wizardStore.setError('Não foi possível salvar a integração Meta. Tente novamente.')
    throw error // Re-throw para impedir avanço
  }
}

/**
 * Método chamado pelo wizard antes de finalizar
 */
const handleComplete = async (): Promise<void> => {
  // Salvar integração Meta automaticamente se houver seleção pendente
  try {
    await ensureMetaIntegrationSaved()
  } catch (error) {
    console.error('[StepPlatformConfig] Erro ao salvar integração Meta antes de finalizar:', error)
    wizardStore.setError('Não foi possível salvar a integração Meta. Tente novamente.')
    throw error // Re-throw para impedir finalização
  }
}

// Expor métodos para o wizard
defineExpose({
  handleContinue,
  handleComplete,
})

// ============================================================================
// MÉTODOS - Google Ads
// ============================================================================

const connectGoogleAds = async () => {
  // Limpar erros anteriores
  wizardStore.clearError()
  googleIntegration.error.value = null

  try {
    await googleIntegration.startOAuth()
    // OAuth bem-sucedido, estado atualizado automaticamente
    console.log('[StepPlatformConfig] Google OAuth concluído com sucesso')
  } catch (error) {
    console.error('[StepPlatformConfig] Erro ao conectar Google Ads:', error)

    const errorMessage = googleIntegration.error.value ||
                        (error instanceof Error ? error.message : t('projectWizard.step4.google.connectionError'))

    googleIntegration.error.value = errorMessage
    wizardStore.setError(errorMessage)
  }
}

const createEvent = async () => {
  if (!canCreateEvent.value) return

  isCreatingEvent.value = true

  try {
    const createdEvent = await eventsService.create({
      name: newEventName.value,
      platform: 'google',
      type: 'conversion',
      defaultValue: newEventValue.value,
      allowMultiplePurchases: newEventMultiple.value,
    })

    const newEvent = {
      id: createdEvent.id,
      name: newEventName.value,
      defaultValue: newEventValue.value,
      allowMultiplePurchases: newEventMultiple.value,
    }

    events.value.push(newEvent)

    // Atualiza store
    wizardStore.updateProjectData({
      googleAds: {
        ...wizardStore.projectData.googleAds,
        connected: googleAdsConnected.value,
        accountId: googleAdsAccount.value,
        events: events.value,
      },
    })

    // Limpa form
    newEventName.value = ''
    newEventValue.value = 0
    newEventMultiple.value = false
  } catch (error) {
    console.error('Erro ao criar evento:', error)
  } finally {
    isCreatingEvent.value = false
  }
}


// ============================================================================
// WATCHERS
// ============================================================================

// Watch para carregar pixels automaticamente quando conta for selecionada
watch(metaAdsAccount, async (newAccountId, oldAccountId) => {
  if (import.meta.env.DEV) {
    console.log('[StepPlatformConfig] Watch metaAdsAccount disparado:', {
      newAccountId,
      oldAccountId,
      hasIntegrationId: !!metaIntegration.integrationId.value,
      isLoadingPixels: isLoadingPixels.value
    })
  }
  
  if (!newAccountId) {
    // Limpar pixels quando conta for desmarcada
    metaIntegration.availablePixels.value = []
    metaAdsPixel.value = ''
    return
  }

  // Carregar pixels automaticamente quando conta for selecionada
  if (newAccountId && metaIntegration.integrationId.value) {
    // Prevenir execuções simultâneas (race condition protection)
    if (isLoadingPixels.value) {
      if (import.meta.env.DEV) {
        console.log('[StepPlatformConfig] Watch ignorado - pixels já estão sendo carregados')
      }
      return
    }

    isLoadingPixels.value = true
    try {
      await metaIntegration.loadPixels(newAccountId)
    } catch (error) {
      console.error('[StepPlatformConfig] Erro ao carregar pixels:', error)
      // Não bloquear o fluxo - usuário pode criar novo pixel ou tentar novamente
      wizardStore.setError('Erro ao carregar pixels. Você pode criar um novo pixel ou tentar novamente.')
    } finally {
      isLoadingPixels.value = false
    }
  }
})

// Observa mudanças na store e atualiza campos locais (apenas se não carregou do banco)
watch(
  () => wizardStore.projectData.metaAds,
  (newMetaAds) => {
    // Não sobrescrever se já carregou dados do banco (backend é fonte da verdade)
    if (hasLoadedFromBackend.value) {
      return
    }
    
    if (newMetaAds) {
      if (newMetaAds.accountId && metaAdsAccount.value !== newMetaAds.accountId) {
        metaAdsAccount.value = newMetaAds.accountId
      }
      if (newMetaAds.pixelId && metaAdsPixel.value !== newMetaAds.pixelId) {
        metaAdsPixel.value = newMetaAds.pixelId
      }
    }
  },
  { immediate: false, deep: true } // immediate: false para não executar antes do onMounted
)

watch(
  () => wizardStore.projectData.googleAds,
  (newGoogleAds) => {
    if (newGoogleAds) {
      if (newGoogleAds.accountId && googleAdsAccount.value !== newGoogleAds.accountId) {
        googleAdsAccount.value = newGoogleAds.accountId
      }
      if (newGoogleAds.events && JSON.stringify(events.value) !== JSON.stringify(newGoogleAds.events)) {
        events.value = newGoogleAds.events || []
      }
    }
  },
  { immediate: true, deep: true }
)

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(async () => {
  // SEMPRE resetar o composable primeiro para garantir estado limpo
  metaIntegration.reset()
  hasLoadedFromBackend.value = false
  
  console.log('[StepPlatformConfig] onMounted - Estado inicial após reset:', {
    hasIntegrationId: hasMetaIntegrationId.value,
    hasAccounts: hasMetaAccounts.value,
    hasPixels: metaIntegration.availablePixels.value.length,
    selectedAccountIds: metaIntegration.selectedAccountIds.value.length,
    selectedPixelId: metaIntegration.selectedPixelId,
    metaAdsConnected: metaAdsConnected.value,
  })
  
  // ✅ Carregar integração existente do banco de dados PRIMEIRO
  try {
    const projectId = route.query.projectId as string || localStorage.getItem('current_project_id')
    
    if (projectId) {
      console.log('[StepPlatformConfig] Carregando integração existente para projeto:', projectId)
      await metaIntegration.loadExistingIntegration(projectId)
      hasLoadedFromBackend.value = true
      
      // Popular campos locais com dados carregados do banco
      if (metaIntegration.selectedAccountIds.value.length > 0) {
        const firstAccountId = metaIntegration.selectedAccountIds.value[0]
        if (firstAccountId && metaAdsAccount.value !== firstAccountId) {
          metaAdsAccount.value = firstAccountId
        }
      }
      
      if (metaIntegration.selectedPixelId.value) {
        const pixelId = metaIntegration.selectedPixelId.value
        if (pixelId && metaAdsPixel.value !== pixelId) {
          metaAdsPixel.value = pixelId
        }
      }
      
      // Carregar pixels da conta selecionada se houver
      if (metaAdsAccount.value && metaIntegration.integrationId.value) {
        try {
          await metaIntegration.loadPixels(metaAdsAccount.value)
        } catch (error) {
          console.warn('[StepPlatformConfig] Erro ao carregar pixels da conta carregada:', error)
          // Não bloquear - pixels podem ser carregados depois
        }
      }
      
      // ✅ Atualizar store do wizard para marcar Meta Ads como conectado
      // Isso é necessário para passar na validação do step 4
      if (metaAdsAccount.value && metaAdsPixel.value) {
        wizardStore.updateProjectData({
          platforms: {
            ...wizardStore.projectData.platforms,
            metaAds: true, // Garantir que plataforma está marcada como selecionada
          },
          metaAds: {
            connected: true,
            accountId: metaAdsAccount.value,
            pixelId: metaAdsPixel.value,
          },
        })
        console.log('[StepPlatformConfig] ✅ Store atualizada com Meta Ads conectado:', {
          platformsMetaAds: wizardStore.projectData.platforms.metaAds,
          metaAdsConnected: wizardStore.projectData.metaAds?.connected,
          canProceed: wizardStore.canProceed,
        })
      }
      
      console.log('[StepPlatformConfig] ✅ Integração carregada do banco:', {
        hasIntegrationId: hasMetaIntegrationId.value,
        hasAccounts: hasMetaAccounts.value,
        accountId: metaAdsAccount.value,
        pixelId: metaAdsPixel.value,
        storeConnected: wizardStore.projectData.metaAds?.connected,
      })
    }
  } catch (error) {
    console.error('[StepPlatformConfig] Erro ao carregar integração existente:', error)
    // Não bloquear fluxo - continuar normalmente
    hasLoadedFromBackend.value = true // Marcar como tentado para usar fallback
  }
  
  // Só usar dados do wizardStore como fallback se NÃO carregou do banco
  if (!hasLoadedFromBackend.value) {
    const savedMeta = wizardStore.projectData.metaAds
    console.log('[StepPlatformConfig] Usando dados do wizardStore como fallback:', savedMeta)
    
    if (savedMeta && savedMeta.connected) {
      // Se já está conectado no store mas não no composable, usar dados do store
      if (!metaAdsAccount.value && savedMeta.accountId) {
        metaAdsAccount.value = savedMeta.accountId
      }
      if (!metaAdsPixel.value && savedMeta.pixelId) {
        metaAdsPixel.value = savedMeta.pixelId
      }
      console.log('[StepPlatformConfig] Meta já conectado no store, usando dados salvos como fallback')
    }
  }

  const savedGoogle = wizardStore.projectData.googleAds
  if (savedGoogle) {
    googleAdsAccount.value = savedGoogle.accountId || ''
    events.value = savedGoogle.events || []
  }
  
  // Verificação final
  console.log('[StepPlatformConfig] Estado final:', {
    hasIntegrationId: hasMetaIntegrationId.value,
    hasAccounts: hasMetaAccounts.value,
    hasLoadedFromBackend: hasLoadedFromBackend.value,
    shouldShowAuthButton: !hasMetaIntegrationId.value,
    accountId: metaAdsAccount.value,
    pixelId: metaAdsPixel.value,
  })
})
</script>

<template>
  <div class="step-platform-config">
    <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Cabeçalho do step -->
      <div class="text-center mb-4">
        <h2 class="text-xl sm:text-2xl font-bold">
          {{ t('projectWizard.step4.title') }}
        </h2>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ t('projectWizard.step4.description') }}
        </p>
      </div>

      <div class="space-y-8">
        <!-- ===== META ADS ===== -->
        <div v-if="showMetaAdsConfig" class="border border-border rounded-lg p-6">
          <div class="flex items-center space-x-3 mb-6">
            <span class="text-3xl">📱</span>
            <h3 class="text-xl font-semibold">
              {{ t('projectWizard.step4.meta.title') }}
            </h3>
          </div>

          <!-- Autenticação - Mostra apenas se NÃO tem integrationId válido -->
          <div v-if="!hasMetaIntegrationId" class="space-y-4">
            <p class="text-sm text-muted-foreground">
              {{ t('projectWizard.step4.meta.connectDescription') }}
            </p>
            <Button
              @click="connectMetaAds"
              :disabled="metaAdsConnecting"
              class="w-full sm:w-auto"
            >
              {{ metaAdsConnecting ? t('projectWizard.step4.connecting') : t('projectWizard.step4.meta.connectButton') }}
            </Button>
            <p v-if="metaIntegration.error" class="text-sm text-destructive">
              {{ metaIntegration.error }}
            </p>
          </div>

          <!-- Seleção de contas e pixels após OAuth - Mostra apenas se TEM integrationId E TEM contas -->
          <div v-else-if="hasMetaIntegrationId && hasMetaAccounts" class="space-y-4">
            <div class="flex items-center space-x-2 text-sm text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Autenticação concluída. Selecione as contas e o pixel:</span>
            </div>

            <!-- Selecionar conta -->
            <div class="space-y-2">
              <label class="block text-sm font-medium">
                {{ t('projectWizard.step4.meta.accountLabel') }}
              </label>
              <Select
                v-model="metaAdsAccount"
                :options="metaAccountOptions"
                class="w-full"
              />
            </div>

            <!-- Selecionar pixel -->
            <div class="space-y-2">
              <label class="block text-sm font-medium">
                {{ t('projectWizard.step4.meta.pixelLabel') }}
              </label>

              <div v-if="metaAdsAccount" class="space-y-2">
                <!-- Mostrar loading enquanto carrega pixels -->
                <div v-if="isLoadingPixels" class="flex items-center space-x-2 text-sm text-muted-foreground">
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ t('projectWizard.step4.loadingPixels') }}</span>
                </div>

                <!-- Mostrar pixels quando carregados -->
                <Select
                  v-else-if="metaIntegration.availablePixels.value.length > 0"
                  v-model="metaAdsPixel"
                  :options="metaPixelOptions"
                  class="w-full"
                />

                <!-- Mensagem quando não há pixels disponíveis -->
                <p v-else class="text-sm text-muted-foreground">
                  {{ t('projectWizard.step4.meta.noPixelsFound') }}
                </p>
              </div>

              <p v-else class="text-sm text-muted-foreground">
                {{ t('projectWizard.step4.meta.selectAccountFirst') }}
              </p>

              <p class="text-xs text-muted-foreground">
                {{ t('projectWizard.step4.meta.pixelHint') }}
              </p>
            </div>

            <!-- Botão para finalizar seleção -->
            <Button
              @click="selectMetaAccounts"
              :disabled="!metaAdsAccount || !metaAdsPixel || metaIntegration.isSelectingAccounts.value"
              class="w-full sm:w-auto"
            >
              {{ metaIntegration.isSelectingAccounts.value ? t('projectWizard.step4.savingSelection') : t('projectWizard.step4.saveSelection') }}
            </Button>
          </div>

          <!-- Configuração após conectar -->
          <div v-else class="space-y-4">
            <div class="flex items-center space-x-2 text-sm text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ t('projectWizard.step4.meta.connected') }}</span>
            </div>

            <div class="text-sm text-muted-foreground">
              <p>Conta: {{ metaAdsAccount }}</p>
              <p>Pixel: {{ metaAdsPixel }}</p>
            </div>
          </div>
        </div>

        <!-- ===== GOOGLE ADS ===== -->
        <div v-if="showGoogleAdsConfig" class="border border-border rounded-lg p-6">
          <div class="flex items-center space-x-3 mb-6">
            <span class="text-3xl">🔍</span>
            <h3 class="text-xl font-semibold">
              {{ t('projectWizard.step4.google.title') }}
            </h3>
          </div>

          <!-- Autenticação -->
          <div v-if="!hasGoogleIntegrationId" class="space-y-4">
            <p class="text-sm text-muted-foreground">
              {{ t('projectWizard.step4.google.connectDescription') }}
            </p>
            <Button
              @click="connectGoogleAds"
              :disabled="googleAdsConnecting"
              class="w-full sm:w-auto"
            >
              {{ googleAdsConnecting ? t('projectWizard.step4.connecting') : t('projectWizard.step4.google.connectButton') }}
            </Button>
            <p v-if="googleIntegration.error.value" class="text-sm text-destructive">
              {{ googleIntegration.error.value }}
            </p>
          </div>

          <!-- Configuração após conectar -->
          <div v-else-if="hasGoogleIntegrationId && hasGoogleAccounts" class="space-y-6">
            <div class="flex items-center space-x-2 text-sm text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ t('projectWizard.step4.google.connected') }}</span>
            </div>

            <!-- Selecionar conta -->
            <div class="space-y-2">
              <label class="block text-sm font-medium">
                {{ t('projectWizard.step4.google.accountLabel') }}
              </label>
              <Select
                v-model="googleAdsAccount"
                :options="googleAccountOptions"
                class="w-full"
              />
            </div>

            <!-- Criar evento offline -->
            <div class="space-y-4 border-t border-border pt-6">
              <h4 class="font-medium">
                {{ t('projectWizard.step4.google.createEvent') }}
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium">
                    {{ t('projectWizard.step4.google.eventName') }}
                  </label>
                  <Input
                    v-model="newEventName"
                    :placeholder="t('projectWizard.step4.google.eventNamePlaceholder')"
                  />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium">
                    {{ t('projectWizard.step4.google.eventValue') }}
                  </label>
                  <Input
                    v-model.number="newEventValue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <input
                  id="event-multiple"
                  v-model="newEventMultiple"
                  type="checkbox"
                  class="rounded"
                />
                <label for="event-multiple" class="text-sm">
                  {{ t('projectWizard.step4.google.allowMultiple') }}
                </label>
              </div>

              <Button
                @click="createEvent"
                :disabled="!canCreateEvent || isCreatingEvent"
                size="sm"
              >
                {{ isCreatingEvent ? t('projectWizard.step4.creating') : t('projectWizard.step4.google.createEventButton') }}
              </Button>

              <!-- Lista de eventos criados -->
              <div v-if="events.length > 0" class="mt-4 space-y-2">
                <p class="text-sm font-medium">{{ t('projectWizard.step4.google.createdEvents') }}</p>
                <div class="space-y-2">
                  <div
                    v-for="event in events"
                    :key="event.id"
                    class="p-3 bg-muted/50 rounded border border-border text-sm"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-medium">{{ event.name }}</span>
                      <span class="text-muted-foreground">R$ {{ event.defaultValue.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-platform-config {
  min-height: 400px;
}
</style>
