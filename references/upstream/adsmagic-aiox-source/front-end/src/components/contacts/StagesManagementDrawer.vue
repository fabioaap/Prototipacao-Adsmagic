<script setup lang="ts">
import { ref, computed, /* onMounted, */ watch, nextTick } from 'vue'
import { X, Plus, Trash2, GripVertical, Save, Settings } from 'lucide-vue-next'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import { useStagesStore } from '@/stores/stages'
import { useToast } from '@/components/ui/toast/use-toast'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { Stage } from '@/types/models'
// import { cn } from '@/lib/utils' // Temporariamente não utilizado

interface Props {
  /**
   * Controla a abertura do drawer
   */
  open: boolean
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'stages-updated': []
}>()

const stagesStore = useStagesStore()
const { toast } = useToast()
const confirmDialog = useConfirmDialog()

// Estado local
const loading = ref(false)
const localStages = ref<Array<Partial<Stage> & { tempId?: string }>>([])

// Computed
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// Carregar stages do store
const loadStages = () => {
  localStages.value = stagesStore.stages.map((stage) => (
    ({ ...stage }) as Partial<Stage> & { tempId?: string }
  ))
}

const isSystemStage = (stage: Partial<Stage> & { tempId?: string }): boolean => {
  return Boolean(stage.id && !stage.tempId && !stage.projectId)
}

// Watch para carregar quando abrir
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    loadStages()
    await nextTick()
    await initializeSortable()
  }
})

// Adicionar nova etapa
const addStage = () => {
  const tempId = `temp-${Date.now()}`
  localStages.value.push({
    tempId,
    name: '',
    trackingPhrase: '',
    type: 'normal',
    order: localStages.value.length,
  })
}

