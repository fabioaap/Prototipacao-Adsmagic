<script setup lang="ts">
/**
 * ComparisonPeriodsSelector.vue
 * 
 * Componente para selecionar até 3 períodos de comparação no Dashboard.
 * Permite visualizar métricas side-by-side de diferentes períodos.
 * 
 * @feature G5.7 — Comparação multi-período
 */
import { computed } from 'vue'
import { Plus, X, Calendar } from 'lucide-vue-next'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface ComparisonPeriod {
  id: string
  label: string
  startDate: Date
  endDate: Date
  color: string
}

interface Props {
  /** Períodos de comparação selecionados */
  periods: ComparisonPeriod[]
  /** Máximo de períodos permitidos */
  maxPeriods?: number
  /** Desabilitar adição de novos períodos */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxPeriods: 3,
  disabled: false
})

const emit = defineEmits<{
  'add-period': [period: Omit<ComparisonPeriod, 'id'>]
  'remove-period': [periodId: string]
  'clear-all': []
}>()

// Cores para os períodos de comparação
const periodColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const canAddMore = computed(() => props.periods.length < props.maxPeriods && !props.disabled)

// Opções de períodos pré-definidos para adicionar
const presetPeriods = computed(() => {
  const now = new Date()
  return [
    {
      label: 'Mês anterior',
      getRange: () => {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)
        return { startDate: start, endDate: end }
      }
    },
    {
      label: '2 meses atrás',
      getRange: () => {
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - 1, 0)
        return { startDate: start, endDate: end }
      }
    },
    {
      label: '3 meses atrás',
      getRange: () => {
        const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - 2, 0)
        return { startDate: start, endDate: end }
      }
    },
    {
      label: 'Mesmo período ano anterior',
      getRange: () => {
        const start = new Date(now.getFullYear() - 1, now.getMonth(), 1)
        const end = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0)
        return { startDate: start, endDate: end }
      }
    },
    {
      label: 'Últimos 30 dias (anterior)',
      getRange: () => {
        const end = new Date(now)
        end.setDate(end.getDate() - 30)
        const start = new Date(end)
        start.setDate(start.getDate() - 30)
        return { startDate: start, endDate: end }
      }
    }
  ]
})

// Verificar se um preset já foi adicionado
const isPresetAdded = (presetLabel: string): boolean => {
  return props.periods.some(p => p.label === presetLabel)
}

// Adicionar período de preset
const handleAddPreset = (preset: typeof presetPeriods.value[0]) => {
  const { startDate, endDate } = preset.getRange()
  const colorIndex = props.periods.length % periodColors.length
  const color = periodColors[colorIndex] ?? '#3B82F6'
  emit('add-period', {
    label: preset.label,
    startDate,
    endDate,
    color
  })
}

// Formatar data para exibição
const formatDateRange = (start: Date, end: Date): string => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
  const startStr = start.toLocaleDateString('pt-BR', options)
  const endStr = end.toLocaleDateString('pt-BR', options)
  return `${startStr} - ${endStr}`
}
</script>

<template>
  <div class="comparison-card">
    <!-- Header do card -->
    <div class="comparison-header">
      <div class="comparison-title">
        <Calendar class="h-5 w-5 text-blue-500" />
        <div>
          <h3 class="section-title-sm">Comparar períodos</h3>
          <p class="text-xs text-slate-500">Compare métricas com até {{ maxPeriods }} períodos anteriores</p>
        </div>
      </div>
      
      <!-- Botão para adicionar período -->
      <Popover v-if="canAddMore">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="add-period-button"
            data-testid="add-comparison-period"
          >
            <Plus class="h-4 w-4" />
            <span>Adicionar período</span>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          class="w-72 p-3" 
          align="end"
          :side-offset="8"
        >
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-700 mb-3">
              Selecione um período para comparar:
            </p>
            <button
              v-for="preset in presetPeriods"
              :key="preset.label"
              type="button"
              :disabled="isPresetAdded(preset.label)"
              :class="cn(
                'w-full text-left px-3 py-2.5 text-sm rounded-lg border transition-all',
                isPresetAdded(preset.label) 
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' 
                  : 'hover:bg-blue-50 hover:border-blue-200 border-slate-200 bg-white'
              )"
              @click="handleAddPreset(preset)"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar class="h-4 w-4 text-blue-600" />
                </div>
                <span class="font-medium text-slate-700">{{ preset.label }}</span>
              </div>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>

    <!-- Períodos selecionados -->
    <div v-if="periods.length > 0" class="selected-periods">
      <div
        v-for="period in periods"
        :key="period.id"
        class="period-chip"
        :style="{ 
          borderColor: period.color,
          backgroundColor: `${period.color}10`
        }"
      >
        <span 
          class="period-dot" 
          :style="{ backgroundColor: period.color }"
        />
        <div class="period-info">
          <span class="period-name">{{ period.label }}</span>
          <span class="period-range">{{ formatDateRange(period.startDate, period.endDate) }}</span>
        </div>
        <button
          type="button"
          class="remove-chip-btn"
          :aria-label="`Remover período ${period.label}`"
          @click="emit('remove-period', period.id)"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Limpar todos -->
      <button
        v-if="periods.length > 1"
        type="button"
        class="clear-all-button"
        @click="emit('clear-all')"
      >
        Limpar todas comparações
      </button>
    </div>

    <!-- Estado vazio -->
    <div v-else class="empty-state">
      <p class="text-sm text-slate-500">
        Nenhum período de comparação selecionado. Clique em "Adicionar período" para começar.
      </p>
    </div>
  </div>
</template>

<style scoped>
.comparison-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.comparison-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.comparison-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comparison-title h3 {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.2;
}

.comparison-title p {
  margin: 0;
}

.add-period-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.add-period-button:hover {
  background: #2563eb;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.add-period-button:active {
  transform: translateY(0);
}

.selected-periods {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.period-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid;
  border-radius: 0.75rem;
  font-size: 0.8125rem;
  transition: all 0.15s ease;
}

.period-chip:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.period-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.period-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.period-name {
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.period-range {
  font-size: 0.6875rem;
  color: #64748b;
  line-height: 1.2;
}

.remove-chip-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
  color: #94a3b8;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-left: 0.25rem;
}

.remove-chip-btn:hover {
  background: #ef4444;
  color: white;
}

.clear-all-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  background: white;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
  margin-left: auto;
}

.clear-all-button:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.empty-state {
  padding: 0.5rem 0;
  text-align: center;
}

.empty-state p {
  margin: 0;
}
</style>
