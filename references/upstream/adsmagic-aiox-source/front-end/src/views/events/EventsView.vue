<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ToolbarMetricPill from '@/components/ui/ToolbarMetricPill.vue'
import ToolbarIconButton from '@/components/ui/ToolbarIconButton.vue'
import EventsList from '@/components/events/EventsList.vue'
import EventsFilters from '@/components/events/EventsFilters.vue'
import EventDetailsDrawer from '@/components/events/EventDetailsDrawer.vue'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { RefreshCw } from '@/composables/useIcons'
import { useEventsStore } from '@/stores/events'
import { eventsService } from '@/services/api/events'
import { downloadBlob, generateFilename } from '@/utils/download'
import type { Event } from '@/types/models'
import type { EventFilters } from '@/types/api'
import { useToast } from '@/components/ui/toast/use-toast'

// ============================================================================
// STATE
// ============================================================================

const eventsStore = useEventsStore()
const { toast } = useToast()

// Search query
const searchQuery = ref('')

// Date range filter
interface DateRange {
  start: Date
  end: Date
}
const dateRange = ref<DateRange | undefined>()

// Overlay states
const isFiltersModalOpen = ref(false)
const isDetailsDrawerOpen = ref(false)
const selectedEvent = ref<Event | null>(null)

// Loading states
const isRetrying = ref(false)
const isExporting = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

const events = computed(() => [...eventsStore.events])
const isLoading = computed(() => eventsStore.isLoading)
const hasFilters = computed(() => eventsStore.hasFilters)
// Converter filters readonly para mutável
const filters = computed((): EventFilters => {
  const storeFilters = eventsStore.filters
  return {
    search: storeFilters.search,
    platform: storeFilters.platform,
    platforms: storeFilters.platforms ? [...storeFilters.platforms] : undefined,
    status: storeFilters.status,
    statuses: storeFilters.statuses ? [...storeFilters.statuses] : undefined,
    eventType: storeFilters.eventType,
    type: storeFilters.type,
    types: storeFilters.types ? [...storeFilters.types] : undefined,
    eventName: storeFilters.eventName,
    contactId: storeFilters.contactId,
    entityTypes: storeFilters.entityTypes ? [...storeFilters.entityTypes] : undefined,
    startDate: storeFilters.startDate,
    endDate: storeFilters.endDate,
    page: storeFilters.page,
    pageSize: storeFilters.pageSize
  }
})

const activeFiltersCount = computed(() => {
  let count = 0
  const currentFilters = filters.value
  
  if (currentFilters.types?.length) count++
  if (currentFilters.platforms?.length) count++
  if (currentFilters.statuses?.length) count++
  if (currentFilters.entityTypes?.length) count++
  if (currentFilters.dateFrom) count++
  if (currentFilters.dateTo) count++
  
  return count
})

const filteredEventsCount = computed(() => {
  return eventsStore.pagination.total
})

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(async () => {
  // Carregar eventos iniciais
  await loadEvents()
})

// ============================================================================
// METHODS
// ============================================================================

const loadEvents = async () => {
  try {
    await eventsStore.fetchEvents()
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar os eventos',
      variant: 'destructive'
    })
  }
}

const handleRefresh = async () => {
  await loadEvents()
  toast({
    title: 'Atualizado!',
    description: 'Lista de eventos atualizada'
  })
}

const handleDateRangeChange = async (range: DateRange) => {
  dateRange.value = range
  // Aplicar filtro de data aos eventos
  await eventsStore.setFilters({
    ...filters.value,
    startDate: range.start.toISOString(),
    endDate: range.end.toISOString()
  })
  toast({
    title: 'Filtro aplicado',
    description: 'Período de datas atualizado'
  })
}

const handleViewDetails = (event: Event) => {
  selectedEvent.value = event
  isDetailsDrawerOpen.value = true
}

const handleRetry = async (event: Event) => {
  isRetrying.value = true
  
  try {
    await eventsStore.retryEvent(event.id)
    toast({
      title: 'Sucesso!',
      description: 'Evento reenviado com sucesso'
    })
    
    // Atualizar lista se estiver na view de detalhes
    if (isDetailsDrawerOpen.value) {
      await loadEvents()
    }
  } catch (error) {
    console.error('Erro ao reenviar evento:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível reenviar o evento',
      variant: 'destructive'
    })
  } finally {
    isRetrying.value = false
  }
}

