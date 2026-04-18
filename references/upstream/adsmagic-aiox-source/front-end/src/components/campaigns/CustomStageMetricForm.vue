<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import type {
  NorthStarCustomMetricDefinition,
  NorthStarCustomMetricType,
} from '@/types'

interface StageOption {
  id: string
  name: string
}

interface Props {
  stages: StageOption[]
}

defineProps<Props>()

const emit = defineEmits<{
  add: [metric: NorthStarCustomMetricDefinition]
  error: [message: string]
}>()

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

function toggleStageSelection(container: 'sum' | 'num' | 'den', stageId: string, checked: boolean) {
  const update = (arr: string[]) => {
    if (checked) return arr.includes(stageId) ? arr : [...arr, stageId]
    return arr.filter((id) => id !== stageId)
  }

  if (container === 'sum') newMetricStageIds.value = update(newMetricStageIds.value)
  if (container === 'num') newMetricNumeratorStageIds.value = update(newMetricNumeratorStageIds.value)
  if (container === 'den') newMetricDenominatorStageIds.value = update(newMetricDenominatorStageIds.value)
}

function resetForm() {
  newMetricName.value = ''
  newMetricType.value = 'stage_count'
  newMetricStageId.value = ''
  newMetricStageIds.value = []
  newMetricNumeratorStageIds.value = []
  newMetricDenominatorStageIds.value = []
}

function handleAdd() {
  const name = newMetricName.value.trim()
  if (!name) {
    emit('error', 'Informe um nome para a métrica.')
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
      emit('error', 'Selecione uma etapa.')
      return
    }
    metric.stageId = newMetricStageId.value
  }

  if (type === 'sum_stages') {
    if (newMetricStageIds.value.length === 0) {
      emit('error', 'Selecione ao menos uma etapa para somar.')
      return
    }
    metric.stageIds = [...newMetricStageIds.value]
  }

  if (type === 'divide_stages') {
    if (newMetricNumeratorStageIds.value.length === 0 || newMetricDenominatorStageIds.value.length === 0) {
      emit('error', 'Selecione etapas de numerador e denominador.')
      return
    }
    metric.numeratorStageIds = [...newMetricNumeratorStageIds.value]
    metric.denominatorStageIds = [...newMetricDenominatorStageIds.value]
  }

  emit('add', metric)
  resetForm()
}
</script>

<template>
  <div class="space-y-3">
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
        :options="stages.map((stage) => ({ value: stage.id, label: stage.name }))"
        placeholder="Selecione a etapa"
      />
    </div>

    <div v-if="newMetricType === 'sum_stages'" class="space-y-2">
      <Label>Etapas para somar</Label>
      <div class="grid gap-2 md:grid-cols-2">
        <div v-for="stage in stages" :key="`sum-${stage.id}`" class="rounded-control border border-border px-3 py-2">
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
          <div v-for="stage in stages" :key="`num-${stage.id}`" class="rounded-control border border-border px-3 py-2">
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
          <div v-for="stage in stages" :key="`den-${stage.id}`" class="rounded-control border border-border px-3 py-2">
            <Checkbox
              :label="stage.name"
              :model-value="newMetricDenominatorStageIds.includes(stage.id)"
              @update:model-value="toggleStageSelection('den', stage.id, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <Button variant="outline" class="w-full" @click="handleAdd">
      <Plus class="h-4 w-4 mr-2" />
      Adicionar métrica customizada
    </Button>
  </div>
</template>
