<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import PeriodSelector from '@/components/dashboardV2/PeriodSelector.vue'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { TooltipArrow } from 'reka-ui'

interface Props {
  period: string
  startDate?: Date
  endDate?: Date
  compare: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'period-change': [period: string]
  'compare-toggle': [value: boolean]
  'update:startDate': [date: Date | undefined]
  'update:endDate': [date: Date | undefined]
  'date-range-change': [start: Date, end: Date]
}>()

function handleStartDateUpdate(date: Date | undefined) {
  emit('update:startDate', date)
}

function handleEndDateUpdate(date: Date | undefined) {
  emit('update:endDate', date)
}

function handleRangeChange(range: { start: Date; end: Date }) {
  emit('date-range-change', range.start, range.end)
}

function handleCompareToggle() {
  emit('compare-toggle', !props.compare)
}
</script>

<template>
  <div class="campaigns-filters-bar">
    <div class="filter-fill">
      <PeriodSelector
        :model-value="period"
        :muted-when-empty="false"
        :start-date="startDate"
        :end-date="endDate"
        @update:model-value="(v) => emit('period-change', v)"
        @update:start-date="handleStartDateUpdate"
        @update:end-date="handleEndDateUpdate"
        @range-change="handleRangeChange"
      />
    </div>

    <div class="filters-actions">
      <div class="compare-wrapper">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                class="compare-toggle"
                :class="{ 'is-active': props.compare }"
                :aria-pressed="props.compare"
                @click="handleCompareToggle"
              >
                <span class="toggle-label">
                  Comparar
                  <Info :size="14" class="info-icon" />
                </span>
                <div class="toggle-switch" :class="{ 'is-on': props.compare }">
                  <div class="toggle-thumb" />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="8" class="bg-primary text-primary-foreground border-primary">
              <p>{{ props.compare ? 'Comparação ativa com período anterior' : 'Ativar comparação de período' }}</p>
              <TooltipArrow class="fill-primary" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div v-if="$slots.actions" class="toolbar-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.campaigns-filters-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  box-sizing: border-box;
  padding: 0.1rem;
  width: 100%;
}

.filter-fill {
  flex: 1 1 320px;
  min-width: 260px;
}

.filters-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 1 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-left: auto;
}

.compare-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.625rem;
  min-height: var(--sym-control-height-md);
  height: var(--sym-control-height-md);
  padding: 0 1rem;
  border-radius: var(--radius-control);
  border: 1px solid #e5e7eb;
  background-color: #f7f8fb;
  font-size: var(--sym-font-size-3);
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.compare-toggle:hover {
  background-color: #eef2f7;
}

.compare-toggle.is-active {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  color: hsl(222.2 47.4% 11.2%);
}

.compare-toggle .info-icon {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.compare-toggle:hover .info-icon {
  opacity: 1;
}

.toggle-switch {
  position: relative;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  background-color: #cbd5e1;
  transition: background-color 0.2s ease;
}

.toggle-switch.is-on {
  background-color: hsl(222.2 47.4% 11.2%);
}

.toggle-thumb {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.toggle-switch.is-on .toggle-thumb {
  transform: translateX(1.25rem);
}

.compare-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.toolbar-actions :deep(button) {
  height: var(--sym-control-height-md);
  min-height: var(--sym-control-height-md);
  border-radius: var(--radius-control);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 640px) {
  .campaigns-filters-bar {
    width: 100%;
    align-items: stretch;
    gap: 0.75rem;
  }

  .filter-fill,
  .filters-actions,
  .toolbar-actions {
    width: 100%;
  }

  .filter-fill {
    min-width: 0;
  }

  .filters-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-left: 0;
    justify-content: stretch;
  }

  .compare-wrapper {
    width: 100%;
  }

  .compare-toggle {
    display: flex;
    width: 100%;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .toolbar-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    justify-content: stretch;
  }

  .toolbar-actions :deep(button) {
    width: 100%;
    justify-content: center;
  }
}
</style>
