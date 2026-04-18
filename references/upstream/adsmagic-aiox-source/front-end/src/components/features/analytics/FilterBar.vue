<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import type { Period } from '@/types/analytics'
import { X } from 'lucide-vue-next'

interface FilterOption {
  id: string
  name: string
}

interface Props {
  periods: Period[]
  currentPeriod: Period
  selectedOrigins?: string[]
  selectedStages?: string[]
  origins?: FilterOption[]
  stages?: FilterOption[]
  isLoading?: boolean
}

interface Emits {
  'update:period': [period: Period]
  'update:origins': [originIds: string[]]
  'update:stages': [stageIds: string[]]
  'clear': []
}

const props = withDefaults(defineProps<Props>(), {
  selectedOrigins: () => [],
  selectedStages: () => [],
  origins: () => [],
  stages: () => [],
  isLoading: false,
})

const emit = defineEmits<Emits>()

const periodLabels: Record<Period, string> = {
  today: 'Hoje',
  week: 'Esta Semana',
  month: 'Este Mês',
}

// Local state for dropdowns (to show selected items)
const showOriginDropdown = computed(() => props.origins.length > 0)
const showStageDropdown = computed(() => props.stages.length > 0)

// Count selected filters
const selectedOriginCount = computed(() => props.selectedOrigins?.length || 0)
const selectedStageCount = computed(() => props.selectedStages?.length || 0)
const hasFilters = computed(() => selectedOriginCount.value > 0 || selectedStageCount.value > 0)

// Handle period change
const handlePeriodChange = (period: Period) => {
  emit('update:period', period)
}

// Handle origin selection
const toggleOrigin = (originId: string) => {
  const current = props.selectedOrigins || []
  const updated = current.includes(originId)
    ? current.filter(id => id !== originId)
    : [...current, originId]
  emit('update:origins', updated)
}

// Handle stage selection
const toggleStage = (stageId: string) => {
  const current = props.selectedStages || []
  const updated = current.includes(stageId)
    ? current.filter(id => id !== stageId)
    : [...current, stageId]
  emit('update:stages', updated)
}

// Clear all filters
const handleClearFilters = () => {
  emit('update:origins', [])
  emit('update:stages', [])
  emit('clear')
}
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Period tabs -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="period in periods"
        :key="period"
        @click="handlePeriodChange(period)"
        :class="cn(
          'px-4 py-2 rounded-control text-sm font-medium transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          currentPeriod === period
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        )"
        :disabled="isLoading"
      >
        {{ periodLabels[period] }}
      </button>
    </div>

    <!-- Filters row -->
    <div class="flex gap-3 flex-wrap items-center">
      <!-- Origin filter -->
      <div v-if="showOriginDropdown" class="relative group">
        <button
          :class="cn(
            'px-3 py-2 rounded-control text-sm font-medium transition-all duration-200',
            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            'hover:bg-slate-200 dark:hover:bg-slate-700',
            selectedOriginCount > 0 && 'ring-2 ring-blue-500'
          )"
        >
          Origens{{ selectedOriginCount > 0 ? ` (${selectedOriginCount})` : '' }}
        </button>

        <!-- Dropdown menu -->
        <div
          class="absolute left-0 mt-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-control shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10"
        >
          <div class="p-2 max-h-64 overflow-y-auto space-y-1">
            <label
              v-for="origin in origins"
              :key="origin.id"
              class="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <input
                type="checkbox"
                :checked="selectedOrigins?.includes(origin.id)"
                @change="toggleOrigin(origin.id)"
                class="rounded"
              />
              <span class="text-sm text-slate-700 dark:text-slate-300">
                {{ origin.name }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Stage filter -->
      <div v-if="showStageDropdown" class="relative group">
        <button
          :class="cn(
            'px-3 py-2 rounded-control text-sm font-medium transition-all duration-200',
            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            'hover:bg-slate-200 dark:hover:bg-slate-700',
            selectedStageCount > 0 && 'ring-2 ring-blue-500'
          )"
        >
          Estágios{{ selectedStageCount > 0 ? ` (${selectedStageCount})` : '' }}
        </button>

        <!-- Dropdown menu -->
        <div
          class="absolute left-0 mt-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-control shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10"
        >
          <div class="p-2 max-h-64 overflow-y-auto space-y-1">
            <label
              v-for="stage in stages"
              :key="stage.id"
              class="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <input
                type="checkbox"
                :checked="selectedStages?.includes(stage.id)"
                @change="toggleStage(stage.id)"
                class="rounded"
              />
              <span class="text-sm text-slate-700 dark:text-slate-300">
                {{ stage.name }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Clear filters button -->
      <button
        v-if="hasFilters"
        @click="handleClearFilters"
        :class="cn(
          'px-3 py-2 rounded-control text-sm font-medium transition-all duration-200',
          'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
          'hover:bg-red-200 dark:hover:bg-red-900',
          'flex items-center gap-1'
        )"
      >
        <X class="w-4 h-4" />
        Limpar
      </button>
    </div>
  </div>
</template>
