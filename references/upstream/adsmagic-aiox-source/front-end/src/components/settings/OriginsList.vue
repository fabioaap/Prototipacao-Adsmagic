<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Plus, Edit, Trash2, Globe, CheckSquare, Square, X, GripVertical } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import { useOriginsStore } from '@/stores/origins'
import type { Origin } from '@/types/models'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast/use-toast'

interface Props {
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
  showHeaderActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showHeaderActions: true,
})

const emit = defineEmits<{
  originEdit: [origin: Origin]
  originDelete: [origin: Origin]
  originAdd: []
  originBulkDelete: [originIds: string[]]
  selectionModeChange: [isEnabled: boolean]
  selectionAvailabilityChange: [isAvailable: boolean]
}>()

const originsStore = useOriginsStore()
const { toast } = useToast()

// Estado local
const selectedOrigins = ref<Set<string>>(new Set())
const selectionMode = ref(false)
const isDragging = ref(false)
const localCustomOrigins = ref<Origin[]>([])
const sortableInstance = ref<unknown>(null)

// Computed
const origins = computed(() => originsStore.origins)
const systemOrigins = computed(() => origins.value.filter(o => o.type === 'system'))
const customOrigins = computed(() => origins.value.filter(o => o.type === 'custom'))

watch(selectionMode, (isEnabled) => {
  emit('selectionModeChange', isEnabled)
}, { immediate: true })

watch(customOrigins, (items) => {
  emit('selectionAvailabilityChange', items.length > 0)
}, { immediate: true })

// Sincronizar localCustomOrigins com customOrigins quando mudar
watch(customOrigins, (newCustomOrigins) => {
  localCustomOrigins.value = [...newCustomOrigins]
  // Limpar seleções inválidas
  selectedOrigins.value = new Set(
    Array.from(selectedOrigins.value).filter(id => 
      newCustomOrigins.some(o => o.id === id)
    )
  )
}, { immediate: true })

// Todas custom selecionadas?
const allSelected = computed(() => 
  customOrigins.value.length > 0 && 
  customOrigins.value.every(o => selectedOrigins.value.has(o.id))
)

// Handlers
const handleAddOrigin = () => {
  emit('originAdd')
}

const handleEditOrigin = (origin: Origin) => {
  emit('originEdit', origin)
}

const handleDeleteOrigin = (origin: Origin) => {
  emit('originDelete', origin)
}

const handleOriginReorder = async () => {
  try {
    // Atualiza ordem no store usando localCustomOrigins
    await originsStore.reorderOrigins(localCustomOrigins.value.map(origin => origin.id))
  } catch (error) {
    console.error('Erro ao reordenar origens:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível reordenar as origens.',
      variant: 'destructive'
    })
    // Reverter para o estado anterior em caso de erro
    localCustomOrigins.value = [...customOrigins.value]
  }
}

// Inicializar SortableJS para drag-and-drop
const initializeSortable = async () => {
  await nextTick()

  const container = document.querySelector('.origins-sortable-container')
  if (!container || props.loading || selectionMode.value) return

  try {
    const { default: Sortable } = await import('sortablejs')

    // Destruir instância anterior se existir
    if (sortableInstance.value) {
      (sortableInstance.value as { destroy: () => void }).destroy()
    }

    sortableInstance.value = Sortable.create(container as HTMLElement, {
      handle: '.drag-handle',
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',

      onStart: () => {
        isDragging.value = true
      },

      onEnd: async (evt: { oldIndex?: number; newIndex?: number }) => {
        isDragging.value = false

        if (evt.oldIndex !== undefined && evt.newIndex !== undefined && evt.oldIndex !== evt.newIndex) {
          // Atualizar array local
          const [movedItem] = localCustomOrigins.value.splice(evt.oldIndex, 1)
          if (movedItem) {
            localCustomOrigins.value.splice(evt.newIndex, 0, movedItem)
            // Persistir nova ordem
            await handleOriginReorder()
          }
        }
      }
    })
  } catch (error) {
    console.error('[OriginsList] Erro ao inicializar SortableJS:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  initializeSortable()
})

watch(customOrigins, async () => {
  await nextTick()
  initializeSortable()
})

watch(selectionMode, async (isSelectionMode) => {
  if (!isSelectionMode) {
    await nextTick()
    initializeSortable()
  } else if (sortableInstance.value) {
    // Destruir sortable quando entrar no modo de seleção
    (sortableInstance.value as { destroy: () => void }).destroy()
    sortableInstance.value = null
  }
})

onUnmounted(() => {
  if (sortableInstance.value) {
    (sortableInstance.value as { destroy: () => void }).destroy()
  }
})

// Toggle modo de seleção
const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedOrigins.value = new Set()
  }
}

