<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFormat } from '@/composables/useFormat'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const { formatCurrency, formatNumber } = useFormat()

// Dados mock para performance por origem
const performanceData = computed(() => [
  {
    id: '1',
    origin: 'Google Ads',
    originColor: 'bg-blue-500',
    adSpend: 450.25,
    contacts: 45,
    sales: 8,
    conversionRate: 17.8,
    roi: 3.2
  },
  {
    id: '2',
    origin: 'Meta Ads',
    originColor: 'bg-blue-600',
    adSpend: 320.15,
    contacts: 28,
    sales: 5,
    conversionRate: 17.9,
    roi: 2.8
  },
  {
    id: '3',
    origin: 'TikTok Ads',
    originColor: 'bg-black',
    adSpend: 180.50,
    contacts: 15,
    sales: 2,
    conversionRate: 13.3,
    roi: 1.9
  },
  {
    id: '4',
    origin: 'Organic',
    originColor: 'bg-green-500',
    adSpend: 0,
    contacts: 12,
    sales: 3,
    conversionRate: 25.0,
    roi: 0
  },
  {
    id: '5',
    origin: 'Direct',
    originColor: 'bg-gray-600',
    adSpend: 0,
    contacts: 8,
    sales: 1,
    conversionRate: 12.5,
    roi: 0
  },
  {
    id: '6',
    origin: 'Others',
    originColor: 'bg-gray-500',
    adSpend: 0,
    contacts: 5,
    sales: 1,
    conversionRate: 20.0,
    roi: 0
  }
])

// Estado da tabela
const sortField = ref<'origin' | 'adSpend' | 'contacts' | 'sales' | 'conversionRate' | 'roi'>('roi')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = ref(10)

// Dados ordenados
const sortedData = computed(() => {
  const sorted = [...performanceData.value].sort((a, b) => {
    let aValue: number | string = a[sortField.value]
    let bValue: number | string = b[sortField.value]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }

    if (sortDirection.value === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  return sorted
})

// Dados paginados
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedData.value.slice(start, end)
})

// Total de páginas
const totalPages = computed(() => {
  return Math.ceil(performanceData.value.length / pageSize.value)
})

// Função para ordenar
const handleSort = (field: typeof sortField.value) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'desc'
  }
}

// Função para obter ícone de ordenação
const getSortIcon = (field: typeof sortField.value) => {
  if (sortField.value !== field) return null
  return sortDirection.value === 'asc' ? ChevronUp : ChevronDown
}

// Navegação de páginas
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Formatação de ROI
const formatROI = (roi: number) => {
  if (roi === 0) return 'N/A'
  return `${roi.toFixed(1)}x`
}

// Formatação de taxa de conversão
const formatConversionRate = (rate: number) => {
  return `${rate.toFixed(1)}%`
}
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <!-- Header -->
    <div class="border-b border-border p-6">
      <h3 class="section-title-sm">Desempenho por Origem</h3>
      <p class="text-sm text-muted-foreground">
        Análise detalhada de performance de cada origem de tráfego
      </p>
    </div>

    <!-- Tabela -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="border-b border-border bg-muted/50">
          <tr>
            <!-- Origem -->
            <th class="px-6 py-3 text-left">
              <button
                @click="handleSort('origin')"
                class="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                Origem
                <component :is="getSortIcon('origin')" class="h-3 w-3" />
              </button>
            </th>

            <!-- Gastos -->
            <th class="px-6 py-3 text-right">
              <button
                @click="handleSort('adSpend')"
                class="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                Gastos
                <component :is="getSortIcon('adSpend')" class="h-3 w-3" />
              </button>
            </th>

            <!-- Contatos -->
            <th class="px-6 py-3 text-right">
              <button
                @click="handleSort('contacts')"
                class="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                Contatos
                <component :is="getSortIcon('contacts')" class="h-3 w-3" />
              </button>
            </th>

            <!-- Vendas -->
            <th class="px-6 py-3 text-right">
              <button
                @click="handleSort('sales')"
                class="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                Vendas
                <component :is="getSortIcon('sales')" class="h-3 w-3" />
              </button>
            </th>

            <!-- Taxa de Conversão -->
            <th class="px-6 py-3 text-right">
              <button
                @click="handleSort('conversionRate')"
                class="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                Taxa de Conversão
                <component :is="getSortIcon('conversionRate')" class="h-3 w-3" />
              </button>
            </th>

            <!-- ROI -->
            <th class="px-6 py-3 text-right">
              <button
                @click="handleSort('roi')"
                class="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                ROI
                <component :is="getSortIcon('roi')" class="h-3 w-3" />
              </button>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border">
          <tr
            v-for="item in paginatedData"
            :key="item.id"
            class="transition-colors hover:bg-muted/50 cursor-pointer"
          >
            <!-- Origem -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <span 
                  class="inline-flex h-3 w-3 rounded-full"
                  :class="item.originColor"
                ></span>
                <span class="section-kicker">
                  {{ item.origin }}
                </span>
              </div>
            </td>

            <!-- Gastos -->
            <td class="px-6 py-4 text-right">
              <span class="text-sm text-foreground">
                {{ item.adSpend > 0 ? formatCurrency(item.adSpend) : 'R$ 0,00' }}
              </span>
            </td>

            <!-- Contatos -->
            <td class="px-6 py-4 text-right">
              <span class="text-sm text-foreground">
                {{ formatNumber(item.contacts) }}
              </span>
            </td>

            <!-- Vendas -->
            <td class="px-6 py-4 text-right">
              <span class="section-kicker">
                {{ formatNumber(item.sales) }}
              </span>
            </td>

            <!-- Taxa de Conversão -->
            <td class="px-6 py-4 text-right">
              <span class="text-sm text-foreground">
                {{ formatConversionRate(item.conversionRate) }}
              </span>
            </td>

            <!-- ROI -->
            <td class="px-6 py-4 text-right">
              <span 
                class="text-sm font-medium"
                :class="item.roi > 2 ? 'text-green-600' : item.roi > 1 ? 'text-yellow-600' : 'text-red-600'"
              >
                {{ formatROI(item.roi) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div class="border-t border-border px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Info -->
        <div class="text-sm text-muted-foreground">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize, performanceData.length) }} de {{ performanceData.length }} resultados
        </div>

        <!-- Controles -->
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="flex h-8 w-8 items-center justify-center rounded border border-border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            <ChevronLeft class="h-4 w-4" />
          </button>

          <!-- Páginas -->
          <div class="flex items-center gap-1">
            <button
              v-for="page in Math.min(5, totalPages)"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'flex h-8 w-8 items-center justify-center rounded text-sm',
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-muted'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="flex h-8 w-8 items-center justify-center rounded border border-border bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
