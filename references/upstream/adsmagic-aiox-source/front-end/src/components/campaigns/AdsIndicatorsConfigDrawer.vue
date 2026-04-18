<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-vue-next'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import CustomStageMetricForm from '@/components/campaigns/CustomStageMetricForm.vue'
import type { CampaignsIndicatorOption } from '@/types/campaigns'
import type { NorthStarCustomMetricDefinition } from '@/types'

interface StageOption {
  id: string
  name: string
}

interface Props {
  open: boolean
  baseOptions: CampaignsIndicatorOption[]
  customOptions: CampaignsIndicatorOption[]
  selectedColumnIds: string[]
  columnOrder: string[]
  saving?: boolean
  stages?: StageOption[]
  customMetrics?: NorthStarCustomMetricDefinition[]
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
  stages: () => [],
  customMetrics: () => [],
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [{
    selectedColumnIds: string[]
    columnOrder: string[]
    customMetrics: NorthStarCustomMetricDefinition[]
  }]
}>()

const localSelectedColumnIds = ref<string[]>([])
const localColumnOrder = ref<string[]>([])
const localCustomMetrics = ref<NorthStarCustomMetricDefinition[]>([])
const localError = ref<string | null>(null)

const allOptions = computed(() => {
  const customMetricOptions: CampaignsIndicatorOption[] = localCustomMetrics.value.map((m) => ({
    id: m.id,
    label: m.name,
  }))
  return [...props.baseOptions, ...props.customOptions, ...customMetricOptions]
})

const optionById = computed(() => {
  const map = new Map<string, CampaignsIndicatorOption>()
  allOptions.value.forEach((option) => map.set(option.id, option))
  return map
})

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const orderedSelectedColumnIds = computed(() =>
  localColumnOrder.value.filter((columnId) => localSelectedColumnIds.value.includes(columnId))
)

function initializeState() {
  const validIds = new Set<string>(allOptions.value.map((option) => option.id))

  // Also consider custom metrics from props
  localCustomMetrics.value = props.customMetrics.map((m) => ({ ...m }))
  for (const m of localCustomMetrics.value) {
    validIds.add(m.id)
  }

  const requestedSelected = props.selectedColumnIds.filter((id) => validIds.has(id))
  localSelectedColumnIds.value = requestedSelected.length > 0
    ? [...requestedSelected]
    : props.baseOptions.map((option) => option.id)

  const requestedOrder = props.columnOrder.filter((id) => validIds.has(id))
  localColumnOrder.value = requestedOrder.length > 0
    ? [...requestedOrder]
    : [...localSelectedColumnIds.value]

  for (const selectedId of localSelectedColumnIds.value) {
    if (!localColumnOrder.value.includes(selectedId)) {
      localColumnOrder.value.push(selectedId)
    }
  }

  localError.value = null
}

watch(
  () => props.open,
  (open) => {
    if (open) initializeState()
  }
)

function toggleColumn(columnId: string, checked: boolean) {
  localError.value = null

  if (checked) {
    if (!localSelectedColumnIds.value.includes(columnId)) {
      localSelectedColumnIds.value.push(columnId)
    }
    if (!localColumnOrder.value.includes(columnId)) {
      localColumnOrder.value.push(columnId)
    }
    return
  }

  localSelectedColumnIds.value = localSelectedColumnIds.value.filter((id) => id !== columnId)
}

function moveSelectedColumn(index: number, direction: 'up' | 'down') {
  const selected = [...orderedSelectedColumnIds.value]
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= selected.length) return

  const item = selected[index]
  selected.splice(index, 1)
  if (item) selected.splice(target, 0, item)
  localColumnOrder.value = selected
}

function handleAddCustomMetric(metric: NorthStarCustomMetricDefinition) {
  localError.value = null
  localCustomMetrics.value.push(metric)
  localSelectedColumnIds.value.push(metric.id)
  localColumnOrder.value.push(metric.id)
}

function handleCustomMetricError(message: string) {
  localError.value = message
}

function removeCustomMetric(metricId: string) {
  localCustomMetrics.value = localCustomMetrics.value.filter((m) => m.id !== metricId)
  localSelectedColumnIds.value = localSelectedColumnIds.value.filter((id) => id !== metricId)
  localColumnOrder.value = localColumnOrder.value.filter((id) => id !== metricId)
}

