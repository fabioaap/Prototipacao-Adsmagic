<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Filter, RefreshCcw, Download } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import AppShell from '@/components/layout/AppShell.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import ToolbarMetricPill from '@/components/ui/ToolbarMetricPill.vue'
import ToolbarIconButton from '@/components/ui/ToolbarIconButton.vue'
import Select from '@/components/ui/radix/Select.vue'
import SalesMetrics from '@/components/sales/SalesMetrics.vue'
import SalesList from '@/components/sales/SalesList.vue'
import SalesFilters, { type SaleFilters } from '@/components/sales/SalesFilters.vue'
import SaleDetailsDrawer from '@/components/sales/SaleDetailsDrawer.vue'
import SaleFormModal from '@/components/sales/SaleFormModal.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import { SelectItem, SelectItemText } from 'radix-vue'
import { useSalesStore } from '@/stores/sales'
import { useContactsStore } from '@/stores/contacts'
import { useStagesStore } from '@/stores/stages'
import { useOriginsStore } from '@/stores/origins'
import { salesService } from '@/services/api/sales'
import type { Sale, MarkSaleLostDTO } from '@/types'
import { useToast } from '@/components/ui/toast/use-toast'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useI18n } from 'vue-i18n'
import Input from '@/components/ui/Input.vue'

// ============================================================================
// TOAST
// ============================================================================
const { toast } = useToast()
const { t } = useI18n()

// ============================================================================
// STORES
// ============================================================================
const salesStore = useSalesStore()
const contactsStore = useContactsStore()
const stagesStore = useStagesStore()
const originsStore = useOriginsStore()
const confirmDialog = useConfirmDialog()

// ============================================================================
// STATE
// ============================================================================
const statusFilter = ref<'all' | 'completed' | 'lost'>('all')
const searchQuery = ref('')
const filters = ref<SaleFilters>({
  originIds: [],
  minValue: undefined,
  maxValue: undefined,
  dateFrom: '',
  dateTo: '',
  city: '',
  country: '',
  device: '',
})

const statusOptions = computed(() => [
  { value: 'all', label: t('sales.statusAll') },
  { value: 'completed', label: t('sales.statusCompleted') },
  { value: 'lost', label: t('sales.statusLost') },
])

const isFiltersModalOpen = ref(false)
const isDeleteConfirmModalOpen = ref(false)
const isDetailsDrawerOpen = ref(false)
const isEditModalOpen = ref(false)
const isExporting = ref(false)

const selectedSale = ref<Sale | null>(null)

// ============================================================================
// COMPUTED
// ============================================================================
const isLoading = computed(
  () =>
    salesStore.isLoading ||
    contactsStore.isLoading ||
    originsStore.isLoading
)

const debouncedSearch = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val
  }, 300)
})

const filteredSales = computed(() => {
  let sales: Sale[]

  if (statusFilter.value === 'completed') {
    sales = salesStore.confirmedSales as Sale[]
  } else if (statusFilter.value === 'lost') {
    sales = salesStore.lostSales as Sale[]
  } else {
    sales = salesStore.sales as Sale[]
  }

  const query = debouncedSearch.value.toLowerCase()
  if (query) {
    sales = sales.filter(sale =>
      (sale.contactName?.toLowerCase().includes(query)) ||
      (sale.contactPhone?.toLowerCase().includes(query)) ||
      (sale.status?.toLowerCase().includes(query))
    )
  }

  return sales
})

const hasActiveFilters = computed(() => {
  return (
    filters.value.originIds.length > 0 ||
    filters.value.minValue !== undefined ||
    filters.value.maxValue !== undefined ||
    filters.value.dateFrom !== '' ||
    filters.value.dateTo !== '' ||
    filters.value.city !== '' ||
    filters.value.country !== '' ||
    filters.value.device !== ''
  )
})

