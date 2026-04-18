<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import type { Sale } from '@/types/models'
import { useToast } from '@/components/ui/toast/use-toast'

// ============================================================================
// TOAST
// ============================================================================
const { toast } = useToast()

// ============================================================================
// STORES
// ============================================================================
const salesStore = useSalesStore()
const contactsStore = useContactsStore()
const stagesStore = useStagesStore()
const originsStore = useOriginsStore()

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

const statusOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'completed', label: 'Realizadas' },
  { value: 'lost', label: 'Perdidas' },
]

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

const filteredSales = computed(() => {
  console.log('[SalesView] Filtrando vendas...')
  console.log('[SalesView] Total de vendas:', salesStore.sales.length)
  console.log('[SalesView] Vendas confirmadas:', salesStore.confirmedSales.length)
  console.log('[SalesView] Vendas perdidas:', salesStore.lostSales.length)
  console.log('[SalesView] Status filter:', statusFilter.value)
  
  let sales: Sale[] = []
  
  // Filtro por status
  if (statusFilter.value === 'completed') {
    sales = Array.from(salesStore.confirmedSales)
  } else if (statusFilter.value === 'lost') {
    sales = Array.from(salesStore.lostSales)
  } else {
    sales = Array.from(salesStore.sales)
  }
  
  console.log('[SalesView] Vendas após filtro de status:', sales.length)
  
  // Filtro por busca (nome, telefone, status)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    sales = sales.filter(sale => {
      const contactName = sale.contactName?.toLowerCase() || ''
      const contactPhone = sale.contactPhone?.toLowerCase() || ''
      const status = sale.status?.toLowerCase() || ''
      return contactName.includes(query) || contactPhone.includes(query) || status.includes(query)
    })
  }
  
  console.log('[SalesView] Vendas após busca:', sales.length)
  
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
  console.log('[SalesView] Carregando dados...')
  try {
    const promises: Promise<void>[] = [
      salesStore.fetchSales(),
      stagesStore.fetchStages(),
      originsStore.fetchOrigins(),
    ]
    // Skip contacts fetch if already loaded for same project
    if (contactsStore.contacts.length === 0) {
      promises.push(contactsStore.fetchContacts())
    }
    await Promise.all(promises)
    console.log('[SalesView] Dados carregados com sucesso')
    console.log('[SalesView] Vendas carregadas:', salesStore.sales.length)
    console.log('[SalesView] Contatos carregados:', contactsStore.contacts.length)
  } catch (error) {
    console.error('Erro ao carregar dados iniciais:', error)
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
    console.error('Erro ao aplicar filtros:', error)
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
    console.error('Erro ao limpar filtros:', error)
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
    console.error('Erro ao excluir venda:', error)
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
    console.error('Erro ao exportar vendas:', error)
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
    </div>
  </AppShell>
</template>


