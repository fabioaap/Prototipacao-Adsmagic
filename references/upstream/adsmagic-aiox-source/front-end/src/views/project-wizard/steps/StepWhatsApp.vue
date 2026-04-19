<!--
  Step 4: Conexão com WhatsApp - Multi-Broker
  Suporta múltiplos brokers: uazapi (QR Code), Gupshup (Credenciais), API Oficial (OAuth/Credenciais)
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/components/ui/toast/use-toast'
import { useProjectWizardStore } from '@/stores/projectWizard'
import { whatsappIntegrationService } from '@/services/api/whatsappIntegrationService'
import { whatsappAdapter } from '@/services/adapters/whatsappAdapter'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { HelpCircle, Shield, ArrowLeft, RefreshCw, ExternalLink, Eye, EyeOff, Check, AlertCircle, WifiOff } from 'lucide-vue-next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  type WhatsAppBroker,
  type WhatsAppStepState,
  type WhatsAppIntegrationError,
  type BrokerCredentials,
  brokerRequiresCredentials,
} from '@/types/whatsapp'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()
const { error: toastError } = useToast()

// ============================================================================
// STORE
// ============================================================================

const wizardStore = useProjectWizardStore()

// ============================================================================
// CONSTANTES
// ============================================================================

/** Intervalo de polling em ms */
const POLLING_INTERVAL = 3000

/** Número máximo de tentativas de polling (2 minutos) */
const MAX_POLLING_ATTEMPTS = 40

/** Tempo para exibir aviso de timeout (30s antes do fim) */
const TIMEOUT_WARNING_THRESHOLD = 30

// ============================================================================
// ESTADO - SELEÇÃO DE BROKER
// ============================================================================

const availableBrokers = ref<WhatsAppBroker[]>([])
const selectedBrokerId = ref<string | null>(null)
const selectedBroker = ref<WhatsAppBroker | null>(null)
const isLoadingBrokers = ref(false)

// ============================================================================
// ESTADO - CONFIGURAÇÃO (CREDENCIAIS)
// ============================================================================

const credentials = ref<BrokerCredentials>({})
const credentialErrors = ref<Record<string, string>>({})
const showPasswords = ref<Record<string, boolean>>({})

// ============================================================================
// ESTADO - CONEXÃO
// ============================================================================

const stepState = ref<WhatsAppStepState>('loading_brokers')
const qrCode = ref('')
const pairCode = ref('')
const isConnected = ref(false)
const phoneNumber = ref('')
const profileName = ref('')
const accountId = ref<string | null>(null)

// ============================================================================
// ESTADO - ERROS E POLLING
// ============================================================================

const error = ref<WhatsAppIntegrationError | null>(null)
const pollingAttempts = ref(0)
let pollingInterval: ReturnType<typeof setInterval> | null = null

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Determina se o broker requer credenciais
 */
const requiresCredentials = computed(() => {
  if (!selectedBroker.value) return false
  const brokerType = selectedBroker.value.name.toLowerCase()
  return brokerRequiresCredentials(brokerType as any)
})

/**
 * Texto do status atual
 */
const statusText = computed(() => {
  switch (stepState.value) {
    case 'loading_brokers':
      return t('projectWizard.step6.loadingBrokers')
    case 'selecting_broker':
      return t('projectWizard.step6.selectMethod')
    case 'configuring':
      return t('projectWizard.step6.fillCredentials')
    case 'validating_credentials':
      return t('projectWizard.step6.validatingCredentials')
    case 'creating_instance':
      return t('projectWizard.step6.preparingConnection')
    case 'connecting':
      return t('projectWizard.step6.generatingCode')
    case 'waiting_qr':
      return t('projectWizard.step6.statusWaiting')
    case 'waiting_oauth':
      return t('projectWizard.step6.waitingAuth')
    case 'testing_connection':
      return t('projectWizard.step6.testingConnection')
    case 'connected':
      return t('projectWizard.step6.statusConnected')
    case 'error':
      return t('projectWizard.step6.statusError')
    default:
      return ''
  }
})

/**
 * Cor do status
 */
const statusColor = computed(() => {
  switch (stepState.value) {
    case 'connected':
      return 'text-green-600'
    case 'error':
      return 'text-destructive'
    case 'waiting_qr':
    case 'waiting_oauth':
    case 'validating_credentials':
    case 'testing_connection':
    case 'connecting':
      return 'text-yellow-600'
    default:
      return 'text-muted-foreground'
  }
})

/**
 * Tempo restante em segundos para o QR Code expirar
 */
const timeRemaining = computed(() => {
  const remaining = Math.max(0, MAX_POLLING_ATTEMPTS - pollingAttempts.value) * (POLLING_INTERVAL / 1000)
  return Math.round(remaining)
})

