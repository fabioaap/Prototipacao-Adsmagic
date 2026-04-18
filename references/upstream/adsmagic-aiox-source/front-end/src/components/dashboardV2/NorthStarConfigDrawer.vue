<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-vue-next'
import Drawer from '@/components/ui/Drawer.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import type {
  NorthStarConfig,
  NorthStarCustomMetricDefinition,
  NorthStarCustomMetricType,
} from '@/types'

interface MetricOption {
  id: string
  label: string
  caption: string
}

interface StageOption {
  id: string
  name: string
}

interface Props {
  open: boolean
  baseMetrics: MetricOption[]
  currentConfig: NorthStarConfig | null
  stages: StageOption[]
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [{
    primaryMetricIds: string[]
    detailedMetricOrder: string[]
    customMetrics: NorthStarCustomMetricDefinition[]
  }]
}>()

const localPrimaryMetricIds = ref<string[]>([])
const localDetailedMetricOrder = ref<string[]>([])
const localCustomMetrics = ref<NorthStarCustomMetricDefinition[]>([])
const localError = ref<string | null>(null)

const newMetricName = ref('')
const newMetricType = ref<NorthStarCustomMetricType>('stage_count')
const newMetricStageId = ref('')
const newMetricStageIds = ref<string[]>([])
const newMetricNumeratorStageIds = ref<string[]>([])
const newMetricDenominatorStageIds = ref<string[]>([])

const customMetricTypeOptions = [
  { value: 'stage_count', label: 'Contatos na etapa' },
  { value: 'sum_stages', label: 'Soma de etapas' },
  { value: 'divide_stages', label: 'Divisão de etapas (%)' },
  { value: 'cost_per_stage', label: 'Custo por etapa' },
]

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const allMetrics = computed(() => {
  const customMetrics = localCustomMetrics.value.map((metric) => ({
    id: metric.id,
    label: metric.name,
    caption: metric.type,
  }))
  return [...props.baseMetrics, ...customMetrics]
})

const metricNameById = computed(() => {
  const map = new Map<string, string>()
  for (const metric of allMetrics.value) map.set(metric.id, metric.label)
  return map
})

function initializeState() {
  const config = props.currentConfig
  const customMetrics = config?.customMetrics ?? []
  const allMetricIds = [...props.baseMetrics.map((metric) => metric.id), ...customMetrics.map((metric) => metric.id)]

  localCustomMetrics.value = customMetrics.map((metric) => ({ ...metric }))
  localPrimaryMetricIds.value = (config?.primaryMetricIds ?? ['spend', 'revenue', 'sales', 'salesRate'])
    .filter((id) => allMetricIds.includes(id))
    .slice(0, 4)

  const order = config?.detailedMetricOrder?.filter((id) => allMetricIds.includes(id)) ?? []
  localDetailedMetricOrder.value = [...order]
  for (const id of allMetricIds) {
    if (!localDetailedMetricOrder.value.includes(id)) localDetailedMetricOrder.value.push(id)
  }

  localError.value = null
  resetNewMetricForm()
}

function resetNewMetricForm() {
  newMetricName.value = ''
  newMetricType.value = 'stage_count'
  newMetricStageId.value = ''
  newMetricStageIds.value = []
  newMetricNumeratorStageIds.value = []
  newMetricDenominatorStageIds.value = []
}

watch(() => props.open, (open) => {
  if (open) initializeState()
})

function moveMetric(index: number, direction: 'up' | 'down') {
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= localDetailedMetricOrder.value.length) return
  const list = [...localDetailedMetricOrder.value]
  const item = list[index]
  list.splice(index, 1)
  if (item) list.splice(target, 0, item)
  localDetailedMetricOrder.value = list
}

function togglePrimary(metricId: string, checked: boolean) {
  localError.value = null
  if (checked) {
    if (localPrimaryMetricIds.value.length >= 4) {
      localError.value = 'Você pode selecionar no máximo 4 métricas principais.'
      return
    }
    if (!localPrimaryMetricIds.value.includes(metricId)) {
      localPrimaryMetricIds.value.push(metricId)
    }
    return
  }

  localPrimaryMetricIds.value = localPrimaryMetricIds.value.filter((id) => id !== metricId)
}

function toggleStageSelection(container: 'sum' | 'num' | 'den', stageId: string, checked: boolean) {
  const update = (arr: string[]) => {
    if (checked) return arr.includes(stageId) ? arr : [...arr, stageId]
    return arr.filter((id) => id !== stageId)
  }

  if (container === 'sum') newMetricStageIds.value = update(newMetricStageIds.value)
  if (container === 'num') newMetricNumeratorStageIds.value = update(newMetricNumeratorStageIds.value)
  if (container === 'den') newMetricDenominatorStageIds.value = update(newMetricDenominatorStageIds.value)
}

function addCustomMetric() {
  localError.value = null
  const name = newMetricName.value.trim()
  if (!name) {
    localError.value = 'Informe um nome para a métrica.'
    return
  }

  const type = newMetricType.value
  const metric: NorthStarCustomMetricDefinition = {
    id: `custom:${crypto.randomUUID()}`,
    name,
    type,
  }

  if (type === 'stage_count' || type === 'cost_per_stage') {
    if (!newMetricStageId.value) {
      localError.value = 'Selecione uma etapa.'
      return
    }
    metric.stageId = newMetricStageId.value
  }

  if (type === 'sum_stages') {
    if (newMetricStageIds.value.length === 0) {
      localError.value = 'Selecione ao menos uma etapa para somar.'
      return
    }
    metric.stageIds = [...newMetricStageIds.value]
  }

  if (type === 'divide_stages') {
    if (newMetricNumeratorStageIds.value.length === 0 || newMetricDenominatorStageIds.value.length === 0) {
      localError.value = 'Selecione etapas de numerador e denominador.'
      return
    }
    metric.numeratorStageIds = [...newMetricNumeratorStageIds.value]
    metric.denominatorStageIds = [...newMetricDenominatorStageIds.value]
  }

  localCustomMetrics.value.push(metric)
  localDetailedMetricOrder.value.push(metric.id)
  resetNewMetricForm()
}

