<template>
  <Modal :model-value="open" @update:model-value="emit('update:open', $event)">
    <template #content>
      <div class="max-w-md mx-auto p-6">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare class="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 class="section-title-md mb-2">Conectar WhatsApp Business</h2>
          <p class="text-sm text-muted-foreground">
            Escaneie o QR Code com seu WhatsApp Business para conectar
          </p>
        </div>

        <!-- QR Code Section -->
        <div class="text-center mb-6">
          <div v-if="!qrCode && !isConnecting" class="py-12">
            <div class="w-24 h-24 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              <QrCode class="h-12 w-12 text-muted-foreground" />
            </div>
            <p class="text-sm text-muted-foreground">QR Code será gerado ao conectar</p>
          </div>

          <div v-else-if="isConnecting" class="py-12">
            <div class="w-24 h-24 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              <RefreshCw class="h-12 w-12 text-muted-foreground animate-spin" />
            </div>
            <p class="text-sm text-muted-foreground">Gerando QR Code...</p>
          </div>

          <div v-else-if="qrCode" class="space-y-4">
            <!-- QR Code -->
            <div class="bg-white p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 inline-block">
              <div class="w-48 h-48 bg-white flex items-center justify-center">
                <img
                  v-if="isRenderableQr && !qrImageError"
                  :src="qrCodeSrc"
                  alt="QR Code do WhatsApp"
                  class="w-44 h-44 object-contain"
                  @error="handleQrImageError"
                />
                <div v-else class="text-center px-2">
                  <p class="text-xs text-destructive">QR Code inválido. Gere novamente.</p>
                </div>
              </div>
            </div>

            <!-- Timer -->
            <div v-if="expiresAt" class="space-y-2">
              <div class="flex items-center justify-center space-x-2">
                <Clock class="h-4 w-4 text-warning" />
                <span class="text-sm font-medium text-warning">
                  Expira em {{ formatTimeRemaining(expiresAt) }}
                </span>
              </div>
              <div class="w-full bg-muted rounded-full h-2">
                <div 
                  class="bg-warning h-2 rounded-full transition-all duration-1000"
                  :style="{ width: getTimeRemainingPercentage(expiresAt) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mb-6">
          <h3 class="section-kicker mb-3">Como conectar:</h3>
          <ol class="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Abra o WhatsApp Business no seu celular</li>
            <li>Toque em <strong>Menu</strong> → <strong>Dispositivos conectados</strong></li>
            <li>Toque em <strong>Conectar um dispositivo</strong></li>
            <li>Escaneie o QR Code acima</li>
            <li>Aguarde a confirmação</li>
          </ol>
        </div>

        <!-- Status Messages -->
        <div v-if="connectionStatus" class="mb-4">
          <div v-if="connectionStatus === 'waiting'" class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div class="flex items-center space-x-2">
              <Clock class="h-4 w-4 text-blue-600" />
              <span class="text-sm text-blue-600">Aguardando escaneamento do QR Code...</span>
            </div>
          </div>

          <div v-else-if="connectionStatus === 'success'" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div class="flex items-center space-x-2">
              <CheckCircle class="h-4 w-4 text-green-600" />
              <span class="text-sm text-green-600">WhatsApp conectado com sucesso!</span>
            </div>
          </div>

          <div v-else-if="connectionStatus === 'error'" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div class="flex items-center space-x-2">
              <XCircle class="h-4 w-4 text-red-600" />
              <span class="text-sm text-red-600">Erro ao conectar. Tente novamente.</span>
            </div>
          </div>

          <div v-else-if="connectionStatus === 'expired'" class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div class="flex items-center space-x-2">
              <AlertTriangle class="h-4 w-4 text-yellow-600" />
              <span class="text-sm text-yellow-600">QR Code expirado. Gere um novo.</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between">
          <Button
            v-if="!qrCode && !isConnecting"
            @click="handleGenerateQR"
            :disabled="isConnecting"
          >
            <QrCode class="h-4 w-4 mr-2" />
            Conectar com WhatsApp
          </Button>

          <Button
            v-else-if="qrCode && connectionStatus !== 'success'"
            variant="outline"
            @click="handleRegenerateQR"
            :disabled="isConnecting"
          >
            <RefreshCw class="h-4 w-4 mr-2" />
            Regenerar QR
          </Button>

          <Button
            v-if="connectionStatus === 'success'"
            @click="handleClose"
          >
            <CheckCircle class="h-4 w-4 mr-2" />
            Concluir
          </Button>

          <Button
            variant="outline"
            @click="handleClose"
            :disabled="isConnecting"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  MessageSquare, 
  QrCode, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  /**
   * Se true, modal está aberto
   */
  open: boolean
  /**
   * QR Code string (base64 ou URL)
   */
  qrCode?: string | null
  /**
   * Data de expiração do QR Code
   */
  expiresAt?: string | null
  /**
   * Se true, está conectando
   */
  isConnecting?: boolean
  /**
   * Se true, a conexão foi estabelecida com sucesso
   */
  isConnected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  qrCode: null,
  expiresAt: null,
  isConnecting: false,
  isConnected: false
})

