<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="flex space-x-4">
          <div class="w-4 h-4 bg-muted rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-muted rounded w-1/4"></div>
            <div class="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="groupedEvents.length === 0" class="text-center py-12">
      <div class="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <Activity class="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 class="section-title-sm mb-2">Nenhum evento encontrado</h3>
      <p class="text-muted-foreground">
        Não há eventos para exibir na timeline
      </p>
    </div>

    <!-- Timeline -->
    <div v-else class="space-y-8">
      <div
        v-for="(group, groupIndex) in groupedEvents"
        :key="group.date"
        class="relative"
      >
        <!-- Date Header -->
        <div class="flex items-center space-x-4 mb-4">
          <div class="flex-shrink-0">
            <div class="w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <div class="flex-1">
            <h3 class="section-kicker">{{ group.label }}</h3>
            <p class="text-xs text-muted-foreground">{{ group.count }} evento(s)</p>
          </div>
        </div>

        <!-- Events for this date -->
        <div class="relative">
          <!-- Timeline line -->
          <div 
            v-if="groupIndex < groupedEvents.length - 1"
            class="absolute left-2 top-0 w-px h-full bg-border"
          ></div>

          <div class="space-y-4">
            <div
              v-for="(event, eventIndex) in group.events"
              :key="event.id"
              class="relative flex space-x-4 group"
            >
              <!-- Timeline dot -->
              <div class="flex-shrink-0 relative">
                <div 
                  class="w-4 h-4 rounded-full border-2 border-background flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                  :class="getEventDotClass(event)"
                >
                  <component
                    :is="getEventIcon(event.type)"
                    class="h-2 w-2"
                    :class="getEventIconColor(event.type)"
                  />
                </div>
                <!-- Connecting line to next event -->
                <div 
                  v-if="eventIndex < group.events.length - 1"
                  class="absolute left-1/2 top-4 w-px h-8 -translate-x-1/2 bg-border"
                ></div>
              </div>

              <!-- Event content -->
              <div 
                class="flex-1 min-w-0 cursor-pointer"
                @click="handleEventClick(event)"
              >
                <div class="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 group-hover:border-primary/20">
                  <!-- Event header -->
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-3">
                      <div 
                        class="w-8 h-8 rounded-full flex items-center justify-center"
                        :class="getEventIconBg(event.type)"
                      >
                        <component
                          :is="getEventIcon(event.type)"
                          class="h-4 w-4"
                          :class="getEventIconColor(event.type)"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="section-kicker truncate">
                          {{ getEventTypeLabel(event.type) }}
                        </h4>
                        <p class="text-xs text-muted-foreground truncate">
                          {{ getEntityLabel(event) }} • {{ event.entityId }}
                        </p>
                      </div>
                    </div>
                    <Badge :variant="getStatusBadge(event.status).variant">
                      <component
                        :is="getStatusIcon(event.status)"
                        class="h-3 w-3 mr-1"
                      />
                      {{ getStatusBadge(event.status).label }}
                    </Badge>
                  </div>

                  <!-- Event details -->
                  <div class="space-y-2">
                    <!-- Platform -->
                    <div class="flex items-center space-x-2 text-sm">
                      <component
                        :is="getPlatformIcon(event.platform)"
                        class="h-4 w-4 text-muted-foreground"
                      />
                      <span class="text-muted-foreground">
                        {{ getPlatformLabel(event.platform) }}
                      </span>
                    </div>

                    <!-- Time -->
                    <div class="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock class="h-4 w-4" />
                      <span>{{ formatTime(event.createdAt) }}</span>
                      <span class="text-xs">{{ formatRelativeTime(event.createdAt) }}</span>
                    </div>

                    <!-- Error message (if failed) -->
                    <div v-if="event.status === 'failed' && event.error" class="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                      <div class="flex items-start space-x-2">
                        <X class="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span class="line-clamp-2">{{ event.error }}</span>
                      </div>
                    </div>

                    <!-- Metadata preview -->
                    <div v-if="event.metadata" class="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div v-if="event.metadata.device" class="flex items-center space-x-1">
                        <Smartphone class="h-3 w-3" />
                        <span>{{ event.metadata.device }}</span>
                      </div>
                      <div v-if="event.metadata.country" class="flex items-center space-x-1">
                        <Globe class="h-3 w-3" />
                        <span>{{ event.metadata.country }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="flex justify-center pt-4">
        <Button
          variant="outline"
          @click="handleLoadMore"
          :disabled="loading"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          Carregar Mais
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Activity, 
  Clock, 
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
import { formatSafeDate } from '@/utils/formatters'

interface Props {
  /**
   * Lista de eventos a exibir
   */
  events: Event[]
  /**
   * Se true, indica loading state
   */
  loading?: boolean
  /**
   * Se true, indica que há mais eventos para carregar
   */
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: false
})

const emit = defineEmits<{
  eventClick: [event: Event]
  loadMore: []
}>()

// ============================================================================
// COMPOSABLES
// ============================================================================

const { formatTime, formatRelativeTime } = useFormat()

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Agrupa eventos por data
 */
const groupedEvents = computed(() => {
  const groups: Record<string, { date: string; label: string; count: number; events: Event[] }> = {}
  
  props.events.forEach(event => {
    if (!event.createdAt) return
    
    const eventDate = new Date(event.createdAt)
    if (isNaN(eventDate.getTime())) return
    
    const date = eventDate.toDateString()
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    let label: string
    if (date === today) {
      label = 'Hoje'
    } else if (date === yesterday) {
      label = 'Ontem'
    } else {
      label = formatSafeDate(event.createdAt, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    if (!groups[date]) {
      groups[date] = {
        date,
        label,
        count: 0,
        events: []
      }
    }
    
    groups[date].events.push(event)
    groups[date].count++
  })
  
  // Converte para array e ordena por data (mais recente primeiro)
  return Object.values(groups).sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0
    return dateB.getTime() - dateA.getTime()
  })
})

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
    failed: XCircle,
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

/**
 * Obtém a classe do dot da timeline baseado no status
 */
const getEventDotClass = (event: Event) => {
  const baseClass = 'border-2'
  const statusClass = {
    success: 'bg-success border-success',
    pending: 'bg-warning border-warning',
    failed: 'bg-destructive border-destructive',
    info: 'bg-secondary border-secondary'
  }
  return `${baseClass} ${statusClass[event.status as keyof typeof statusClass] || statusClass.info}`
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleEventClick = (event: Event) => {
  emit('eventClick', event)
}

const handleLoadMore = () => {
  emit('loadMore')
}
</script>
