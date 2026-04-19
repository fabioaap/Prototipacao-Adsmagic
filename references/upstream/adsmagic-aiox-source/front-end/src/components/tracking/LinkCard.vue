<script setup lang="ts">
import { computed, ref } from 'vue'
import { ExternalLink, Copy, Eye, BarChart3, Calendar, Link as LinkIcon, RefreshCw, Check } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { Link } from '@/types/models'
import { useFormat } from '@/composables/useFormat'
import { cn } from '@/lib/utils'

interface Props {
  /**
   * Link de rastreamento a ser exibido
   */
  link: Link
  /**
   * Se true, mostra botões de ação
   */
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

const emit = defineEmits<{
  view: [link: Link]
  edit: [link: Link]
  delete: [link: Link]
  copy: [link: Link]
  regenerateShortUrl: [link: Link]
}>()

const { formatDate, formatNumber } = useFormat()

// State
const copiedShortUrl = ref(false)
const copiedTrackingUrl = ref(false)

// Computed
const statusVariant = computed(() => {
  return props.link.isActive ? 'success' : 'secondary'
})

const statusLabel = computed(() => {
  return props.link.isActive ? 'Ativo' : 'Inativo'
})

const conversionRate = computed(() => {
  if (props.link.stats.clicks === 0) return 0
  return (props.link.stats.sales / props.link.stats.clicks) * 100
})

// Handlers
const handleView = () => {
  emit('view', props.link)
}

const handleEdit = () => {
  emit('edit', props.link)
}

const handleDelete = () => {
  emit('delete', props.link)
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.link.shortUrl || props.link.trackingUrl || '')
    emit('copy', props.link)
  } catch (error) {
    console.error('Erro ao copiar link:', error)
  }
}

const handleCopyShortUrl = async (e: Event) => {
  e.stopPropagation()
  try {
    await navigator.clipboard.writeText(props.link.shortUrl || '')
    copiedShortUrl.value = true
    setTimeout(() => {
      copiedShortUrl.value = false
    }, 2000)
  } catch (error) {
    console.error('Erro ao copiar short URL:', error)
  }
}

const handleCopyTrackingUrl = async (e: Event) => {
  e.stopPropagation()
  try {
    await navigator.clipboard.writeText(props.link.trackingUrl || '')
    copiedTrackingUrl.value = true
    setTimeout(() => {
      copiedTrackingUrl.value = false
    }, 2000)
  } catch (error) {
    console.error('Erro ao copiar tracking URL:', error)
  }
}

const handleRegenerateShortUrl = (e: Event) => {
  e.stopPropagation()
  emit('regenerateShortUrl', props.link)
}

// Format clicks
const formatClicks = (clicks: number) => {
  if (clicks >= 1000) {
    return `${(clicks / 1000).toFixed(1)}k`
  }
  return clicks.toString()
}
</script>

<template>
  <div
    :class="cn(
      'group relative rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md',
      'cursor-pointer'
    )"
    @click="handleView"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ExternalLink class="h-5 w-5 text-primary" />
        </div>

        <div class="flex-1 min-w-0">
          <h4 class="section-kicker truncate mb-1">
            {{ props.link.name }}
          </h4>
          <p class="text-xs text-muted-foreground truncate">
            {{ props.link.shortUrl }}
          </p>
        </div>
      </div>

      <Badge :variant="statusVariant">
        {{ statusLabel }}
      </Badge>
    </div>

    <!-- URL Info -->
    <div class="mb-4 space-y-2">
      <!-- Short URL (se existir) -->
      <div 
        v-if="props.link.shortUrl"
        class="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded text-xs"
      >
        <LinkIcon class="h-3 w-3 text-primary flex-shrink-0" />
        <span class="truncate font-medium text-primary">{{ props.link.shortUrl }}</span>
        <div class="flex items-center gap-1 ml-auto flex-shrink-0">
          <button
            type="button"
            class="p-1 rounded hover:bg-primary/10 transition-colors"
            title="Copiar short URL"
            @click="handleCopyShortUrl"
          >
            <Check v-if="copiedShortUrl" class="h-3 w-3 text-green-500" />
            <Copy v-else class="h-3 w-3 text-primary" />
          </button>
          <button
            type="button"
            class="p-1 rounded hover:bg-primary/10 transition-colors"
            title="Regenerar short URL"
            @click="handleRegenerateShortUrl"
          >
            <RefreshCw class="h-3 w-3 text-primary" />
          </button>
        </div>
      </div>
      
      <!-- Tracking URL completa -->
      <div class="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
        <ExternalLink class="h-3 w-3 text-muted-foreground flex-shrink-0" />
        <span class="truncate">{{ props.link.trackingUrl || props.link.url }}</span>
        <button
          type="button"
          class="p-1 rounded hover:bg-muted transition-colors ml-auto flex-shrink-0"
          title="Copiar URL completa"
          @click="handleCopyTrackingUrl"
        >
          <Check v-if="copiedTrackingUrl" class="h-3 w-3 text-green-500" />
          <Copy v-else class="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <!-- Clicks -->
      <div class="text-center">
        <div class="flex items-center justify-center gap-1 mb-1">
          <Eye class="h-3 w-3 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">Cliques</span>
        </div>
        <p class="section-kicker">
          {{ formatClicks(props.link.stats.clicks) }}
        </p>
      </div>

      <!-- Conversions -->
      <div class="text-center">
        <div class="flex items-center justify-center gap-1 mb-1">
          <BarChart3 class="h-3 w-3 text-muted-foreground" />
          <span class="text-xs text-muted-foreground">Conversões</span>
        </div>
        <p class="section-kicker">
          {{ formatNumber(props.link.stats.sales) }}
        </p>
      </div>

      <!-- Rate -->
      <div class="text-center">
        <div class="flex items-center justify-center gap-1 mb-1">
          <span class="text-xs text-muted-foreground">Taxa</span>
        </div>
        <p class="section-kicker">
          {{ conversionRate.toFixed(1) }}%
        </p>
      </div>
    </div>

    <!-- Metadata -->
    <div class="space-y-2 mb-4">
      <!-- Created Date -->
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar class="h-3 w-3" />
        <span>Criado em {{ formatDate(props.link.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</span>
      </div>

      <!-- UTM Parameters -->
      <div v-if="props.link.utmSource || props.link.utmMedium || props.link.utmCampaign" class="text-xs text-muted-foreground">
        <span v-if="props.link.utmSource">Source: {{ props.link.utmSource }}</span>
        <span v-if="props.link.utmMedium"> • Medium: {{ props.link.utmMedium }}</span>
        <span v-if="props.link.utmCampaign"> • Campaign: {{ props.link.utmCampaign }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div
      v-if="props.showActions"
      class="flex items-center gap-2 pt-4 border-t border-border"
      @click.stop
    >
      <Button
        variant="ghost"
        size="sm"
        class="flex-1"
        @click="handleCopy"
      >
        <Copy class="h-4 w-4 mr-2" />
        Copiar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        @click="handleEdit"
      >
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        @click="handleDelete"
      >
        Excluir
      </Button>
    </div>
  </div>
</template>
