<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Filter, Download, Plus, Trash2, MoveRight, FileDown } from 'lucide-vue-next'
import ContactRow from './ContactRow.vue'
import Button from '@/components/ui/Button.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Select from '@/components/ui/Select.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import type { Contact, Tag } from '@/types/models'
import { useContactsStore } from '@/stores/contacts'
import { useStagesStore } from '@/stores/stages'

interface Props {
  /**
   * Se true, mostra loading skeleton
   */
  loading?: boolean
  /**
   * Número de itens por página
   */
  itemsPerPage?: number
  /**
   * Se true, permite seleção múltipla
   */
  selectable?: boolean
  /**
   * Busca atual controlada pelo componente pai
   */
  searchQuery?: string
  /**
   * Se true, usa busca/paginação controladas pelo backend
   */
  serverPaginated?: boolean
  /**
   * Se true, oculta a toolbar interna (busca, filtros, exportar, novo contato)
   * para quando o componente pai já renderiza esses controles
   */
  hideToolbar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  itemsPerPage: 10,
  selectable: true,
  searchQuery: '',
  serverPaginated: false,
  hideToolbar: false,
})

const emit = defineEmits<{
  contactViewDetails: [contact: Contact]
  contactEdit: [contact: Contact]
  contactDelete: [contact: Contact]
  contactAddSale: [contact: Contact]
  addContact: []
  openFilters: []
  bulkDelete: [contactIds: string[]]
  bulkMoveStage: [contactIds: string[], stageId: string]
  bulkExport: [contactIds: string[]]
  export: []
  searchChange: [value: string]
  pageChange: [page: number]
}>()

const contactsStore = useContactsStore()
const stagesStore = useStagesStore()

// Estado local
const selectedContacts = ref<Set<string>>(new Set())
const internalSearchQuery = ref(props.searchQuery || '')
const localCurrentPage = ref(1)
const visibleContactTags = ref<Record<string, Tag[]>>({})

watch(
  () => props.searchQuery,
  (value) => {
    if (props.serverPaginated) {
      internalSearchQuery.value = value || ''
    }
  }
)

const filteredContacts = computed(() => {
  if (props.serverPaginated) {
    return contactsStore.contacts
  }

  if (!internalSearchQuery.value.trim()) {
    return contactsStore.contacts
  }

  const query = internalSearchQuery.value.toLowerCase()
  return contactsStore.contacts.filter(contact => (
    contact.name.toLowerCase().includes(query) ||
    contact.email?.toLowerCase().includes(query) ||
    contact.phone?.toLowerCase().includes(query) ||
    contact.company?.toLowerCase().includes(query) ||
    contact.location?.toLowerCase().includes(query)
  ))
})

const activeSearchQuery = computed(() => (
  props.serverPaginated ? (props.searchQuery || '') : internalSearchQuery.value
))

const hasActiveSearch = computed(() => activeSearchQuery.value.trim().length > 0)

const currentPage = computed(() => (
  props.serverPaginated ? (contactsStore.pagination.page || 1) : localCurrentPage.value
))

const totalPages = computed(() => {
  if (props.serverPaginated) {
    return contactsStore.pagination.totalPages || 0
  }
  return Math.ceil(filteredContacts.value.length / props.itemsPerPage)
})

const totalContacts = computed(() => {
  if (props.serverPaginated) {
    return contactsStore.pagination.total || 0
  }
  return filteredContacts.value.length
})

