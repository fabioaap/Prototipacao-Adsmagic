<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Check, Filter } from '@/composables/useIcons'
import Select from '@/components/ui/radix/Select.vue'
import { SelectItem, SelectItemIndicator, SelectItemText } from 'radix-vue'
import { useOriginsStore } from '@/stores/origins'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const originsStore = useOriginsStore()

onMounted(() => {
  if (originsStore.activeOrigins.length === 0) {
    originsStore.fetchOrigins()
  }
})

const options = computed(() => {
  const items = [{ label: 'Todas Origens', value: 'all' }]
  for (const origin of originsStore.activeOrigins) {
    items.push({ label: origin.name, value: origin.id })
  }
  return items
})

const validValues = computed(() => new Set(options.value.map((option) => option.value)))
const selectedValue = computed(() => {
  if (validValues.value.has(props.modelValue)) return props.modelValue
  return 'all'
})

const isLoadingOrigins = computed(() => originsStore.isLoading && originsStore.activeOrigins.length === 0)

function handleSelect(value: string) {
  emit('update:modelValue', value || 'all')
}
</script>

<template>
  <div class="filter-pill" aria-label="Selecionar origem">
    <span class="filter-icon-shell" aria-hidden="true">
      <Filter class="filter-icon" />
    </span>
    <div class="select-wrapper">
      <Select
        :model-value="selectedValue"
        :placeholder="isLoadingOrigins ? 'Carregando...' : 'Selecione'"
        data-testid="origins-select"
        :disabled="isLoadingOrigins"
        @update:model-value="handleSelect"
      >
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          class="origin-select-item w-full"
        >
          <SelectItemIndicator class="origin-select-item-indicator">
            <Check class="h-3.5 w-3.5" />
          </SelectItemIndicator>
          <SelectItemText class="w-full block">{{ option.label }}</SelectItemText>
        </SelectItem>
      </Select>
    </div>
  </div>
</template>

<style scoped>
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 var(--sym-space-6);
  width: 100%;
  min-width: 240px;
  min-height: var(--sym-control-height-md);
  height: var(--sym-control-height-md);
  border-radius: var(--radius-control);
  border: 1px solid rgb(226 232 240);
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
  box-sizing: border-box;
  transition: border-color var(--transition-base), box-shadow var(--transition-base), background-color var(--transition-base);
}

.filter-pill:focus-within {
  border-color: rgb(148 163 184);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
}

.filter-icon-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.625rem;
  height: 1.625rem;
  color: #475569;
  flex-shrink: 0;
}

.filter-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.select-wrapper {
  flex: 1;
  min-width: 0;
}

:deep([data-testid='select-trigger']) {
  border: none;
  background: transparent;
  padding: 0;
  min-height: auto;
  height: auto;
  box-shadow: none;
  font-size: var(--sym-font-size-3);
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  border-radius: 0;
}

:deep([data-testid='select-trigger']:focus-visible) {
  outline: none;
  box-shadow: none;
}

:deep([data-testid='select-trigger'] > span:first-child) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.lucide-chevron-down) {
  right: 0 !important;
  color: #64748b !important;
  width: 0.95rem !important;
  height: 0.95rem !important;
}

:deep([data-testid='select-content']) {
  border-radius: calc(var(--radius-control) + 2px);
  z-index: 60;
}

@media (max-width: 640px) {
  .filter-pill {
    min-width: 200px;
    width: 100%;
  }
}
</style>

<style>
.origin-select-item {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  align-items: center;
  column-gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  font-weight: 600;
}

.origin-select-item-indicator {
  grid-column: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: rgb(79 70 229);
}

.origin-select-item [data-item-text] {
  grid-column: 2;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
