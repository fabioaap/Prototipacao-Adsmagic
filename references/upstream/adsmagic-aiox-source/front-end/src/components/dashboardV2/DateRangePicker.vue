<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Calendar as CalendarIcon, X } from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDate } from '@internationalized/date'

interface Props {
  startDate?: Date
  endDate?: Date
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:startDate': [date: Date | undefined]
  'update:endDate': [date: Date | undefined]
  'clear': []
}>()

// Converter Date para CalendarDate para uso interno
const toCalendarDate = (date: Date | undefined): CalendarDate | undefined => {
  if (!date) return undefined
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

// Converter CalendarDate para Date para emitir
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromCalendarDate = (dateValue: any): Date | undefined => {
  if (!dateValue) return undefined
  // DateValue tem propriedades year, month, day
  return new Date(dateValue.year, dateValue.month - 1, dateValue.day)
}

const localStartDateValue = ref<CalendarDate | undefined>(toCalendarDate(props.startDate))
const localEndDateValue = ref<CalendarDate | undefined>(toCalendarDate(props.endDate))

// Computeds para exibição como Date
const localStartDate = computed(() => fromCalendarDate(localStartDateValue.value))
const localEndDate = computed(() => fromCalendarDate(localEndDateValue.value))

// Sync with props
watch(() => props.startDate, (newDate) => {
  localStartDateValue.value = toCalendarDate(newDate)
})
watch(() => props.endDate, (newDate) => {
  localEndDateValue.value = toCalendarDate(newDate)
})

const dateRangeText = computed(() => {
  if (!localStartDate.value && !localEndDate.value) {
    return 'Selecione o período'
  }
  if (localStartDate.value && !localEndDate.value) {
    return format(localStartDate.value, 'dd/MM/yyyy', { locale: ptBR })
  }
  if (localStartDate.value && localEndDate.value) {
    return `${format(localStartDate.value, 'dd/MM/yyyy', { locale: ptBR })} - ${format(localEndDate.value, 'dd/MM/yyyy', { locale: ptBR })}`
  }
  return 'Selecione o período'
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleStartDateSelect(dateValue: any) {
  localStartDateValue.value = dateValue as CalendarDate | undefined
  const date = fromCalendarDate(dateValue)
  emit('update:startDate', date)
  
  // Se end date for antes de start date, limpa end date
  if (localEndDateValue.value && dateValue && localEndDateValue.value.compare(dateValue) < 0) {
    localEndDateValue.value = undefined
    emit('update:endDate', undefined)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleEndDateSelect(dateValue: any) {
  // Validar que end date não seja antes de start date
  if (dateValue && localStartDateValue.value && dateValue.compare(localStartDateValue.value) < 0) {
    return
  }
  localEndDateValue.value = dateValue as CalendarDate | undefined
  emit('update:endDate', fromCalendarDate(dateValue))
}

// Data de hoje para comparação (G5.2 - bloquear datas futuras)
const today = new CalendarDate(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  new Date().getDate()
)

/**
 * Verifica se a data de início está desabilitada
 * G5.2: Bloqueia datas futuras (depois de hoje)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isStartDateDisabled(dateValue: any): boolean {
  // Bloqueia datas futuras
  return dateValue.compare(today) > 0
}

/**
 * Verifica se a data final está desabilitada
 * - Bloqueia datas anteriores à data de início
 * - G5.2: Bloqueia datas futuras (depois de hoje)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEndDateDisabled(dateValue: any): boolean {
  // Bloqueia datas futuras
  if (dateValue.compare(today) > 0) {
    return true
  }
  // Bloqueia datas antes da data de início
  if (localStartDateValue.value && dateValue.compare(localStartDateValue.value) < 0) {
    return true
  }
  return false
}

function clearDates() {
  localStartDateValue.value = undefined
  localEndDateValue.value = undefined
  emit('update:startDate', undefined)
  emit('update:endDate', undefined)
  emit('clear')
}
</script>

<template>
  <div class="date-range-picker">
    <Popover>
      <PopoverTrigger class="trigger-wrapper">
        <div
          class="filter-pill"
          :class="{ 'has-dates': localStartDate || localEndDate }"
        >
          <CalendarIcon class="filter-icon" />
          <span class="date-text">{{ dateRangeText }}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <div class="flex flex-col gap-4 p-4 relative">
          <!-- Botão X no canto superior direito -->
          <button
            type="button"
            class="absolute top-3 right-3 p-1.5 rounded-control hover:bg-slate-100 transition-colors"
            @click="clearDates"
            :disabled="!localStartDate && !localEndDate"
            :class="{ 'opacity-50 cursor-not-allowed': !localStartDate && !localEndDate }"
            aria-label="Limpar datas"
          >
            <X class="w-4 h-4 text-slate-600" />
          </button>
          
          <div class="space-y-2">
            <p class="text-sm font-medium">Data inicial</p>
            <Calendar
              :model-value="(localStartDateValue as any)"
              :is-date-disabled="isStartDateDisabled"
              @update:model-value="handleStartDateSelect"
            />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium">Data final</p>
            <Calendar
              :model-value="(localEndDateValue as any)"
              :is-date-disabled="isEndDateDisabled"
              @update:model-value="handleEndDateSelect"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<style scoped>
.date-range-picker {
  width: 100%;
}

.trigger-wrapper {
  all: unset;
  display: block;
  width: 100%;
  cursor: pointer;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  width: 100%;
  min-width: 220px;
  min-height: 48px;
  border-radius: 0.9rem;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.filter-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: #475569;
  flex-shrink: 0;
}

.date-text {
  flex: 1;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  text-align: left;
}

.filter-pill:not(.has-dates) .date-text {
  color: #64748b;
  font-weight: 600;
}

@media (max-width: 640px) {
  .filter-pill {
    min-width: 200px;
  }
}
</style>
