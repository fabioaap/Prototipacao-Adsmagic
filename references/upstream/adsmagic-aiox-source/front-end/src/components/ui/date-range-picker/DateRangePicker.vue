<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        :class="cn('filter-pill-button', triggerClass)"
      >
        <CalendarIcon class="filter-icon" />
        <span class="filter-text">{{ buttonText }}</span>
      </button>
    </PopoverTrigger>
    <PopoverContent class="date-range-popover w-auto p-0" align="start">
      <div class="date-range-picker-layout relative">
        <!-- Presets -->
        <div v-if="showPresets" class="date-range-picker-presets border-r p-1.5 max-w-[140px]">
          <div class="date-range-picker-presets-list space-y-1">
            <button
              v-for="preset in presets"
              :key="preset.label"
              type="button"
              class="date-range-picker-preset w-full rounded-control px-2 py-1 text-left text-sm hover:bg-accent transition-colors whitespace-nowrap"
              @click="selectPreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- RangeCalendar -->
        <div class="date-range-picker-calendar p-3 relative">
          <!-- Botão X posicionado dentro do calendário -->
          <button
            type="button"
            class="absolute top-2 right-2 z-50 p-1.5 rounded-control bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-sm"
            @click="clearAndClose"
            aria-label="Limpar período"
            title="Limpar período"
          >
            <X class="w-4 h-4 text-slate-600" />
          </button>

          <div class="date-range-picker-summary mb-3 grid grid-cols-2 gap-3 pr-10">
            <div class="space-y-1">
              <p class="text-sm font-medium">Data inicial</p>
              <p class="text-xs text-muted-foreground">
                {{ dateRange?.start ? formatDate(dateRange.start.toDate(tz)) : '—' }}
              </p>
            </div>
            <div class="space-y-1 text-right">
              <p class="text-sm font-medium">Data final</p>
              <p class="text-xs text-muted-foreground">
                {{ dateRange?.end ? formatDate(dateRange.end.toDate(tz)) : '—' }}
              </p>
            </div>
          </div>

          <RangeCalendar
            v-model="dateRange"
            class="rounded-surface border shadow-sm"
            :number-of-months="calendarMonths"
            :max-value="maxValue"
          />

          <!-- Botões -->
          <div class="date-range-picker-actions mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" @click="cancel">
              Cancelar
            </Button>
            <Button
              size="sm"
              :disabled="!dateRange?.start || !dateRange?.end"
              @click="applyDateRange"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { CalendarIcon, X } from '@/composables/useIcons'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { fromDate, getLocalTimeZone, today, type DateValue } from '@internationalized/date'
import { resolveTimezone } from '@/utils/dateTimezone'

interface DateRange {
  start: Date
  end: Date
}

interface RangeValue {
  start: DateValue
  end: DateValue
}

interface Props {
  modelValue?: DateRange
  showPresets?: boolean
  className?: string
  timezone?: string
  variant?: 'default' | 'toolbar'
  mutedWhenEmpty?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPresets: true,
  variant: 'default',
  mutedWhenEmpty: true
})

const emit = defineEmits<{
  'update:modelValue': [value: DateRange | undefined]
  'change': [value: DateRange]
}>()

const open = ref(false)
const dateRange = ref<RangeValue | undefined>()
const tz = computed(() => resolveTimezone(props.timezone || getLocalTimeZone()))
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth <= 640 : false)

const MOBILE_BREAKPOINT = 640
const RESIZE_DEBOUNCE_MS = 150

let resizeTimer: ReturnType<typeof setTimeout> | null = null

function updateViewportState() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT
  }, RESIZE_DEBOUNCE_MS)
}

// Converter JS Date Range para Reka DateValue Range
function jsRangeToReka(range?: DateRange): RangeValue | undefined {
  if (!range?.start || !range?.end) return undefined
  return {
    start: fromDate(range.start, tz.value),
    end: fromDate(range.end, tz.value)
  }
}

// Converter Reka DateValue Range para JS Date Range
function rekaRangeToJs(range: RangeValue): DateRange {
  return {
    start: range.start.toDate(tz.value),
    end: range.end.toDate(tz.value)
  }
}

