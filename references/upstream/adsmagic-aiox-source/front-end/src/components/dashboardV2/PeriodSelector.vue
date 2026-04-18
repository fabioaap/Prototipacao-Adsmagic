<script setup lang="ts">
import { computed } from 'vue'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { today } from '@internationalized/date'
import { resolveTimezone, toISODateInTimezone, todayISOInTimezone } from '@/utils/dateTimezone'

interface DateRange {
  start: Date
  end: Date
}

interface Props {
  modelValue: string
  startDate?: Date
  endDate?: Date
  timezone?: string
  mutedWhenEmpty?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:startDate': [date: Date | undefined]
  'update:endDate': [date: Date | undefined]
  'range-change': [range: DateRange]
}>()

const dateRange = computed<DateRange | undefined>(() => {
  if (props.startDate && props.endDate) {
    // Type safety: garantir que são objetos Date válidos
    const start = props.startDate instanceof Date ? props.startDate : new Date(props.startDate)
    const end = props.endDate instanceof Date ? props.endDate : new Date(props.endDate)
    
    // Validar se as datas são válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('[PeriodSelector] Datas inválidas recebidas:', { startDate: props.startDate, endDate: props.endDate })
      return undefined
    }
    
    return { start, end }
  }
  return undefined
})

function parseIsoToUtcDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1))
}

function detectPeriod(range: DateRange): 'today' | '7d' | '30d' | '90d' | 'custom' {
  const timezone = resolveTimezone(props.timezone)
  const startIso = toISODateInTimezone(range.start, timezone)
  const endIso = toISODateInTimezone(range.end, timezone)
  const todayIso = todayISOInTimezone(timezone)

  const startDate = parseIsoToUtcDate(startIso)
  const endDate = parseIsoToUtcDate(endIso)
  const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  if (startIso === todayIso && endIso === todayIso) return 'today'
  if (endIso === todayIso && diffDays === 7) return '7d'
  if (endIso === todayIso && diffDays === 30) return '30d'
  if (endIso === todayIso && diffDays === 90) return '90d'
  return 'custom'
}

function handleDateRangeChange(range: DateRange) {
  emit('update:modelValue', detectPeriod(range))
  emit('range-change', range)
}

function handleModelValueUpdate(value: DateRange | undefined) {
  if (value) return

  const timezone = resolveTimezone(props.timezone)
  const todayDate = today(timezone)
  const end = todayDate.toDate(timezone)

  const startDate = todayDate.subtract({ days: 29 })
  const start = startDate.toDate(timezone)

  emit('update:modelValue', '30d')
  emit('range-change', { start, end })
}
</script>

<template>
  <div class="period-selector-wrapper">
    <!-- DateRangePicker com presets SEMPRE visível (igual ao TimelineChart) -->
    <DateRangePicker
      :model-value="dateRange"
      :show-presets="true"
      :muted-when-empty="mutedWhenEmpty"
      :timezone="timezone"
      class-name="filter-pill-style"
      @update:model-value="handleModelValueUpdate"
      @change="handleDateRangeChange"
    />
  </div>
</template>

<style scoped>
.period-selector-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
}

/* Estilizar o DateRangePicker do shadcn para ter a mesma estética dos filtros */
:deep(.filter-pill-style) {
  min-width: 240px;
  min-height: var(--sym-control-height-md);
  height: var(--sym-control-height-md);
  border-radius: var(--radius-control) !important;
  border: 1px solid #e5e7eb !important;
  background: #ffffff !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
  padding: 0.5rem 0.9rem !important;
  font-size: var(--sym-font-size-3) !important;
  font-weight: 700 !important;
}

:deep(.filter-pill-style:hover) {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
}

@media (max-width: 640px) {
  .period-selector-wrapper {
    width: 100%;
  }
  
  :deep(.filter-pill-style) {
    min-width: 200px;
    width: 100%;
  }
}
</style>
