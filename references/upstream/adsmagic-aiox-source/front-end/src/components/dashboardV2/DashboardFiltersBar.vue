<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useDashboardV2Store } from '@/stores/dashboardV2'
import { useOriginsStore } from '@/stores/origins'
import { Download, Calendar, Filter, RotateCw } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/radix/Select.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import Switch from '@/components/ui/Switch.vue'

interface Props {
  /**
   * Layout style for the toolbar. Inline follows the hero layout, sticky pins to the top.
   */
  layout?: 'inline' | 'sticky'
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'inline'
})

const attrs = useAttrs()
const dashboardStore = useDashboardV2Store()
const originsStore = useOriginsStore()

// Period options
const periodOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: 'custom', label: 'Período personalizado' }
]

// Origin options (all + active origins) - memoized to avoid unnecessary filtering
const originOptions = computed(() => {
  const options: Array<{ value: string | null; label: string }> = [{ value: null, label: 'Todas as origens' }]
  const activeOrigins = originsStore.origins.filter(o => o.isActive)
  
  for (const origin of activeOrigins) {
    options.push({ value: origin.id, label: origin.name })
  }
  
  return options
})

// Wrapper class adapts to inline (hero) or sticky (page top) usage
const wrapperClass = computed(() => cn(
  props.layout === 'sticky'
    ? 'sticky top-0 z-10 bg-background border-b border-border px-4 py-3 sm:px-6'
    : '',
  attrs.class as string
))

// Handle period change
function handlePeriodChange(value: string) {
  dashboardStore.updateFilter('period', value as '7d' | '30d' | '90d' | 'custom')
}

// Handle origin change
function handleOriginChange(value: string | null) {
  dashboardStore.updateFilter('origin', value)
}

// Handle refresh
function handleRefresh() {
  dashboardStore.loadDashboardData()
}

// Handle export
function handleExport() {
  // TODO: Implement export functionality
  console.log('[DashboardFiltersBar] Export clicked')
}
</script>

<template>
  <div
    :class="wrapperClass"
    role="toolbar"
    aria-label="Filtros do dashboard"
  >
    <div class="flex items-center gap-2 flex-wrap justify-end">
      <!-- Period Filter -->
      <div class="flex items-center gap-1.5">
        <Calendar class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Select
          :model-value="dashboardStore.filters.period"
          @update:model-value="handlePeriodChange"
          placeholder="Período"
        >
          <SelectItem
            v-for="option in periodOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </Select>
      </div>

      <!-- Origin Filter -->
      <div class="flex items-center gap-1.5">
        <Filter class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Select
          :model-value="dashboardStore.filters.origin ?? ''"
          @update:model-value="(v) => handleOriginChange(v || null)"
          placeholder="Origem"
        >
          <SelectItem
            v-for="option in originOptions"
            :key="option.value || 'all'"
            :value="option.value ?? ''"
          >
            {{ option.label }}
          </SelectItem>
        </Select>
      </div>

      <!-- Compare Toggle -->
      <div class="flex items-center gap-1.5">
        <Switch
          :checked="dashboardStore.filters.compare"
          @update:checked="dashboardStore.toggleCompare"
          id="compare-toggle"
        />
        <label
          for="compare-toggle"
          class="text-sm font-medium cursor-pointer"
        >
          Comparar
        </label>
      </div>

      <!-- Refresh Button -->
      <Button
        variant="ghost"
        size="sm"
        @click="handleRefresh"
        :disabled="dashboardStore.isLoading"
        aria-label="Atualizar dados"
        class="gap-1 h-9 px-3"
      >
        <RotateCw class="h-4 w-4" />
        <span class="hidden sm:inline">Atualizar</span>
      </Button>

      <!-- Export Button -->
      <Button
        variant="default"
        size="sm"
        @click="handleExport"
        aria-label="Exportar dados"
        class="gap-2"
      >
        <Download class="h-4 w-4" />
        <span class="hidden sm:inline">Exportar</span>
      </Button>
    </div>
  </div>
</template>
