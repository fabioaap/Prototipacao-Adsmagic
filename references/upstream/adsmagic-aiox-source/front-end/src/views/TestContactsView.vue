<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { LayoutGrid, List, ArrowLeft } from 'lucide-vue-next'
import ContactsKanban from '@/components/contacts/ContactsKanban.vue'
import ContactsList from '@/components/contacts/ContactsList.vue'
import ContactFormModal from '@/components/contacts/ContactFormModal.vue'
import ContactDetailsDrawer from '@/components/contacts/ContactDetailsDrawer.vue'
import ContactsFilters, { type ContactFilters } from '@/components/contacts/ContactsFilters.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import TabsContent from '@/components/ui/TabsContent.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import AlertSimple from '@/components/ui/AlertSimple.vue'
import type { Contact } from '@/types/models'
import { useContactsStore } from '@/stores/contacts'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAlertDialog } from '@/composables/useAlertDialog'

const router = useRouter()
const contactsStore = useContactsStore()
const confirmDialog = useConfirmDialog()
const alertDialog = useAlertDialog()

// Estado das UIs
const activeView = ref<'kanban' | 'list'>('kanban')
const isFormModalOpen = ref(false)
const isFiltersModalOpen = ref(false)
const isDetailsDrawerOpen = ref(false)
const selectedContact = ref<Contact | null>(null)
const filters = ref<ContactFilters>({
  stageIds: [],
  originIds: [],
  tagIds: [],
  location: '',
  dateFrom: '',
  dateTo: '',
})

// Handle view toggle
const setView = (view: 'kanban' | 'list') => {
  activeView.value = view
}

// Handle add contact
const handleAddContact = (_stageId?: string) => {
  selectedContact.value = null
  isFormModalOpen.value = true
}

// Handle contact click
const handleContactClick = (contact: Contact) => {
  selectedContact.value = contact
  isDetailsDrawerOpen.value = true
}

// Handle view details
const handleViewDetails = (contact: Contact) => {
  selectedContact.value = contact
  isDetailsDrawerOpen.value = true
}

// Handle edit
const handleEdit = (contact: Contact) => {
  selectedContact.value = contact
  isDetailsDrawerOpen.value = false
  isFormModalOpen.value = true
}

// Handle delete
const handleDelete = async (contact: Contact) => {
  const confirmed = await confirmDialog.confirm({
    title: 'Excluir Contato',
    description: `Deseja realmente excluir o contato "${contact.name}"?`,
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
    variant: 'destructive'
  })
  
  if (confirmed) {
    try {
      await contactsStore.deleteContact(contact.id)
      isDetailsDrawerOpen.value = false
    } catch (error) {
      console.error('Erro ao excluir contato:', error)
      await alertDialog.alert({
        title: 'Erro',
        description: 'Erro ao excluir contato. Tente novamente.',
        variant: 'destructive'
      })
    }
  }
}

// Handle bulk delete
const handleBulkDelete = async (contactIds: string[]) => {
  const confirmed = await confirmDialog.confirm({
    title: 'Excluir Contatos',
    description: `Deseja realmente excluir ${contactIds.length} contato(s)?`,
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
    variant: 'destructive'
  })
  
  if (confirmed) {
    try {
      await Promise.all(contactIds.map(id => contactsStore.deleteContact(id)))
    } catch (error) {
      console.error('Erro ao excluir contatos:', error)
      await alertDialog.alert({
        title: 'Erro',
        description: 'Erro ao excluir contatos. Tente novamente.',
        variant: 'destructive'
      })
    }
  }
}

// Handle filters
const handleOpenFilters = () => {
  isFiltersModalOpen.value = true
}

const handleApplyFilters = (newFilters: ContactFilters) => {
  filters.value = newFilters
  console.log('Filtros aplicados:', newFilters)
  // Aqui você implementaria a lógica de filtro
}

const handleClearFilters = () => {
  filters.value = {
    stageIds: [],
    originIds: [],
    tagIds: [],
    location: '',
    dateFrom: '',
    dateTo: '',
  }
  console.log('Filtros limpos')
}

// Handle export
const handleExport = async () => {
  console.log('Exportar contatos')
  await alertDialog.alert({
    title: 'Em Desenvolvimento',
    description: 'Funcionalidade de exportação será implementada',
    variant: 'info'
  })
}

// Handle form success
const handleFormSuccess = (contact: Contact) => {
  console.log('Contato salvo:', contact)
}

// Navigate back
const goBack = () => {
  router.push('/test-layouts')
}
</script>

