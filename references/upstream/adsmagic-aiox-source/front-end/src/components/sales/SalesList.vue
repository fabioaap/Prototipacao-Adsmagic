<script setup lang="ts">
import { ref, computed } from 'vue'
import { DollarSign, Package, Edit, Trash2, Phone, XCircle } from '@/composables/useIcons'
import Pagination from '@/components/ui/Pagination.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import type { Sale } from '@/types/models'
import { useFormat } from '@/composables/useFormat'
import { formatSafeCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import { useContactsStore } from '@/stores/contacts'
import { useOriginsStore } from '@/stores/origins'

// Store para buscar dados dos contatos
const contactsStore = useContactsStore()
const originsStore = useOriginsStore()

interface Props {
  /**
   * Lista de vendas a ser exibida (filtrada externamente)
   */
  sales?: Sale[]
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
  /**
   * Número de itens por página
   */
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  sales: () => [],
  loading: false,
  itemsPerPage: 10,
})

/**
 * Busca o telefone do contato - usa dados do join primeiro, fallback para store
 */
const getContactPhone = (sale: Sale): string => {
  if (sale.contactPhone) return sale.contactPhone
  const contact = contactsStore.contacts.find(c => c.id === sale.contactId)
  if (!contact?.phone) return '-'
  const countryCode = contact.countryCode || ''
  return countryCode ? `+${countryCode} ${contact.phone}` : contact.phone
}

/**
 * Busca o nome do contato - usa dados do join primeiro, fallback para store
 */
const getContactName = (sale: Sale): string => {
  if (sale.contactName) return sale.contactName
  const contact = contactsStore.contacts.find(c => c.id === sale.contactId)
  return contact?.name || '-'
}

const originNameById = computed(() => {
  return new Map(originsStore.origins.map((origin) => [origin.id, origin.name]))
})

const getDisplayOrigin = (originId?: string): string => {
  if (!originId) return '-'
  return originNameById.value.get(originId) || 'Origem desconhecida'
}

const emit = defineEmits<{
  saleEdit: [sale: Sale]
  saleDelete: [sale: Sale]
  bulkDelete: [saleIds: string[]]
  bulkMarkLost: [saleIds: string[]]
}>()

const { formatDate } = useFormat()

// Estado local
const currentPage = ref(1)

// Use sales prop directly
const filteredSales = computed(() => props.sales)

// Paginação
const totalPages = computed(() => {
  return Math.ceil(filteredSales.value.length / props.itemsPerPage)
})

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredSales.value.slice(start, end)
})

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Selection state
const selectedSales = ref<Set<string>>(new Set())

const allSelected = computed(() => {
  return paginatedSales.value.length > 0 &&
    paginatedSales.value.every(s => selectedSales.value.has(s.id))
})

const someSelected = computed(() => {
  return paginatedSales.value.some(s => selectedSales.value.has(s.id)) &&
    !allSelected.value
})

const handleSelectAll = () => {
  if (allSelected.value) {
    paginatedSales.value.forEach(s => selectedSales.value.delete(s.id))
  } else {
    paginatedSales.value.forEach(s => selectedSales.value.add(s.id))
  }
}

const handleSelectSale = (saleId: string, selected: boolean) => {
  if (selected) {
    selectedSales.value.add(saleId)
  } else {
    selectedSales.value.delete(saleId)
  }
}

// Handle actions
const handleEdit = (sale: Sale) => {
  emit('saleEdit', sale)
}

const handleDelete = (sale: Sale) => {
  emit('saleDelete', sale)
}

const handleBulkDelete = () => {
  emit('bulkDelete', Array.from(selectedSales.value))
  selectedSales.value.clear()
}

const handleBulkMarkLost = () => {
  emit('bulkMarkLost', Array.from(selectedSales.value))
  selectedSales.value.clear()
}

// Format status badge
const getStatusBadge = (status: Sale['status']) => {
  return status === 'completed' ? 'success' : 'destructive'
}

