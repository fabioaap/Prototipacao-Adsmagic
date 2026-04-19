<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { List, LayoutGrid, Loader2, Filter, Download, Plus } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import Input from '@/components/ui/Input.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import Modal from '@/components/ui/Modal.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import AppShell from '@/components/layout/AppShell.vue'
import ContactsList from '@/components/contacts/ContactsList.vue'
import ContactsKanban from '@/components/contacts/ContactsKanban.vue'
import ContactFormModal from '@/components/contacts/ContactFormModal.vue'
import ContactDetailsDrawer from '@/components/contacts/ContactDetailsDrawer.vue'
import ContactsFilters from '@/components/contacts/ContactsFilters.vue'
const ContactImportModal = defineAsyncComponent(() => import('@/components/contacts/ContactImportModal.vue'))
const StagesManagementDrawer = defineAsyncComponent(() => import('@/components/contacts/StagesManagementDrawer.vue'))
import SaleFormModal from '@/components/sales/SaleFormModal.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Select from '@/components/ui/Select.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAlertDialog } from '@/composables/useAlertDialog'
import type { ContactFilters } from '@/components/contacts/ContactsFilters.vue'
import type { Contact } from '@/types/models'
import { useContactsStore } from '@/stores/contacts'
import { useStagesStore } from '@/stores/stages'
import { useOriginsStore } from '@/stores/origins'
import { exportContactsToCSV } from '@/services/api/contacts'
import { downloadBlob, generateFilename } from '@/utils/download'
import { useToast } from '@/components/ui/toast/use-toast'
import { cn } from '@/lib/utils'

// ============================================================================
// Stores
// ============================================================================

const contactsStore = useContactsStore()
const stagesStore = useStagesStore()
const originsStore = useOriginsStore()
const confirmDialog = useConfirmDialog()
const alertDialog = useAlertDialog()

// ============================================================================
// State
// ============================================================================

type ViewMode = 'list' | 'kanban'

const { toast } = useToast()
const { t } = useI18n()

// Preferência de visualização (salva em localStorage)
import { CONTACTS_VIEW_MODE_KEY } from '@/config/storage-keys'
const storedViewMode = localStorage.getItem(CONTACTS_VIEW_MODE_KEY) as ViewMode | null
const viewMode = ref<ViewMode>(storedViewMode || 'list')

// Modals e Drawers
const isFormModalOpen = ref(false)
const isDetailsDrawerOpen = ref(false)
const isFiltersModalOpen = ref(false)
const isImportModalOpen = ref(false)
const isStagesDrawerOpen = ref(false)
const isSaleModalOpen = ref(false)
const saleContactId = ref<string | undefined>(undefined)

// Contato selecionado
const selectedContact = ref<Contact | null>(null)

// Loading states (usa isLoading do store para evitar duplicidade)
const isExporting = ref(false)

// Filtros
const activeFilters = ref<ContactFilters>({
  stageIds: [],
  originIds: [],
  tagIds: [],
  location: '',
  dateFrom: '',
  dateTo: '',
})

// Busca por texto livre (G6.4)
const searchTerm = ref('')
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// ============================================================================
// Computed
// ============================================================================

const isLoading = computed(() => contactsStore.isLoading)

const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.stageIds.length > 0 ||
    activeFilters.value.originIds.length > 0 ||
    activeFilters.value.location !== '' ||
    activeFilters.value.dateFrom !== '' ||
    activeFilters.value.dateTo !== ''
  )
})

// ============================================================================
// Methods
// ============================================================================

// Alternar visualização
const setViewMode = (mode: ViewMode) => {
  viewMode.value = mode
  localStorage.setItem(CONTACTS_VIEW_MODE_KEY, mode)
}

// Abrir modal de criação
const handleAddContact = (_stageId?: string) => {
  selectedContact.value = null
  isFormModalOpen.value = true
}

// Adicionar nova etapa (abre drawer de configuração de etapas)
const handleAddStage = () => {
  isStagesDrawerOpen.value = true
}

// Adicionar venda ao contato
const handleAddSale = (contact: Contact) => {
  saleContactId.value = contact.id
  isSaleModalOpen.value = true
}

// Sucesso ao criar venda
const handleSaleSuccess = () => {
  isSaleModalOpen.value = false
  saleContactId.value = undefined
}