// Remover etapa
const removeStage = async (index: number) => {
  const stage = localStages.value[index]

  if (stage && isSystemStage(stage)) {
    toast({
      title: 'Etapa protegida',
      description: 'Etapas padrão do sistema não podem ser removidas.',
      variant: 'destructive',
    })
    return
  }
  
  if (stage?.id && stagesStore.stages.find(s => s.id === stage.id)) {
    // Se é uma stage existente, confirmar antes de remover
    const confirmed = await confirmDialog.confirm({
      title: 'Remover Etapa',
      description: `Tem certeza que deseja remover a etapa "${stage?.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      variant: 'destructive'
    })
    
    if (!confirmed) {
      return
    }
  }
  
  localStages.value.splice(index, 1)
  // Reordenar
  localStages.value.forEach((stage, idx) => {
    stage.order = idx
  })
}

// Inicializar SortableJS para drag and drop
const initializeSortable = async () => {
  await nextTick()
  
  try {
    console.log('[StagesDrawer] Carregando SortableJS...')
    const { default: Sortable } = await import('sortablejs')
    
    const container = document.querySelector('.stages-sortable-container')
    if (!container) {
      console.log('[StagesDrawer] Container não encontrado')
      return
    }
    
    console.log('[StagesDrawer] Inicializando SortableJS...')
    
    Sortable.create(container as HTMLElement, {
      handle: '.stage-drag-handle',
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      
      onStart: (_evt) => {
        // Adicionar feedback visual durante o drag
        container.classList.add('dragging')
      },
      
      onEnd: (evt) => {
        // Remover feedback visual
        container.classList.remove('dragging')

        const draggedIsSystem = evt.item?.getAttribute('data-system-stage') === 'true'
        if (draggedIsSystem) {
          return
        }
        
        const { oldIndex, newIndex } = evt
        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
          console.log('[StagesDrawer] Movendo stage de', oldIndex, 'para', newIndex)
          
          // Reordenar array local
          const item = localStages.value[oldIndex]
          localStages.value.splice(oldIndex, 1)
          if (item) localStages.value.splice(newIndex, 0, item)
          
          // Atualizar ordens
          localStages.value.forEach((stage, idx) => {
            stage.order = idx
          })
        }
      },
      
      onMove: (evt) => {
        const draggedIsSystem = evt.dragged.getAttribute('data-system-stage') === 'true'
        if (draggedIsSystem) {
          return false
        }

        // Feedback visual durante o movimento
        return evt.related.classList.contains('stage-sortable-item')
      }
    })
    
    console.log('[StagesDrawer] ✅ SortableJS inicializado')
  } catch (error) {
    console.error('[StagesDrawer] ❌ Erro ao inicializar SortableJS:', error)
  }
}

// Salvar mudanças
const saveChanges = async () => {
  loading.value = true
  
  try {
    // Validar que todas as etapas têm nome
    const invalidStages = localStages.value.filter(stage => !stage.name?.trim())
    if (invalidStages.length > 0) {
      toast({
        title: 'Erro de validação',
        description: 'Todas as etapas devem ter um nome',
        variant: 'destructive',
      })
      return
    }

    // IMPORTANTE: Primeiro identificar quais stages existentes foram removidas da UI
    // ANTES de criar novas stages (para evitar deletar as recém-criadas)
    const originalStageIds = stagesStore.stages.map(s => s.id)
    const stageIdsToKeep = localStages.value
      .filter(s => s.id) // Apenas stages com ID (não tempId)
      .map(s => s.id!)
    
    const stageIdsToDelete = originalStageIds.filter(id => !stageIdsToKeep.includes(id))
    const deletableStageIds = stageIdsToDelete.filter((id) => {
      const originalStage = stagesStore.stages.find((s) => s.id === id)
      return Boolean(originalStage?.projectId)
    })

    // Processar mudanças uma por vez
    for (const [index, stage] of localStages.value.entries()) {
      const stageData = {
        name: stage.name!.trim(),
        trackingPhrase: stage.trackingPhrase || '',
        type: stage.type || 'normal' as const,
        order: index,
      }

      if (stage.tempId) {
        // Nova etapa - criar e atualizar o ID local
        const createdStage = await stagesStore.createStage(stageData)
        // Atualizar o stage local com o ID real
        stage.id = createdStage.id
        delete stage.tempId
      } else if (stage.id) {
        if (isSystemStage(stage)) {
          continue
        }
        // Etapa existente - atualizar
        await stagesStore.updateStage(stage.id, stageData)
      }
    }

    // Remover etapas que foram deletadas da UI
    for (const stageId of deletableStageIds) {
      await stagesStore.deleteStage(stageId)
    }

    toast({
      title: 'Etapas atualizadas',
      description: 'As mudanças foram salvas com sucesso',
    })

    emit('stages-updated')
    isOpen.value = false
  } catch (error) {
    console.error('Erro ao salvar etapas:', error)
    toast({
      title: 'Erro ao salvar',
      description: 'Não foi possível salvar as mudanças',
      variant: 'destructive',
    })
  } finally {
    loading.value = false
  }
}

// Cancelar e fechar
const cancel = () => {
  loadStages() // Resetar para estado original
  isOpen.value = false
}

// Verificar se tem mudanças
const hasChanges = computed(() => {
  const original = stagesStore.stages
  const current = localStages.value
  
  if (original.length !== current.filter(s => !s.tempId).length) {
    return true
  }
  
  return current.some((stage, index) => {
    if (stage.tempId) return true
    
    const originalStage = original.find(s => s.id === stage.id)
    if (!originalStage) return true
    
    return (
      originalStage.name !== stage.name ||
      originalStage.trackingPhrase !== stage.trackingPhrase ||
      originalStage.type !== stage.type ||
      originalStage.order !== index
    )
  })
})
</script>

<template>
  <Drawer :open="isOpen" @update:open="(value) => isOpen = value" size="xl">
    <template #content>
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-border px-6 py-4">
          <div class="flex items-center gap-3">
            <Settings class="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 class="section-title-sm">Gerenciar Etapas do Funil</h2>
              <p class="text-sm text-muted-foreground">
                Configure as etapas da jornada dos seus contatos
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" @click="cancel">
            <X class="h-4 w-4" />
          </Button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-4">
            <!-- Botão adicionar etapa -->
            <Button
              variant="outline"
              class="w-full border-dashed"
              @click="addStage"
            >
              <Plus class="h-4 w-4 mr-2" />
              Adicionar Nova Etapa
            </Button>

            <!-- Lista de etapas -->
            <div class="stages-sortable-container space-y-4">
              <div
                v-for="(stage, index) in localStages"
                :key="stage.id || stage.tempId"
                class="group relative rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-md stage-sortable-item"
                :class="{ 'stage-system': isSystemStage(stage) }"
                :data-stage-id="stage.id || stage.tempId"
                :data-system-stage="isSystemStage(stage)"
              >
              <!-- Handle de drag visível -->
              <div class="absolute left-2 top-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  class="stage-drag-handle p-2 rounded-control hover:bg-muted hover:shadow-sm transition-all duration-150 bg-muted/30"
                  :disabled="isSystemStage(stage)"
                  :title="isSystemStage(stage) ? 'Etapa de sistema não pode ser reordenada' : 'Arrastar para reordenar'"
                >
                  <GripVertical class="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </div>

              <div class="grid grid-cols-1 gap-4 pl-12">
                <!-- Nome da etapa -->
                <div class="space-y-2">
                  <Label :for="`stage-name-${index}`">Nome da Etapa</Label>
                  <Input
                    :id="`stage-name-${index}`"
                    v-model="stage.name"
                    placeholder="Ex: Contato Inicial, Qualificação, Proposta..."
                    class="font-medium"
                    :disabled="isSystemStage(stage)"
                  />
                </div>

                <!-- Frase de tracking -->
                <div class="space-y-2">
                  <Label :for="`stage-phrase-${index}`">Frase de Tracking (Opcional)</Label>
                  <Input
                    :id="`stage-phrase-${index}`"
                    v-model="stage.trackingPhrase"
                    placeholder="Breve descrição desta etapa..."
                    class="text-sm"
                    :disabled="isSystemStage(stage)"
                  />
                </div>

                <!-- Tipo de etapa -->
                <div class="space-y-2">
                  <Label>Tipo da Etapa</Label>
                  <Select 
                    v-model="stage.type!" 
                    :options="[
                      { value: 'normal', label: 'Normal' },
                      { value: 'sale', label: 'Venda' },
                      { value: 'lost', label: 'Perdido' }
                    ]"
                    placeholder="Selecione o tipo"
                    size="sm"
                    :disabled="isSystemStage(stage)"
                  />
                </div>
              </div>

              <!-- Botão de remover -->
              <div class="absolute right-4 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  :disabled="localStages.length <= 1 || isSystemStage(stage)"
                  @click="removeStage(index)"
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-border px-6 py-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">
              {{ localStages.length }} etapa{{ localStages.length !== 1 ? 's' : '' }}
              <span v-if="hasChanges" class="text-orange-600">• Mudanças não salvas</span>
            </p>
            <div class="flex gap-3">
              <Button variant="ghost" @click="cancel">
                Cancelar
              </Button>
              <Button 
                :disabled="loading || !hasChanges" 
                @click="saveChanges"
              >
                <Save class="h-4 w-4 mr-2" />
                Salvar Mudanças
              </Button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Drawer>

  <!-- Dialog de Confirmação -->
  <AlertDialog
    v-model="confirmDialog.isOpen.value"
    :title="confirmDialog.title.value"
    :description="confirmDialog.description.value"
    :confirm-text="confirmDialog.confirmText.value"
    :cancel-text="confirmDialog.cancelText.value"
    :variant="confirmDialog.variant.value"
    @confirm="confirmDialog.handleConfirm"
    @cancel="confirmDialog.handleCancel"
  />
</template>

<style scoped>
/* Melhorias na UX de drag and drop */
.stages-sortable-container.dragging .stage-sortable-item:not(.sortable-chosen) {
  transform: scale(0.95);
  transition: transform 0.2s ease;
}

.stages-sortable-container.dragging {
  user-select: none;
}

/* Estilo para o item sendo arrastado */
.sortable-ghost {
  opacity: 0.5 !important;
  transform: rotate(2deg) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 2px dashed hsl(var(--primary));
  background: hsl(var(--primary) / 0.08) !important;
}

/* Item escolhido (quando clicado) */
.sortable-chosen {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: hsl(var(--primary) / 0.3);
}

/* Item durante o drag */
.sortable-drag {
  opacity: 1 !important;
  transform: rotate(1deg) scale(1.03);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  z-index: 9999;
}

/* Handle de drag com melhor feedback e cursor correto */
.stage-drag-handle {
  cursor: grab;
  color: inherit;
}

.stage-drag-handle:hover {
  background: hsl(var(--muted)) !important;
  transform: scale(1.05);
  cursor: grab;
}

.stage-drag-handle:active {
  transform: scale(0.98);
  background: hsl(var(--primary) / 0.1) !important;
  cursor: grabbing;
}

/* Garantir que o ícone interno também tenha o cursor correto */
.stage-drag-handle .lucide-grip-vertical {
  pointer-events: none;
}

/* Feedback visual para área de drop */
.stages-sortable-container.dragging .stage-sortable-item {
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.stages-sortable-container.dragging .stage-sortable-item:not(.sortable-chosen):not(.sortable-ghost) {
  transform: scale(0.97);
  opacity: 0.8;
}

.stages-sortable-container.dragging .stage-sortable-item:hover:not(.sortable-chosen) {
  border-color: hsl(var(--primary) / 0.4);
  background: hsl(var(--primary) / 0.05);
  transform: scale(1);
  opacity: 1;
}
</style>
