<template>
  <div class="relative">
    <Badge :variant="getStatusVariant(status)">
      <component
        :is="getStatusIcon(status)"
        class="h-3 w-3 mr-1"
      />
      {{ getStatusLabel(status) }}
    </Badge>

    <!-- Tooltip -->
    <div
      v-if="showTooltip && lastSync"
      class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-control shadow-lg border z-50 whitespace-nowrap"
    >
      <div class="flex items-center space-x-2">
        <Clock class="h-3 w-3" />
        <span>{{ formatRelativeTime(lastSync) }}</span>
      </div>
      <!-- Arrow -->
      <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover border-l border-t rotate-45"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import { useFormat } from '@/composables/useFormat'

interface Props {
  /**
   * Status da integração
   */
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  /**
   * Data da última sincronização
   */
  lastSync?: string | null
  /**
   * Se true, mostra tooltip com informações
   */
  showTooltip?: boolean
}

withDefaults(defineProps<Props>(), {
  showTooltip: false
})

// ============================================================================
// COMPOSABLES
// ============================================================================

const { formatRelativeTime } = useFormat()

// ============================================================================
// METHODS
// ============================================================================

/**
 * Obtém o ícone baseado no status
 */
const getStatusIcon = (status: string) => {
  const iconMap: Record<string, any> = {
    connected: CheckCircle,
    disconnected: XCircle,
    error: AlertTriangle,
    syncing: RefreshCw
  }
  return iconMap[status] || XCircle
}

/**
 * Obtém o variant do badge baseado no status
 */
const getStatusVariant = (status: string) => {
  const variantMap: Record<string, any> = {
    connected: 'success',
    disconnected: 'secondary',
    error: 'destructive',
    syncing: 'warning'
  }
  return variantMap[status] || 'secondary'
}

/**
 * Obtém o label do status
 */
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    error: 'Erro',
    syncing: 'Sincronizando'
  }
  return labelMap[status] || status
}
</script>