// Formatar data individual
function formatDate(date: Date): string {
  // Detecta locale do navegador como fallback
  const userLocale = navigator.language || 'pt-BR'
  return date.toLocaleDateString(userLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Inicializar dateRange a partir de modelValue
dateRange.value = jsRangeToReka(props.modelValue)

// Watch para sincronizar com modelValue externo
// Usa comparação para evitar race condition
const stopWatch = watch(() => props.modelValue, (newValue, oldValue) => {
  // Compara valores para evitar loop infinito
  if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
    dateRange.value = jsRangeToReka(newValue)
  }
}, { deep: true })

const stopTimezoneWatch = watch(
  () => tz.value,
  () => {
    dateRange.value = jsRangeToReka(props.modelValue)
  }
)

// Cleanup para prevenir memory leak
onBeforeUnmount(() => {
  stopWatch()
  stopTimezoneWatch()
  window.removeEventListener('resize', updateViewportState)
})

onMounted(() => {
  updateViewportState()
  window.addEventListener('resize', updateViewportState)
})

// Texto do botão
const buttonText = computed(() => {
  if (dateRange.value?.start && dateRange.value?.end) {
    const start = dateRange.value.start.toDate(tz.value)
    const end = dateRange.value.end.toDate(tz.value)
    return `${formatDate(start)} - ${formatDate(end)}`
  }
  return 'Selecione o período'
})

const triggerClass = computed(() =>
  cn(
    props.variant === 'toolbar' && 'filter-pill-button--toolbar',
    props.mutedWhenEmpty && !dateRange.value?.start && 'text-muted-foreground',
    props.className
  )
)

const calendarMonths = computed(() => (isMobile.value ? 1 : 2))

// Aplicar seleção
function applyDateRange() {
  if (dateRange.value?.start && dateRange.value?.end) {
    const jsRange = rekaRangeToJs(dateRange.value)
    emit('update:modelValue', jsRange)
    emit('change', jsRange)
    open.value = false
  }
}

// Cancelar e reverter
function cancel() {
  dateRange.value = jsRangeToReka(props.modelValue)
  open.value = false
}

// Limpar e fechar
function clearAndClose() {
  dateRange.value = undefined
  emit('update:modelValue', undefined)
  // Não emite 'change' quando limpa (undefined não é um range válido)
  open.value = false
}

// Presets - usando @internationalized/date para consistência de timezone
const presets = [
  {
    label: 'Hoje',
    getValue: () => {
      const todayDate = today(tz.value)
      const todayJs = todayDate.toDate(tz.value)
      return {
        start: todayJs,
        end: new Date(todayJs)
      }
    }
  },
  {
    label: 'Últimos 7 dias',
    getValue: () => {
      const todayDate = today(tz.value)
      const endDate = todayDate.toDate(tz.value)
      
      const startDateCal = todayDate.subtract({ days: 6 })
      const startDate = startDateCal.toDate(tz.value)
      
      return { start: startDate, end: endDate }
    }
  },
  {
    label: 'Últimos 30 dias',
    getValue: () => {
      const todayDate = today(tz.value)
      const endDate = todayDate.toDate(tz.value)
      
      const startDateCal = todayDate.subtract({ days: 29 })
      const startDate = startDateCal.toDate(tz.value)
      
      return { start: startDate, end: endDate }
    }
  },
  {
    label: 'Últimos 90 dias',
    getValue: () => {
      const todayDate = today(tz.value)
      const endDate = todayDate.toDate(tz.value)
      
      const startDateCal = todayDate.subtract({ days: 89 })
      const startDate = startDateCal.toDate(tz.value)
      
      return { start: startDate, end: endDate }
    }
  }
]

function selectPreset(preset: typeof presets[0]) {
  const range = preset.getValue()
  dateRange.value = jsRangeToReka(range)
  emit('update:modelValue', range)
  emit('change', range)
  open.value = false
}

// Data máxima (hoje)
const maxValue = computed(() => fromDate(new Date(), tz.value))
</script>

<style scoped>
.filter-pill-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0 var(--sym-space-6);
  width: 100%;
  min-width: 240px;
  min-height: var(--sym-control-height-md);
  height: var(--sym-control-height-md);
  border-radius: var(--radius-control);
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  font-size: var(--sym-font-size-3);
  font-weight: 700;
  color: #111827;
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.filter-pill-button:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filter-pill-button--toolbar {
  border-color: #e2e8f0;
}

.filter-icon {
  width: 1rem;
  height: 1rem;
  color: #475569;
  flex-shrink: 0;
}

.filter-text {
  flex: 1;
  color: #111827;
}

@media (max-width: 640px) {
  .date-range-popover {
    width: min(calc(100vw - 1rem), 23rem) !important;
    max-width: min(calc(100vw - 1rem), 23rem) !important;
    max-height: min(85vh, 42rem);
    overflow-y: auto;
  }

  .date-range-picker-layout {
    display: flex;
    flex-direction: column;
  }

  .date-range-picker-presets {
    max-width: none;
    border-right: 0;
    border-bottom: 1px solid hsl(var(--border));
    padding: 0.75rem;
  }

  .date-range-picker-presets-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .date-range-picker-preset {
    text-align: center;
    white-space: normal;
  }

  .date-range-picker-calendar {
    padding: 0.75rem;
  }

  .date-range-picker-summary {
    padding-right: 2rem;
    gap: 0.5rem;
  }

  .date-range-picker-actions {
    flex-direction: column-reverse;
  }

  .date-range-picker-actions > * {
    width: 100%;
  }

  .filter-pill-button {
    min-width: 200px;
    width: 100%;
  }
}
</style>
