<template>
  <div class="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200">
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-3">
        <!-- Ícone do tipo de evento -->
        <div class="flex-shrink-0">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="getEventIconBg(event.type)"
          >
            <component
              :is="getEventIcon(event.type)"
              class="h-5 w-5"
              :class="getEventIconColor(event.type)"
            />
          </div>
        </div>

        <!-- Informações principais -->
        <div class="flex-1 min-w-0">
          <h3 class="section-kicker truncate">
            {{ getEventTypeLabel(event.type) }}
          </h3>
          <p class="text-xs text-muted-foreground truncate">
            {{ getEntityLabel(event) }} • {{ event.entityId }}
          </p>
        </div>
      </div>

      <!-- Status badge -->
      <Badge :variant="getStatusBadge(event.status).variant">
        <component
          :is="getStatusIcon(event.status)"
          class="h-3 w-3 mr-1"
        />
        {{ getStatusBadge(event.status).label }}
      </Badge>
    </div>

    <!-- Conteúdo -->
    <div class="space-y-3">
      <!-- Plataforma -->
      <div class="flex items-center space-x-2 text-sm">
        <component
          :is="getPlatformIcon(event.platform)"
          class="h-4 w-4 text-muted-foreground"
        />
        <span class="text-muted-foreground">
          {{ getPlatformLabel(event.platform) }}
        </span>
      </div>

      <!-- Data/Hora -->
      <div class="flex items-center space-x-2 text-sm text-muted-foreground">
        <Clock class="h-4 w-4" />
        <span>{{ formatDate(event.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</span>
        <span class="text-xs">{{ formatTime(event.createdAt) }}</span>
      </div>

      <!-- Metadata (se disponível) -->
      <div v-if="event.metadata" class="space-y-1">
        <div v-if="event.metadata.device" class="flex items-center space-x-2 text-xs text-muted-foreground">
          <Smartphone class="h-3 w-3" />
          <span>{{ event.metadata.device }}</span>
        </div>
        <div v-if="event.metadata.country" class="flex items-center space-x-2 text-xs text-muted-foreground">
          <Globe class="h-3 w-3" />
          <span>{{ event.metadata.country }}</span>
        </div>
      </div>

      <!-- Error message (se falhou) -->
      <div v-if="event.status === 'failed' && event.error" class="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
        <div class="flex items-start space-x-2">
          <X class="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{{ event.error }}</span>
        </div>
      </div>

      <!-- Retry count (se falhou) -->
      <div v-if="event.status === 'failed' && (event.retryCount ?? 0) > 0" class="text-xs text-muted-foreground">
        Tentativas: {{ event.retryCount }}
      </div>
    </div>

    <!-- Actions -->
    <div v-if="showActions" class="flex items-center justify-between mt-4 pt-3 border-t">
      <div class="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          @click="handleView"
          :disabled="loading"
        >
          <Eye class="h-4 w-4 mr-1" />
          Ver Detalhes
        </Button>

        <Button
          v-if="event.status === 'failed'"
          variant="ghost"
          size="sm"
          @click="handleRetry"
          :disabled="loading"
        >
          <RefreshCw class="h-4 w-4 mr-1" />
          Reenviar
        </Button>
      </div>

      <!-- Timestamp -->
      <div class="text-xs text-muted-foreground">
        {{ formatRelativeTime(event.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Clock, 
  Eye, 
  RefreshCw, 
  X, 
  Smartphone, 
  Globe,
  UserPlus,
  UserCog,
  ArrowRight,
  CheckCircle,
  XCircle,
  MousePointer,
  MessageSquare,
  RefreshCw as SyncIcon,
  Facebook,
  Chrome,
  Music,
  Linkedin,
  Webhook,
  Check,
  Clock as PendingIcon,
  Info
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Event } from '@/types/models'
import { useFormat } from '@/composables/useFormat'

interface Props {
  /**
   * Evento a ser exibido
   */
  event: Event
  /**
   * Se true, mostra botões de ação
   */
  showActions?: boolean
  /**
   * Se true, indica loading state
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  loading: false
})

const emit = defineEmits<{
  view: [event: Event]
  retry: [event: Event]
}>()

// ============================================================================
// COMPOSABLES
// ============================================================================

const { formatDate, formatTime, formatRelativeTime } = useFormat()

// ============================================================================
// METHODS
// ============================================================================

/**
 * Obtém o ícone baseado no tipo de evento
 */
const getEventIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    contact_created: UserPlus,
    contact_updated: UserCog,
    stage_changed: ArrowRight,
    sale_completed: CheckCircle,
    sale_lost: XCircle,
    link_clicked: MousePointer,
    message_sent: MessageSquare,
    integration_sync: SyncIcon
  }
  return iconMap[type] || UserPlus
}

/**
 * Obtém a cor de fundo do ícone
 */
const getEventIconBg = (type: string) => {
  const bgMap: Record<string, string> = {
    contact_created: 'bg-blue-100 dark:bg-blue-900/20',
    contact_updated: 'bg-purple-100 dark:bg-purple-900/20',
    stage_changed: 'bg-orange-100 dark:bg-orange-900/20',
    sale_completed: 'bg-green-100 dark:bg-green-900/20',
    sale_lost: 'bg-red-100 dark:bg-red-900/20',
    link_clicked: 'bg-cyan-100 dark:bg-cyan-900/20',
    message_sent: 'bg-indigo-100 dark:bg-indigo-900/20',
    integration_sync: 'bg-gray-100 dark:bg-gray-900/20'
  }
  return bgMap[type] || 'bg-gray-100 dark:bg-gray-900/20'
}

/**
 * Obtém a cor do ícone
 */
const getEventIconColor = (type: string) => {
  const colorMap: Record<string, string> = {
    contact_created: 'text-blue-600 dark:text-blue-400',
    contact_updated: 'text-purple-600 dark:text-purple-400',
    stage_changed: 'text-orange-600 dark:text-orange-400',
    sale_completed: 'text-green-600 dark:text-green-400',
    sale_lost: 'text-red-600 dark:text-red-400',
    link_clicked: 'text-cyan-600 dark:text-cyan-400',
    message_sent: 'text-indigo-600 dark:text-indigo-400',
    integration_sync: 'text-gray-600 dark:text-gray-400'
  }
  return colorMap[type] || 'text-gray-600 dark:text-gray-400'
}

/**
 * Obtém o label do tipo de evento
 */
const getEventTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    contact_created: 'Contato Criado',
    contact_updated: 'Contato Atualizado',
    stage_changed: 'Etapa Alterada',
    sale_completed: 'Venda Concluída',
    sale_lost: 'Venda Perdida',
    link_clicked: 'Link Clicado',
    message_sent: 'Mensagem Enviada',
    integration_sync: 'Sincronização'
  }
  return labelMap[type] || type
}

/**
 * Obtém o ícone da plataforma
 */
const getPlatformIcon = (platform?: string) => {
  const iconMap: Record<string, any> = {
    meta: Facebook,
    google: Chrome,
    tiktok: Music,
    linkedin: Linkedin,
    whatsapp: MessageSquare,
    system: Webhook
  }
  return iconMap[platform || 'system'] || Webhook
}

/**
 * Obtém o label da plataforma
 */
const getPlatformLabel = (platform?: string) => {
  const labelMap: Record<string, string> = {
    meta: 'Meta',
    google: 'Google',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    system: 'Sistema'
  }
  return labelMap[platform || 'system'] || 'Sistema'
}

/**
 * Obtém o label da entidade
 */
const getEntityLabel = (event: Event) => {
  const entityMap: Record<string, string> = {
    contact: 'Contato',
    sale: 'Venda',
    stage: 'Etapa',
    link: 'Link',
    message: 'Mensagem'
  }
  return entityMap[event.entityType ?? 'contact'] || event.entityType || 'Desconhecido'
}

/**
 * Obtém o ícone do status
 */
const getStatusIcon = (status: string) => {
  const iconMap: Record<string, any> = {
    success: Check,
    pending: PendingIcon,
    failed: X,
    info: Info
  }
  return iconMap[status] || Info
}

/**
 * Obtém o badge do status
 */
const getStatusBadge = (status: string) => {
  const badgeMap: Record<string, { variant: any; label: string }> = {
    success: { variant: 'success', label: 'Sucesso' },
    pending: { variant: 'warning', label: 'Pendente' },
    failed: { variant: 'destructive', label: 'Falhou' },
    info: { variant: 'secondary', label: 'Info' }
  }
  return badgeMap[status] || { variant: 'secondary', label: status }
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleView = () => {
  emit('view', props.event)
}

const handleRetry = () => {
  emit('retry', props.event)
}
</script>