defineExpose({
  toggleSelectionMode,
})

// Selecionar/deselecionar origem
const toggleOriginSelection = (originId: string) => {
  if (selectedOrigins.value.has(originId)) {
    selectedOrigins.value.delete(originId)
  } else {
    selectedOrigins.value.add(originId)
  }
  selectedOrigins.value = new Set(selectedOrigins.value)
}

// Selecionar todas
const selectAll = () => {
  customOrigins.value.forEach(o => selectedOrigins.value.add(o.id))
  selectedOrigins.value = new Set(selectedOrigins.value)
}

// Deselecionar todas
const deselectAll = () => {
  selectedOrigins.value = new Set()
}

// Bulk delete
const handleBulkDelete = () => {
  if (selectedOrigins.value.size > 0) {
    emit('originBulkDelete', Array.from(selectedOrigins.value))
    selectedOrigins.value = new Set()
    selectionMode.value = false
  }
}

// Get origin badge variant
const getOriginBadgeVariant = (origin: Origin) => {
  if (origin.type === 'system') return 'secondary'
  return 'default'
}

</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        <h3 class="section-title-sm whitespace-nowrap">Origens de Contatos</h3>
        <p class="truncate whitespace-nowrap text-sm text-muted-foreground">
          Gerencie as origens dos seus contatos e leads
        </p>
      </div>
      <div v-if="props.showHeaderActions" class="flex items-center gap-2 shrink-0">
        <Button 
          variant="outline" 
          size="sm"
          @click="toggleSelectionMode"
          :disabled="customOrigins.length === 0"
        >
          <component :is="selectionMode ? X : CheckSquare" class="h-4 w-4" />
          {{ selectionMode ? 'Cancelar' : 'Selecionar' }}
        </Button>
        <Button size="sm" @click="handleAddOrigin">
          <Plus class="h-4 w-4" />
          Nova origem
        </Button>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div 
      v-if="selectionMode && selectedOrigins.size > 0" 
      class="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
    >
      <div class="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          @click="allSelected ? deselectAll() : selectAll()"
        >
          <component :is="allSelected ? CheckSquare : Square" class="h-4 w-4" />
          {{ allSelected ? 'Desmarcar todas' : 'Selecionar todas' }}
        </Button>
        <span class="text-sm text-muted-foreground">
          {{ selectedOrigins.size }} selecionada{{ selectedOrigins.size !== 1 ? 's' : '' }}
        </span>
      </div>
      <Button 
        variant="destructive" 
        size="sm"
        @click="handleBulkDelete"
      >
        <Trash2 class="h-4 w-4" />
        Excluir selecionadas
      </Button>
    </div>

    <!-- Rules Alert -->
    <Alert variant="info" :icon="false">
      <div class="flex items-start gap-3 text-sm">
        <div class="mt-0.5 shrink-0 text-info">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <div>
          <p class="mb-1 font-medium leading-none tracking-tight">Informações importantes:</p>
          <ul class="list-disc list-inside space-y-1 text-xs opacity-90">
            <li>Origens do sistema não podem ser removidas</li>
            <li>Máximo de 20 origens customizadas</li>
            <li>Origens são usadas para análise e filtros</li>
          </ul>
        </div>
      </div>
    </Alert>

    <!-- Loading State -->
    <div v-if="props.loading" class="space-y-4">
      <div
        v-for="i in 4"
        :key="i"
        class="flex items-center gap-3 p-4 border border-border rounded-lg"
      >
        <div class="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-32 bg-muted animate-pulse rounded" />
          <div class="h-3 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div class="h-8 w-16 bg-muted animate-pulse rounded" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="origins.length === 0" class="text-center py-12">
      <div class="flex flex-col items-center">
        <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Globe class="h-6 w-6 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground mb-2">Nenhuma origem configurada</p>
        <p class="text-sm text-muted-foreground mb-4">
          Comece criando a primeira origem customizada
        </p>
        <Button @click="handleAddOrigin">
          <Plus class="h-4 w-4" />
          Criar Primeira Origem
        </Button>
      </div>
    </div>

    <!-- Origins List -->
    <div v-else class="space-y-6">
      <!-- System Origins -->
      <div v-if="systemOrigins.length > 0" class="space-y-3">
        <h4 class="section-kicker">Origens do Sistema</h4>
        <div class="space-y-2">
          <div
            v-for="origin in systemOrigins"
            :key="origin.id"
            class="group flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/20"
          >
            <!-- Icon -->
            <div
              :class="cn(
                'h-10 w-10 rounded-full flex items-center justify-center',
                'bg-primary/10 text-primary'
              )"
            >
              <Globe class="h-5 w-5" />
            </div>

            <!-- Origin Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h4 class="section-kicker truncate">
                  {{ origin.name }}
                </h4>
                <Badge :variant="getOriginBadgeVariant(origin)">
                  Sistema
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">
                0 contatos
              </p>
            </div>

            <!-- System Badge -->
            <div class="text-xs text-muted-foreground">
              Não editável
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Origins -->
      <div v-if="customOrigins.length > 0" class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="section-kicker">
            Origens Customizadas
          </h4>
          <span class="text-xs text-muted-foreground">
            {{ customOrigins.length }}/20
          </span>
        </div>
        <div class="origins-sortable-container space-y-2">
          <div
            v-for="origin in localCustomOrigins"
            :key="origin.id"
            :data-origin-id="origin.id"
            :class="cn(
              'group flex items-center gap-3 p-4 border border-border rounded-lg transition-all hover:shadow-md hover:border-primary/20',
              isDragging && 'shadow-lg border-primary/30',
              selectionMode && selectedOrigins.has(origin.id) && 'border-primary bg-primary/5'
            )"
          >
            <!-- Checkbox (modo seleção) -->
            <Checkbox
              v-if="selectionMode"
              :model-value="selectedOrigins.has(origin.id)"
              @update:model-value="toggleOriginSelection(origin.id)"
              class="shrink-0"
            />

            <!-- Drag Handle -->
            <div
              v-if="!selectionMode"
              class="drag-handle cursor-grab active:cursor-grabbing"
            >
              <GripVertical class="h-5 w-5 text-muted-foreground" />
            </div>

            <!-- Icon -->
            <div
              :class="cn(
                'h-10 w-10 rounded-full flex items-center justify-center',
                'bg-secondary text-secondary-foreground'
              )"
              :style="{ backgroundColor: origin.color + '20', color: origin.color }"
            >
              <Globe class="h-5 w-5" />
            </div>

            <!-- Origin Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h4 class="section-kicker truncate">
                  {{ origin.name }}
                </h4>
                <Badge :variant="getOriginBadgeVariant(origin)">
                  Customizada
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">
                0 contatos
              </p>
              <p
                v-if="origin.utmSourceMatchMode && origin.utmSourceMatchValue"
                class="text-[11px] text-muted-foreground mt-1"
              >
                Regra UTM Source: {{ origin.utmSourceMatchMode === 'contains' ? 'contém' : 'exato' }}
                = {{ origin.utmSourceMatchValue }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                @click="handleEditOrigin(origin)"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="handleDeleteOrigin(origin)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="text-xs text-muted-foreground text-center pt-4 border-t border-border">
      <p>
        <span class="font-medium">{{ origins.length }}</span> origens configuradas
        <span v-if="customOrigins.length > 0">
          • {{ customOrigins.length }} customizadas
        </span>
      </p>
    </div>
  </div>
</template>