// Ver detalhes do contato
const handleViewDetails = (contact: Contact) => {
  selectedContact.value = contact
  isDetailsDrawerOpen.value = true
}

// Editar contato
const handleEdit = (contact: Contact) => {
  selectedContact.value = contact
  isFormModalOpen.value = true
}

// Deletar contato
const handleDelete = async (contact: Contact) => {
  const confirmed = await confirmDialog.confirm({
    title: t('contacts.deleteConfirm.title'),
    description: t('contacts.deleteConfirm.description', { name: contact.name }),
    confirmText: t('common.delete'),
    cancelText: t('common.cancel'),
    variant: 'destructive'
  })

  if (!confirmed) {
    return
  }

  try {
    await contactsStore.deleteContact(contact.id)
  } catch (error) {
    console.error('Erro ao deletar contato:', error)
    await alertDialog.alert({
      title: t('common.error'),
      description: t('contacts.deleteConfirm.error'),
      variant: 'destructive'
    })
  }
}

// Deletar múltiplos contatos
const handleBulkDelete = async (contactIds: string[]) => {
  const confirmed = await confirmDialog.confirm({
    title: t('contacts.bulkDelete.title'),
    description: t('contacts.bulkDelete.description', { count: contactIds.length }),
    confirmText: t('common.delete'),
    cancelText: t('common.cancel'),
    variant: 'destructive'
  })

  if (!confirmed) {
    return
  }

  try {
    await Promise.all(contactIds.map(id => contactsStore.deleteContact(id)))
    toast({
      title: t('common.success'),
      description: t('contacts.bulkDelete.success', { count: contactIds.length }),
    })
  } catch (error) {
    console.error('Erro ao deletar contatos:', error)
    toast({
      title: t('common.error'),
      description: t('contacts.bulkDelete.error'),
      variant: 'destructive',
    })
  }
}

// Mover múltiplos contatos para um estágio
const handleBulkMoveStage = async (contactIds: string[], stageId: string) => {
  try {
    await Promise.all(
      contactIds.map(id => contactsStore.updateContact(id, { stage: stageId }))
    )
    toast({
      title: t('common.success'),
      description: t('contacts.bulkMove.success', { count: contactIds.length }),
    })
  } catch (error) {
    console.error('Erro ao mover contatos:', error)
    toast({
      title: t('common.error'),
      description: t('contacts.bulkMove.error'),
      variant: 'destructive',
    })
  }
}

// Exportar contatos selecionados
const handleBulkExport = async (contactIds: string[]) => {
  try {
    isExporting.value = true
    const contacts = contactsStore.contacts.filter(c => contactIds.includes(c.id))
    
    // Criar CSV manualmente dos contatos selecionados
    const headers = [
      t('contacts.csvHeaders.name'),
      t('contacts.csvHeaders.email'),
      t('contacts.csvHeaders.phone'),
      t('contacts.csvHeaders.location'),
      t('contacts.csvHeaders.stage'),
      t('contacts.csvHeaders.origin'),
      t('contacts.csvHeaders.date')
    ]
    const rows = contacts.map(c => [
      c.name || '',
      c.email || '',
      c.phone || '',
      c.location || '',
      c.stage || '',
      c.origin || '',
      c.createdAt || '',
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, generateFilename('contatos-selecionados', 'csv'))
    
    toast({
      title: t('common.success'),
      description: t('contacts.bulkExport.success', { count: contactIds.length }),
    })
  } catch (error) {
    console.error('Erro ao exportar contatos:', error)
    toast({
      title: t('common.error'),
      description: t('contacts.bulkExport.error'),
      variant: 'destructive',
    })
  } finally {
    isExporting.value = false
  }
}

// Sucesso ao criar/editar
const handleFormSuccess = () => {
  isFormModalOpen.value = false
  selectedContact.value = null
}

// Editar do drawer
const handleEditFromDrawer = (contact: Contact) => {
  isDetailsDrawerOpen.value = false
  selectedContact.value = contact
  isFormModalOpen.value = true
}

// Deletar do drawer
const handleDeleteFromDrawer = (contact: Contact) => {
  isDetailsDrawerOpen.value = false
  handleDelete(contact)
}

// Aplicar filtros
const buildApiFilters = (overrideSearch?: string) => {
  const effectiveSearch = overrideSearch !== undefined
    ? overrideSearch
    : (searchTerm.value || activeFilters.value.location)

  return {
    stages: activeFilters.value.stageIds,
    origins: activeFilters.value.originIds,
    search: effectiveSearch || undefined,
    dateFrom: activeFilters.value.dateFrom,
    dateTo: activeFilters.value.dateTo,
    page: 1,
    pageSize: 10
  }
}

const handleApplyFilters = async (filters: ContactFilters) => {
  activeFilters.value = filters
  const apiFilters = buildApiFilters()

  try {
    contactsStore.setFilters(apiFilters, { skipFetch: true })
    await Promise.all([
      contactsStore.fetchContacts(),
      contactsStore.fetchKanbanContacts(apiFilters),
    ])
  } catch (error) {
    console.error('Erro ao aplicar filtros:', error)
    toast({ title: t('contacts.filterError'), variant: 'destructive' })
  }
}

// Limpar filtros
const handleClearFilters = async () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }

  searchTerm.value = ''
  activeFilters.value = {
    stageIds: [],
    originIds: [],
    tagIds: [],
    location: '',
    dateFrom: '',
    dateTo: '',
  }
  
  try {
    contactsStore.setFilters({ page: 1, pageSize: 10 }, { skipFetch: true })
    await Promise.all([
      contactsStore.fetchContacts(),
      contactsStore.fetchKanbanContacts({ page: 1, pageSize: 10 }),
    ])
  } catch (error) {
    console.error('Erro ao limpar filtros:', error)
  }
}

