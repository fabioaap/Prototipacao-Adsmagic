<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Plus, GripVertical, Edit, Trash2, CheckSquare, Square, X } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import { useStagesStore } from '@/stores/stages'
import type { Stage } from '@/types/models'
import { cn } from '@/lib/utils'

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
  stageEdit: [stage: Stage]
  stageDelete: [stage: Stage]
  stageAdd: []
  stageBulkDelete: [stageIds: string[]]
  selectionModeChange: [enabled: boolean]
  selectionAvailabilityChange: [enabled: boolean]
}>()

const stagesStore = useStagesStore()

// Estado local
const isDragging = ref(false)
const localStages = ref<Stage[]>([])
const selectedStages = ref<Set<string>>(new Set())
const selectionMode = ref(false)
const sortableInstance = ref<unknown>(null)

// Computed
const stages = computed(() => stagesStore.stages)

// Etapas que podem ser deletadas (normais, não padrão)
const deletableStages = computed(() => 
  localStages.value.filter(s => canDeleteStage(s))
)

// Todas selecionadas?
const allSelected = computed(() => 
  deletableStages.value.length > 0 && 
  deletableStages.value.every(s => selectedStages.value.has(s.id))
)

// Sincronizar localStages com stages quando mudar
watch(stages, (newStages) => {
  localStages.value = newStages.map((stage) => ({ ...stage }) as Stage)
  // Limpar seleções inválidas
  selectedStages.value = new Set(
    Array.from(selectedStages.value).filter(id => 
      newStages.some(s => s.id === id)
    )
  )
}, { immediate: true })

watch(selectionMode, (enabled) => {
  emit('selectionModeChange', enabled)
}, { immediate: true })

watch(deletableStages, (items) => {
  emit('selectionAvailabilityChange', items.length > 0)
}, { immediate: true })

// Handlers
const handleAddStage = () => {
  emit('stageAdd')
}

const handleEditStage = (stage: Stage) => {
  emit('stageEdit', stage)
}

// Toggle modo de seleção
const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedStages.value = new Set()
  }
}

// Selecionar/deselecionar etapa
const toggleStageSelection = (stageId: string) => {
  if (selectedStages.value.has(stageId)) {
    selectedStages.value.delete(stageId)
  } else {
    selectedStages.value.add(stageId)
  }
  selectedStages.value = new Set(selectedStages.value)
}

// Selecionar todas as etapas deletáveis
const selectAll = () => {
  deletableStages.value.forEach(s => selectedStages.value.add(s.id))
  selectedStages.value = new Set(selectedStages.value)
}

// Deselecionar todas
const deselectAll = () => {
  selectedStages.value = new Set()
}

// Bulk delete
const handleBulkDelete = () => {
  if (selectedStages.value.size > 0) {
    emit('stageBulkDelete', Array.from(selectedStages.value))
    selectedStages.value = new Set()
    selectionMode.value = false
  }
}

const handleDeleteStage = (stage: Stage) => {
  emit('stageDelete', stage)
}

const handleStageReorder = async () => {
  try {
    // Update order in store usando localStages
    await stagesStore.reorderStages(localStages.value.map(stage => stage.id))
  } catch (error) {
    console.error('Erro ao reordenar etapas:', error)
    // TODO: Show toast error
    // Reverter para o estado anterior em caso de erro
    localStages.value = stages.value.map((stage) => structuredClone(stage) as Stage)
  }
}

// Inicializar SortableJS para drag-and-drop
const initializeSortable = async () => {
  await nextTick()

  const container = document.querySelector('.stages-sortable-container')
  if (!container || props.loading) return

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
          const [movedItem] = localStages.value.splice(evt.oldIndex, 1)
          if (movedItem) {
            localStages.value.splice(evt.newIndex, 0, movedItem)
            // Persistir nova ordem
            await handleStageReorder()
          }
        }
      }
    })
  } catch (error) {
    console.error('[StagesList] Erro ao inicializar SortableJS:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  initializeSortable()
})

watch(stages, async () => {
  await nextTick()
  initializeSortable()
})

onUnmounted(() => {
  if (sortableInstance.value) {
    (sortableInstance.value as { destroy: () => void }).destroy()
  }
})

// Get stage type badge
const getStageTypeBadge = (type: Stage['type']) => {
  switch (type) {
    case 'normal':
      return { variant: 'secondary' as const, label: 'Normal' }
    case 'sale':
      return { variant: 'success' as const, label: 'Venda' }
    case 'lost':
      return { variant: 'destructive' as const, label: 'Perdida' }
    default:
      return { variant: 'secondary' as const, label: 'Normal' }
  }
}

// Check if stage can be deleted
function canDeleteStage(stage: Stage) {
  // Cannot delete "Contato iniciado" stage
  if (stage.name.toLowerCase().includes('iniciado')) {
    return false
  }
  // Cannot delete sale or lost stages
  if (stage.type === 'sale' || stage.type === 'lost') {
    return false
  }
  // For now, allow deletion of normal stages
  return true
}