<template>
  <div class="min-h-screen bg-background p-6">
    <div class="container mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            @click="goBack"
          >
            <ArrowLeft class="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight mb-2">
              Contacts System Test
            </h1>
            <p class="text-muted-foreground">
              Sistema completo de gerenciamento de contatos com visualizações Kanban e Lista
            </p>
          </div>

          <!-- View Toggle -->
          <div class="flex gap-2">
            <Button
              :variant="activeView === 'kanban' ? 'default' : 'outline'"
              size="sm"
              @click="setView('kanban')"
            >
              <LayoutGrid class="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              :variant="activeView === 'list' ? 'default' : 'outline'"
              size="sm"
              @click="setView('list')"
            >
              <List class="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card class="p-4">
          <h3 class="font-medium mb-2">📋 Componentes Criados</h3>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>• ContactCard.vue - Card do Kanban</li>
            <li>• ContactRow.vue - Linha da Tabela</li>
            <li>• ContactsKanban.vue - Kanban Board</li>
            <li>• ContactsList.vue - Lista/Tabela</li>
            <li>• ContactFormModal.vue - Form CRUD</li>
            <li>• ContactDetailsDrawer.vue - Drawer</li>
            <li>• ContactsFilters.vue - Filtros</li>
            <li>• ContactQuickActions.vue - Menu</li>
          </ul>
        </Card>

        <Card class="p-4">
          <h3 class="font-medium mb-2">✨ Funcionalidades</h3>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>• Drag & drop entre etapas</li>
            <li>• Busca em tempo real</li>
            <li>• Filtros avançados</li>
            <li>• Seleção múltipla</li>
            <li>• Paginação</li>
            <li>• Validação com Zod</li>
            <li>• Loading/empty states</li>
            <li>• Mobile responsive</li>
          </ul>
        </Card>

        <Card class="p-4">
          <h3 class="font-medium mb-2">🎨 Padrões Usados</h3>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>• Composition API</li>
            <li>• TypeScript strict</li>
            <li>• Pinia stores</li>
            <li>• Shadcn-vue pattern</li>
            <li>• Optimistic UI</li>
            <li>• Accessibility (ARIA)</li>
            <li>• Dark mode support</li>
            <li>• Tailwind CSS</li>
          </ul>
        </Card>
      </div>

      <!-- Main Content -->
      <Card class="p-6">
        <Tabs v-model="activeView">
          <TabsList class="mb-6">
            <TabsTrigger value="kanban">
              <LayoutGrid class="h-4 w-4 mr-2" />
              Kanban Board
            </TabsTrigger>
            <TabsTrigger value="list">
              <List class="h-4 w-4 mr-2" />
              Lista/Tabela
            </TabsTrigger>
          </TabsList>

          <!-- Kanban View -->
          <TabsContent value="kanban">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">Visualização Kanban</h2>
                <Button size="sm" @click="handleAddContact()">
                  Adicionar Contato
                </Button>
              </div>

              <ContactsKanban
                :draggable="true"
                @contact-click="handleContactClick"
                @contact-view-details="handleViewDetails"
                @add-contact="handleAddContact"
              />
            </div>
          </TabsContent>

          <!-- List View -->
          <TabsContent value="list">
            <div class="space-y-4">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold">Visualização Lista</h2>
              </div>

              <ContactsList
                :items-per-page="10"
                :selectable="true"
                @contact-view-details="handleViewDetails"
                @contact-edit="handleEdit"
                @contact-delete="handleDelete"
                @add-contact="handleAddContact"
                @open-filters="handleOpenFilters"
                @bulk-delete="handleBulkDelete"
                @export="handleExport"
              />
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <!-- How it Works -->
      <Card class="mt-8 p-6">
        <h2 class="text-xl font-semibold mb-4">Como Funciona</h2>
        <div class="space-y-4 text-sm text-muted-foreground">
          <div>
            <h3 class="font-medium text-foreground mb-2">Kanban Board</h3>
            <p>
              Arraste os cards entre as colunas para mudar a etapa do contato.
              A mudança é salva automaticamente com optimistic UI (atualiza imediatamente
              e faz rollback em caso de erro).
            </p>
          </div>

          <div>
            <h3 class="font-medium text-foreground mb-2">Lista/Tabela</h3>
            <p>
              Use a busca para filtrar contatos em tempo real. Selecione múltiplos contatos
              para ações em lote. A paginação é automática baseada no número de itens.
            </p>
          </div>

          <div>
            <h3 class="font-medium text-foreground mb-2">Formulário</h3>
            <p>
              O formulário usa validação Zod com mensagens de erro em tempo real.
              Todos os campos têm validação apropriada (email, telefone, etc).
            </p>
          </div>

          <div>
            <h3 class="font-medium text-foreground mb-2">Drawer de Detalhes</h3>
            <p>
              Clique em qualquer contato para ver seus detalhes completos em um drawer lateral.
              De lá você pode editar ou excluir o contato.
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Modals & Drawers -->
    <ContactFormModal
      :open="isFormModalOpen"
      :contact="selectedContact"
      @update:open="isFormModalOpen = $event"
      @success="handleFormSuccess"
    />

    <ContactDetailsDrawer
      :open="isDetailsDrawerOpen"
      :contact="selectedContact"
      @update:open="isDetailsDrawerOpen = $event"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <ContactsFilters
      :open="isFiltersModalOpen"
      :filters="filters"
      @update:open="isFiltersModalOpen = $event"
      @apply="handleApplyFilters"
      @clear="handleClearFilters"
    />
  </div>

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

  <AlertSimple
    v-model="alertDialog.isOpen.value"
    :title="alertDialog.title.value"
    :description="alertDialog.description.value"
    :confirm-text="alertDialog.confirmText.value"
    :variant="alertDialog.variant.value"
    @confirm="alertDialog.handleConfirm"
  />
</template>
