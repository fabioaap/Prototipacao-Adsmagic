<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Download, Upload, Sparkles, ShoppingCart, Building2, GraduationCap, Rocket, LayoutGrid, CheckSquare, X, Plus } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import StagesList from '@/components/settings/StagesList.vue'
import StageFormDrawer from '@/components/settings/StageFormDrawer.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import { useStagesStore } from '@/stores/stages'
import { countContactsByStage } from '@/services/api/contacts'
import type { Stage } from '@/types/models'
import { useToast } from '@/components/ui/toast/use-toast'
import { downloadBlob, generateFilename } from '@/utils/download'

// ============================================================================
// I18N
// ============================================================================
const { toast } = useToast()

// ============================================================================
// STORES
// ============================================================================
const stagesStore = useStagesStore()
const route = useRoute()
const router = useRouter()

// ============================================================================
// STATE
// ============================================================================
const isStageFormDrawerOpen = ref(false)
const isDeleteConfirmModalOpen = ref(false)
const isImportModalOpen = ref(false)
const deleteDialogLoading = ref(false)
const deleteBlockedByDependency = ref(false)
const dependentContactsCount = ref(0)
const importData = ref<Stage[]>([])
const importMode = ref<'merge' | 'replace'>('merge')
const isImporting = ref(false)

const selectedStage = ref<Stage | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const stagesListRef = ref<{ toggleSelectionMode: () => void } | null>(null)
const stageSelectionMode = ref(false)
const hasDeletableStages = ref(false)

// ============================================================================
// TEMPLATES DE FUNIL PRÉ-CONFIGURADOS (G11.5)
// ============================================================================

interface FunnelTemplate {
  id: string
  name: string
  description: string
  icon: typeof ShoppingCart
  color: string
  stages: Array<{
    name: string
    description: string
    type: string
    color: string
    trackingPhrase: string
  }>
}

const funnelTemplates: FunnelTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Funil para lojas virtuais',
    icon: ShoppingCart,
    color: 'bg-blue-500',
    stages: [
      { name: 'Novo Lead', description: 'Lead captado', type: 'normal', color: '#3b82f6', trackingPhrase: 'novo lead' },
      { name: 'Carrinho', description: 'Adicionou ao carrinho', type: 'normal', color: '#f59e0b', trackingPhrase: 'carrinho' },
      { name: 'Checkout', description: 'Iniciou checkout', type: 'normal', color: '#8b5cf6', trackingPhrase: 'checkout' },
      { name: 'Compra', description: 'Finalizou compra', type: 'sale', color: '#10b981', trackingPhrase: 'compra' },
    ]
  },
  {
    id: 'services',
    name: 'Serviços',
    description: 'Funil para prestadores de serviço',
    icon: Building2,
    color: 'bg-green-500',
    stages: [
      { name: 'Contato', description: 'Primeiro contato', type: 'normal', color: '#3b82f6', trackingPhrase: 'contato' },
      { name: 'Orçamento', description: 'Orçamento enviado', type: 'normal', color: '#f59e0b', trackingPhrase: 'orçamento' },
      { name: 'Negociação', description: 'Em negociação', type: 'normal', color: '#8b5cf6', trackingPhrase: 'negociação' },
      { name: 'Fechado', description: 'Contrato fechado', type: 'sale', color: '#10b981', trackingPhrase: 'fechado' },
    ]
  },
  {
    id: 'infoproduct',
    name: 'Infoproduto',
    description: 'Funil para cursos e digitais',
    icon: GraduationCap,
    color: 'bg-purple-500',
    stages: [
      { name: 'Lead', description: 'Captado na landing', type: 'normal', color: '#3b82f6', trackingPhrase: 'lead' },
      { name: 'Nutrição', description: 'Em sequência de emails', type: 'normal', color: '#f59e0b', trackingPhrase: 'nutrição' },
      { name: 'Webinar', description: 'Assistiu webinar', type: 'normal', color: '#8b5cf6', trackingPhrase: 'webinar' },
      { name: 'Comprador', description: 'Comprou o curso', type: 'sale', color: '#10b981', trackingPhrase: 'compra' },
    ]
  },
  {
    id: 'saas',
    name: 'SaaS',
    description: 'Funil para software',
    icon: Rocket,
    color: 'bg-orange-500',
    stages: [
      { name: 'MQL', description: 'Marketing Qualified Lead', type: 'normal', color: '#3b82f6', trackingPhrase: 'mql' },
      { name: 'SQL', description: 'Sales Qualified Lead', type: 'normal', color: '#f59e0b', trackingPhrase: 'sql' },
      { name: 'Trial', description: 'Em período de teste', type: 'normal', color: '#8b5cf6', trackingPhrase: 'trial' },
      { name: 'Cliente', description: 'Converteu para pago', type: 'sale', color: '#10b981', trackingPhrase: 'cliente' },
    ]
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Comece do zero',
    icon: LayoutGrid,
    color: 'bg-slate-500',
    stages: []
  },
]

