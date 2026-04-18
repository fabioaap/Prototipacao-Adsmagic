<template>
  <Modal :model-value="open" @update:model-value="emit('update:open', $event)">
    <template #content>
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="section-title-sm">Filtros Avançados</h2>
            <p class="text-sm text-muted-foreground">
              Filtre eventos por tipo, plataforma, status e período
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            @click="emit('update:open', false)"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>

        <form @submit.prevent="handleApply" class="space-y-6">
          <!-- Busca por Texto (G8.4) -->
          <div class="space-y-3">
            <Label class="text-sm font-medium">Buscar no Payload</Label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="localFilters.search"
                type="text"
                placeholder="Buscar por nome, ID, mensagem, payload..."
                class="pl-10"
              />
            </div>
            <p class="text-xs text-muted-foreground">
              Busque por qualquer texto no evento, incluindo dados do payload
            </p>
          </div>

          <!-- Tipo de Evento -->
          <div class="space-y-3">
            <Label class="text-sm font-medium">Tipo de Evento</Label>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="type in eventTypes"
                :key="type.value"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="localFilters.types"
                  :value="type.value"
                  type="checkbox"
                  class="rounded border-border"
                />
                <span class="text-sm">{{ type.label }}</span>
              </label>
            </div>
          </div>

          <!-- Plataforma -->
          <div class="space-y-3">
            <Label class="text-sm font-medium">Plataforma</Label>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="platform in platforms"
                :key="platform.value"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="localFilters.platforms"
                  :value="platform.value"
                  type="checkbox"
                  class="rounded border-border"
                />
                <span class="text-sm">{{ platform.label }}</span>
              </label>
            </div>
          </div>

          <!-- Status -->
          <div class="space-y-3">
            <Label class="text-sm font-medium">Status</Label>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="status in statuses"
                :key="status.value"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="localFilters.statuses"
                  :value="status.value"
                  type="checkbox"
                  class="rounded border-border"
                />
                <span class="text-sm">{{ status.label }}</span>
              </label>
            </div>
          </div>

          <!-- Tipo de Entidade -->
          <div class="space-y-3">
            <Label class="text-sm font-medium">Tipo de Entidade</Label>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="entity in entityTypes"
                :key="entity.value"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="localFilters.entityTypes"
                  :value="entity.value"
                  type="checkbox"
                  class="rounded border-border"
                />
                <span class="text-sm">{{ entity.label }}</span>
              </label>
            </div>
          </div>

          <!-- Período -->
          <div class="space-y-3">
            <Label class="text-sm font-medium">Período</Label>
            <DateRangePicker
              :model-value="dateRange"
              :show-presets="true"
              @change="handleDateRangeChange"
            />
          </div>

          <!-- Preview de Filtros Ativos -->
          <div v-if="hasActiveFilters" class="space-y-3">
            <Label class="text-sm font-medium">Filtros Ativos</Label>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="filter in activeFiltersPreview"
                :key="filter"
                variant="secondary"
                class="text-xs"
              >
                {{ filter }}
              </Badge>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              @click="handleClear"
            >
              Limpar Filtros
            </Button>
            <div class="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                @click="emit('update:open', false)"
              >
                Cancelar
              </Button>
              <Button type="submit">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </form>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Search } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import type { EventFilters } from '@/types/api'

interface Props {
  /**
   * Se true, modal está aberto
   */
  open: boolean
  /**
   * Filtros atuais
   */
  filters: EventFilters
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  apply: [filters: EventFilters]
  clear: []
}>()

// ============================================================================
// STATE
// ============================================================================

const localFilters = ref<EventFilters>({
  search: '',
  types: [],
  platforms: [],
  statuses: [],
  entityTypes: [],
  dateFrom: '',
  dateTo: ''
})

// ============================================================================
// CONSTANTS
// ============================================================================

const eventTypes = [
  { value: 'contact_created', label: 'Contato Criado' },
  { value: 'contact_updated', label: 'Contato Atualizado' },
  { value: 'stage_changed', label: 'Etapa Alterada' },
  { value: 'sale_completed', label: 'Venda Concluída' },
  { value: 'sale_lost', label: 'Venda Perdida' },
  { value: 'link_clicked', label: 'Link Clicado' },
  { value: 'message_sent', label: 'Mensagem Enviada' },
  { value: 'integration_sync', label: 'Sincronização' }
]

const platforms = [
  { value: 'meta', label: 'Meta' },
  { value: 'google', label: 'Google' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'system', label: 'Sistema' }
]

const statuses = [
  { value: 'success', label: 'Sucesso' },
  { value: 'pending', label: 'Pendente' },
  { value: 'failed', label: 'Falhou' },
  { value: 'info', label: 'Info' }
]

const entityTypes = [
  { value: 'contact', label: 'Contato' },
  { value: 'sale', label: 'Venda' },
  { value: 'stage', label: 'Etapa' },
  { value: 'link', label: 'Link' },
  { value: 'message', label: 'Mensagem' }
]

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Verifica se há filtros ativos
 */
const hasActiveFilters = computed(() => {
  return !!(
    localFilters.value.search ||
    localFilters.value.types?.length ||
    localFilters.value.platforms?.length ||
    localFilters.value.statuses?.length ||
    localFilters.value.entityTypes?.length ||
    localFilters.value.dateFrom ||
    localFilters.value.dateTo
  )
})

/**
 * Preview dos filtros ativos
 */
const activeFiltersPreview = computed(() => {
  const preview: string[] = []

  if (localFilters.value.search) {
    preview.push(`Busca: "${localFilters.value.search}"`)
  }
  if (localFilters.value.types?.length) {
    preview.push(`${localFilters.value.types.length} tipo(s)`)
  }
  if (localFilters.value.platforms?.length) {
    preview.push(`${localFilters.value.platforms.length} plataforma(s)`)
  }
  if (localFilters.value.statuses?.length) {
    preview.push(`${localFilters.value.statuses.length} status`)
  }
  if (localFilters.value.entityTypes?.length) {
    preview.push(`${localFilters.value.entityTypes.length} entidade(s)`)
  }
  if (localFilters.value.dateFrom) {
    preview.push(`De: ${localFilters.value.dateFrom}`)
  }
  if (localFilters.value.dateTo) {
    preview.push(`Até: ${localFilters.value.dateTo}`)
  }

  return preview
})

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Sincroniza filtros externos com locais
 */
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = {
      search: newFilters.search || '',
      types: newFilters.types || [],
      platforms: newFilters.platforms || [],
      statuses: newFilters.statuses || [],
      entityTypes: newFilters.entityTypes || [],
      dateFrom: newFilters.dateFrom || '',
      dateTo: newFilters.dateTo || ''
    }
  },
  { immediate: true, deep: true }
)

// ============================================================================
// DATE RANGE
// ============================================================================

const dateRange = computed(() => {
  if (localFilters.value.dateFrom && localFilters.value.dateTo) {
    return {
      start: new Date(localFilters.value.dateFrom),
      end: new Date(localFilters.value.dateTo)
    }
  }
  return undefined
})

function handleDateRangeChange(range: { start: Date; end: Date }) {
  localFilters.value.dateFrom = range.start.toISOString().split('T')[0]
  localFilters.value.dateTo = range.end.toISOString().split('T')[0]
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleApply = () => {
  emit('apply', { ...localFilters.value })
  emit('update:open', false)
}

const handleClear = () => {
  localFilters.value = {
    search: '',
    types: [],
    platforms: [],
    statuses: [],
    entityTypes: [],
    dateFrom: '',
    dateTo: ''
  }
  emit('clear')
}
</script>