/**
 * Mostra aviso de timeout quando estiver próximo
 */
const showTimeoutWarning = computed(() => {
  return stepState.value === 'waiting_qr' && timeRemaining.value <= TIMEOUT_WARNING_THRESHOLD
})

/**
 * Verifica se o formulário de credenciais é válido
 */
const isCredentialsFormValid = computed(() => {
  if (!selectedBroker.value?.requiredFields) return true
  
  return selectedBroker.value.requiredFields.every(field => {
    if (!field.required) return true
    const value = credentials.value[field.name]
    return value && value.trim() !== ''
  })
})

// ============================================================================
// MÉTODOS - SELEÇÃO DE BROKER
// ============================================================================

/**
 * Carrega lista de brokers disponíveis
 */
async function loadAvailableBrokers() {
  isLoadingBrokers.value = true
  stepState.value = 'loading_brokers'
  error.value = null

  try {
    const result = await whatsappIntegrationService.listAvailableBrokers()

    if (result.success) {
      availableBrokers.value = result.data
      stepState.value = 'selecting_broker'
      console.log('[StepWhatsApp] Brokers carregados:', result.data.length)
    } else {
      handleError(result.error)
    }
  } catch (err) {
    console.error('[StepWhatsApp] Erro ao carregar brokers:', err)
    handleError({
      code: 'UNKNOWN_ERROR',
      message: 'Erro ao carregar opções de conexão. Tente novamente.',
      recoverable: true,
    })
  } finally {
    isLoadingBrokers.value = false
  }
}

/**
 * Seleciona um broker
 */
async function selectBroker(broker: WhatsAppBroker) {
  selectedBrokerId.value = broker.id
  selectedBroker.value = broker
  error.value = null

  console.log('[StepWhatsApp] Broker selecionado:', broker.name)

  // Verificar se já existe uma instância para este projeto e broker
  const savedWhatsApp = wizardStore.projectData.whatsapp
  const existingAccountId = savedWhatsApp?.accountId

  // Se já existe accountId e é do mesmo broker, tentar carregar a conta existente
  if (existingAccountId && savedWhatsApp?.brokerType === broker.name.toLowerCase()) {
    console.log('[StepWhatsApp] Verificando instância existente...', { accountId: existingAccountId })
    
    const existingAccountResult = await whatsappIntegrationService.getExistingAccount(existingAccountId)
    
    if (existingAccountResult.success && existingAccountResult.data) {
      const account = existingAccountResult.data
      console.log('[StepWhatsApp] Instância existente encontrada:', {
        accountId: account.accountId,
        status: account.status,
        phoneNumber: account.phoneNumber,
      })

      // Se já está conectada, mostrar estado conectado
      if (account.status === 'connected') {
        handleConnectionSuccess({
          phone: account.phoneNumber,
          profileName: account.profileName,
          accountId: account.accountId,
        })
        return
      }

      // Se não está conectada mas tem accountId, tentar conectar
      if (account.accountId) {
        accountId.value = account.accountId
        // Salvar dados no store
        wizardStore.updateProjectData({
          whatsapp: {
            connected: false,
            selectedBrokerId: broker.id,
            brokerType: broker.name as any,
            accountId: account.accountId,
            instanceId: savedWhatsApp.instanceId,
          } as any,
        })
        // Tentar conectar para obter QR Code
        await connectInstance()
        return
      }
    }
  }

  // Salvar seleção no store
  wizardStore.updateProjectData({
    whatsapp: {
      connected: false,
      selectedBrokerId: broker.id,
      brokerType: broker.name as any,
    } as any,
  })

  // Determinar próximo passo baseado no tipo de broker
  const method = whatsappAdapter.getConnectionMethod(broker)

  if (method === 'credentials') {
    // Brokers com credenciais: mostrar formulário
    stepState.value = 'configuring'
    credentials.value = {}
    credentialErrors.value = {}
  } else if (method === 'qr_code' || method === 'pair_code') {
    // uazapi: criar instância automaticamente (apenas se não existir)
    await createInstance()
  } else if (method === 'oauth') {
    // API Oficial com OAuth
    stepState.value = 'waiting_oauth'
    // TODO: Implementar fluxo OAuth
  }
}

/**
 * Volta para seleção de broker
 */
function goBackToSelection() {
  stopPolling()
  selectedBrokerId.value = null
  selectedBroker.value = null
  stepState.value = 'selecting_broker'
  error.value = null
  qrCode.value = ''
  pairCode.value = ''
  credentials.value = {}
  credentialErrors.value = {}
  pollingAttempts.value = 0
}

