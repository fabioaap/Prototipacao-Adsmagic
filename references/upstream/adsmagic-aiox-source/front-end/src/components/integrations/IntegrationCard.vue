<template>
  <div class="bg-card border rounded-lg p-6 hover:shadow-md transition-all duration-200">
    <!-- Dialog de confirmação de desconexão -->
    <AlertDialog
      v-model="showDisconnectConfirm"
      :title="`Desconectar ${getPlatformName(integration.platform)}?`"
      :description="disconnectWarningMessage"
      variant="destructive"
      confirm-text="Sim, Desconectar"
      cancel-text="Cancelar"
      :loading="loading"
      @confirm="confirmDisconnect"
      @cancel="showDisconnectConfirm = false"
    />

    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center space-x-3">
        <!-- Platform Icon -->
        <div 
          class="w-12 h-12 rounded-lg flex items-center justify-center"
          :class="getPlatformIconBg(integration.platform)"
        >
          <BrandIcons
            :name="integration.platform as any"
            class="h-6 w-6"
            :class="getPlatformIconColor(integration.platform)"
          />
        </div>

        <!-- Platform Info -->
        <div>
          <h3 class="section-title-sm">{{ getPlatformName(integration.platform) }}</h3>
          <p class="text-sm text-muted-foreground">
            {{ getPlatformDescription(integration.platform) }}
          </p>
        </div>
      </div>

      <!-- Status Badge -->
      <IntegrationStatusBadge
        :status="integration.status === 'pending' ? 'syncing' : integration.status"
        :last-sync="integration.lastSync"
        :show-tooltip="true"
      />
    </div>

    <!-- Connection Info -->
    <div v-if="integration.connection" class="mb-4 p-3 bg-muted/50 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium">Conta Conectada</span>
        <span class="text-xs text-muted-foreground">
          Conectado em {{ formatDate(integration.connection.connectedAt, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
        </span>
      </div>
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <User class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm">{{ integration.connection.accountName }}</span>
        </div>
        <div v-if="integration.connection.email" class="flex items-center space-x-2">
          <Mail class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm text-muted-foreground">{{ integration.connection.email }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <Hash class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm text-muted-foreground">{{ integration.connection.accountId }}</span>
        </div>
      </div>
    </div>

    <!-- Ad Metrics Section (only for advertising platforms) -->
    <div v-if="shouldShowMetrics" class="mb-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium flex items-center gap-2">
          <TrendingUp class="h-4 w-4 text-primary" />
          Métricas (últimos 30 dias)
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="metricsLoading" class="flex items-center justify-center py-4">
        <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
        <span class="ml-2 text-sm text-muted-foreground">Carregando métricas...</span>
      </div>

      <!-- Metrics Grid -->
      <div v-else-if="adMetrics" class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <!-- Spend -->
        <div class="text-center p-2 bg-background rounded-surface">
          <div class="flex items-center justify-center mb-1">
            <DollarSign class="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div class="text-sm font-semibold">{{ formatCurrency(adMetrics.spend) }}</div>
          <div class="text-xs text-muted-foreground">Gasto</div>
        </div>

        <!-- Impressions -->
        <div class="text-center p-2 bg-background rounded-surface">
          <div class="flex items-center justify-center mb-1">
            <Eye class="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div class="text-sm font-semibold">{{ formatNumber(adMetrics.impressions) }}</div>
          <div class="text-xs text-muted-foreground">Impressões</div>
        </div>

        <!-- Clicks -->
        <div class="text-center p-2 bg-background rounded-surface">
          <div class="flex items-center justify-center mb-1">
            <MousePointer class="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div class="text-sm font-semibold">{{ formatNumber(adMetrics.clicks) }}</div>
          <div class="text-xs text-muted-foreground">Cliques</div>
        </div>

        <!-- CTR -->
        <div class="text-center p-2 bg-background rounded-surface">
          <div class="flex items-center justify-center mb-1">
            <Percent class="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div class="text-sm font-semibold">{{ formatPercentage(adMetrics.ctr) }}</div>
          <div class="text-xs text-muted-foreground">CTR</div>
        </div>

        <!-- CPC -->
        <div class="text-center p-2 bg-background rounded-surface">
          <div class="flex items-center justify-center mb-1">
            <DollarSign class="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div class="text-sm font-semibold">{{ formatCurrency(adMetrics.cpc) }}</div>
          <div class="text-xs text-muted-foreground">CPC</div>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="text-center py-3 text-sm text-muted-foreground">
        Sem dados de métricas disponíveis
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="integration.status === 'error' && integration.error" class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div class="flex items-start space-x-2">
        <AlertTriangle class="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
        <div>
          <p class="text-sm font-medium text-destructive">Erro de Conexão</p>
          <p class="text-sm text-destructive mt-1">{{ integration.error }}</p>
        </div>
      </div>
    </div>

    <!-- Last Sync Info -->
    <div v-if="integration.lastSync" class="mb-4 text-sm text-muted-foreground">
      <div class="flex items-center space-x-2">
        <RefreshCw class="h-4 w-4" />
        <span>Última sincronização: {{ formatRelativeTime(integration.lastSync) }}</span>
      </div>
    </div>

    <!-- Sync Logs Section -->
    <div v-if="integration.syncLogs && integration.syncLogs.length > 0" class="mb-4">
      <button
        class="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        @click="toggleSyncLogs"
      >
        <div class="flex items-center space-x-2">
          <FileText class="h-4 w-4" />
          <span>Logs de sincronização ({{ integration.syncLogs.length }})</span>
        </div>
        <component
          :is="showSyncLogs ? ChevronUp : ChevronDown"
          class="h-4 w-4"
        />
      </button>

      <!-- Logs List (expandido) -->
      <div v-if="showSyncLogs" class="mt-2 space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="log in integration.syncLogs.slice(0, 5)"
          :key="log.id"
          class="flex items-start justify-between p-2 bg-muted/50 rounded text-xs"
        >
          <div class="flex items-start space-x-2 min-w-0 flex-1">
            <!-- Status icon -->
            <component
              :is="getSyncLogIcon(log.status)"
              class="h-3.5 w-3.5 mt-0.5 shrink-0"
              :class="getSyncLogIconColor(log.status)"
            />
            <div class="min-w-0">
              <div class="flex items-center space-x-2">
                <span class="font-medium">{{ formatDate(log.startedAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</span>
                <span v-if="log.durationMs" class="text-muted-foreground">
                  ({{ formatDuration(log.durationMs) }})
                </span>
              </div>
              <div v-if="log.itemsSynced !== undefined" class="text-muted-foreground">
                {{ log.itemsSynced }} item{{ log.itemsSynced !== 1 ? 's' : '' }} sincronizado{{ log.itemsSynced !== 1 ? 's' : '' }}
              </div>
              <div v-if="log.error" class="text-destructive truncate" :title="log.error">
                {{ log.error }}
              </div>
              <div v-if="log.details" class="text-muted-foreground truncate" :title="log.details">
                {{ log.details }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <!-- Connect/Disconnect Button -->
        <Button
          v-if="integration.status === 'disconnected'"
          @click="handleConnect"
          :disabled="loading"
          :loading="loading"
        >
          <BrandIcons
            :name="integration.platform as any"
            class="h-4 w-4 mr-2"
          />
          Conectar
        </Button>

        <Button
          v-else-if="integration.status === 'connected'"
          variant="outline"
          @click="handleDisconnect"
          :disabled="loading"
        >
          <Unlink class="h-4 w-4 mr-2" />
          Desconectar
        </Button>

        <Button
          v-else-if="integration.status === 'error'"
          @click="handleReconnect"
          :disabled="loading"
          :loading="loading"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          Reautorizar
        </Button>

        <!-- Sync Button -->
        <Button
          v-if="integration.status === 'connected'"
          variant="ghost"
          size="sm"
          @click="handleSync"
          :disabled="loading"
          :loading="isSyncing"
        >
          <RefreshCw class="h-4 w-4" />
        </Button>
      </div>

      <!-- Platform-specific actions -->
      <div class="flex items-center space-x-2">
        <Button
          v-if="integration.status === 'connected'"
          variant="ghost"
          size="sm"
          @click="handleViewDetails"
        >
          <Settings class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  User,
  Mail,
  Hash,
  RefreshCw,
  AlertTriangle,
  Unlink,
  Settings,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Eye,
  MousePointer,
  Percent,
  TrendingUp,
  Loader2
} from 'lucide-vue-next'
import BrandIcons from '@/components/icons/BrandIcons.vue'
import Button from '@/components/ui/Button.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import IntegrationStatusBadge from '@/components/integrations/IntegrationStatusBadge.vue'
import type { Integration, SyncLog } from '@/types/models'
import type { AdMetricsData } from '@/types/integrations'
import { useFormat } from '@/composables/useFormat'

interface Props {
  /**
   * Dados da integração
   */
  integration: Integration
  /**
   * Se true, indica loading state
   */
  loading?: boolean
  /**
   * Se true, indica que está sincronizando
   */
  isSyncing?: boolean
  /**
   * Métricas de anúncios (apenas para plataformas advertising)
   */
  adMetrics?: AdMetricsData | null
  /**
   * Se true, indica que está carregando métricas
   */
  metricsLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  isSyncing: false,
  adMetrics: null,
  metricsLoading: false
})

const emit = defineEmits<{
  connect: [platform: string]
  disconnect: [platform: string]
  reconnect: [platform: string]
  sync: [platform: string]
  viewDetails: [platform: string]
}>()

// ============================================================================
// COMPOSABLES
// ============================================================================

const { formatDate, formatRelativeTime, formatCurrency, formatNumber, formatPercentage } = useFormat()

// ============================================================================
// STATE
// ============================================================================

const showSyncLogs = ref(false)
const showDisconnectConfirm = ref(false)

/**
 * Verifica se a plataforma é de advertising (mostra métricas de ads)
 */
const isAdvertisingPlatform = computed(() => {
  return ['meta', 'google', 'tiktok'].includes(props.integration.platform)
})

/**
 * Verifica se deve mostrar a seção de métricas
 */
const shouldShowMetrics = computed(() => {
  return isAdvertisingPlatform.value &&
         props.integration.status === 'connected' &&
         (props.adMetrics || props.metricsLoading)
})

/**
 * Mensagem de aviso sobre desconexão
 */
const disconnectWarningMessage = computed(() => {
  const platformName = getPlatformName(props.integration.platform)
  return `Ao desconectar, você perderá a sincronização de dados com ${platformName}. ` +
    `Os dados já sincronizados serão mantidos, mas novos dados não serão importados. ` +
    `Você precisará reconectar para retomar a sincronização.`
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Toggle visibilidade dos logs de sincronização
 */
const toggleSyncLogs = () => {
  showSyncLogs.value = !showSyncLogs.value
}

/**
 * Obtém o ícone baseado no status do sync log
 */
const getSyncLogIcon = (status: SyncLog['status']) => {
  const iconMap: Record<SyncLog['status'], typeof CheckCircle> = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    running: Clock
  }
  return iconMap[status] || Clock
}

/**
 * Obtém a cor do ícone baseado no status do sync log
 */
const getSyncLogIconColor = (status: SyncLog['status']) => {
  const colorMap: Record<SyncLog['status'], string> = {
    success: 'text-green-500',
    error: 'text-destructive',
    warning: 'text-amber-500',
    running: 'text-blue-500'
  }
  return colorMap[status] || 'text-muted-foreground'
}

/**
 * Formata duração em milissegundos para string legível
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

/**
 * Obtém o ícone da plataforma
 */
const getPlatformIconBg = (platform: string) => {
  const bgMap: Record<string, string> = {
    whatsapp: 'bg-green-100 dark:bg-green-900/20',
    meta: 'bg-blue-100 dark:bg-blue-900/20',
    google: 'bg-red-100 dark:bg-red-900/20',
    tiktok: 'bg-black/5 dark:bg-white/5',
    linkedin: 'bg-blue-100 dark:bg-blue-900/20',
    telegram: 'bg-cyan-100 dark:bg-cyan-900/20'
  }
  return bgMap[platform] || 'bg-gray-100 dark:bg-gray-900/20'
}

/**
 * Obtém a cor do ícone da plataforma
 */
const getPlatformIconColor = (platform: string) => {
  const colorMap: Record<string, string> = {
    whatsapp: 'text-green-600 dark:text-green-400',
    meta: 'text-blue-600 dark:text-blue-400',
    google: 'text-blue-600 dark:text-blue-400',
    tiktok: 'text-black dark:text-white',
    linkedin: 'text-blue-600 dark:text-blue-400',
    telegram: 'text-cyan-600 dark:text-cyan-400'
  }
  return colorMap[platform] || 'text-gray-600 dark:text-gray-400'
}

/**
 * Obtém o nome da plataforma
 */
const getPlatformName = (platform: string) => {
  const nameMap: Record<string, string> = {
    whatsapp: 'WhatsApp Business',
    meta: 'Meta (Facebook/Instagram)',
    google: 'Google Ads',
    tiktok: 'TikTok Ads',
    linkedin: 'LinkedIn Ads',
    telegram: 'Telegram'
  }
  return nameMap[platform] || platform
}

/**
 * Obtém a descrição da plataforma
 */
const getPlatformDescription = (platform: string) => {
  const descMap: Record<string, string> = {
    whatsapp: 'Conecte sua conta WhatsApp Business para enviar mensagens automáticas',
    meta: 'Conecte suas contas do Facebook e Instagram para rastrear conversões',
    google: 'Conecte sua conta Google Ads para otimizar campanhas',
    tiktok: 'Conecte sua conta TikTok Ads para rastrear conversões',
    linkedin: 'Conecte sua conta LinkedIn Ads para rastrear conversões',
    telegram: 'Conecte sua conta Telegram para enviar mensagens automáticas'
  }
  return descMap[platform] || 'Conecte sua conta para sincronizar dados'
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleConnect = () => {
  emit('connect', props.integration.platform)
}

/**
 * Abre modal de confirmação de desconexão
 */
const handleDisconnect = () => {
  showDisconnectConfirm.value = true
}

/**
 * Confirma a desconexão após confirmação no modal
 */
const confirmDisconnect = () => {
  emit('disconnect', props.integration.platform)
  showDisconnectConfirm.value = false
}

const handleReconnect = () => {
  emit('reconnect', props.integration.platform)
}

const handleSync = () => {
  emit('sync', props.integration.platform)
}

const handleViewDetails = () => {
  emit('viewDetails', props.integration.platform)
}
</script>
