<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from 'lucide-vue-next'
import { useFormat } from '@/composables/useFormat'
import type { OriginBreakdown } from '@/types'
import Skeleton from '@/components/ui/Skeleton.vue'

interface Props {
  /**
   * Origin breakdown data
   */
  data: OriginBreakdown[]
  
  /**
   * Loading state
   */
  loading?: boolean
  
  /**
   * Sort column
   */
  sortBy?: keyof OriginBreakdown
  
  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  sortBy: 'roi',
  sortDirection: 'desc'
})

const emit = defineEmits<{
  rowClick: [origin: OriginBreakdown]
  sort: [column: keyof OriginBreakdown]
}>()

const { formatCurrency, formatPercentage } = useFormat()

// Sort data
const sortedData = computed(() => {
  if (!props.data || props.data.length === 0) return []
  
  const sorted = [...props.data]
  sorted.sort((a, b) => {
    const aVal = a[props.sortBy!]
    const bVal = b[props.sortBy!]
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return props.sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    return 0
  })
  
  return sorted
})

// Handle row click
function handleRowClick(origin: OriginBreakdown) {
  emit('rowClick', origin)
}

// Handle sort
function handleSort(column: keyof OriginBreakdown) {
  emit('sort', column)
}

// Get sort icon
function getSortIcon(column: keyof OriginBreakdown) {
  if (props.sortBy !== column) return ArrowUpDown
  return props.sortDirection === 'asc' ? ArrowUp : ArrowDown
}
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <div class="p-4 sm:p-6 border-b border-border">
      <h3 class="section-title-sm">
        Desempenho por Origem
      </h3>
      <p class="text-sm text-muted-foreground mt-1">
        Comparação de investimento e retorno por canal
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="props.loading" class="p-4 space-y-3">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-16 w-full" />
      <Skeleton class="h-16 w-full" />
      <Skeleton class="h-16 w-full" />
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full" role="table">
        <thead class="bg-muted/50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              scope="col"
            >
              Origem
            </th>
            
            <th
              class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
              scope="col"
              @click="handleSort('spend')"
              role="button"
              :aria-label="`Ordenar por gastos ${props.sortBy === 'spend' ? (props.sortDirection === 'asc' ? 'decrescente' : 'crescente') : ''}`"
            >
              <div class="inline-flex items-center gap-1">
                <span>Gastos</span>
                <component :is="getSortIcon('spend')" class="h-3 w-3" />
              </div>
            </th>
            
            <th
              class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
              scope="col"
              @click="handleSort('contacts')"
              role="button"
            >
              <div class="inline-flex items-center gap-1">
                <span>Contatos</span>
                <component :is="getSortIcon('contacts')" class="h-3 w-3" />
              </div>
            </th>
            
            <th
              class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
              scope="col"
              @click="handleSort('sales')"
              role="button"
            >
              <div class="inline-flex items-center gap-1">
                <span>Vendas</span>
                <component :is="getSortIcon('sales')" class="h-3 w-3" />
              </div>
            </th>
            
            <th
              class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
              scope="col"
              @click="handleSort('conversionRate')"
              role="button"
            >
              <div class="inline-flex items-center gap-1">
                <span>Taxa Conv.</span>
                <component :is="getSortIcon('conversionRate')" class="h-3 w-3" />
              </div>
            </th>
            
            <th
              class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
              scope="col"
              @click="handleSort('cac')"
              role="button"
            >
              <div class="inline-flex items-center gap-1">
                <span>CAC</span>
                <component :is="getSortIcon('cac')" class="h-3 w-3" />
              </div>
            </th>
            
            <th
              class="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
              scope="col"
              @click="handleSort('roi')"
              role="button"
            >
              <div class="inline-flex items-center gap-1">
                <span>ROI</span>
                <component :is="getSortIcon('roi')" class="h-3 w-3" />
              </div>
            </th>
            
            <th class="px-4 py-3 w-12" scope="col"></th>
          </tr>
        </thead>
        
        <tbody class="divide-y divide-border">
          <tr
            v-for="origin in sortedData"
            :key="origin.originId"
            class="hover:bg-muted/30 cursor-pointer transition-colors"
            @click="handleRowClick(origin)"
            role="row"
          >
            <td class="px-4 py-3 section-kicker">
              {{ origin.originName }}
            </td>
            
            <td class="px-4 py-3 text-sm text-right text-foreground">
              {{ formatCurrency(origin.spend) }}
            </td>
            
            <td class="px-4 py-3 text-sm text-right text-foreground">
              {{ origin.contacts }}
            </td>
            
            <td class="px-4 py-3 text-sm text-right text-foreground">
              {{ origin.sales }}
            </td>
            
            <td class="px-4 py-3 text-sm text-right text-foreground">
              {{ formatPercentage(origin.conversionRate) }}
            </td>
            
            <td class="px-4 py-3 text-sm text-right text-foreground">
              {{ formatCurrency(origin.cac) }}
            </td>
            
            <td
              class="px-4 py-3 text-sm text-right font-semibold"
              :class="{
                'text-success': origin.roi >= 2,
                'text-warning': origin.roi >= 1 && origin.roi < 2,
                'text-destructive': origin.roi < 1
              }"
            >
              {{ origin.roi.toFixed(1) }}x
            </td>
            
            <td class="px-4 py-3">
              <ChevronRight class="h-4 w-4 text-muted-foreground" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-if="!props.loading && sortedData.length === 0"
      class="p-8 text-center"
    >
      <p class="text-sm text-muted-foreground">
        Nenhuma origem com dados disponíveis
      </p>
    </div>
  </div>
</template>