// ============================================================================
// MÉTODOS - CONFIGURAÇÃO (CREDENCIAIS)
// ============================================================================

/**
 * Toggle visibilidade de campo password
 */
function togglePasswordVisibility(fieldName: string) {
  showPasswords.value[fieldName] = !showPasswords.value[fieldName]
}

/**
 * Valida e envia credenciais
 */
async function validateAndConfigure() {
  if (!selectedBroker.value || !wizardStore.currentProjectId) return

  // Limpar erros anteriores
  credentialErrors.value = {}

  // Validar campos obrigatórios
  if (selectedBroker.value.requiredFields) {
    for (const field of selectedBroker.value.requiredFields) {
      if (field.required && (!credentials.value[field.name] || credentials.value[field.name]?.trim() === '')) {
        credentialErrors.value[field.name] = `${field.label} é obrigatório`
      }
    }
  }

  if (Object.keys(credentialErrors.value).length > 0) {
    return
  }

  stepState.value = 'validating_credentials'
  error.value = null

  try {
    const result = await whatsappIntegrationService.configureBroker({
      projectId: wizardStore.currentProjectId,
      brokerId: selectedBroker.value.id,
      credentials: credentials.value,
    })

    if (result.success) {
      if (result.data.valid) {
        console.log('[StepWhatsApp] Credenciais válidas:', result.data.accountInfo)
        // Credenciais válidas - salvar conta diretamente
        await saveConnectedAccountForCredentials(result.data.accountInfo)
      } else {
        // Credenciais inválidas
        stepState.value = 'configuring'
        error.value = {
          code: 'INVALID_CREDENTIALS',
          message: result.data.message || 'Credenciais inválidas. Verifique os dados informados.',
          recoverable: true,
        }
      }
    } else {
      stepState.value = 'configuring'
      handleError(result.error)
    }
  } catch (err) {
    console.error('[StepWhatsApp] Erro ao validar credenciais:', err)
    stepState.value = 'configuring'
    handleError({
      code: 'UNKNOWN_ERROR',
      message: 'Erro ao validar credenciais. Tente novamente.',
      recoverable: true,
    })
  }
}

/**
 * Salva conta para brokers com credenciais (Gupshup, API Oficial)
 */
async function saveConnectedAccountForCredentials(accountInfo?: { phoneNumber?: string; accountName?: string }) {
  if (!selectedBroker.value || !wizardStore.currentProjectId) return

  stepState.value = 'testing_connection'

  try {
    const result = await whatsappIntegrationService.saveConnectedAccount({
      projectId: wizardStore.currentProjectId,
      brokerType: selectedBroker.value.name.toLowerCase() as any,
      credentials: credentials.value,
      phoneNumber: accountInfo?.phoneNumber || 'N/A',
      profileName: accountInfo?.accountName,
    })

    if (result.success) {
      handleConnectionSuccess({
        phone: result.data.phoneNumber,
        profileName: result.data.profileName,
        accountId: result.data.accountId,
      })
    } else {
      handleError(result.error)
    }
  } catch (err) {
    console.error('[StepWhatsApp] Erro ao salvar conta:', err)
    handleError({
      code: 'UNKNOWN_ERROR',
      message: 'Erro ao salvar conta. Tente novamente.',
      recoverable: true,
    })
  }
}

// ============================================================================
// MÉTODOS - CRIAÇÃO DE INSTÂNCIA (UAZAPI)
// ============================================================================

/**
 * Cria instância no broker (apenas uazapi)
 */
async function createInstance() {
  if (!selectedBroker.value || !wizardStore.currentProjectId) return

  stepState.value = 'creating_instance'
  error.value = null

  try {
    const result = await whatsappIntegrationService.createInstance({
      projectId: wizardStore.currentProjectId,
      brokerId: selectedBroker.value.id,
    })

    if (result.success) {
      accountId.value = result.data.accountId
      
      // Salvar dados no store
      wizardStore.updateProjectData({
        whatsapp: {
          connected: false,
          selectedBrokerId: selectedBroker.value.id,
          brokerType: selectedBroker.value.name as any,
          instanceId: result.data.instance.instanceId,
          accountId: result.data.accountId,
        } as any,
      })

      console.log('[StepWhatsApp] Instância criada:', result.data.instance.instanceId)

      // Conectar para obter QR Code
      await connectInstance()
    } else {
      handleError(result.error)
    }
  } catch (err) {
    console.error('[StepWhatsApp] Erro ao criar instância:', err)
    handleError({
      code: 'INSTANCE_CREATION_FAILED',
      message: 'Erro ao preparar conexão. Tente novamente.',
      recoverable: true,
    })
  }
}