function removeCustomMetric(metricId: string) {
  localCustomMetrics.value = localCustomMetrics.value.filter((metric) => metric.id !== metricId)
  localDetailedMetricOrder.value = localDetailedMetricOrder.value.filter((id) => id !== metricId)
  localPrimaryMetricIds.value = localPrimaryMetricIds.value.filter((id) => id !== metricId)
}

function handleSave() {
  if (localPrimaryMetricIds.value.length > 4) {
    localError.value = 'Você pode selecionar no máximo 4 métricas principais.'
    return
  }

  emit('save', {
    primaryMetricIds: [...localPrimaryMetricIds.value],
    detailedMetricOrder: [...localDetailedMetricOrder.value],
    customMetrics: [...localCustomMetrics.value],
  })
}
</script>

<template>
  <Drawer :open="isOpen" @update:open="(value) => isOpen = value" size="xl">
    <template #content>
      <div class="flex h-full flex-col">
        <div class="border-b border-border px-6 py-4">
          <h2 class="section-title-sm">Configurar North Star</h2>
          <p class="text-sm text-muted-foreground">Escolha até 4 métricas principais e ordene a exibição.</p>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div v-if="localError" class="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {{ localError }}
          </div>

          <section class="space-y-3">
            <h3 class="text-sm font-semibold text-foreground">Ordem e destaque das métricas</h3>
            <div class="space-y-2">
              <article
                v-for="(metricId, index) in localDetailedMetricOrder"
                :key="metricId"
                class="rounded-lg border border-border bg-card px-3 py-2"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-foreground">{{ metricNameById.get(metricId) || metricId }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <Checkbox
                      :model-value="localPrimaryMetricIds.includes(metricId)"
                      @update:model-value="togglePrimary(metricId, $event)"
                    />
                    <span class="text-xs text-muted-foreground">Principal</span>
                    <Button variant="ghost" size="icon-sm" @click="moveMetric(index, 'up')" :disabled="index === 0">
                      <ArrowUp class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" @click="moveMetric(index, 'down')" :disabled="index === localDetailedMetricOrder.length - 1">
                      <ArrowDown class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="space-y-3 border-t border-border pt-4">
            <h3 class="text-sm font-semibold text-foreground">Nova métrica customizada</h3>
            <div class="grid gap-3 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Nome da métrica</Label>
                <Input v-model="newMetricName" placeholder="Ex: Conversão para primeiro contato" />
              </div>
              <div class="space-y-2">
                <Label>Tipo</Label>
                <Select
                  v-model="newMetricType"
                  :options="customMetricTypeOptions"
                  placeholder="Selecione o tipo"
                />
              </div>
            </div>

            <div v-if="newMetricType === 'stage_count' || newMetricType === 'cost_per_stage'" class="space-y-2">
              <Label>Etapa</Label>
              <Select
                v-model="newMetricStageId"
                :options="props.stages.map((stage) => ({ value: stage.id, label: stage.name }))"
                placeholder="Selecione a etapa"
              />
            </div>

            <div v-if="newMetricType === 'sum_stages'" class="space-y-2">
              <Label>Etapas para somar</Label>
              <div class="grid gap-2 md:grid-cols-2">
                <div v-for="stage in props.stages" :key="`sum-${stage.id}`" class="rounded-control border border-border px-3 py-2">
                  <Checkbox
                    :label="stage.name"
                    :model-value="newMetricStageIds.includes(stage.id)"
                    @update:model-value="toggleStageSelection('sum', stage.id, $event)"
                  />
                </div>
              </div>
            </div>

            <div v-if="newMetricType === 'divide_stages'" class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Numerador (etapas)</Label>
                <div class="space-y-2">
                  <div v-for="stage in props.stages" :key="`num-${stage.id}`" class="rounded-control border border-border px-3 py-2">
                    <Checkbox
                      :label="stage.name"
                      :model-value="newMetricNumeratorStageIds.includes(stage.id)"
                      @update:model-value="toggleStageSelection('num', stage.id, $event)"
                    />
                  </div>
                </div>
              </div>
              <div class="space-y-2">
                <Label>Denominador (etapas)</Label>
                <div class="space-y-2">
                  <div v-for="stage in props.stages" :key="`den-${stage.id}`" class="rounded-control border border-border px-3 py-2">
                    <Checkbox
                      :label="stage.name"
                      :model-value="newMetricDenominatorStageIds.includes(stage.id)"
                      @update:model-value="toggleStageSelection('den', stage.id, $event)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" class="w-full" @click="addCustomMetric">
              <Plus class="h-4 w-4 mr-2" />
              Adicionar métrica customizada
            </Button>
          </section>

          <section v-if="localCustomMetrics.length > 0" class="space-y-3 border-t border-border pt-4">
            <h3 class="text-sm font-semibold text-foreground">Métricas customizadas criadas</h3>
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
            <Button :disabled="props.saving" @click="handleSave">
              {{ props.saving ? 'Salvando...' : 'Salvar configuração' }}
            </Button>
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>