const emit = defineEmits([
  'update:open',
  'generate-qr',
  'generateQr',
  'check-connection',
  'checkConnection'
])

// ============================================================================
// STATE
// ============================================================================

const connectionStatus = ref<'waiting' | 'success' | 'error' | 'expired' | null>(null)
const pollInterval = ref<NodeJS.Timeout | null>(null)
const pollAttempts = ref(0)
const qrImageError = ref(false)
const POLLING_INTERVAL_MS = 4000
const MAX_POLL_ATTEMPTS = 30

// ============================================================================
// COMPOSABLES
// ============================================================================

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Calcula o tempo restante em segundos
 */
const timeRemaining = computed(() => {
  if (!props.expiresAt) return 0
  
  const now = new Date().getTime()
  const expires = new Date(props.expiresAt).getTime()
  const remaining = Math.max(0, Math.floor((expires - now) / 1000))
  
  return remaining
})

const qrCodeSrc = computed(() => {
  const rawValue = props.qrCode?.trim()
  if (!rawValue) return undefined

  if (rawValue.startsWith('data:image/')) {
    return rawValue
  }

  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    return rawValue
  }

  return `data:image/png;base64,${rawValue}`
})

const isRenderableQr = computed(() => Boolean(qrCodeSrc.value))

// ============================================================================
// METHODS
// ============================================================================

/**
 * Formata o tempo restante em formato legível
 */
const formatTimeRemaining = (_expiresAt: string) => {
  const remaining = timeRemaining.value
  
  if (remaining <= 0) return 'Expirado'
  
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Calcula a porcentagem do tempo restante
 */
const getTimeRemainingPercentage = (_expiresAt: string) => {
  const total = 5 * 60 // 5 minutos em segundos
  const remaining = timeRemaining.value
  
  return Math.max(0, Math.min(100, (remaining / total) * 100))
}

/**
 * Inicia o polling para verificar conexão
 */
const startPolling = () => {
  if (pollInterval.value) return

  pollAttempts.value = 0
  connectionStatus.value = 'waiting'

  pollInterval.value = setInterval(() => {
    pollAttempts.value += 1

    if (pollAttempts.value >= MAX_POLL_ATTEMPTS) {
      connectionStatus.value = 'expired'
      stopPolling()
      return
    }

    // Apenas emite o evento - a store faz a verificação real
    // O status será atualizado via prop isConnected
    emit('check-connection')
  }, POLLING_INTERVAL_MS)
}

/**
 * Para o polling
 */
const stopPolling = () => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value)
    pollInterval.value = null
  }
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleGenerateQR = () => {
  emit('generate-qr')
  startPolling()
}

const handleRegenerateQR = () => {
  stopPolling()
  connectionStatus.value = null
  emit('generate-qr')
  startPolling()
}

const handleClose = () => {
  stopPolling()
  connectionStatus.value = null
  emit('update:open', false)
}

const handleQrImageError = () => {
  qrImageError.value = true
}

// ============================================================================
// WATCHERS
// ============================================================================

// Atualizar status quando a conexão for estabelecida via prop
watch(
  () => props.isConnected,
  (isConnected) => {
    if (isConnected) {
      connectionStatus.value = 'success'
      stopPolling()
    }
  },
  { immediate: true }
)

// Iniciar polling automaticamente quando QR Code estiver disponível
watch(
  () => props.qrCode,
  (qrCode) => {
    qrImageError.value = false
    if (props.open && qrCode && !props.isConnected) {
      startPolling()
    }
  }
)

// Verificar expiração do QR Code
watch(timeRemaining, (remaining) => {
  if (remaining <= 0 && connectionStatus.value === 'waiting') {
    connectionStatus.value = 'expired'
    stopPolling()
  }
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      stopPolling()
      pollAttempts.value = 0
      connectionStatus.value = null
      qrImageError.value = false
    }
  }
)

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  if (props.qrCode && !connectionStatus.value) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>