// ============================================================================
// MÉTODOS - CONEXÃO
// ============================================================================

/**
 * Conecta instância e obtém QR Code
 */
async function connectInstance() {
  if (!accountId.value) {
    console.warn('[StepWhatsApp] connectInstance: accountId não definido')
    return
  }

  stepState.value = 'connecting'
  error.value = null

  try {
    console.log('[StepWhatsApp] Conectando instância...', { accountId: accountId.value })
    
    const result = await whatsappIntegrationService.connectInstance({
      accountId: accountId.value,
    })

    if (result.success) {
      console.log('[StepWhatsApp] Resultado da conexão:', {
        success: result.success,
        hasQrCode: !!result.data.qrcode,
        hasPairCode: !!result.data.pairCode,
        connectionMethod: result.data.connectionMethod,
        status: result.data.status,
      })
      // Se já está conectada, tratar como sucesso
      if (result.data.status === 'connected') {
        console.log('[StepWhatsApp] Instância já conectada, verificando status completo...')
        // Verificar status completo para obter phoneNumber e profileName
        const statusResult = await whatsappIntegrationService.checkConnectionStatus(accountId.value)
        if (statusResult.success && statusResult.data.status === 'connected') {
          handleConnectionSuccess({
            phone: statusResult.data.phoneNumber || '',
            profileName: statusResult.data.profileName,
            accountId: accountId.value,
          })
        } else {
          // Se não conseguir obter status completo, ainda assim tratar como conectado
          handleConnectionSuccess({
            phone: '',
            profileName: '',
            accountId: accountId.value,
          })
        }
      } else if (result.data.qrcode) {
        qrCode.value = result.data.qrcode
        stepState.value = 'waiting_qr'
        console.log('[StepWhatsApp] QR Code obtido, iniciando polling...')
        startPolling()
      } else if (result.data.pairCode) {
        pairCode.value = result.data.pairCode
        stepState.value = 'waiting_qr'
        console.log('[StepWhatsApp] Pair Code obtido, iniciando polling...')
        startPolling()
      } else {
        console.warn('[StepWhatsApp] Conexão bem-sucedida mas sem QR Code ou Pair Code. Verificando status...')
        // Se não tem QR Code nem Pair Code, verificar status
        await checkConnectionStatus()
      }
    } else {
      console.error('[StepWhatsApp] Erro ao conectar:', result.error)
      handleError(result.error)
    }
  } catch (err) {
    console.error('[StepWhatsApp] Erro ao conectar:', err)
    handleError({
      code: 'CONNECTION_FAILED',
      message: 'Erro ao gerar código de conexão. Tente novamente.',
      recoverable: true,
    })
  }
}

// ============================================================================
// MÉTODOS - POLLING
// ============================================================================

/**
 * Inicia polling para verificar conexão
 */
function startPolling() {
  stopPolling()
  pollingAttempts.value = 0

  console.log('[StepWhatsApp] Iniciando polling...')

  pollingInterval = setInterval(async () => {
    pollingAttempts.value++

    if (pollingAttempts.value >= MAX_POLLING_ATTEMPTS) {
      stopPolling()
      handleError({
        code: 'TIMEOUT',
        message: t('projectWizard.step6.timeoutMessage'),
        recoverable: true,
      })
      return
    }

    await checkConnectionStatus()
  }, POLLING_INTERVAL)
}

/**
 * Para o polling
 */
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
    console.log('[StepWhatsApp] Polling parado')
  }
}

/**
 * Verifica status da conexão
 */
/**
 * Verifica status da conexão durante o polling
 * Segue SRP: responsabilidade única de verificar status
 */
async function checkConnectionStatus() {
  if (!accountId.value) {
    console.warn('[StepWhatsApp] checkConnectionStatus: accountId não definido')
    return
  }

  try {
    const result = await whatsappIntegrationService.checkConnectionStatus(accountId.value)

    if (result.success) {
      const status = result.data

      if (status.status === 'connected') {
        handleConnectionSuccess({
          phone: status.phoneNumber || '',
          profileName: status.profileName,
          accountId: accountId.value,
        })
        return
      }

      // Atualizar QR Code se mudou
      if (status.qrcode && status.qrcode !== qrCode.value) {
        qrCode.value = status.qrcode
      }

      if (status.pairCode && status.pairCode !== pairCode.value) {
        pairCode.value = status.pairCode
      }
    } else {
      console.warn('[StepWhatsApp] Erro no polling:', result.error)
    }
  } catch (err) {
    console.error('[StepWhatsApp] Erro ao verificar status:', err)
  }
}

// ============================================================================
// MÉTODOS - SUCESSO E ERRO
// ============================================================================

