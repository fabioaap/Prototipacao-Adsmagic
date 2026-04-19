<script setup lang="ts">
/**
 * EventReplayPanel Component
 * 
 * Painel para gerenciar replay de eventos falhados.
 * Permite selecionar eventos individuais ou em batch para reprocessamento.
 * 
 * @feature G8.7 — Replay de eventos (reprocessar batch)
 * 
 * Features:
 * - Lista de eventos falhados com seleção múltipla
 * - Filtro por plataforma
 * - Replay individual ou batch
 * - Barra de progresso durante reprocessamento
 * - Estatísticas de sucesso/falha após replay
 */

import { ref, computed, watch } from 'vue'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare,
  Filter,
  Play,
  Pause,
  RotateCcw
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Progress from '@/components/ui/Progress.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Event } from '@/types/models'

// ============================================================================
// PROPS & EMITS
// ============================================================================

interface Props {
  /** Lista de eventos falhados */
  events: Event[]
  /** Indica se está carregando dados */
  loading?: boolean
  /** Indica se o replay está em andamento */
  replaying?: boolean
  /** Progresso atual do replay (0-100) */
  progress?: number
  /** Resultado do último replay */
  lastResult?: {
    success: number
    failed: number
    total: number
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  replaying: false,
  progress: 0,
  lastResult: null
})

const emit = defineEmits<{
  /** Emitido quando usuário quer reprocessar eventos selecionados */
  (e: 'replay', eventIds: string[]): void
  /** Emitido quando usuário quer reprocessar todos os falhados */
  (e: 'replay-all'): void
  /** Emitido quando usuário quer cancelar o replay */
  (e: 'cancel'): void
  /** Emitido quando usuário quer ver detalhes de um evento */
  (e: 'view-details', event: Event): void
}>()

// ============================================================================
// STATE
// ============================================================================

/** IDs dos eventos selecionados */
const selectedIds = ref<Set<string>>(new Set())

/** Painel expandido/colapsado */
const isExpanded = ref(false)

/** Filtro de plataforma ativo */
const platformFilter = ref<string | null>(null)

/** Máximo de eventos mostrados inicialmente */
const INITIAL_SHOW_COUNT = 5

// ============================================================================
// COMPUTED
// ============================================================================

/** Plataformas únicas dos eventos falhados */
const platforms = computed(() => {
  const platformSet = new Set<string>()
  props.events.forEach(event => {
    if (event.platform) {
      platformSet.add(event.platform)
    }
  })
  return Array.from(platformSet)
})

/** Eventos filtrados por plataforma */
const filteredEvents = computed(() => {
  if (!platformFilter.value) return props.events
  return props.events.filter(e => e.platform === platformFilter.value)
})

/** Eventos a serem mostrados (limitados se não expandido) */
const visibleEvents = computed(() => {
  if (isExpanded.value) return filteredEvents.value
  return filteredEvents.value.slice(0, INITIAL_SHOW_COUNT)
})

/** Quantidade de eventos ocultos */
const hiddenCount = computed(() => {
  return Math.max(0, filteredEvents.value.length - INITIAL_SHOW_COUNT)
})

/** Todos os eventos filtrados estão selecionados? */
const allSelected = computed(() => {
  if (filteredEvents.value.length === 0) return false
  return filteredEvents.value.every(e => selectedIds.value.has(e.id))
})

/** Alguns (mas não todos) eventos estão selecionados? */
const someSelected = computed(() => {
  if (filteredEvents.value.length === 0) return false
  const selectedCount = filteredEvents.value.filter(e => selectedIds.value.has(e.id)).length
  return selectedCount > 0 && selectedCount < filteredEvents.value.length
})

/** Quantidade de eventos selecionados */
const selectedCount = computed(() => selectedIds.value.size)

/** Tem eventos para replay? */
const hasEventsToReplay = computed(() => props.events.length > 0)

/** Pode iniciar replay? */
const canReplay = computed(() => {
  return hasEventsToReplay.value && !props.replaying && selectedCount.value > 0
})

/** Mapa de plataformas para labels */
const platformLabels: Record<string, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  tiktok_ads: 'TikTok Ads',
  linkedin_ads: 'LinkedIn Ads',
  webhook: 'Webhook'
}

// ============================================================================
// METHODS
// ============================================================================