const handleSearchChange = (value: string) => {
  searchTerm.value = value

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(async () => {
    try {
      const apiFilters = buildApiFilters(value.trim())
      contactsStore.setFilters(apiFilters, { skipFetch: true })
      await Promise.all([
        contactsStore.fetchContacts(),
        contactsStore.fetchKanbanContacts(apiFilters),
      ])
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
    }
  }, 300)
}

const handlePageChange = async (page: number) => {
  try {
    await contactsStore.goToPage(page)
  } catch (error) {
    console.error('Erro ao trocar página:', error)
  }
}

// Exportar
const handleExport = async () => {
  if (isExporting.value) return
  
  isExporting.value = true
  try {
    const result = await exportContactsToCSV({
      stages: activeFilters.value.stageIds,
      origins: activeFilters.value.originIds,
      search: searchTerm.value || undefined
    })
    
    if (result.ok) {
      const filename = generateFilename('contatos', 'csv')
      downloadBlob(result.value, filename)
      toast({
        title: t('contacts.exportDone'),
        description: t('contacts.exportDoneDescription', { filename })
      })
    } else {
      throw result.error
    }
  } catch (error) {
    console.error('Erro ao exportar contatos:', error)
    toast({
      title: t('contacts.exportError'),
      description: t('contacts.exportErrorDescription'),
      variant: 'destructive'
    })
  } finally {
    isExporting.value = false
  }
}

// Abrir filtros
const handleOpenFilters = () => {
  isFiltersModalOpen.value = true
}

// Handler para importação concluída (G6.7)
const handleImportComplete = async (count: number) => {
  isImportModalOpen.value = false
  toast({
    title: t('contacts.importDone'),
    description: t('contacts.importDoneDescription', { count }),
  })
  // Recarregar lista e kanban para manter as duas visualizações consistentes
  await Promise.all([
    contactsStore.fetchContacts(),
    contactsStore.fetchKanbanContacts(),
  ])
}

// Abrir drawer para gestão do funil (etapas do Kanban)
const handleGoToFunnel = () => {
  console.log('🎯 handleGoToFunnel clicado!')
  console.log('🎯 Estado antes:', isStagesDrawerOpen.value)
  isStagesDrawerOpen.value = true
  console.log('🎯 Estado depois:', isStagesDrawerOpen.value)
}

// Estados para modal de criação/edição de etapa
const isStageModalOpen = ref(false)
const editingStage = ref<any>(null)
const stageFormData = ref({
  name: '',
  trackingPhrase: '',
  type: 'normal' as 'normal' | 'sale' | 'lost'
})