const showTemplateModal = ref(false)
const isApplyingTemplate = ref(false)
const CONTACTS_VIEW_MODE_STORAGE_KEY = 'contacts-view-mode'

const handleOpenTemplates = () => {
  showTemplateModal.value = true
}

const handleViewKanban = () => {
  localStorage.setItem(CONTACTS_VIEW_MODE_STORAGE_KEY, 'kanban')
  router.push({
    name: 'contacts',
    params: {
      locale: route.params.locale,
      projectId: route.params.projectId,
    },
  })
}

const handleToggleStageSelectionMode = () => {
  stagesListRef.value?.toggleSelectionMode()
}

const handleStageSelectionModeChange = (enabled: boolean) => {
  stageSelectionMode.value = enabled
}

const handleStageSelectionAvailabilityChange = (enabled: boolean) => {
  hasDeletableStages.value = enabled
}

const handleApplyTemplate = async (template: FunnelTemplate) => {
  if (template.id === 'custom') {
    showTemplateModal.value = false
    return
  }
  
  isApplyingTemplate.value = true
  
  try {
    let created = 0
    
    for (const stageData of template.stages) {
      await stagesStore.createStage({
        name: stageData.name,
        description: stageData.description,
        type: stageData.type as 'normal' | 'sale' | 'lost',
        color: stageData.color,
        trackingPhrase: stageData.trackingPhrase,
      })
      created++
    }
    
    toast({
      title: 'Template aplicado!',
      description: `${created} etapa(s) criada(s) a partir do template "${template.name}".`,
    })
    
    await fetchStages()
    showTemplateModal.value = false
  } catch (error) {
    console.error('Erro ao aplicar template:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível aplicar o template.',
      variant: 'destructive',
    })
  } finally {
    isApplyingTemplate.value = false
  }
}

// ============================================================================
// COMPUTED
// ============================================================================
const isLoading = computed(() => stagesStore.isLoading)

const deleteDialogDescription = computed(() => {
  if (deleteBlockedByDependency.value) {
    return `Esta etapa possui ${dependentContactsCount.value} contato(s) associado(s). Mova os contatos para outra etapa antes de excluir.`
  }
  return 'Tem certeza que deseja excluir esta etapa? Esta ação é irreversível.'
})

