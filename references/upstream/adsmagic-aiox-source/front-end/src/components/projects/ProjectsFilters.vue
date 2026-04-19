<script lang="ts">
export interface ProjectFilters {
  status: 'active' | 'archived' | ''
  dateFrom: string
  dateTo: string
  hasWizardPending: boolean | null
}
</script>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Filter } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'
import Modal from '@/components/ui/Modal.vue'
import { DateRangePicker } from '@/components/ui/date-range-picker'

const { t } = useI18n()

interface Props {
  /**
   * Se true, exibe o modal
   */
  open: boolean
  /**
   * Filtros atuais
   */
  filters?: ProjectFilters
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  filters: () => ({
    status: '',
    dateFrom: '',
    dateTo: '',
    hasWizardPending: null,
  }),
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  apply: [filters: ProjectFilters]
  clear: []
}>()

// Estado local dos filtros
const localFilters = ref<ProjectFilters>({ ...props.filters })

// Watch props.filters para sincronizar
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Options para status
const statusOptions = computed(() => [
  { value: '', label: t('projects.advancedFilters.allStatuses') },
  { value: 'active', label: t('projects.advancedFilters.active') },
  { value: 'archived', label: t('projects.advancedFilters.archived') },
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

function handleDateRangeChange(range: { start: Date; end: Date } | undefined) {
  if (range) {
    localFilters.value.dateFrom = range.start.toISOString().split('T')[0] || ''
    localFilters.value.dateTo = range.end.toISOString().split('T')[0] || ''
  } else {
    localFilters.value.dateFrom = ''
    localFilters.value.dateTo = ''
  }
}

function handleClose() {
  emit('update:open', false)
}

function handleClear() {
  localFilters.value = {
    status: '',
    dateFrom: '',
    dateTo: '',
    hasWizardPending: null,
  }
  emit('clear')
  emit('update:open', false)
}

function handleApply() {
  emit('apply', { ...localFilters.value })
  emit('update:open', false)
}

function hasActiveFilters(): boolean {
  return (
    localFilters.value.status !== '' ||
    localFilters.value.dateFrom !== '' ||
    localFilters.value.dateTo !== '' ||
    localFilters.value.hasWizardPending !== null
  )
}
</script>

<template>
  <Modal
    :open="open"
    :title="t('projects.advancedFilters.title')"
    @update:open="handleClose"
  >
    <div class="space-y-6 py-4">
      <!-- Status -->
      <div class="space-y-2">
        <label class="text-sm font-medium">{{ t('projects.advancedFilters.projectStatus') }}</label>
        <Select
          v-model="localFilters.status"
          :options="statusOptions"
          :placeholder="t('projects.advancedFilters.selectStatus')"
        />
      </div>

      <!-- Wizard Pendente -->
      <div class="space-y-2">
        <label class="text-sm font-medium">{{ t('projects.advancedFilters.wizardConfig') }}</label>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
            :class="{
              'bg-primary text-white border-primary': localFilters.hasWizardPending === true,
              'bg-muted/50 border-border hover:bg-muted': localFilters.hasWizardPending !== true
            }"
            @click="localFilters.hasWizardPending = localFilters.hasWizardPending === true ? null : true"
          >
            <span class="text-sm">{{ t('projects.advancedFilters.pending') }}</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
            :class="{
              'bg-success text-white border-success': localFilters.hasWizardPending === false,
              'bg-muted/50 border-border hover:bg-muted': localFilters.hasWizardPending !== false
            }"
            @click="localFilters.hasWizardPending = localFilters.hasWizardPending === false ? null : false"
          >
            <span class="text-sm">{{ t('projects.advancedFilters.complete') }}</span>
          </button>
        </div>
        <p class="text-xs text-muted-foreground">
          {{ t('projects.advancedFilters.wizardHelper') }}
        </p>
      </div>

      <!-- Período de Criação -->
      <div class="space-y-2">
        <label class="text-sm font-medium">{{ t('projects.advancedFilters.creationPeriod') }}</label>
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
          {{ t('projects.advancedFilters.clearFilters') }}
        </Button>
        <div v-else />

        <div class="flex gap-2">
          <Button
            variant="outline"
            @click="handleClose"
          >
            {{ t('projects.advancedFilters.cancel') }}
          </Button>
          <Button @click="handleApply">
            <Filter class="h-4 w-4 mr-2" />
            {{ t('projects.advancedFilters.applyFilters') }}
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>
