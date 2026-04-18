<script lang="ts">
export interface ContactFilters {
  stageIds: string[]
  originIds: string[]
  tagIds: string[]
  location: string
  dateFrom: string
  dateTo: string
}
</script>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Filter } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Modal from '@/components/ui/Modal.vue'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useStagesStore } from '@/stores/stages'
import { useOriginsStore } from '@/stores/origins'
import { useTagsStore } from '@/stores/tags'
import TagBadge from '@/components/tags/TagBadge.vue'

// Já definido no script acima
// interface ContactFilters já exportada

interface Props {
  /**
   * Se true, exibe o modal
   */
  open: boolean
  /**
   * Filtros atuais
   */
  filters?: ContactFilters
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  filters: () => ({
    stageIds: [],
    originIds: [],
    tagIds: [],
    location: '',
    dateFrom: '',
    dateTo: '',
  }),
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  apply: [filters: ContactFilters]
  clear: []
}>()

const stagesStore = useStagesStore()
const originsStore = useOriginsStore()
const tagsStore = useTagsStore()

// Estado local dos filtros
const localFilters = ref<ContactFilters>({ ...props.filters })

// Watch props.filters para sincronizar
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Options para selects
const stageOptions = computed(() => [
  { value: '', label: 'Todas as etapas' },
  ...stagesStore.stages.map(stage => ({
    value: stage.id,
    label: stage.name,
  })),
])

const originOptions = computed(() => [
  { value: '', label: 'Todas as origens' },
  ...originsStore.origins.map(origin => ({
    value: origin.id,
    label: origin.name,
  })),
])

// Date range computed
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
  localFilters.value.dateFrom = range.start.toISOString().split('T')[0] || ''
  localFilters.value.dateTo = range.end.toISOString().split('T')[0] || ''
}

// Handle close
const handleClose = () => {
  emit('update:open', false)
}

// Handle apply
const handleApply = () => {
  emit('apply', { ...localFilters.value })
  handleClose()
}

// Handle clear
const handleClear = () => {
  localFilters.value = {
    stageIds: [],
    originIds: [],
    tagIds: [],
    location: '',
    dateFrom: '',
    dateTo: '',
  }
  emit('clear')
  handleClose()
}

// Handle stage selection
const handleStageChange = (value: string) => {
  if (value) {
    if (!localFilters.value.stageIds.includes(value)) {
      localFilters.value.stageIds.push(value)
    }
  }
}

// Handle origin selection
const handleOriginChange = (value: string) => {
  if (value) {
    if (!localFilters.value.originIds.includes(value)) {
      localFilters.value.originIds.push(value)
    }
  }
}

// Handle tag selection
const handleTagChange = (value: string) => {
  if (value) {
    if (!localFilters.value.tagIds.includes(value)) {
      localFilters.value.tagIds.push(value)
    }
  }
}

// Remove stage
const removeStage = (stageId: string) => {
  localFilters.value.stageIds = localFilters.value.stageIds.filter(id => id !== stageId)
}

// Remove origin
const removeOrigin = (originId: string) => {
  localFilters.value.originIds = localFilters.value.originIds.filter(id => id !== originId)
}

// Remove tag
const removeTag = (tag: { id: string }) => {
  localFilters.value.tagIds = localFilters.value.tagIds.filter(id => id !== tag.id)
}

// Get stage name
const getStageName = (stageId: string) => {
  return stagesStore.stages.find(s => s.id === stageId)?.name || stageId
}

// Get origin name
const getOriginName = (originId: string) => {
  return originsStore.origins.find(o => o.id === originId)?.name || originId
}

// Check if has active filters
const hasActiveFilters = () => {
  return (
    localFilters.value.stageIds.length > 0 ||
    localFilters.value.originIds.length > 0 ||
    localFilters.value.tagIds.length > 0 ||
    localFilters.value.location !== '' ||
    localFilters.value.dateFrom !== '' ||
    localFilters.value.dateTo !== ''
  )
}
</script>

<template>
  <Modal
    :open="props.open"
    title="Filtros Avançados"
    :show-close="true"
    @update:open="handleClose"
  >
    <div class="space-y-6">
      <!-- Etapas -->
      <div class="space-y-3">
        <label class="text-sm font-medium">Etapas</label>
        <Select
          :model-value="''"
          :options="stageOptions"
          placeholder="Selecione uma etapa"
          @update:model-value="handleStageChange"
        />

        <!-- Selected Stages -->
        <div v-if="localFilters.stageIds.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="stageId in localFilters.stageIds"
            :key="stageId"
            class="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            {{ getStageName(stageId) }}
            <button
              @click="removeStage(stageId)"
              class="hover:bg-primary/20 rounded"
            >
              <X class="h-3 w-3" />
            </button>
          </span>
        </div>
      </div>

      <!-- Origens -->
      <div class="space-y-3">
        <label class="text-sm font-medium">Origens</label>
        <Select
          :model-value="''"
          :options="originOptions"
          placeholder="Selecione uma origem"
          @update:model-value="handleOriginChange"
        />

        <!-- Selected Origins -->
        <div v-if="localFilters.originIds.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="originId in localFilters.originIds"
            :key="originId"
            class="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            {{ getOriginName(originId) }}
            <button
              @click="removeOrigin(originId)"
              class="hover:bg-primary/20 rounded"
            >
              <X class="h-3 w-3" />
            </button>
          </span>
        </div>
      </div>

      <!-- Tags -->
      <div class="space-y-3">
        <label class="text-sm font-medium">Tags</label>
        <Select
          :model-value="''"
          :options="[
            { value: '', label: 'Selecione uma tag' },
            ...tagsStore.sortedTags.map(tag => ({
              value: tag.id,
              label: tag.name,
            })),
          ]"
          placeholder="Selecione uma tag"
          @update:model-value="handleTagChange"
        />

        <!-- Selected Tags -->
        <div v-if="localFilters.tagIds.length > 0" class="flex flex-wrap gap-2">
          <template v-for="tagId in localFilters.tagIds" :key="tagId">
            <TagBadge
              v-if="tagsStore.getTagById(tagId)"
              :tag="tagsStore.getTagById(tagId)!"
              size="sm"
              removable
              @remove="removeTag"
            />
          </template>
        </div>
      </div>

      <!-- Localização -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Localização</label>
        <Input
          v-model="localFilters.location"
          placeholder="Ex: São Paulo, SP"
        />
      </div>

      <!-- Período -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Período</label>
        <DateRangePicker
          :model-value="dateRange"
          :show-presets="true"
          @change="handleDateRangeChange"
        />
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-border">
        <Button
          v-if="hasActiveFilters()"
          variant="ghost"
          @click="handleClear"
        >
          Limpar Filtros
        </Button>
        <div v-else />

        <div class="flex gap-2">
          <Button
            variant="outline"
            @click="handleClose"
          >
            Cancelar
          </Button>
          <Button @click="handleApply">
            <Filter class="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>