// ============================================================================
// METHODS
// ============================================================================
const fetchStages = async () => {
  try {
    await stagesStore.fetchStages()
  } catch (error) {
    console.error('Erro ao carregar etapas:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar as etapas. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleAddStage = () => {
  selectedStage.value = null
  isStageFormDrawerOpen.value = true
}

const handleEditStage = (stage: Stage) => {
  selectedStage.value = stage
  isStageFormDrawerOpen.value = true
}

const handleDeleteStage = async (stage: Stage) => {
  selectedStage.value = stage
  deleteDialogLoading.value = true
  deleteBlockedByDependency.value = false
  dependentContactsCount.value = 0
  isDeleteConfirmModalOpen.value = true

  // Verificar dependências (contatos associados)
  const result = await countContactsByStage(stage.id)
  deleteDialogLoading.value = false

  if (result.ok && result.value > 0) {
    deleteBlockedByDependency.value = true
    dependentContactsCount.value = result.value
  }
}

const handleStageSaved = (stage: Stage) => {
  toast({
    title: 'Sucesso!',
    description: `Etapa "${stage.name}" salva com sucesso. Ver no Kanban?`,
  })
  fetchStages() // Refresh data
}

const handleConfirmDelete = async () => {
  if (!selectedStage.value) return

  // Bloquear deleção se houver dependências
  if (deleteBlockedByDependency.value) {
    toast({
      title: 'Não é possível excluir',
      description: `Esta etapa possui ${dependentContactsCount.value} contato(s). Mova os contatos para outra etapa primeiro.`,
      variant: 'destructive',
    })
    return
  }

  try {
    await stagesStore.deleteStage(selectedStage.value.id)
    toast({
      title: 'Sucesso!',
      description: `Etapa "${selectedStage.value.name}" excluída.`,
    })
    isDeleteConfirmModalOpen.value = false
    fetchStages() // Refresh data
  } catch (error) {
    console.error('Erro ao excluir etapa:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível excluir a etapa. Tente novamente.',
      variant: 'destructive',
    })
  }
}

// ============================================================================
// BULK DELETE (G11.3)
// ============================================================================

const handleBulkDeleteStages = async (stageIds: string[]) => {
  const blocked: Array<{ id: string; name: string; count: number }> = []
  const toDelete: Array<{ id: string; name: string }> = []
  
  // Check dependencies for all selected stages
  for (const id of stageIds) {
    const stage = stagesStore.stages.find(s => s.id === id)
    if (!stage) continue
    
    const result = await countContactsByStage(id)
    if (result.ok && result.value > 0) {
      blocked.push({ id, name: stage.name, count: result.value })
    } else {
      toDelete.push({ id, name: stage.name })
    }
  }
  
  // Delete stages without dependencies
  for (const stage of toDelete) {
    try {
      await stagesStore.deleteStage(stage.id)
    } catch (error) {
      console.error(`Erro ao deletar etapa ${stage.name}:`, error)
    }
  }
  
  await fetchStages()
  
  // Show appropriate toast based on results
  if (blocked.length > 0 && toDelete.length > 0) {
    toast({
      title: 'Exclusão parcial',
      description: `${toDelete.length} etapa(s) excluída(s). ${blocked.length} bloqueada(s) por possuírem contatos vinculados.`,
      variant: 'warning',
    })
  } else if (blocked.length > 0) {
    const totalContacts = blocked.reduce((sum, b) => sum + b.count, 0)
    toast({
      title: 'Nenhuma etapa excluída',
      description: `Todas as ${blocked.length} etapa(s) selecionadas possuem ${totalContacts} contato(s) vinculados. Mova-os antes de deletar.`,
      variant: 'destructive',
    })
  } else {
    toast({
      title: 'Sucesso!',
      description: `${toDelete.length} etapa(s) excluída(s) com sucesso.`,
    })
  }
}

// ============================================================================
// IMPORT/EXPORT (G11.4)
// ============================================================================

/**
 * Exporta etapas do funil para arquivo JSON
 */
const handleExportStages = () => {
  try {
    const stages = stagesStore.stages
    const exportData = {
      type: 'adsmagic-stages',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      count: stages.length,
      stages: stages.map(s => ({
        name: s.name,
        description: s.description || '',
        type: s.type,
        color: s.color,
        trackingPhrase: s.trackingPhrase || ''
      }))
    }
    
    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, generateFilename('funil-config', 'json'))
    
    toast({
      title: 'Exportação concluída',
      description: `${stages.length} etapa(s) exportada(s) com sucesso.`,
    })
  } catch (error) {
    console.error('Erro ao exportar etapas:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível exportar as etapas.',
      variant: 'destructive',
    })
  }
}

