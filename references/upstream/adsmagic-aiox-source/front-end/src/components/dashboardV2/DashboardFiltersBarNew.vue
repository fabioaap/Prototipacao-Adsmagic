<script setup lang="ts">
import { Download, Info } from '@/composables/useIcons'
import PeriodSelector from './PeriodSelector.vue'
import OriginSelector from '@/components/dashboardV2/OriginSelector.vue'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip'
import { TooltipArrow } from 'reka-ui'

interface Props {
  period?: string
  origins?: string
  compare?: boolean
  startDate?: Date
  endDate?: Date
  timezone?: string
  loading?: boolean
  exporting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  period: 'Últimos 30 dias',
  origins: 'all',
  compare: false,
  loading: false,
  exporting: false
})

const emit = defineEmits<{
  'period-change': [period: string]
  'origins-change': [origins: string]
  'compare-toggle': [value: boolean]
  'export': []
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

function handleOriginsSelect(value: string) {
  emit('origins-change', value)
}

function handleCompareToggle() {
  emit('compare-toggle', !props.compare)
}

function handleExport() {
  emit('export')
}
</script>

<template>
  <div class="dashboard-filters-bar">
    <!-- Period Selector with Dropdown -->
    <div class="filter-fill">
      <PeriodSelector
        :model-value="period"
        :start-date="startDate"
        :end-date="endDate"
        :timezone="timezone"
        @update:start-date="handleStartDateUpdate"
        @update:end-date="handleEndDateUpdate"
        @range-change="handleRangeChange"
      />
    </div>

    <!-- Origins Filter -->
    <div class="filter-fill">
      <OriginSelector
        :model-value="origins"
        @update:model-value="handleOriginsSelect"
      />
    </div>

    <div class="filters-actions">
      <!-- Compare Toggle -->
      <div class="compare-wrapper">
        <TooltipProvider>
          <Tooltip>
            <button
              type="button"
              class="compare-toggle"
              :class="{ 'is-active': props.compare }"
              :aria-pressed="props.compare"
              data-testid="compare-toggle"
              @click="handleCompareToggle"
            >
              <span class="toggle-label">
                Comparar
                <TooltipTrigger as-child>
                  <span
                    class="info-trigger"
                    tabindex="0"
                    role="button"
                    aria-label="Informações sobre comparação"
                    @click.stop
                  >
                    <Info :size="14" class="info-icon" />
                  </span>
                </TooltipTrigger>
              </span>
              <div class="toggle-switch" :class="{ 'is-on': props.compare }">
                <div class="toggle-thumb" />
              </div>
            </button>
            <TooltipContent side="top" align="center" :side-offset="8" class="bg-primary text-primary-foreground border-primary">
              <p>{{ props.compare ? 'Comparação ativa com período anterior' : 'Ativar comparação de período' }}</p>
              <TooltipArrow class="fill-primary" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <!-- Export Button -->
      <button
        type="button"
        class="export-button"
        :disabled="props.exporting"
        @click="handleExport"
      >
        <Download class="export-icon" />
        <span>{{ props.exporting ? 'Exportando...' : 'Exportar' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-filters-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  box-sizing: border-box;
  padding: 0.125rem 0.1rem;
  width: 100%;
}

.dashboard-filters-bar::-webkit-scrollbar {
  display: none;
}

.filter-fill {
  flex: 1 1 240px;
  min-width: 220px;
}

.filters-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  justify-content: flex-end;
}

.compare-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.625rem;
  min-height: var(--sym-control-height-md);
  height: var(--sym-control-height-md);
  padding: 0 var(--sym-space-6);
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

.export-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: var(--sym-control-height-md);
  height: var(--sym-control-height-md);
  padding: 0 var(--sym-space-6);
  border-radius: var(--radius-control);
  border: none;
  background: hsl(222.2 47.4% 11.2%);
  font-size: var(--sym-font-size-3);
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.export-button:hover {
  background: hsl(222.2 47.4% 8%);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}

.export-button:active {
  background: hsl(222.2 47.4% 11.2%);
}

.export-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.export-icon {
  width: 1rem;
  height: 1rem;
}

.compare-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  outline: none;
}

.info-trigger:focus-visible {
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.14);
}

@media (max-width: 640px) {
  .dashboard-filters-bar {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    flex-wrap: nowrap;
    overflow-x: visible;
    padding: 0;
  }

  .filter-fill {
    flex: 0 0 auto;
    min-width: 0;
    width: 100%;
  }

  .filters-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .compare-toggle,
  .export-button {
    width: 100%;
    flex-shrink: 1;
    white-space: nowrap;
  }

  .compare-wrapper {
    width: 100%;
  }
}
</style>
