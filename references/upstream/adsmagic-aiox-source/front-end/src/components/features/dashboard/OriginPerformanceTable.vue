<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useFormat } from '@/composables/useFormat'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Table from '@/components/ui/TableLegacy.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Badge from '@/components/ui/Badge.vue'

const { t } = useI18n()
const dashboardStore = useDashboardStore()
const { formatCurrency, formatNumber } = useFormat()

const currentPage = ref(1)
const itemsPerPage = 10
const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('desc')

const sortedData = computed(() => {
  const data = [...dashboardStore.originPerformanceData]
  
  if (!sortColumn.value) {
    return data.sort((a, b) => b.sales - a.sales)
  }

  return data.sort((a, b) => {
    const aVal = a[sortColumn.value as keyof typeof a]
    const bVal = b[sortColumn.value as keyof typeof b]
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    return 0
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedData.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(sortedData.value.length / itemsPerPage)
})

const toggleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'desc'
  }
}

const getSortIcon = (column: string) => {
  if (sortColumn.value !== column) return ArrowUpDown
  return sortDirection.value === 'asc' ? ArrowUp : ArrowDown
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t('dashboard.originTable.title') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="dashboardStore.isLoading" class="space-y-4">
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-64 w-full" />
      </div>

      <div v-else-if="paginatedData.length === 0" class="flex items-center justify-center py-12 text-muted-foreground">
        {{ t('dashboard.originTable.noData') }}
      </div>

      <div v-else class="space-y-4">
        <div class="overflow-x-auto">
          <Table>
            <thead>
              <tr class="border-b">
                <th class="px-4 py-3 text-left text-sm font-medium">
                  {{ t('dashboard.originTable.origin') }}
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                  @click="toggleSort('investment')"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ t('dashboard.originTable.spent') }}</span>
                    <component :is="getSortIcon('investment')" class="h-4 w-4" />
                  </div>
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                  @click="toggleSort('contacts')"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ t('dashboard.originTable.contacts') }}</span>
                    <component :is="getSortIcon('contacts')" class="h-4 w-4" />
                  </div>
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                  @click="toggleSort('sales')"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ t('dashboard.originTable.sales') }}</span>
                    <component :is="getSortIcon('sales')" class="h-4 w-4" />
                  </div>
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                  @click="toggleSort('conversionRate')"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ t('dashboard.originTable.conversionRate') }}</span>
                    <component :is="getSortIcon('conversionRate')" class="h-4 w-4" />
                  </div>
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                  @click="toggleSort('roi')"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ t('dashboard.originTable.roi') }}</span>
                    <component :is="getSortIcon('roi')" class="h-4 w-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in paginatedData"
                :key="item.origin"
                class="border-b hover:bg-accent/50 transition-colors"
              >
                <td class="px-4 py-3">
                  <Badge>{{ item.origin }}</Badge>
                </td>
                <td class="px-4 py-3 text-sm">
                  {{ formatCurrency(item.investment) }}
                </td>
                <td class="px-4 py-3 text-sm">
                  {{ formatNumber(item.contacts) }}
                </td>
                <td class="px-4 py-3 text-sm font-medium">
                  {{ formatNumber(item.sales) }}
                </td>
                <td class="px-4 py-3 text-sm">
                  {{ item.conversionRate.toFixed(2) }}%
                </td>
                <td class="px-4 py-3 text-sm font-semibold">
                  {{ item.roi !== null ? item.roi.toFixed(1) + 'x' : 'N/A' }}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        <Pagination
          v-if="totalPages > 1"
          v-model:page="currentPage"
          :page-size="itemsPerPage"
          :total="sortedData.length"
        />
      </div>
    </CardContent>
  </Card>
</template>