/**
 * Abre o file picker para importar etapas
 */
const handleImportClick = () => {
  fileInputRef.value?.click()
}

/**
 * Processa o arquivo JSON selecionado
 */
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    // Validar estrutura do arquivo
    if (data.type !== 'adsmagic-stages' || !Array.isArray(data.stages)) {
      toast({
        title: 'Arquivo inválido',
        description: 'O arquivo não é um backup válido de etapas do funil.',
        variant: 'destructive',
      })
      return
    }
    
    importData.value = data.stages
    isImportModalOpen.value = true
  } catch (error) {
    console.error('Erro ao ler arquivo:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível ler o arquivo. Verifique se é um JSON válido.',
      variant: 'destructive',
    })
  } finally {
    // Reset input para permitir reimportar o mesmo arquivo
    target.value = ''
  }
}

/**
 * Confirma a importação das etapas
 */
const handleConfirmImport = async () => {
  if (importData.value.length === 0) return
  
  isImporting.value = true
  
  try {
    let imported = 0
    let skipped = 0
    
    // Se modo replace, deletar etapas existentes primeiro (sem dependências)
    if (importMode.value === 'replace') {
      for (const stage of stagesStore.stages) {
        const result = await countContactsByStage(stage.id)
        if (!result.ok || result.value === 0) {
          await stagesStore.deleteStage(stage.id)
        } else {
          skipped++
        }
      }
    }
    
    // Importar novas etapas
    for (const stageData of importData.value) {
      // Verificar se já existe (por nome)
      const exists = stagesStore.stages.some(
        s => s.name.toLowerCase() === stageData.name.toLowerCase()
      )
      
      if (exists && importMode.value === 'merge') {
        skipped++
        continue
      }
      
      await stagesStore.createStage({
        name: stageData.name,
        description: stageData.description || '',
        type: stageData.type || 'normal',
        color: stageData.color || '#6366f1',
        trackingPhrase: stageData.trackingPhrase || ''
      })
      imported++
    }
    
    await fetchStages()
    
    toast({
      title: 'Importação concluída',
      description: `${imported} etapa(s) importada(s)${skipped > 0 ? `, ${skipped} ignorada(s)` : ''}.`,
    })
    
    isImportModalOpen.value = false
    importData.value = []
  } catch (error) {
    console.error('Erro ao importar etapas:', error)
    toast({
      title: 'Erro',
      description: 'Ocorreu um erro durante a importação.',
      variant: 'destructive',
    })
  } finally {
    isImporting.value = false
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  fetchStages()
})
</script>