// ============================================================================
// METHODS
// ============================================================================
const fetchAllData = async () => {
  try {
    const promises: Promise<void>[] = [
      salesStore.fetchSales(),
      stagesStore.fetchStages(),
      originsStore.fetchOrigins(),
    ]
    if (contactsStore.contacts.length === 0) {
      promises.push(contactsStore.fetchContacts())
    }
    await Promise.all(promises)
  } catch (error) {
    console.error('[SalesView] Failed to load data:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar os dados das vendas. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleApplyFilters = async (newFilters: SaleFilters) => {
  filters.value = newFilters
  
  const apiFilters = {
    origins: newFilters.originIds,
    minValue: newFilters.minValue,
    maxValue: newFilters.maxValue,
    dateFrom: newFilters.dateFrom,
    dateTo: newFilters.dateTo,
    city: newFilters.city,
    country: newFilters.country,
    device: newFilters.device,
    page: 1,
    pageSize: 10
  }
  
  try {
    await salesStore.setFilters(apiFilters)
  } catch (error) {
    console.error('[SalesView] Failed to apply filters:', error)
    toast({
      title: 'Erro',
      description: 'Erro ao aplicar filtros. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleClearFilters = async () => {
  filters.value = {
    originIds: [],
    minValue: undefined,
    maxValue: undefined,
    dateFrom: '',
    dateTo: '',
    city: '',
    country: '',
    device: '',
  }
  
  try {
    await salesStore.clearFilters()
  } catch (error) {
    console.error('[SalesView] Failed to clear filters:', error)
  }
}

const handleEditSale = (sale: Sale) => {
  selectedSale.value = sale
  isEditModalOpen.value = true
}

const handleDeleteSale = (sale: Sale) => {
  selectedSale.value = sale
  isDeleteConfirmModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!selectedSale.value) return

  try {
    await salesStore.deleteSale(selectedSale.value.id)
    toast({
      title: 'Sucesso!',
      description: `Venda excluída.`,
    })
    isDeleteConfirmModalOpen.value = false
    fetchAllData()
  } catch (error) {
    console.error('[SalesView] Failed to delete sale:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível excluir a venda. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleViewDetails = (sale: Sale) => {
  selectedSale.value = sale
  isDetailsDrawerOpen.value = true
}

const handleDrawerEdit = (sale: Sale) => {
  isDetailsDrawerOpen.value = false
  selectedSale.value = sale
  isEditModalOpen.value = true
}

const handleDrawerDelete = (sale: Sale) => {
  isDetailsDrawerOpen.value = false
  handleDeleteSale(sale)
}

const handleExport = async () => {
  if (isExporting.value) return
  
  isExporting.value = true
  try {
    const blob = await salesService.exportToCSV({
      status: statusFilter.value === 'all' ? undefined : statusFilter.value,
      origins: filters.value.originIds,
      minValue: filters.value.minValue,
      maxValue: filters.value.maxValue
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendas-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Exportação concluída',
      description: 'Arquivo CSV baixado com sucesso'
    })
  } catch (error) {
    console.error('[SalesView] Failed to export:', error)
    toast({
      title: 'Erro ao exportar',
      description: 'Não foi possível exportar as vendas',
      variant: 'destructive'
    })
  } finally {
    isExporting.value = false
  }
}

// ============================================================================
// BULK ACTIONS
// ============================================================================
const isBulkMarkLostModalOpen = ref(false)
const bulkMarkLostIds = ref<string[]>([])
const bulkLostReason = ref('')

const handleBulkDelete = async (saleIds: string[]) => {
  const confirmed = await confirmDialog.confirm({
    title: 'Excluir Vendas',
    description: `Tem certeza que deseja excluir ${saleIds.length} venda(s)? Esta ação é irreversível.`,
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
    variant: 'destructive'
  })

  if (!confirmed) return

  try {
    await Promise.all(saleIds.map(id => salesStore.deleteSale(id)))
    toast({
      title: 'Sucesso!',
      description: `${saleIds.length} venda(s) excluída(s).`,
    })
    fetchAllData()
  } catch (error) {
    console.error('[SalesView] Failed to bulk delete sales:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível excluir todas as vendas. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleBulkMarkLost = (saleIds: string[]) => {
  bulkMarkLostIds.value = saleIds
  bulkLostReason.value = ''
  isBulkMarkLostModalOpen.value = true
}

const handleConfirmBulkMarkLost = async () => {
  if (!bulkLostReason.value.trim()) return

  const dto: MarkSaleLostDTO = {
    lostReason: bulkLostReason.value.trim(),
  }

  try {
    await Promise.all(bulkMarkLostIds.value.map(id => salesStore.markSaleLost(id, dto)))
    toast({
      title: 'Sucesso!',
      description: `${bulkMarkLostIds.value.length} venda(s) marcada(s) como perdida(s).`,
    })
    isBulkMarkLostModalOpen.value = false
    fetchAllData()
  } catch (error) {
    console.error('[SalesView] Failed to bulk mark sales as lost:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível marcar todas as vendas como perdidas.',
      variant: 'destructive',
    })
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  fetchAllData()
})
</script>

<template>
  <AppShell container-size="2xl">
    <div class="w-full section-stack-md">
      <!-- Header -->
      <PageHeader title="Vendas" />

      <!-- Métricas Compactas -->
      <SalesMetrics :loading="isLoading" />

      <!-- Barra de Filtros -->
      <div class="w-full flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <SearchInput
            v-model="searchQuery"
            placeholder="Pesquise pelo nome, telefone ou status"
            class="sm:max-w-xs"
            variant="toolbar"
          />
          <Select
            v-model="statusFilter"
            placeholder="Selecione..."
          >
            <SelectItem
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              <SelectItemText>{{ option.label }}</SelectItemText>
            </SelectItem>
          </Select>
        </div>

        <div class="flex w-full flex-col gap-2 sm:flex-row sm:w-auto sm:items-center">
          <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <!-- Filtros Avançados -->
            <Button
              variant="outline"
              class="w-full justify-center sm:w-auto"
              :class="{ 'border-primary text-primary': hasActiveFilters }"
              @click="isFiltersModalOpen = true"
            >
              <Filter class="h-4 w-4 mr-2" />
              Filtros
              <span
                v-if="hasActiveFilters"
                class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 ml-1 rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
              >
                {{ Object.values(filters).filter(f => (Array.isArray(f) ? f.length > 0 : f !== '' && f !== undefined)).length }}
              </span>
            </Button>

            <!-- Exportar -->
            <Button
              variant="outline"
              class="w-full justify-center sm:w-auto"
              @click="handleExport"
              :disabled="isExporting || isLoading"
            >
              <Download class="h-4 w-4 mr-2" />
              {{ isExporting ? 'Exportando...' : 'Exportar' }}
            </Button>
          </div>

          <div class="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto sm:items-center">
            <!-- Contador de Resultados -->
            <ToolbarMetricPill
              class="w-full justify-center sm:w-auto"
              label="Resultados:"
              :value="filteredSales.length"
            />

            <!-- Atualizar -->
            <ToolbarIconButton
              ariaLabel="Atualizar vendas"
              @click="fetchAllData"
              :disabled="isLoading"
            >
              <RefreshCcw :class="['h-4 w-4', { 'animate-spin': isLoading }]" />
            </ToolbarIconButton>
          </div>
        </div>
      </div>

      <!-- Lista Unificada de Vendas (sem Tabs) -->
      <SalesList
        :sales="filteredSales"
        :loading="isLoading"
        @sale-view-details="handleViewDetails"
        @sale-edit="handleEditSale"
        @sale-delete="handleDeleteSale"
        @bulk-delete="handleBulkDelete"
        @bulk-mark-lost="handleBulkMarkLost"
        @export="handleExport"
      />

      <!-- Modals -->
      <SalesFilters
        :open="isFiltersModalOpen"
        :filters="filters"
        @update:open="isFiltersModalOpen = $event"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
      />

      <SaleFormModal
        :open="isEditModalOpen"
        :sale="selectedSale"
        @update:open="isEditModalOpen = $event"
        @success="fetchAllData"
      />

      <SaleDetailsDrawer
        :open="isDetailsDrawerOpen"
        :sale="selectedSale"
        @update:open="isDetailsDrawerOpen = $event"
        @edit="handleDrawerEdit"
        @delete="handleDrawerDelete"
      />

      <AlertDialog
        :model-value="isDeleteConfirmModalOpen"
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir esta venda? Esta ação é irreversível."
        confirm-text="Excluir"
        cancel-text="Cancelar"
        variant="destructive"
        @update:model-value="isDeleteConfirmModalOpen = $event"
        @confirm="handleConfirmDelete"
      />

      <!-- Confirm Dialog (bulk delete) -->
      <AlertDialog
        v-model="confirmDialog.isOpen.value"
        :title="confirmDialog.title.value"
        :description="confirmDialog.description.value"
        :confirm-text="confirmDialog.confirmText.value"
        :cancel-text="confirmDialog.cancelText.value"
        :variant="confirmDialog.variant.value"
        @confirm="confirmDialog.handleConfirm"
        @cancel="confirmDialog.handleCancel"
      />

      <!-- Bulk Mark as Lost Modal -->
      <AlertDialog
        :model-value="isBulkMarkLostModalOpen"
        :title="`Marcar ${bulkMarkLostIds.length} venda(s) como perdida(s)`"
        description="Informe o motivo da perda."
        confirm-text="Confirmar"
        cancel-text="Cancelar"
        variant="warning"
        @update:model-value="isBulkMarkLostModalOpen = $event"
        @confirm="handleConfirmBulkMarkLost"
      >
        <div class="mt-3">
          <Input
            v-model="bulkLostReason"
            placeholder="Ex: Cliente desistiu, preço alto..."
          />
        </div>
      </AlertDialog>
    </div>
  </AppShell>
</template>