const getStatusLabel = (status: Sale['status']) => {
  return status === 'completed' ? 'Realizada' : 'Perdida'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Bulk Actions -->
    <div
      v-if="selectedSales.size > 0"
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted rounded-[14.4px]"
    >
      <span class="text-sm font-medium">
        {{ selectedSales.size }} venda(s) selecionada(s)
      </span>

      <div class="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="handleBulkMarkLost"
        >
          <XCircle class="h-4 w-4 mr-1" />
          Marcar como Perdida
        </Button>

        <Button
          variant="destructive"
          size="sm"
          @click="handleBulkDelete"
        >
          <Trash2 class="h-4 w-4 mr-1" />
          Excluir
        </Button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredSales.length === 0" class="flex flex-col items-center justify-center py-16 text-center bg-muted/30 rounded-[14.4px] border border-dashed border-muted-foreground/30">
      <Package class="w-24 h-24 text-muted-foreground/40 mb-6" aria-hidden="true" />
      <h3 class="section-title-sm mb-2">Nenhuma venda encontrada</h3>
      <p class="text-gray-600 mt-2 max-w-md">
        Ajuste os filtros para ver mais resultados.
      </p>
    </div>

    <!-- Table -->
    <div v-else class="border border-border rounded-[14.4px] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/50">
            <tr>
              <th class="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  @change="handleSelectAll"
                />
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ID
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contato
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Valor
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Data
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Origem
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <template v-if="props.loading">
              <tr v-for="i in props.itemsPerPage" :key="i">
                <td class="px-4 py-3" colspan="8">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div class="flex-1 space-y-2">
                      <div class="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div class="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else-if="filteredSales.length === 0">
              <td colspan="8" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center justify-center">
                  <Package class="h-12 w-12 text-muted-foreground mb-4" />
                  <p class="text-muted-foreground mb-2">
                    Nenhuma venda encontrada
                  </p>
                </div>
              </td>
            </tr>

            <!-- Data -->
            <tr
              v-else
              v-for="sale in paginatedSales"
              :key="sale.id"
              :class="cn(
                'border-b border-border transition-colors hover:bg-muted/50',
                selectedSales.has(sale.id) && 'bg-muted/30'
              )"
            >
              <!-- Checkbox -->
              <td class="w-12 px-4 py-3" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedSales.has(sale.id)"
                  class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  @change="handleSelectSale(sale.id, ($event.target as HTMLInputElement).checked)"
                />
              </td>

              <!-- ID -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign class="h-5 w-5 text-primary" />
                  </div>
                  <div class="min-w-0">
                    <p class="section-kicker truncate">
                      #{{ sale.id.slice(0, 8) }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Contato -->
              <td class="px-4 py-3">
                <div class="min-w-0">
                  <p class="section-kicker truncate">
                    {{ getContactName(sale) }}
                  </p>
                  <p class="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone class="h-3 w-3" />
                    {{ getContactPhone(sale) }}
                  </p>
                </div>
              </td>

              <!-- Valor -->
              <td class="px-4 py-3">
                <p class="section-kicker">
                  {{ formatSafeCurrency(sale.value, sale.currency) }}
                </p>
              </td>

              <!-- Data -->
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ formatDate(sale.date, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
              </td>

              <!-- Origem -->
              <td class="px-4 py-3">
                <span class="text-sm font-medium">
                  {{ getDisplayOrigin(sale.origin) }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <Badge :variant="getStatusBadge(sale.status)">
                  {{ getStatusLabel(sale.status) }}
                </Badge>
              </td>

              <!-- Ações -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    title="Editar"
                    @click.stop="handleEdit(sale)"
                  >
                    <Edit class="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    class="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-muted hover:text-destructive transition-colors"
                    title="Excluir"
                    @click.stop="handleDelete(sale)"
                  >
                    <Trash2 class="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between"
    >
      <p class="text-sm text-muted-foreground">
        Mostrando {{ (currentPage - 1) * props.itemsPerPage + 1 }} a
        {{ Math.min(currentPage * props.itemsPerPage, filteredSales.length) }}
        de {{ filteredSales.length }} vendas
      </p>

      <Pagination
        :page="currentPage"
        :page-size="props.itemsPerPage"
        :total="filteredSales.length"
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>