<template>
  <div class="section-stack-md">
    <!-- Content -->
    <div class="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div class="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-6 py-4">
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="handleOpenTemplates">
            <Sparkles class="h-4 w-4" />
            Templates
          </Button>
          <Button variant="outline" size="sm" @click="handleExportStages">
            <Download class="h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" @click="handleImportClick">
            <Upload class="h-4 w-4" />
            Importar
          </Button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleFileSelect"
          />
          <Button variant="outline" size="sm" @click="handleViewKanban">
            Ver Kanban
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!hasDeletableStages"
            @click="handleToggleStageSelectionMode"
          >
            <component :is="stageSelectionMode ? X : CheckSquare" class="h-4 w-4" />
            {{ stageSelectionMode ? 'Cancelar' : 'Selecionar' }}
          </Button>
          <Button size="sm" @click="handleAddStage">
            <Plus class="h-4 w-4" />
            Nova etapa
          </Button>
        </div>
      </div>

      <div class="p-6">
        <StagesList
          ref="stagesListRef"
          :loading="isLoading"
          :show-header-actions="false"
          @stage-edit="handleEditStage"
          @stage-delete="handleDeleteStage"
          @stage-add="handleAddStage"
          @stage-bulk-delete="handleBulkDeleteStages"
          @selection-mode-change="handleStageSelectionModeChange"
          @selection-availability-change="handleStageSelectionAvailabilityChange"
        />
      </div>
    </div>

    <!-- Modals and Drawers -->
    <StageFormDrawer
      :open="isStageFormDrawerOpen"
      :stage="selectedStage"
      @update:open="isStageFormDrawerOpen = $event"
      @success="handleStageSaved"
    />

    <AlertDialog
      :model-value="isDeleteConfirmModalOpen"
      :title="deleteBlockedByDependency ? 'Não é possível excluir' : 'Confirmar Exclusão'"
      :description="deleteDialogDescription"
      :confirm-text="deleteBlockedByDependency ? 'Entendi' : 'Excluir'"
      cancel-text="Cancelar"
      :variant="deleteBlockedByDependency ? 'warning' : 'destructive'"
      :loading="deleteDialogLoading"
      @update:model-value="isDeleteConfirmModalOpen = $event"
      @confirm="deleteBlockedByDependency ? (isDeleteConfirmModalOpen = false) : handleConfirmDelete()"
    />

    <!-- Import Modal (G11.4) -->
    <AlertDialog
      :model-value="isImportModalOpen"
      title="Importar Etapas do Funil"
      :description="`Encontrado(s) ${importData.length} etapa(s) no arquivo. Escolha o modo de importação:`"
      confirm-text="Importar"
      cancel-text="Cancelar"
      :loading="isImporting"
      @update:model-value="isImportModalOpen = $event"
      @confirm="handleConfirmImport"
    >
      <template #content>
        <div class="space-y-4 py-4">
          <div class="text-sm text-muted-foreground">
            Encontrado(s) <strong>{{ importData.length }}</strong> etapa(s) no arquivo.
          </div>
          
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="importMode"
                type="radio"
                value="merge"
                class="rounded border-border"
              />
              <span class="text-sm">
                <strong>Mesclar</strong> — Adiciona novas etapas, ignora duplicadas
              </span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="importMode"
                type="radio"
                value="replace"
                class="rounded border-border"
              />
              <span class="text-sm">
                <strong>Substituir</strong> — Remove etapas existentes (sem contatos) e importa todas
              </span>
            </label>
          </div>
          
          <div class="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            💡 Etapas com contatos associados não serão removidas no modo substituir.
          </div>
        </div>
      </template>
    </AlertDialog>

    <!-- Templates Modal (G11.5) -->
    <Modal
      :open="showTemplateModal"
      title="Templates de Funil"
      description="Escolha um template para criar etapas pré-configuradas"
      size="2xl"
      @update:open="showTemplateModal = $event"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
        <button
          v-for="template in funnelTemplates"
          :key="template.id"
          type="button"
          :disabled="isApplyingTemplate"
          class="flex flex-col p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleApplyTemplate(template)"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="template.color"
            >
              <component :is="template.icon" class="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 class="section-title-sm">{{ template.name }}</h4>
              <p class="text-xs text-muted-foreground">{{ template.description }}</p>
            </div>
          </div>

          <div v-if="template.stages.length > 0" class="flex flex-wrap gap-1.5">
            <span
              v-for="(stage, idx) in template.stages"
              :key="idx"
              class="text-xs px-2 py-0.5 rounded-full"
              :style="{ backgroundColor: stage.color + '20', color: stage.color }"
            >
              {{ stage.name }}
            </span>
          </div>
          <p v-else class="text-xs text-muted-foreground italic">
            Configure manualmente suas etapas
          </p>
        </button>
      </div>

      <template #footer>
        <p class="text-xs text-muted-foreground text-center w-full">
          💡 Os templates adicionam novas etapas ao seu funil existente. Você pode editar ou remover depois.
        </p>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
/* Adicione estilos específicos da view aqui, se necessário */
</style>