const handleExport = async () => {
  if (isExporting.value) return
  
  isExporting.value = true
  try {
    // Usa os filtros atuais da store (convertendo readonly para mutável)
    const currentFilters = { ...eventsStore.filters } as Record<string, unknown>
    // Converter arrays readonly para mutáveis
    if (currentFilters.platforms) {
      currentFilters.platforms = [...(currentFilters.platforms as string[])]
    }
    if (currentFilters.types) {
      currentFilters.types = [...(currentFilters.types as string[])]
    }
    if (currentFilters.statuses) {
      currentFilters.statuses = [...(currentFilters.statuses as string[])]
    }
    const blob = await eventsService.export(currentFilters as Parameters<typeof eventsService.export>[0])
    
    const filename = generateFilename('eventos', 'csv')
    downloadBlob(blob, filename)
    
    toast({
      title: 'Exportação concluída',
      description: `Arquivo ${filename} baixado com sucesso`
    })
  } catch (error) {
    console.error('Erro ao exportar eventos:', error)
    toast({
      title: 'Erro na exportação',
      description: 'Não foi possível exportar os eventos',
      variant: 'destructive'
    })
  } finally {
    isExporting.value = false
  }
}

const handleApplyFilters = async (newFilters: EventFilters) => {
  try {
    await eventsStore.setFilters(newFilters)
    isFiltersModalOpen.value = false
    toast({
      title: 'Filtros aplicados',
      description: 'Filtros foram aplicados com sucesso'
    })
  } catch (error) {
    console.error('Erro ao aplicar filtros:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível aplicar os filtros',
      variant: 'destructive'
    })
  }
}

const handlePageChange = async (page: number) => {
  try {
    await eventsStore.goToPage(page)
  } catch (error) {
    console.error('Erro ao mudar página:', error)
  }
}

const handleClearFilters = async () => {
  try {
    await eventsStore.clearFilters()
    toast({
      title: 'Filtros limpos',
      description: 'Todos os filtros foram removidos'
    })
  } catch (error) {
    console.error('Erro ao limpar filtros:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível limpar os filtros',
      variant: 'destructive'
    })
  }
}

// ============================================================================
// WATCHERS
// ============================================================================

// Sem watchers no momento
</script>

<template>
  <AppLayout>
    <div class="page-shell section-stack-md">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <div>
          <PageHeader title="Eventos" />
        </div>
        
        <div class="events-toolbar">
          <div class="events-toolbar__search">
            <SearchInput
              v-model="searchQuery"
              placeholder="Pesquise pelo nome ou telefone"
              :disabled="isLoading"
              variant="toolbar"
            />
          </div>

          <div class="events-toolbar__date">
            <DateRangePicker
              :model-value="dateRange"
              :show-presets="true"
              variant="toolbar"
              class-name="!min-w-0 w-full"
              @change="handleDateRangeChange"
            />
          </div>

          <div class="events-toolbar__footer">
            <ToolbarMetricPill
              class="events-toolbar__results"
              label="Resultados:"
              :value="filteredEventsCount"
            />

            <ToolbarIconButton
              class="events-toolbar__refresh-shell"
              ariaLabel="Atualizar eventos"
              :disabled="isLoading"
              @click="handleRefresh"
            >
              <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
            </ToolbarIconButton>
          </div>
        </div>
      </div>

    <!-- Conteúdo Principal -->
    <div class="space-y-4">
      <!-- EventsList -->
      <EventsList
        :events="events"
        :loading="isLoading"
        :search-query="searchQuery"
        :items-per-page="10"
        :has-active-filters="hasFilters"
        :active-filters-count="activeFiltersCount"
        server-paginated
        :page="eventsStore.pagination.page"
        :total-items="eventsStore.pagination.total"
        @event-view-details="handleViewDetails"
        @event-retry="handleRetry"
        @export="handleExport"
        @open-filters="isFiltersModalOpen = true"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Modals -->
    <EventsFilters
      :open="isFiltersModalOpen"
      :filters="filters"
      @update:open="isFiltersModalOpen = $event"
      @apply="handleApplyFilters"
      @clear="handleClearFilters"
    />

    <EventDetailsDrawer
      :open="isDetailsDrawerOpen"
      :event="selectedEvent"
      :loading="isRetrying"
      @update:open="isDetailsDrawerOpen = $event"
      @retry="handleRetry"
    />
  </div>
  </AppLayout>
</template>

<style scoped>
.events-toolbar {
  display: grid;
  grid-template-columns: 506.922px 444px 113.141px 40px;
  gap: 6px;
  align-items: center;
}

.events-toolbar__search,
.events-toolbar__date {
  min-width: 0;
}

.events-toolbar__footer {
  display: contents;
}

.events-toolbar__results {
  width: 113.141px;
}

@media (max-width: 1024px) {
  .events-toolbar {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .events-toolbar__footer {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px;
    align-items: center;
  }

  .events-toolbar__results {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .events-toolbar {
    grid-template-columns: minmax(0, 1fr);
  }

  .events-toolbar__results {
    width: 100%;
  }
}
</style>