const paginatedContacts = computed(() => {
  if (props.serverPaginated) {
    return contactsStore.contacts
  }

  const start = (localCurrentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredContacts.value.slice(start, end)
})

watch(
  [filteredContacts, () => props.itemsPerPage],
  ([contacts, itemsPerPage]) => {
    if (props.serverPaginated) {
      return
    }

    const maxPage = Math.max(1, Math.ceil(contacts.length / itemsPerPage))
    if (localCurrentPage.value > maxPage) {
      localCurrentPage.value = maxPage
    }
  }
)

// Tags preload desabilitado — coluna Tags não está visível no momento

// Seleção
const allSelected = computed(() => {
  return paginatedContacts.value.length > 0 &&
    paginatedContacts.value.every(c => selectedContacts.value.has(c.id))
})

const someSelected = computed(() => {
  return paginatedContacts.value.some(c => selectedContacts.value.has(c.id)) &&
    !allSelected.value
})

// Handle search
const handleSearch = (value: string) => {
  internalSearchQuery.value = value

  if (!props.serverPaginated) {
    localCurrentPage.value = 1
  }

  emit('searchChange', value)
}

// Handle select all
const handleSelectAll = () => {
  if (allSelected.value) {
    // Deselect all
    paginatedContacts.value.forEach(c => {
      selectedContacts.value.delete(c.id)
    })
  } else {
    // Select all
    paginatedContacts.value.forEach(c => {
      selectedContacts.value.add(c.id)
    })
  }
}

// Handle select contact
const handleSelectContact = (contact: Contact, selected: boolean) => {
  if (selected) {
    selectedContacts.value.add(contact.id)
  } else {
    selectedContacts.value.delete(contact.id)
  }
}

// Handle page change
const handlePageChange = (page: number) => {
  if (!props.serverPaginated) {
    localCurrentPage.value = page
  }

  emit('pageChange', page)
}

// Handle actions
const handleViewDetails = (contact: Contact) => {
  emit('contactViewDetails', contact)
}

const handleEdit = (contact: Contact) => {
  emit('contactEdit', contact)
}

const handleDelete = (contact: Contact) => {
  emit('contactDelete', contact)
}

const handleAddSale = (contact: Contact) => {
  emit('contactAddSale', contact)
}

const handleAddContact = () => {
  emit('addContact')
}

const handleOpenFilters = () => {
  emit('openFilters')
}

const handleBulkDelete = () => {
  emit('bulkDelete', Array.from(selectedContacts.value))
  selectedContacts.value.clear()
}

// Estado para seleção de estágio em bulk move
const selectedBulkStage = ref('')

// Opções de estágio para o select
const stageOptions = computed(() => {
  return stagesStore.stages.map(stage => ({
    value: stage.id,
    label: stage.name
  }))
})

const handleBulkMoveStage = () => {
  if (!selectedBulkStage.value) {
    return
  }
  emit('bulkMoveStage', Array.from(selectedContacts.value), selectedBulkStage.value)
  selectedContacts.value.clear()
  selectedBulkStage.value = ''
}

const handleBulkExport = () => {
  emit('bulkExport', Array.from(selectedContacts.value))
}

const handleExport = () => {
  emit('export')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header Actions (oculto quando pai gerencia toolbar) -->
    <div v-if="!props.hideToolbar" class="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <!-- Search -->
      <div class="relative flex-1">
        <SearchInput
          :model-value="internalSearchQuery"
          placeholder="Buscar contatos..."
          @update:model-value="handleSearch"
          @search="handleSearch"
        />
      </div>

      <!-- Actions -->
      <div class="flex gap-3 w-full sm:w-auto items-center">
        <Button
          variant="outline"
          @click="handleOpenFilters"
        >
          <Filter class="h-4 w-4 mr-2" />
          Filtros
        </Button>

        <Button
          variant="outline"
          @click="handleExport"
        >
          <Download class="h-4 w-4 mr-2" />
          Exportar
        </Button>

        <!-- Toggle View Mode -->
        <slot name="viewToggle" />

        <Button
          @click="handleAddContact"
        >
          <Plus class="h-4 w-4 mr-2" />
          Novo Contato
        </Button>
      </div>
    </div>

    <!-- Bulk Actions (se houver seleção) -->
    <div
      v-if="selectedContacts.size > 0"
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted rounded-[14.4px]"
    >
      <span class="text-sm font-medium">
        {{ selectedContacts.size }} contato(s) selecionado(s)
      </span>
      
      <div class="flex flex-wrap items-center gap-2">
        <!-- Mover estágio -->
        <div class="flex items-center gap-2">
          <Select
            v-model="selectedBulkStage"
            :options="stageOptions"
            placeholder="Mover para..."
            class="w-[160px]"
          />
          <Button
            variant="outline"
            size="sm"
            :disabled="!selectedBulkStage"
            @click="handleBulkMoveStage"
          >
            <MoveRight class="h-4 w-4 mr-1" />
            Mover
          </Button>
        </div>
        
        <!-- Exportar selecionados -->
        <Button
          variant="outline"
          size="sm"
          @click="handleBulkExport"
        >
          <FileDown class="h-4 w-4 mr-1" />
          Exportar
        </Button>
        
        <!-- Excluir -->
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

    <!-- Table -->
    <div class="border border-border rounded-[14.4px] overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <table class="w-full min-w-[800px]" style="border-collapse: separate; border-spacing: 0;">
          <thead class="bg-muted/50">
            <tr>
              <!-- Checkbox -->
              <th v-if="props.selectable" class="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  class="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  @change="handleSelectAll"
                />
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nome
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Telefone
              </th>
              <th class="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Localização
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Etapa
              </th>
              <th class="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Origem
              </th>
              <th class="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Data
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <template v-if="props.loading">
              <ContactRow
                v-for="i in props.itemsPerPage"
                :key="i"
                :contact="{} as Contact"
                :loading="true"
                :selectable="props.selectable"
              />
            </template>

            <!-- Empty State -->
            <tr v-else-if="paginatedContacts.length === 0">
              <td :colspan="props.selectable ? 9 : 8" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center justify-center">
                  <p class="text-muted-foreground mb-2">
                    {{ hasActiveSearch ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado' }}
                  </p>
                  <Button
                    v-if="!hasActiveSearch"
                    variant="outline"
                    @click="handleAddContact"
                  >
                    <Plus class="h-4 w-4 mr-2" />
                    Adicionar Primeiro Contato
                  </Button>
                </div>
              </td>
            </tr>

            <!-- Data -->
            <ContactRow
              v-else
              v-for="contact in paginatedContacts"
              :key="contact.id"
              :contact="contact"
              :tags="visibleContactTags[contact.id] ?? []"
              :selectable="props.selectable"
              :selected="selectedContacts.has(contact.id)"
              @select="handleSelectContact"
              @view-details="handleViewDetails"
              @edit="handleEdit"
              @delete="handleDelete"
              @add-sale="handleAddSale"
            />
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
        Mostrando {{ totalContacts === 0 ? 0 : (currentPage - 1) * props.itemsPerPage + 1 }} a
        {{ totalContacts === 0 ? 0 : Math.min(currentPage * props.itemsPerPage, totalContacts) }}
        de {{ totalContacts }} contatos
      </p>

      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page="currentPage"
        :page-size="props.itemsPerPage"
        :total="totalContacts"
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>