/**
 * Manipula sucesso da conexão
 * Segue SRP: responsabilidade única de atualizar estado após conexão bem-sucedida
 */
function handleConnectionSuccess(data: { phone: string; profileName?: string; accountId?: string }) {
  stopPolling()
  isConnected.value = true
  phoneNumber.value = whatsappAdapter.formatPhoneNumber(data.phone)
  profileName.value = data.profileName || ''
  stepState.value = 'connected'

  if (data.accountId) {
    accountId.value = data.accountId
  }

  // Limpar QR Code quando conectado
  qrCode.value = ''
  pairCode.value = ''

  // Atualiza store
  wizardStore.updateProjectData({
    whatsapp: {
      connected: true,
      phoneNumber: data.phone,
      qrCode: '',
      accountId: accountId.value || undefined,
      brokerType: selectedBroker.value?.name as any,
      selectedBrokerId: selectedBroker.value?.id,
    } as any,
  })

  console.log('[StepWhatsApp] Conectado com sucesso:', data.phone)
}

/**
 * Manipula erros
 */
function handleError(err: WhatsAppIntegrationError) {
  console.error('[StepWhatsApp] Erro:', err)
  error.value = err
  stepState.value = 'error'
}

/**
 * Renovar QR Code
 */
async function renewQRCode() {
  error.value = null
  pollingAttempts.value = 0
  await connectInstance()
}

/**
 * Tentar novamente
 */
async function retry() {
  error.value = null

  if (stepState.value === 'error') {
    if (!selectedBroker.value) {
      await loadAvailableBrokers()
    } else if (requiresCredentials.value) {
      stepState.value = 'configuring'
    } else {
      await createInstance()
    }
  }
}

/**
 * Compartilha link de conexão
 */
async function shareConnectionLink() {
  let link = ''

  if (accountId.value) {
    const result = await whatsappIntegrationService.createShareToken(accountId.value)
    if (result.success) {
      link = result.data.shareUrl
    } else {
      toastError(t('projectWizard.step6.shareError', 'Erro ao gerar link de compartilhamento'))
      return
    }
  } else {
    toastError(t('projectWizard.step6.shareError', 'Nenhuma conta conectada'))
    return
  }

  try {
    if (navigator.share) {
      await navigator.share({
        title: t('projectWizard.step6.shareTitle'),
        text: t('projectWizard.step6.shareText'),
        url: link,
      })
    } else {
      await navigator.clipboard.writeText(link)
    }
  } catch (err) {
    console.error('Erro ao compartilhar:', err)
  }
}

/**
 * Pular esta etapa
 */
function skipStep() {
  stopPolling()
  wizardStore.updateProjectData({
    whatsapp: {
      connected: false,
    },
  })
  wizardStore.nextStep()
}

// ============================================================================
// HELPERS - UI
// ============================================================================

/**
 * Retorna ícone para o tipo de broker
 */
function getBrokerIcon(broker: WhatsAppBroker): string {
  const name = broker.name.toLowerCase()
  if (name.includes('uazapi')) return '📱'
  if (name.includes('gupshup')) return '💬'
  if (name.includes('official') || name.includes('meta')) return '✅'
  return '📲'
}

/**
 * Retorna descrição do método de conexão
 */
function getConnectionMethodDescription(broker: WhatsAppBroker): string {
  const method = whatsappAdapter.getConnectionMethod(broker)
  switch (method) {
    case 'qr_code':
      return t('projectWizard.step6.connectionViaQR')
    case 'credentials':
      return t('projectWizard.step6.connectionViaCredentials')
    case 'oauth':
      return t('projectWizard.step6.connectionViaMeta')
    case 'pair_code':
      return t('projectWizard.step6.connectionViaPairCode')
    default:
      return ''
  }
}

// ============================================================================
// WATCHERS
// ============================================================================

