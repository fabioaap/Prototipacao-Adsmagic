<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from 'lucide-vue-next'
import Skeleton from '@/components/ui/Skeleton.vue'

export interface AdsTableColumn {
  id: string
  label: string
  align?: 'left' | 'right'
  format?: 'text' | 'number' | 'currency' | 'percent' | 'multiplier'
  sortable?: boolean
  subtitleKey?: string
}

export interface AdsTableRow {
  id: string
  thumbnailUrl?: string
  customMetrics?: Record<string, number>
  [key: string]: string | number | null | undefined | Record<string, number>
}

interface Props {
  columns: AdsTableColumn[]
  rows: AdsTableRow[]
  loading?: boolean
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  selectable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  sortBy: 'spend',
  sortDirection: 'desc',
  selectable: false,
})

const emit = defineEmits<{
  sort: [columnId: string]
  'row-click': [row: AdsTableRow]
}>()

function handleSort(columnId: string) {
  emit('sort', columnId)
}

function getSortIcon(columnId: string) {
  if (props.sortBy !== columnId) return ArrowUpDown
  return props.sortDirection === 'asc' ? ArrowUp : ArrowDown
}

function toNumber(value: string | number | Record<string, number> | null | undefined): number | null {
  if (typeof value === 'object' && value !== null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function formatValue(value: string | number | Record<string, number> | null | undefined, format: AdsTableColumn['format']): string {
  if (value === null || value === undefined || value === '') return '—'
  const numericValue = toNumber(value)

  if (format === 'currency') {
    if (numericValue === null) return '—'
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    })
  }

  if (format === 'percent') {
    if (numericValue === null) return '—'
    return `${numericValue.toFixed(2).replace('.', ',')}%`
  }

  if (format === 'multiplier') {
    if (numericValue === null) return '—'
    return `${numericValue.toFixed(2).replace('.', ',')}x`
  }

  if (format === 'number') {
    if (numericValue === null) return '—'
    return Math.round(numericValue).toLocaleString('pt-BR')
  }

  return String(value)
}

const sortedRows = computed(() => {
  if (!props.sortBy) return props.rows

  const rows = [...props.rows]
  rows.sort((a, b) => {
    const aValue = a[props.sortBy]
    const bValue = b[props.sortBy]
    const aNum = toNumber(aValue)
    const bNum = toNumber(bValue)

    if (aNum !== null && bNum !== null) {
      return props.sortDirection === 'asc' ? aNum - bNum : bNum - aNum
    }

    const aText = String(aValue ?? '')
    const bText = String(bValue ?? '')
    if (props.sortDirection === 'asc') {
      return aText.localeCompare(bText, 'pt-BR')
    }
    return bText.localeCompare(aText, 'pt-BR')
  })

  return rows
})
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <div v-if="props.loading" class="p-4 space-y-3">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-14 w-full" />
      <Skeleton class="h-14 w-full" />
      <Skeleton class="h-14 w-full" />
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full" role="table">
        <thead class="bg-muted/50">
          <tr>
            <th
              v-for="column in props.columns"
              :key="column.id"
              scope="col"
              class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              :class="column.align === 'right' ? 'text-right' : 'text-left'"
            >
              <button
                v-if="column.sortable !== false"
                type="button"
                class="inline-flex items-center gap-1 hover:text-foreground"
                :class="column.align === 'right' ? 'ml-auto' : ''"
                @click="handleSort(column.id)"
              >
                <span>{{ column.label }}</span>
                <component :is="getSortIcon(column.id)" class="h-3 w-3" />
              </button>
              <span v-else>
                {{ column.label }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border">
          <tr
            v-for="row in sortedRows"
            :key="row.id"
            class="hover:bg-muted/30 transition-colors"
            :class="{ 'cursor-pointer': props.selectable }"
            @click="props.selectable ? emit('row-click', row) : undefined"
          >
            <td
              v-for="(column, colIndex) in props.columns"
              :key="`${row.id}-${column.id}`"
              class="px-4 py-3 text-sm text-foreground"
              :class="column.align === 'right' ? 'text-right' : 'text-left font-medium'"
            >
              <span
                v-if="colIndex === 0 && row.thumbnailUrl"
                class="inline-flex items-center gap-3"
              >
                <img
                  :src="row.thumbnailUrl"
                  :alt="String(row[column.id] ?? '')"
                  class="h-10 w-10 shrink-0 rounded object-cover bg-muted"
                  loading="lazy"
                />
                <span class="inline-flex items-center gap-1.5 min-w-0">
                  <span class="truncate">{{ formatValue(row[column.id], column.format) }}</span>
                  <ChevronRight v-if="props.selectable" class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </span>
              </span>
              <span
                v-else-if="colIndex === 0 && props.selectable"
                class="inline-flex items-center gap-1.5"
              >
                {{ formatValue(row[column.id], column.format) }}
                <ChevronRight class="h-3.5 w-3.5 text-muted-foreground" />
              </span>
              <div
                v-else-if="column.subtitleKey && row[column.subtitleKey]"
                class="flex flex-col gap-0.5"
              >
                <span>{{ formatValue(row[column.id], column.format) }}</span>
                <span class="text-xs text-muted-foreground truncate max-w-[160px]">{{ row[column.subtitleKey] }}</span>
              </div>
              <template v-else>
                {{ formatValue(row[column.id], column.format) }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!props.loading && sortedRows.length === 0"
      class="p-8 text-center text-sm text-muted-foreground"
    >
      Nenhum dado encontrado para o período selecionado.
    </div>
  </div>
</template>