function handleSave() {
  if (localSelectedColumnIds.value.length === 0) {
    localError.value = 'Selecione ao menos um indicador para exibir na tabela.'
    return
  }

  emit('save', {
    selectedColumnIds: [...localSelectedColumnIds.value],
    columnOrder: [...orderedSelectedColumnIds.value],
    customMetrics: [...localCustomMetrics.value],
  })
}
</script>

<template>
  <Drawer :open="isOpen" @update:open="(value) => isOpen = value" size="lg">
    <template #content>
      <div class="flex h-full flex-col">
        <div class="border-b border-border px-6 py-4">
          <h2 class="section-title-sm">Configurar indicadores da tabela</h2>
          <p class="text-sm text-muted-foreground">
            Selecione os indicadores e defina a ordem de exibição.
          </p>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div
            v-if="localError"
            class="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {{ localError }}
          </div>

          <section class="space-y-3">
            <h3 class="text-sm font-semibold text-foreground">Ordem atual</h3>
            <div v-if="orderedSelectedColumnIds.length > 0" class="space-y-2">
              <article
                v-for="(columnId, index) in orderedSelectedColumnIds"
                :key="columnId"
                class="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
              >
                <p class="text-sm font-medium text-foreground">
                  {{ optionById.get(columnId)?.label || columnId }}
                </p>
                <div class="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    :disabled="index === 0"
                    @click="moveSelectedColumn(index, 'up')"
                  >
                    <ArrowUp class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    :disabled="index === orderedSelectedColumnIds.length - 1"
                    @click="moveSelectedColumn(index, 'down')"
                  >
                    <ArrowDown class="h-4 w-4" />
                  </Button>
                </div>
              </article>
            </div>
          </section>

          <section class="space-y-3 border-t border-border pt-4">
            <h3 class="text-sm font-semibold text-foreground">Indicadores padrão</h3>
            <div class="grid gap-2 md:grid-cols-2">
              <div
                v-for="option in props.baseOptions"
                :key="option.id"
                class="rounded-control border border-border px-3 py-2"
              >
                <Checkbox
                  :label="option.label"
                  :model-value="localSelectedColumnIds.includes(option.id)"
                  @update:model-value="toggleColumn(option.id, $event)"
                />
              </div>
            </div>
          </section>

          <section class="space-y-3 border-t border-border pt-4">
            <h3 class="text-sm font-semibold text-foreground">Indicadores customizados</h3>
            <div class="grid gap-2 md:grid-cols-2">
              <div
                v-for="option in props.customOptions"
                :key="option.id"
                class="rounded-control border border-border px-3 py-2"
              >
                <Checkbox
                  :label="option.label"
                  :model-value="localSelectedColumnIds.includes(option.id)"
                  @update:model-value="toggleColumn(option.id, $event)"
                />
              </div>
            </div>
          </section>

          <section v-if="props.stages.length > 0" class="space-y-3 border-t border-border pt-4">
            <h3 class="text-sm font-semibold text-foreground">Métricas customizadas de funil</h3>
            <CustomStageMetricForm
              :stages="props.stages"
              @add="handleAddCustomMetric"
              @error="handleCustomMetricError"
            />
          </section>

          <section v-if="localCustomMetrics.length > 0" class="space-y-3 border-t border-border pt-4">
            <h3 class="text-sm font-semibold text-foreground">Métricas de funil criadas</h3>
            <div class="space-y-2">
              <article
                v-for="metric in localCustomMetrics"
                :key="metric.id"
                class="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
              >
                <div>
                  <p class="text-sm font-medium text-foreground">{{ metric.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ metric.type }}</p>
                </div>
                <Button variant="ghost" size="icon-sm" @click="removeCustomMetric(metric.id)">
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </article>
            </div>
          </section>
        </div>

        <div class="border-t border-border px-6 py-4">
          <div class="flex items-center justify-end gap-3">
            <Button variant="ghost" @click="isOpen = false">Cancelar</Button>
            <Button :loading="props.saving" @click="handleSave">
              Salvar configuração
            </Button>
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>