/** Alterna seleção de um evento */
const toggleSelection = (eventId: string) => {
  if (selectedIds.value.has(eventId)) {
    selectedIds.value.delete(eventId)
  } else {
    selectedIds.value.add(eventId)
  }
  // Força reatividade
  selectedIds.value = new Set(selectedIds.value)
}

/** Seleciona/deseleciona todos os eventos filtrados */
const toggleSelectAll = () => {
  if (allSelected.value) {
    // Deseleciona todos
    filteredEvents.value.forEach(e => selectedIds.value.delete(e.id))
  } else {
    // Seleciona todos
    filteredEvents.value.forEach(e => selectedIds.value.add(e.id))
  }
  selectedIds.value = new Set(selectedIds.value)
}

/** Limpa seleção */
const clearSelection = () => {
  selectedIds.value = new Set()
}

/** Aplica filtro de plataforma */
const setFilter = (platform: string | null) => {
  platformFilter.value = platform
  // Limpa seleção ao mudar filtro
  clearSelection()
}

/** Inicia replay dos eventos selecionados */
const handleReplay = () => {
  if (!canReplay.value) return
  emit('replay', Array.from(selectedIds.value))
}

/** Inicia replay de todos os falhados */
const handleReplayAll = () => {
  emit('replay-all')
}

/** Cancela replay em andamento */
const handleCancel = () => {
  emit('cancel')
}

/** Abre detalhes do evento */
const handleViewDetails = (event: Event) => {
  emit('view-details', event)
}

/** Formata data */
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** Trunca mensagem de erro */
const truncateError = (message: string | undefined, maxLength = 50): string => {
  if (!message) return 'Erro desconhecido'
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}

// ============================================================================
// WATCHERS
// ============================================================================

// Limpa seleção quando eventos mudam
watch(() => props.events, () => {
  clearSelection()
}, { deep: true })
</script>