// Funções de gerenciamento de etapas (atualmente não utilizadas no template)
/* const addNewStage = () => {
  // Fechar drawer antes de abrir modal
  isStagesDrawerOpen.value = false
  
  editingStage.value = null
  stageFormData.value = {
    name: '',
    trackingPhrase: '',
    type: 'normal'
  }
  isStageModalOpen.value = true
}

const editStage = () => {
  // Fechar drawer antes de abrir modal
  isStagesDrawerOpen.value = false
  
  editingStage.value = stage
  stageFormData.value = {
    name: stage.name,
    trackingPhrase: stage.trackingPhrase || '',
    type: stage.type
  }
  isStageModalOpen.value = true
}

const deleteStage = async () => {
  const stage = stagesStore.stageById(stageId)
  if (!stage) return

  // Confirmação
  const confirmed = await confirmDialog.confirm({
    title: 'Excluir Etapa',
    description: `Tem certeza que deseja excluir a etapa "${stage.name}"?\n\nEsta ação não pode ser desfeita.`,
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
    variant: 'destructive'
  })

  if (!confirmed) {
    return
  }

  try {
    await stagesStore.deleteStage(stageId)
    toast({
      title: 'Etapa excluída',
      description: `A etapa "${stage.name}" foi excluída com sucesso`,
    })
  } catch (error) {
    toast({
      title: 'Erro ao excluir',
      description: error instanceof Error ? error.message : 'Erro ao excluir etapa',
      variant: 'destructive'
    })
  }
}

const canDeleteStage = () => {
  // Não pode deletar a etapa padrão (primeira etapa normal)
  const defaultStage = stagesStore.defaultStage
  return defaultStage ? stage.id !== defaultStage.id : index !== 0
}

const saveStageForm = async () => {
  if (!stageFormData.value.name.trim()) {
    toast({
      title: 'Nome obrigatório',
      description: 'O nome da etapa é obrigatório',
      variant: 'destructive'
    })
    return
  }

  try {
    if (editingStage.value) {
      // Edição
      await stagesStore.updateStage(editingStage.value.id, {
        name: stageFormData.value.name.trim(),
        trackingPhrase: stageFormData.value.trackingPhrase.trim() || undefined,
      })
      toast({
        title: 'Etapa atualizada',
        description: `A etapa "${stageFormData.value.name}" foi atualizada com sucesso`,
      })
    } else {
      // Criação
      await stagesStore.createStage({
        name: stageFormData.value.name.trim(),
        trackingPhrase: stageFormData.value.trackingPhrase.trim() || undefined,
        type: stageFormData.value.type
      })
      toast({
        title: 'Etapa criada',
        description: `A etapa "${stageFormData.value.name}" foi criada com sucesso`,
      })
    }
    
    isStageModalOpen.value = false
    // Reabrir drawer após salvar
    setTimeout(() => {
      isStagesDrawerOpen.value = true
    }, 100)
  } catch (error) {
    toast({
      title: 'Erro ao salvar',
      description: error instanceof Error ? error.message : 'Erro ao salvar etapa',
      variant: 'destructive'
    })
  }
}

const saveChanges = () => {
  // Fechar drawer - mudanças já foram salvas automaticamente
  isStagesDrawerOpen.value = false
  toast({
    title: 'Etapas atualizadas',
    description: 'O kanban foi atualizado com as alterações',
  })
} */

// Handler para quando etapas forem atualizadas
const handleStagesUpdated = async () => {
  // Recarregar etapas para atualizar o kanban
  await stagesStore.fetchStages()
  toast({
    title: t('contacts.stagesUpdated'),
    description: t('contacts.stagesUpdatedDescription'),
  })
}

// Click no contato (kanban)
const handleContactClick = (contact: Contact) => {
  handleViewDetails(contact)
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  try {
    // Carregar stages e origins em paralelo (necessários para renderização)
    // Só recarrega contatos se a lista estiver vazia (evita fetch redundante
    // quando o store já tem dados do watch de project change)
    const promises: Promise<void>[] = [
      stagesStore.fetchStages(),
      originsStore.fetchOrigins(),
    ]

    if (contactsStore.contacts.length === 0) {
      promises.push(contactsStore.fetchContacts())
    }
    if (contactsStore.kanbanContacts.length === 0) {
      promises.push(contactsStore.fetchKanbanContacts())
    }

    await Promise.all(promises)
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
})