const getActiveRouteCount = (stage: Stage): number => {
  const eventConfig = stage.eventConfig as Record<string, unknown> | undefined
  if (!eventConfig) return 0

  const routes = eventConfig.routes
  if (!Array.isArray(routes)) return 0

  return routes.filter((route) => {
    if (typeof route !== 'object' || route === null) return false
    const maybeIsActive = (route as Record<string, unknown>).isActive
    return maybeIsActive === undefined ? true : maybeIsActive === true
  }).length
}

defineExpose({
  toggleSelectionMode,
})

</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        <h3 class="section-title-sm whitespace-nowrap">Etapas do Funil</h3>
        <p class="truncate whitespace-nowrap text-sm text-muted-foreground">
          Organize as etapas do seu funil de vendas. Arraste para reordenar.
        </p>
      </div>
      <div v-if="props.showHeaderActions" class="flex items-center gap-2 shrink-0">
        <Button 
          variant="outline" 
          size="sm"
          @click="toggleSelectionMode"
          :disabled="deletableStages.length === 0"
        >
          <component :is="selectionMode ? X : CheckSquare" class="h-4 w-4" />
          {{ selectionMode ? 'Cancelar' : 'Selecionar' }}
        </Button>
        <Button size="sm" @click="handleAddStage">
          <Plus class="h-4 w-4" />
          Nova etapa
        </Button>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div 
      v-if="selectionMode && selectedStages.size > 0" 
      class="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
    >
      <div class="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          @click="allSelected ? deselectAll() : selectAll()"
        >
          <component :is="allSelected ? CheckSquare : Square" class="h-4 w-4" />
          {{ allSelected ? 'Desmarcar todos' : 'Selecionar todos' }}
        </Button>
        <span class="text-sm text-muted-foreground">
          {{ selectedStages.size }} selecionada{{ selectedStages.size !== 1 ? 's' : '' }}
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
          <p class="mb-1 font-medium leading-none tracking-tight">Regras importantes:</p>
          <ul class="list-disc list-inside space-y-1 text-xs opacity-90">
            <li>Apenas 1 etapa pode ser marcada como "Venda"</li>
            <li>Apenas 1 etapa pode ser marcada como "Perdida"</li>
            <li>A etapa "Contato iniciado" não pode ser excluída</li>
            <li>Etapas com contatos não podem ser excluídas</li>
          </ul>
        </div>
      </div>
    </Alert>

    <!-- Loading State -->
    <div v-if="props.loading" class="space-y-3">
      <div
        v-for="i in 3"
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
    <div v-else-if="stages.length === 0" class="text-center py-12">
      <div class="flex flex-col items-center">
        <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <GripVertical class="h-6 w-6 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground mb-2">Nenhuma etapa configurada</p>
        <p class="text-sm text-muted-foreground mb-4">
          Comece criando a primeira etapa do seu funil
        </p>
        <Button @click="handleAddStage">
          <Plus class="h-4 w-4" />
          Criar Primeira Etapa
        </Button>
      </div>
    </div>

    <!-- Stages List -->
    <div v-else class="space-y-2">
      <div class="stages-sortable-container space-y-2">
        <div
          v-for="stage in localStages"
          :key="stage.id"
          :data-stage-id="stage.id"
          data-testid="stage-item"
          :class="cn(
            'group flex items-center gap-3 p-4 border border-border rounded-lg transition-all',
            'hover:shadow-md hover:border-primary/20',
            isDragging && 'shadow-lg border-primary/30',
            selectionMode && selectedStages.has(stage.id) && 'border-primary bg-primary/5'
          )"
        >
          <!-- Checkbox (modo seleção) -->
          <Checkbox
            v-if="selectionMode && canDeleteStage(stage)"
            :model-value="selectedStages.has(stage.id)"
            @update:model-value="toggleStageSelection(stage.id)"
            class="shrink-0"
          />

          <!-- Drag Handle -->
          <div class="drag-handle cursor-grab active:cursor-grabbing">
            <GripVertical class="h-5 w-5 text-muted-foreground" />
          </div>

          <!-- Stage Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <h4 class="section-kicker truncate">
                {{ stage.name }}
              </h4>
              <Badge :variant="getStageTypeBadge(stage.type).variant">
                {{ getStageTypeBadge(stage.type).label }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground">
              Etapa {{ stage.type === 'normal' ? 'normal' : stage.type === 'sale' ? 'de venda' : 'perdida' }}
              <span v-if="stage.trackingPhrase"> • Rastreamento: "{{ stage.trackingPhrase }}"</span>
              <span v-if="getActiveRouteCount(stage) > 0">
                • {{ getActiveRouteCount(stage) }} regra(s) de evento ativa(s)
              </span>
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              @click="handleEditStage(stage)"
            >
              <Edit class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              :disabled="!canDeleteStage(stage)"
              @click="handleDeleteStage(stage)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="text-xs text-muted-foreground text-center pt-4 border-t border-border">
      <p>
        Arraste as etapas para reordenar • 
        <span class="font-medium">{{ stages.length }}</span> etapas configuradas
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Drag and drop styles */
.sortable-ghost {
  opacity: 0.5;
}

.sortable-chosen {
  transform: scale(1.02);
}
</style>