watch(
  () => wizardStore.projectData.whatsapp,
  (newWhatsApp) => {
    if (newWhatsApp) {
      if (newWhatsApp.connected && !isConnected.value) {
        isConnected.value = true
        phoneNumber.value = newWhatsApp.phoneNumber || ''
        qrCode.value = newWhatsApp.qrCode || ''
        stepState.value = 'connected'
      }
    }
  },
  { immediate: true, deep: true }
)

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(async () => {
  const savedWhatsApp = wizardStore.projectData.whatsapp
  
  if (savedWhatsApp?.connected) {
    isConnected.value = true
    phoneNumber.value = savedWhatsApp.phoneNumber || ''
    qrCode.value = savedWhatsApp.qrCode || ''
    stepState.value = 'connected'
    
    // Carregar broker selecionado se houver
    if (savedWhatsApp.selectedBrokerId) {
      await loadAvailableBrokers()
      const broker = availableBrokers.value.find(b => b.id === savedWhatsApp.selectedBrokerId)
      if (broker) {
        selectedBroker.value = broker
        selectedBrokerId.value = broker.id
      }
    }
  } else if (savedWhatsApp?.accountId && savedWhatsApp?.selectedBrokerId) {
    // Se tem accountId mas não está conectado, tentar carregar e conectar
    console.log('[StepWhatsApp] Carregando instância existente...', {
      accountId: savedWhatsApp.accountId,
      brokerId: savedWhatsApp.selectedBrokerId,
    })
    
    await loadAvailableBrokers()
    const broker = availableBrokers.value.find(b => b.id === savedWhatsApp.selectedBrokerId)
    if (broker) {
      selectedBroker.value = broker
      selectedBrokerId.value = broker.id
      accountId.value = savedWhatsApp.accountId
      
      // Verificar status da conta existente
      const statusResult = await whatsappIntegrationService.checkConnectionStatus(savedWhatsApp.accountId)
      if (statusResult.success) {
        const status = statusResult.data
        if (status.status === 'connected') {
          handleConnectionSuccess({
            phone: status.phoneNumber || '',
            profileName: status.profileName,
            accountId: savedWhatsApp.accountId,
          })
        } else {
          // Não conectado, tentar obter QR Code
          await connectInstance()
        }
      } else {
        // Erro ao verificar, mostrar seleção de brokers
        stepState.value = 'selecting_broker'
      }
    } else {
      await loadAvailableBrokers()
    }
  } else {
    await loadAvailableBrokers()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="step-whatsapp">
    <div class="w-full max-w-[800px] mx-auto px-4 sm:px-6 py-4">
      <!-- Cabeçalho do step -->
      <div class="text-center mb-4">
        <div class="flex items-center justify-center gap-2">
          <h2 class="text-xl sm:text-2xl font-bold">
            {{ t('projectWizard.step6.title') }}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <HelpCircle class="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p class="max-w-xs text-sm">
                  {{ t('projectWizard.step6.optionalHint') }}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ t('projectWizard.step6.description') }}
        </p>
        <!-- Badge de segurança -->
        <div class="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
          <Shield class="h-3 w-3" />
          {{ t('projectWizard.step6.securityInfo') }}
        </div>
      </div>

      <!-- Card principal -->
      <div class="border border-border rounded-lg p-4 sm:p-6">
        <!-- Status da conexão -->
        <div class="flex items-center justify-center space-x-2 mb-4">
          <div
            :class="[
              'w-3 h-3 rounded-full',
              stepState === 'connected' ? 'bg-green-600' :
              stepState === 'error' ? 'bg-destructive' :
              ['waiting_qr', 'waiting_oauth', 'connecting', 'validating_credentials', 'testing_connection'].includes(stepState) ? 'bg-yellow-600 animate-pulse' :
              'bg-muted-foreground animate-pulse'
            ]"
          />
          <p :class="['text-sm font-medium', statusColor]">
            {{ statusText }}
          </p>
        </div>

        <!-- ======================================== -->
        <!-- ESTADO: Carregando Brokers               -->
        <!-- ======================================== -->
        <div v-if="stepState === 'loading_brokers'" class="space-y-4">
          <div class="flex justify-center">
            <Spinner size="lg" :label="t('projectWizard.step6.loadingOptions')" />
          </div>
          <div class="space-y-3">
            <Skeleton variant="rounded" height="80px" />
            <Skeleton variant="rounded" height="80px" />
          </div>
        </div>

        <!-- ======================================== -->
        <!-- ESTADO: Seleção de Broker                -->
        <!-- ======================================== -->
        <div v-else-if="stepState === 'selecting_broker'" class="space-y-4">
          <p class="text-sm text-center text-muted-foreground mb-4">
            {{ t('projectWizard.step6.selectMethodHint') }}
          </p>

          <div class="grid gap-3">
            <button
              v-for="broker in availableBrokers"
              :key="broker.id"
              class="w-full p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
              :class="{
                'border-primary bg-primary/5': selectedBrokerId === broker.id
              }"
              @click="selectBroker(broker)"
            >
              <div class="flex items-start gap-3">
                <span class="text-2xl">{{ getBrokerIcon(broker) }}</span>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold">{{ broker.displayName }}</h3>
                    <span class="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {{ getConnectionMethodDescription(broker) }}
                    </span>
                  </div>
                  <p v-if="broker.description" class="text-sm text-muted-foreground mt-1">
                    {{ broker.description }}
                  </p>
                  <div class="flex gap-2 mt-2">
                    <span
                      v-if="broker.supportsMedia"
                      class="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded"
                    >
                      {{ t('projectWizard.step6.media') }}
                    </span>
                    <span
                      v-if="broker.supportsTemplates"
                      class="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded"
                    >
                      {{ t('projectWizard.step6.templates') }}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <!-- Sem brokers disponíveis -->
          <div v-if="availableBrokers.length === 0 && !isLoadingBrokers" class="text-center py-8">
            <WifiOff class="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">{{ t('projectWizard.step6.noProviders') }}</p>
            <Button variant="outline" class="mt-4" @click="loadAvailableBrokers">
              <RefreshCw class="h-4 w-4 mr-2" />
              {{ t('projectWizard.step6.tryAgain') }}
            </Button>
          </div>
        </div>

        <!-- ======================================== -->
        <!-- ESTADO: Configuração de Credenciais      -->
        <!-- ======================================== -->
        <div v-else-if="stepState === 'configuring'" class="space-y-4">
          <!-- Botão voltar -->
          <button
            class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            @click="goBackToSelection"
          >
            <ArrowLeft class="h-4 w-4" />
            {{ t('projectWizard.step6.chooseOtherMethod') }}
          </button>

          <div class="border-t border-border pt-4">
            <h3 class="font-semibold mb-4">
              {{ t('projectWizard.step6.configure') }} {{ selectedBroker?.displayName }}
            </h3>

            <!-- Erro de validação -->
            <div
              v-if="error"
              class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <div class="flex items-start gap-2">
                <AlertCircle class="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p class="text-sm font-medium text-destructive">{{ error.message }}</p>
                </div>
              </div>
            </div>

            <!-- Campos dinâmicos -->
            <form class="space-y-4" @submit.prevent="validateAndConfigure">
              <div
                v-for="field in selectedBroker?.requiredFields"
                :key="field.name"
                class="space-y-1.5"
              >
                <Label :for="field.name">
                  {{ field.label }}
                  <span v-if="field.required" class="text-destructive">*</span>
                </Label>

                <div class="relative">
                  <Input
                    :id="field.name"
                    v-model="credentials[field.name]"
                    :type="field.type === 'password' && !showPasswords[field.name] ? 'password' : 'text'"
                    :placeholder="field.placeholder"
                    :class="{ 'border-destructive': credentialErrors[field.name] }"
                  />
                  
                  <!-- Toggle password visibility -->
                  <button
                    v-if="field.type === 'password'"
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    @click="togglePasswordVisibility(field.name)"
                  >
                    <Eye v-if="!showPasswords[field.name]" class="h-4 w-4" />
                    <EyeOff v-else class="h-4 w-4" />
                  </button>
                </div>

                <p v-if="field.description" class="text-xs text-muted-foreground">
                  {{ field.description }}
                </p>

                <p v-if="credentialErrors[field.name]" class="text-xs text-destructive">
                  {{ credentialErrors[field.name] }}
                </p>
              </div>

              <!-- Link para documentação -->
              <div
                v-if="selectedBroker?.documentationUrl"
                class="pt-2"
              >
                <a
                  :href="selectedBroker.documentationUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink class="h-3 w-3" />
                  {{ t('projectWizard.step6.howToGetCredentials') }}
                </a>
              </div>

              <div class="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  class="flex-1"
                  @click="goBackToSelection"
                >
                  {{ t('projectWizard.step6.cancel') }}
                </Button>
                <Button
                  type="submit"
                  class="flex-1"
                  :disabled="!isCredentialsFormValid"
                >
                  {{ t('projectWizard.step6.validateAndConnect') }}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <!-- ======================================== -->
        <!-- ESTADO: Validando Credenciais            -->
        <!-- ======================================== -->
        <div v-else-if="stepState === 'validating_credentials' || stepState === 'testing_connection'" class="space-y-4">
          <div class="flex flex-col items-center justify-center py-8">
            <Spinner size="lg" />
            <p class="text-sm text-muted-foreground mt-4">
              {{ stepState === 'validating_credentials' ? t('projectWizard.step6.validatingCredentials') : t('projectWizard.step6.testingConnection') }}
            </p>
          </div>
        </div>

        <!-- ======================================== -->
        <!-- ESTADO: Criando Instância / Conectando   -->
        <!-- ======================================== -->
        <div v-else-if="stepState === 'creating_instance' || stepState === 'connecting'" class="space-y-4">
          <!-- Botão voltar -->
          <button
            class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            @click="goBackToSelection"
          >
            <ArrowLeft class="h-4 w-4" />
            {{ t('projectWizard.step6.chooseOtherMethod') }}
          </button>

          <div class="flex flex-col items-center justify-center py-8">
            <Spinner size="lg" />
            <p class="text-sm text-muted-foreground mt-4">
              {{ stepState === 'creating_instance' ? t('projectWizard.step6.preparingConnection') : t('projectWizard.step6.generatingQR') }}
            </p>
          </div>
        </div>

        <!-- ======================================== -->
        <!-- ESTADO: Aguardando QR Code               -->
        <!-- ======================================== -->
        <div v-else-if="stepState === 'waiting_qr'" class="space-y-4">
          <!-- Botão voltar -->
          <button
            class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            @click="goBackToSelection"
          >
            <ArrowLeft class="h-4 w-4" />
            {{ t('projectWizard.step6.chooseOtherMethod') }}
          </button>

          <!-- QR Code -->
          <div class="flex justify-center">
            <div class="w-48 h-48 border-2 border-border rounded-lg bg-white p-3 flex items-center justify-center">
              <img
                v-if="qrCode"
                :src="qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`"
                alt="QR Code para conectar WhatsApp"
                class="w-full h-full object-contain"
              />
              <div v-else class="text-muted-foreground">
                {{ t('projectWizard.step6.loadingQR') }}
              </div>
            </div>
          </div>

          <!-- Aviso de timeout -->
          <div
            v-if="showTimeoutWarning"
            class="flex items-center justify-center gap-2 text-yellow-600 text-sm"
          >
            <AlertCircle class="h-4 w-4" />
            <span>{{ t('projectWizard.step6.qrExpires') }} {{ timeRemaining }}s</span>
          </div>

          <!-- Instruções -->
          <div class="space-y-3">
            <p class="text-sm text-center text-muted-foreground">
              {{ t('projectWizard.step6.instructions') }}
            </p>

            <ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>{{ t('projectWizard.step6.step1') }}</li>
              <li>{{ t('projectWizard.step6.step2') }}</li>
              <li>{{ t('projectWizard.step6.step3') }}</li>
            </ol>
          </div>

          <!-- Botões -->
          <div class="flex justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              @click="renewQRCode"
            >
              <RefreshCw class="h-4 w-4 mr-2" />
              {{ t('projectWizard.step6.renewQR') }}
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="shareConnectionLink"
            >
              <ExternalLink class="h-4 w-4 mr-2" />
              {{ t('projectWizard.step6.shareLink') }}
            </Button>
          </div>
        </div>

        <!-- ======================================== -->
        <!-- ESTADO: Conectado                        -->
        <!-- ======================================== -->
        <div v-else-if="stepState === 'connected'" class="space-y-4 text-center">
          <!-- Ícone de sucesso -->
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check class="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div>
            <p class="text-lg font-semibold text-green-600">
              {{ t('projectWizard.step6.successTitle') }}
            </p>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('projectWizard.step6.successDescription', { phone: phoneNumber }) }}
            </p>
          </div>

          <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p class="text-sm text-green-800 dark:text-green-200">
              💡 {{ t('projectWizard.step6.successHint') }}
            </p>
          </div>

          <!-- Info do broker usado -->
          <div v-if="selectedBroker" class="text-xs text-muted-foreground">
            {{ t('projectWizard.step6.connectedVia') }} {{ selectedBroker.displayName }}
          </div>
        </div>

        <!-- ======================================== -->
        <!-- ESTADO: Erro                             -->
        <!-- ======================================== -->
        <div v-else-if="stepState === 'error'" class="space-y-4 text-center">
          <!-- Ícone de erro -->
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle class="h-8 w-8 text-destructive" />
            </div>
          </div>

          <div>
            <p class="text-lg font-semibold text-destructive">
              {{ t('projectWizard.step6.errorTitle') }}
            </p>
            <p class="text-sm text-muted-foreground mt-1">
              {{ error?.message || t('projectWizard.step6.errorDescription') }}
            </p>
          </div>

          <div class="flex justify-center gap-3">
            <Button variant="outline" @click="goBackToSelection">
              <ArrowLeft class="h-4 w-4 mr-2" />
              {{ t('projectWizard.step6.switchMethod') }}
            </Button>
            <Button v-if="error?.recoverable" @click="retry">
              <RefreshCw class="h-4 w-4 mr-2" />
              {{ t('projectWizard.step6.retry') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Opção de pular -->
      <div v-if="stepState !== 'connected'" class="mt-4 text-center">
        <Button
          variant="ghost"
          size="sm"
          @click="skipStep"
        >
          {{ t('projectWizard.step6.skip') }}
        </Button>
        <p class="text-xs text-muted-foreground mt-2">
          {{ t('projectWizard.step6.skipHint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-whatsapp {
  min-height: 400px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