onUnmounted(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }
})
</script>

<template>
  <AppShell container-size="2xl">
    <div class="w-full section-stack-md">
        <!-- Header com ações integradas -->
        <PageHeader
          :title="t('contacts.title')"
          :description="t('contacts.description')"
        />

        <!-- Toolbar compartilhada (visível em ambos os modos) -->
        <div class="w-full flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <!-- Search -->
          <div class="relative flex-1 w-full sm:w-auto">
            <SearchInput
              :model-value="searchTerm"
              :placeholder="t('contacts.search')"
              class="h-10"
              @update:model-value="handleSearchChange"
            />
          </div>

          <!-- Actions -->
          <div class="flex w-full flex-col gap-2 sm:flex-row sm:w-auto sm:items-center">
            <div class="flex w-full items-center gap-2 sm:w-auto sm:flex-none">
              <!-- Toggle de visualização -->
              <div class="flex items-center gap-1 p-1 bg-muted rounded-control shrink-0">
                <button
                  :class="cn(
                    'h-8 w-8 inline-flex items-center justify-center rounded-control text-sm font-medium transition-colors',
                    viewMode === 'list'
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )"
                  @click="setViewMode('list')"
                  :title="t('contacts.listView')"
                  :aria-label="t('contacts.listView')"
                >
                  <List class="h-4 w-4" />
                </button>
                <button
                  :class="cn(
                    'h-8 w-8 inline-flex items-center justify-center rounded-control text-sm font-medium transition-colors',
                    viewMode === 'kanban'
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )"
                  @click="setViewMode('kanban')"
                  :title="t('contacts.kanbanView')"
                  :aria-label="t('contacts.kanbanView')"
                >
                  <LayoutGrid class="h-4 w-4" />
                </button>
              </div>

              <Button variant="outline" size="sm" class="flex-1 sm:flex-none" @click="handleGoToFunnel">
                {{ t('contacts.editFunnelStages') }}
              </Button>
            </div>

            <!-- Active Filters Indicator -->
            <div
              v-if="hasActiveFilters"
              class="w-full text-xs font-medium text-primary sm:w-auto"
            >
              <span class="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
                <span>{{ t('contacts.activeFilters') }}</span>
                <button
                  class="underline hover:no-underline"
                  @click="handleClearFilters"
                >
                  {{ t('contacts.clearFilters') }}
                </button>
              </span>
            </div>

            <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
              <Button
                variant="outline"
                size="sm"
                class="w-full"
                @click="handleOpenFilters"
              >
                <Filter class="h-4 w-4 mr-2" />
                {{ t('common.filters') }}
              </Button>

              <Button
                variant="outline"
                size="sm"
                class="w-full"
                @click="handleExport"
              >
                <Download class="h-4 w-4 mr-2" />
                {{ t('contacts.export') }}
              </Button>
            </div>

            <Button
              size="sm"
              class="w-full sm:w-auto"
              @click="handleAddContact()"
            >
              <Plus class="h-4 w-4 mr-2" />
              {{ t('contacts.addNew') }}
            </Button>
          </div>
        </div>

        <!-- List View -->
        <div
          v-if="viewMode === 'list'"
          class="w-full"
        >
          <ContactsList
            :loading="isLoading"
            :server-paginated="true"
            :search-query="searchTerm"
            :hide-toolbar="true"
            @contact-view-details="handleViewDetails"
            @contact-edit="handleEdit"
            @contact-delete="handleDelete"
            @contact-add-sale="handleAddSale"
            @add-contact="handleAddContact"
            @open-filters="handleOpenFilters"
            @bulk-delete="handleBulkDelete"
            @bulk-move-stage="handleBulkMoveStage"
            @bulk-export="handleBulkExport"
            @export="handleExport"
            @search-change="handleSearchChange"
            @page-change="handlePageChange"
          />
        </div>

        <!-- T031: Kanban View com gutters responsivos preservados -->
        <div v-else class="w-full -mx-gutter-mobile sm:-mx-gutter-tablet lg:-mx-gutter-desktop">
          <div class="pl-gutter-mobile sm:pl-gutter-tablet lg:pl-gutter-desktop">
            <ContactsKanban
              :loading="contactsStore.isFetchingKanban"
              :draggable="true"
              @contact-click="handleContactClick"
              @contact-view-details="handleViewDetails"
              @add-contact="handleAddContact"
              @add-stage="handleAddStage"
            />
          </div>
        </div>
      </div>

    <!-- Form Modal (Create/Edit) -->
    <ContactFormModal
      v-model:open="isFormModalOpen"
      :contact="selectedContact"
      @success="handleFormSuccess"
    />

    <!-- Details Drawer -->
    <ContactDetailsDrawer
      v-model:open="isDetailsDrawerOpen"
      :contact="selectedContact"
      @edit="handleEditFromDrawer"
      @delete="handleDeleteFromDrawer"
    />

    <!-- Filters Modal -->
    <ContactsFilters
      v-model:open="isFiltersModalOpen"
      :filters="activeFilters"
      @apply="handleApplyFilters"
      @clear="handleClearFilters"
    />

    <!-- Import CSV Modal -->
    <ContactImportModal
      v-model:open="isImportModalOpen"
      @imported="handleImportComplete"
    />

    <!-- Sale Form Modal -->
    <SaleFormModal
      :open="isSaleModalOpen"
      :contact-id="saleContactId"
      @update:open="isSaleModalOpen = $event"
      @success="handleSaleSuccess"
    />

    <!-- Stages Management Drawer -->
    <StagesManagementDrawer
      v-model:open="isStagesDrawerOpen"
      @stages-updated="handleStagesUpdated"
    />

    <!-- Modal de Criação/Edição de Etapa -->
    <Modal
      :open="isStageModalOpen"
      :title="editingStage ? t('contacts.stageModal.editTitle') : t('contacts.stageModal.newTitle')"
      size="md"
      @update:open="isStageModalOpen = $event"
    >
      <div class="space-y-4">
        <div>
          <Label for="stage-name">{{ t('contacts.stageModal.stageName') }}</Label>
          <Input
            id="stage-name"
            v-model="stageFormData.name"
            :placeholder="t('contacts.stageModal.stageNamePlaceholder')"
            class="mt-1"
          />
        </div>

        <div>
          <Label for="stage-phrase">{{ t('contacts.stageModal.trackingPhrase') }}</Label>
          <Input
            id="stage-phrase"
            v-model="stageFormData.trackingPhrase"
            :placeholder="t('contacts.stageModal.trackingPhrasePlaceholder')"
            class="mt-1"
          />
          <p class="text-xs text-muted-foreground mt-1">
            {{ t('contacts.stageModal.trackingPhraseHint') }}
          </p>
        </div>

        <div>
          <Label>{{ t('contacts.stageModal.stageType') }}</Label>
          <div class="mt-2">
            <Select
              v-model="stageFormData.type"
              :options="[
                { value: 'normal', label: t('contacts.stageModal.typeNormal') },
                { value: 'sale', label: t('contacts.stageModal.typeSale') },
                { value: 'lost', label: t('contacts.stageModal.typeLost') }
              ]"
              :placeholder="t('contacts.stageModal.typePlaceholder')"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button variant="outline" @click="isStageModalOpen = false">
          {{ t('common.cancel') }}
        </Button>
        <Button @click="() => {}" :disabled="stagesStore.isLoading">
          <span v-if="stagesStore.isLoading">
            <Loader2 class="h-4 w-4 animate-spin mr-2" />
            {{ t('contacts.stageModal.saving') }}
          </span>
          <span v-else>
            {{ editingStage ? t('contacts.stageModal.updateStage') : t('contacts.stageModal.createStage') }}
          </span>
        </Button>
      </template>
    </Modal>
  </AppShell>

  <!-- Dialogs de Confirmação e Alerta -->
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

  <AlertDialog
    v-model="alertDialog.isOpen.value"
    :title="alertDialog.title.value"
    :description="alertDialog.description.value"
    :confirm-text="alertDialog.confirmText.value"
    :variant="alertDialog.variant.value === 'info' ? 'warning' : alertDialog.variant.value"
    @confirm="alertDialog.handleConfirm"
  />
</template>
