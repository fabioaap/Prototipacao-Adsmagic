<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, AlertCircle, Inbox } from 'lucide-vue-next'

interface ColumnDef {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => string
  width?: string
}

interface Props {
  columns: ColumnDef[]
  rows: Array<Record<string, any>>
  isLoading?: boolean
  isEmpty?: boolean
  error?: string | null
  pageSize?: number
  title?: string
}

interface Emits {
  'sort': [key: string, direction: 'asc' | 'desc']
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isEmpty: false,
  error: null,
  pageSize: 10,
  title: undefined,
})

const emit = defineEmits<Emits>()

// Sorting state
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

// Handle sort
const handleSort = (key: string, sortable?: boolean) => {
  if (!sortable) return

  if (sortKey.value === key) {
    // Toggle direction if same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // New column, reset to asc
    sortKey.value = key
    sortDirection.value = 'asc'
  }

  emit('sort', key, sortDirection.value)
  currentPage.value = 1 // Reset to first page
}

// Sort rows
const sortedRows = computed(() => {
  const key = sortKey.value
  if (!key) return props.rows

  return [...props.rows].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()

    if (sortDirection.value === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })
})

// Pagination
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedRows.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(sortedRows.value.length / props.pageSize))
const pageInfo = computed(() => {
  const total = sortedRows.value.length
  const start = total === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1
  const end = Math.min(currentPage.value * props.pageSize, total)
  return { start, end, total }
})

// Format value
const formatValue = (value: any, column: ColumnDef): string => {
  if (column.format) {
    return column.format(value)
  }

  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR')
  }

  if (value === null || value === undefined) {
    return '-'
  }

  return String(value)
}

// Get sort icon
const getSortIcon = (key: string) => {
  if (sortKey.value !== key) return null
  return sortDirection.value === 'asc' ? 'up' : 'down'
}

// Navigation
const goToPage = (page: number) => {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
}
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Title -->
    <div v-if="title" class="px-1">
      <h3 class="section-title-sm">
        {{ title }}
      </h3>
    </div>

    <!-- Table wrapper -->
    <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900"
      >
        <div class="flex flex-col items-center gap-3">
          <div
            class="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"
          />
          <p class="text-sm text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="flex items-center justify-center p-8 bg-red-50 dark:bg-red-950/20"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <AlertCircle class="w-8 h-8 text-red-500" />
          <div>
            <p class="text-sm font-medium text-red-700 dark:text-red-400">
              Erro ao carregar dados
            </p>
            <p class="text-xs text-red-600 dark:text-red-500 mt-1">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="isEmpty || (paginatedRows.length === 0 && sortedRows.length === 0)"
        class="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <Inbox class="w-12 h-12 text-slate-400" />
          <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
            Nenhum dado disponível
          </p>
        </div>
      </div>

      <!-- Table -->
      <table v-else class="w-full">
        <!-- Header -->
        <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="handleSort(column.key, column.sortable)"
              :class="cn(
                'px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.sortable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'
              )"
            >
              <div class="flex items-center gap-2" :class="column.align === 'right' && 'justify-end'">
                {{ column.label }}
                <ChevronUp
                  v-if="getSortIcon(column.key) === 'up'"
                  class="w-4 h-4 text-blue-500"
                />
                <ChevronDown
                  v-else-if="getSortIcon(column.key) === 'down'"
                  class="w-4 h-4 text-blue-500"
                />
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr
            v-for="(row, idx) in paginatedRows"
            :key="idx"
            class="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="cn(
                'px-6 py-4 text-sm text-slate-700 dark:text-slate-300',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              )"
            >
              {{ formatValue(row[column.key], column) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between px-1 text-sm text-slate-600 dark:text-slate-400"
    >
      <div>
        Mostrando {{ pageInfo.start }} a {{ pageInfo.end }} de {{ pageInfo.total }} resultados
      </div>

      <div class="flex gap-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          :class="cn(
            'px-3 py-1 rounded border border-slate-200 dark:border-slate-700',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )"
        >
          Anterior
        </button>

        <div class="flex items-center gap-1">
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
        </div>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          :class="cn(
            'px-3 py-1 rounded border border-slate-200 dark:border-slate-700',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )"
        >
          Próxima
        </button>
      </div>
    </div>
  </div>
</template>