<template>
  <div 
    class="rounded-lg border bg-card text-card-foreground shadow-sm"
    :class="{ 'border-yellow-500/50': hasEventsToReplay }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <RotateCcw class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 class="section-title-sm">Replay de Eventos</h3>
          <p class="text-sm text-muted-foreground">
            {{ events.length }} evento{{ events.length !== 1 ? 's' : '' }} falhado{{ events.length !== 1 ? 's' : '' }} disponíve{{ events.length !== 1 ? 'is' : 'l' }} para reprocessamento
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Replay All Button -->
        <Button
          v-if="hasEventsToReplay && !replaying"
          variant="outline"
          size="sm"
          @click="handleReplayAll"
          :disabled="loading"
        >
          <RefreshCw class="h-4 w-4 mr-2" />
          Reprocessar Todos
        </Button>

        <!-- Replay Selected Button -->
        <Button
          v-if="selectedCount > 0 && !replaying"
          variant="default"
          size="sm"
          @click="handleReplay"
          :disabled="!canReplay"
        >
          <Play class="h-4 w-4 mr-2" />
          Reprocessar ({{ selectedCount }})
        </Button>

        <!-- Cancel Button (during replay) -->
        <Button
          v-if="replaying"
          variant="destructive"
          size="sm"
          @click="handleCancel"
        >
          <Pause class="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>

    <!-- Progress Bar (durante replay) -->
    <div v-if="replaying" class="px-4 py-3 bg-muted/50">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium">Reprocessando eventos...</span>
        <span class="text-sm text-muted-foreground">{{ Math.round(progress) }}%</span>
      </div>
      <Progress :model-value="progress" class="h-2" />
    </div>

    <!-- Last Result (após replay) -->
    <div 
      v-if="lastResult && !replaying" 
      class="px-4 py-3 bg-muted/30 flex items-center gap-4"
    >
      <span class="text-sm font-medium">Último reprocessamento:</span>
      <div class="flex items-center gap-3">
        <Badge variant="success" class="gap-1">
          <CheckCircle class="h-3 w-3" />
          {{ lastResult.success }} sucesso
        </Badge>
        <Badge v-if="lastResult.failed > 0" variant="destructive" class="gap-1">
          <XCircle class="h-3 w-3" />
          {{ lastResult.failed }} falha{{ lastResult.failed !== 1 ? 's' : '' }}
        </Badge>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="platforms.length > 1" class="px-4 py-2 border-b flex items-center gap-2">
      <Filter class="h-4 w-4 text-muted-foreground" />
      <span class="text-sm text-muted-foreground mr-2">Plataforma:</span>
      <Button
        v-for="platform in ['all', ...platforms]"
        :key="platform"
        variant="ghost"
        size="sm"
        class="h-7 px-2 text-xs"
        :class="{ 
          'bg-primary/10 text-primary': platform === 'all' ? !platformFilter : platformFilter === platform 
        }"
        @click="setFilter(platform === 'all' ? null : platform)"
      >
        {{ platform === 'all' ? 'Todas' : platformLabels[platform] || platform }}
      </Button>
    </div>

    <!-- Select All Header -->
    <div 
      v-if="filteredEvents.length > 0" 
      class="px-4 py-2 border-b bg-muted/20 flex items-center gap-3"
    >
      <button
        class="p-0.5 rounded hover:bg-muted transition-colors"
        @click="toggleSelectAll"
        :title="allSelected ? 'Desselecionar todos' : 'Selecionar todos'"
      >
        <CheckSquare 
          v-if="allSelected" 
          class="h-5 w-5 text-primary" 
        />
        <Square 
          v-else-if="someSelected"
          class="h-5 w-5 text-muted-foreground"
        />
        <Square 
          v-else 
          class="h-5 w-5 text-muted-foreground" 
        />
      </button>
      <span class="text-sm text-muted-foreground">
        {{ selectedCount > 0 
          ? `${selectedCount} selecionado${selectedCount !== 1 ? 's' : ''}` 
          : 'Selecionar eventos para reprocessar' 
        }}
      </span>
      <button
        v-if="selectedCount > 0"
        class="text-xs text-primary hover:underline ml-auto"
        @click="clearSelection"
      >
        Limpar seleção
      </button>
    </div>

    <!-- Events List -->
    <div class="divide-y">
      <div
        v-for="event in visibleEvents"
        :key="event.id"
        class="px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
        @click="toggleSelection(event.id)"
      >
        <!-- Checkbox -->
        <button
          class="p-0.5 rounded flex-shrink-0"
          @click.stop="toggleSelection(event.id)"
        >
          <CheckSquare 
            v-if="selectedIds.has(event.id)" 
            class="h-5 w-5 text-primary" 
          />
          <Square 
            v-else 
            class="h-5 w-5 text-muted-foreground" 
          />
        </button>

        <!-- Event Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="section-kicker">{{ event.eventName || event.type }}</span>
            <Badge variant="outline" size="sm">
              {{ platformLabels[event.platform || ''] || event.platform }}
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground mt-0.5 truncate">
            {{ truncateError(event.errorMessage) }}
          </p>
        </div>

        <!-- Date -->
        <span class="text-xs text-muted-foreground flex-shrink-0">
          {{ formatDate(event.createdAt) }}
        </span>

        <!-- View Details -->
        <Button
          variant="ghost"
          size="sm"
          class="h-7 px-2"
          @click.stop="handleViewDetails(event)"
        >
          Detalhes
        </Button>
      </div>

      <!-- Empty State -->
      <div 
        v-if="filteredEvents.length === 0" 
        class="px-4 py-8 text-center"
      >
        <CheckCircle class="h-10 w-10 text-green-500 mx-auto mb-3" />
        <p class="text-sm font-medium">Nenhum evento falhado</p>
        <p class="text-xs text-muted-foreground mt-1">
          {{ platformFilter 
            ? 'Nenhum evento falhado para esta plataforma' 
            : 'Todos os eventos foram processados com sucesso' 
          }}
        </p>
      </div>
    </div>

    <!-- Show More / Less Button -->
    <div v-if="hiddenCount > 0 || isExpanded" class="p-3 border-t">
      <Button
        variant="ghost"
        size="sm"
        class="w-full"
        @click="isExpanded = !isExpanded"
      >
        <template v-if="isExpanded">
          <ChevronUp class="h-4 w-4 mr-2" />
          Mostrar menos
        </template>
        <template v-else>
          <ChevronDown class="h-4 w-4 mr-2" />
          Mostrar mais {{ hiddenCount }} evento{{ hiddenCount !== 1 ? 's' : '' }}
        </template>
      </Button>
    </div>
  </div>
</template>
