<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Download, Loader2 } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import LinksList from '@/components/tracking/LinksList.vue'
import LinkFormModal from '@/components/tracking/LinkFormModal.vue'
import LinkStatsDrawer from '@/components/tracking/LinkStatsDrawer.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import { useTrackingStore } from '@/stores/tracking'
import { downloadBlob, generateFilename } from '@/utils/download'
import type { Link } from '@/types/models'
import { useToast } from '@/components/ui/toast/use-toast'

// ============================================================================
// I18N
// ============================================================================
const { toast } = useToast()

// ============================================================================
// STORES
// ============================================================================
const trackingStore = useTrackingStore()

// ============================================================================
// STATE
// ============================================================================
const isLinkFormModalOpen = ref(false)
const isLinkStatsDrawerOpen = ref(false)
const isDeleteConfirmModalOpen = ref(false)

const selectedLink = ref<Link | null>(null)

// ============================================================================
// COMPUTED
// ============================================================================
const isLoading = computed(() => trackingStore.isLoading)

// ============================================================================
// METHODS
// ============================================================================
const fetchLinks = async () => {
  try {
    await trackingStore.fetchLinks()
  } catch (error) {
    console.error('Erro ao carregar links:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar os links de rastreamento. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleAddLink = () => {
  selectedLink.value = null
  isLinkFormModalOpen.value = true
}

const handleEditLink = (link: Link) => {
  selectedLink.value = link
  isLinkFormModalOpen.value = true
}

const handleLinkSaved = (link: Link) => {
  toast({
    title: 'Sucesso!',
    description: `Link "${link.name}" salvo com sucesso.`,
  })
  fetchLinks() // Refresh data
}

const handleViewStats = (link: Link) => {
  selectedLink.value = link
  isLinkStatsDrawerOpen.value = true
}

const handleDeleteLink = (link: Link) => {
  selectedLink.value = link
  isDeleteConfirmModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!selectedLink.value) return

  try {
    await trackingStore.deleteLink(selectedLink.value.id)
    toast({
      title: 'Sucesso!',
      description: `Link "${selectedLink.value.name}" excluído.`,
    })
    isDeleteConfirmModalOpen.value = false
    isLinkStatsDrawerOpen.value = false // Close drawer if open
    fetchLinks() // Refresh data
  } catch (error) {
    console.error('Erro ao excluir link:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível excluir o link. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleCopyLink = async (link: Link) => {
  try {
    await navigator.clipboard.writeText(link.trackingUrl || link.url)
    toast({
      title: 'Copiado!',
      description: `Link "${link.name}" copiado para a área de transferência.`,
    })
  } catch (error) {
    console.error('Erro ao copiar link:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível copiar o link.',
      variant: 'destructive',
    })
  }
}

const isExporting = ref(false)

const handleExport = async () => {
  if (isExporting.value) return
  
  isExporting.value = true
  
  try {
    const links = trackingStore.links
    
    if (links.length === 0) {
      toast({
        title: 'Nenhum link',
        description: 'Não há links para exportar.',
        variant: 'destructive',
      })
      return
    }
    
    // Gerar CSV
    const headers = [
      'Nome',
      'UUID',
      'URL Destino',
      'URL Rastreamento',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'Cliques',
      'Contatos',
      'Vendas',
      'Receita',
      'Ativo',
      'Criado Em'
    ]
    
    const rows = links.map((link: Link) => [
      link.name,
      link.id,
      link.destinationUrl,
      link.trackingUrl || link.url,
      link.utmSource || '',
      link.utmMedium || '',
      link.utmCampaign || '',
      link.stats?.clicks || 0,
      link.stats?.contacts || 0,
      link.stats?.sales || 0,
      link.stats?.revenue || 0,
      link.isActive ? 'Sim' : 'Não',
      link.createdAt
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
    const filename = generateFilename('links-rastreamento', 'csv')
    downloadBlob(blob, filename)
    
    toast({
      title: 'Exportação concluída',
      description: `${links.length} link(s) exportado(s) com sucesso.`,
    })
  } catch (error) {
    console.error('Erro ao exportar links:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível exportar os links. Tente novamente.',
      variant: 'destructive',
    })
  } finally {
    isExporting.value = false
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  fetchLinks()
})
</script>

<template>
  <AppLayout>
    <div class="page-shell section-stack-md">
      <!-- Header -->
      <div class="space-y-2">
        <div class="page-header-section !mb-0">
          <div class="page-header-content">
            <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Links
            </h1>
          </div>
        </div>

        <p class="text-sm text-muted-foreground leading-relaxed">
          Crie e gerencie links rastreáveis para WhatsApp e acompanhe contatos e vendas
        </p>
      </div>

    <!-- Content Area -->
    <div class="bg-card rounded-surface shadow-sm p-6">
      <LinksList
        :loading="isLoading"
        @link-view-details="handleViewStats"
        @link-edit="handleEditLink"
        @link-delete="handleDeleteLink"
        @link-copy="handleCopyLink"
        @export="handleExport"
      >
        <template #actions>
          <Button
            variant="outline"
            size="sm"
            :disabled="isExporting"
            @click="handleExport"
          >
            <Loader2 v-if="isExporting" class="h-4 w-4 mr-2 animate-spin" />
            <Download v-else class="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>

          <Button
            size="sm"
            @click="handleAddLink"
          >
            <Plus class="h-4 w-4 mr-2" />
            Criar link
          </Button>
        </template>
      </LinksList>
    </div>

    <!-- Modals and Drawers -->
    <LinkFormModal
      :open="isLinkFormModalOpen"
      :link="selectedLink"
      @update:open="isLinkFormModalOpen = $event"
      @success="handleLinkSaved"
    />

    <LinkStatsDrawer
      :open="isLinkStatsDrawerOpen"
      :link="selectedLink"
      @update:open="isLinkStatsDrawerOpen = $event"
    />

    <AlertDialog
      v-model="isDeleteConfirmModalOpen"
      title="Confirmar Exclusão"
      description="Tem certeza que deseja excluir este link de rastreamento? Esta ação é irreversível."
      confirm-text="Excluir"
      cancel-text="Cancelar"
      variant="destructive"
      @confirm="handleConfirmDelete"
    />
    </div>
  </AppLayout>
</template>

<style scoped>
/* Adicione estilos específicos da view aqui, se necessário */
</style>
