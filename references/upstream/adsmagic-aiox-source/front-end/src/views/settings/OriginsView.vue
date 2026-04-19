<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Download, Upload, CheckSquare, X, Plus } from '@/composables/useIcons'
import Button from '@/components/ui/Button.vue'
import OriginsList from '@/components/settings/OriginsList.vue'
import OriginFormModal from '@/components/settings/OriginFormModal.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'

import { useOriginsStore } from '@/stores/origins'
import { countContactsByOrigin } from '@/services/api/contacts'
import type { Origin } from '@/types/models'
import { useToast } from '@/components/ui/toast/use-toast'
import { downloadBlob, generateFilename } from '@/utils/download'

const { toast } = useToast()

// ============================================================================
// STORES
// ============================================================================
const originsStore = useOriginsStore()

// ============================================================================
// STATE
// ============================================================================
interface OriginImportItem {
  name: string
  description?: string
  color?: string
  icon?: string
  isActive?: boolean
  utmSourceMatchMode?: 'exact' | 'contains' | null
  utmSourceMatchValue?: string | null
}

const isOriginFormModalOpen = ref(false)
const isDeleteConfirmModalOpen = ref(false)
const isImportModalOpen = ref(false)
const deleteDialogLoading = ref(false)
const deleteBlockedByDependency = ref(false)
const dependentContactsCount = ref(0)
const importData = ref<OriginImportItem[]>([])
const importMode = ref<'merge' | 'replace'>('merge')
const isImporting = ref(false)

const selectedOrigin = ref<Origin | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const originsListRef = ref<InstanceType<typeof OriginsList> | null>(null)
const originSelectionMode = ref(false)
const hasSelectableOrigins = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================
const isLoading = computed(() => originsStore.isLoading)

const deleteDialogDescription = computed(() => {
  if (deleteBlockedByDependency.value) {
    return `Esta origem possui ${dependentContactsCount.value} contato(s) associado(s). Remova ou reassocie os contatos antes de excluir esta origem.`
  }
  return 'Tem certeza que deseja excluir esta origem? Esta ação é irreversível.'
})

// ============================================================================
// METHODS
// ============================================================================
const fetchOrigins = async () => {
  try {
    await originsStore.fetchOrigins()
  } catch (error) {
    console.error('Erro ao carregar origens:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar as origens. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleAddOrigin = () => {
  selectedOrigin.value = null
  isOriginFormModalOpen.value = true
}

const handleToggleOriginSelectionMode = () => {
  originsListRef.value?.toggleSelectionMode()
}

const handleOriginSelectionModeChange = (isEnabled: boolean) => {
  originSelectionMode.value = isEnabled
}

const handleOriginSelectionAvailabilityChange = (isAvailable: boolean) => {
  hasSelectableOrigins.value = isAvailable
  if (!isAvailable) {
    originSelectionMode.value = false
  }
}

const handleEditOrigin = (origin: Origin) => {
  selectedOrigin.value = origin
  isOriginFormModalOpen.value = true
}

const handleDeleteOrigin = async (origin: Origin) => {
  selectedOrigin.value = origin
  deleteDialogLoading.value = true
  deleteBlockedByDependency.value = false
  dependentContactsCount.value = 0
  isDeleteConfirmModalOpen.value = true

  // Verificar dependências (contatos associados)
  const result = await countContactsByOrigin(origin.id)
  deleteDialogLoading.value = false

  if (result.ok && result.value > 0) {
    deleteBlockedByDependency.value = true
    dependentContactsCount.value = result.value
  }
}

const handleOriginSaved = (origin: Origin) => {
  toast({
    title: 'Sucesso!',
    description: `Origem "${origin.name}" salva com sucesso.`,
  })
  fetchOrigins() // Refresh data
}

const handleConfirmDelete = async () => {
  if (!selectedOrigin.value) return

  // Bloquear deleção se houver dependências
  if (deleteBlockedByDependency.value) {
    toast({
      title: 'Não é possível excluir',
      description: `Esta origem possui ${dependentContactsCount.value} contato(s). Remova ou reassocie os contatos primeiro.`,
      variant: 'destructive',
    })
    return
  }

  try {
    await originsStore.deleteOrigin(selectedOrigin.value.id)
    toast({
      title: 'Sucesso!',
      description: `Origem "${selectedOrigin.value.name}" excluída.`,
    })
    isDeleteConfirmModalOpen.value = false
    fetchOrigins() // Refresh data
  } catch (error) {
    console.error('Erro ao excluir origem:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível excluir a origem. Tente novamente.',
      variant: 'destructive',
    })
  }
}

const handleBulkDeleteOrigins = async (originIds: string[]) => {
  const blocked: Array<{ id: string; name: string; count: number }> = []
  const toDelete: Array<{ id: string; name: string }> = []

  // Check dependencies in parallel
  const checkResults = await Promise.allSettled(
    originIds.map(async (id) => {
      const origin = originsStore.origins.find(o => o.id === id)
      if (!origin) return null
      const result = await countContactsByOrigin(id)
      return { id, name: origin.name, result }
    })
  )

  for (const settled of checkResults) {
    if (settled.status !== 'fulfilled' || !settled.value) continue
    const { id, name, result } = settled.value
    if (result.ok && result.value > 0) {
      blocked.push({ id, name, count: result.value })
    } else {
      toDelete.push({ id, name })
    }
  }

  // Delete in parallel
  const deleteResults = await Promise.allSettled(
    toDelete.map(origin => originsStore.deleteOrigin(origin.id))
  )
  for (let i = 0; i < deleteResults.length; i++) {
    if (deleteResults[i]!.status === 'rejected') {
      console.error(`Erro ao deletar origem ${toDelete[i]!.name}:`, (deleteResults[i] as PromiseRejectedResult).reason)
    }
  }

  await fetchOrigins()

  if (blocked.length > 0 && toDelete.length > 0) {
    toast({
      title: 'Exclusão parcial',
      description: `${toDelete.length} origem(ns) excluída(s). ${blocked.length} bloqueada(s) por possuírem contatos vinculados.`,
      variant: 'warning',
    })
  } else if (blocked.length > 0) {
    const totalContacts = blocked.reduce((sum, item) => sum + item.count, 0)
    toast({
      title: 'Nenhuma origem excluída',
      description: `Todas as ${blocked.length} origem(ns) selecionadas possuem ${totalContacts} contato(s) vinculados.`,
      variant: 'destructive',
    })
  } else {
    toast({
      title: 'Sucesso!',
      description: `${toDelete.length} origem(ns) excluída(s) com sucesso.`,
    })
  }
}

// ============================================================================
// IMPORT/EXPORT (G11.4)
// ============================================================================

/**
 * Exporta origens para arquivo JSON
 */
const handleExportOrigins = () => {
  try {
    const origins = originsStore.origins
    const exportData = {
      type: 'adsmagic-origins',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      count: origins.length,
      origins: origins.map(o => ({
        name: o.name,
        description: o.description || '',
        color: o.color,
        icon: o.icon,
        isActive: o.isActive ?? true,
        utmSourceMatchMode: o.utmSourceMatchMode ?? null,
        utmSourceMatchValue: o.utmSourceMatchValue ?? null,
      }))
    }
    
    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, generateFilename('origens-config', 'json'))
    
    toast({
      title: 'Exportação concluída',
      description: `${origins.length} origem(ns) exportada(s) com sucesso.`,
    })
  } catch (error) {
    console.error('Erro ao exportar origens:', error)
    toast({
      title: 'Erro',
      description: 'Não foi possível exportar as origens.',
      variant: 'destructive',
    })
  }
}

/**
 * Abre o file picker para importar origens
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
    const data = JSON.parse(text) as Record<string, unknown>

    const legacyOrigins = Array.isArray(data.data) ? data.data : null
    const nextOrigins = Array.isArray(data.origins) ? data.origins : null
    const importedOriginsRaw = nextOrigins || legacyOrigins

    // Validar estrutura do arquivo
    if (
      !importedOriginsRaw
      || (data.type !== 'adsmagic-origins' && data.type !== 'origins')
    ) {
      toast({
        title: 'Arquivo inválido',
        description: 'O arquivo não é um backup válido de origens.',
        variant: 'destructive',
      })
      return
    }

    const parsedOrigins: OriginImportItem[] = importedOriginsRaw
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item) => {
        const modeRaw = item.utmSourceMatchMode ?? item.utm_source_match_mode
        const valueRaw = item.utmSourceMatchValue ?? item.utm_source_match_value
        const mode: 'exact' | 'contains' | null =
          modeRaw === 'exact' || modeRaw === 'contains' ? modeRaw : null
        const value = typeof valueRaw === 'string' ? valueRaw.trim().toLowerCase() : null
        const isPairValid = !!mode && !!value && !/\s/.test(value)

        return {
          name: typeof item.name === 'string' ? item.name.trim() : '',
          description: typeof item.description === 'string' ? item.description : '',
          color: typeof item.color === 'string' ? item.color : '#6366f1',
          icon: typeof item.icon === 'string' ? item.icon : undefined,
          isActive: typeof item.isActive === 'boolean' ? item.isActive : true,
          utmSourceMatchMode: isPairValid ? mode : null,
          utmSourceMatchValue: isPairValid ? value : null,
        }
      })
      .filter((origin: OriginImportItem) => origin.name.length >= 3)

    if (parsedOrigins.length === 0) {
      toast({
        title: 'Arquivo inválido',
        description: 'Nenhuma origem válida foi encontrada no arquivo.',
        variant: 'destructive',
      })
      return
    }

    importData.value = parsedOrigins
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
 * Confirma a importação das origens
 */
const handleConfirmImport = async () => {
  if (importData.value.length === 0) return
  
  isImporting.value = true
  
  try {
    let imported = 0
    let skipped = 0
    
    // Se modo replace, deletar origens existentes primeiro (sem dependências)
    if (importMode.value === 'replace') {
      for (const origin of originsStore.customOrigins) {
        const result = await countContactsByOrigin(origin.id)
        if (!result.ok || result.value === 0) {
          await originsStore.deleteOrigin(origin.id)
        } else {
          skipped++
        }
      }
    }
    
    // Importar novas origens
    for (const originData of importData.value) {
      // Verificar se já existe (por nome)
      const exists = originsStore.origins.some(
        o => o.name.toLowerCase() === originData.name.toLowerCase()
      )
      
      if (exists && importMode.value === 'merge') {
        skipped++
        continue
      }
      
      await originsStore.createOrigin({
        name: originData.name,
        description: originData.description || '',
        color: originData.color || '#6366f1',
        icon: originData.icon,
        utmSourceMatchMode: originData.utmSourceMatchMode ?? null,
        utmSourceMatchValue: originData.utmSourceMatchValue ?? null,
      })
      imported++
    }
    
    await fetchOrigins()
    
    toast({
      title: 'Importação concluída',
      description: `${imported} origem(ns) importada(s)${skipped > 0 ? `, ${skipped} ignorada(s)` : ''}.`,
    })
    
    isImportModalOpen.value = false
    importData.value = []
  } catch (error) {
    console.error('Erro ao importar origens:', error)
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
  fetchOrigins()
})
</script>

<template>
  <div class="section-stack-md">
    <!-- Content -->
    <div class="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div class="flex flex-col items-stretch gap-2 border-b bg-muted/30 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:px-6">
        <Button variant="outline" size="sm" class="w-full sm:w-auto" @click="handleExportOrigins">
          <Download class="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <Button variant="outline" size="sm" class="w-full sm:w-auto" @click="handleImportClick">
          <Upload class="h-4 w-4 mr-2" />
          Importar
        </Button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileSelect"
        />
        <Button
          variant="outline"
          size="sm"
          class="w-full sm:w-auto"
          :disabled="!hasSelectableOrigins"
          @click="handleToggleOriginSelectionMode"
        >
          <component :is="originSelectionMode ? X : CheckSquare" class="h-4 w-4" />
          {{ originSelectionMode ? 'Cancelar' : 'Selecionar' }}
        </Button>
        <Button size="sm" class="w-full sm:w-auto" @click="handleAddOrigin">
          <Plus class="h-4 w-4" />
          Nova origem
        </Button>
      </div>

      <div class="p-4 sm:p-6">
        <OriginsList
          ref="originsListRef"
          :loading="isLoading"
          :show-header-actions="false"
          @origin-edit="handleEditOrigin"
          @origin-delete="handleDeleteOrigin"
          @origin-add="handleAddOrigin"
          @origin-bulk-delete="handleBulkDeleteOrigins"
          @selection-mode-change="handleOriginSelectionModeChange"
          @selection-availability-change="handleOriginSelectionAvailabilityChange"
        />
      </div>
    </div>

    <!-- Modals -->
    <OriginFormModal
      :open="isOriginFormModalOpen"
      :origin="selectedOrigin"
      @update:open="isOriginFormModalOpen = $event"
      @success="handleOriginSaved"
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
      title="Importar Origens"
      :description="`Encontrado(s) ${importData.length} origem(ns) no arquivo. Escolha o modo de importação:`"
      confirm-text="Importar"
      cancel-text="Cancelar"
      :loading="isImporting"
      @update:model-value="isImportModalOpen = $event"
      @confirm="handleConfirmImport"
    >
      <template #content>
        <div class="space-y-4 py-4">
          <div class="text-sm text-muted-foreground">
            Encontrado(s) <strong>{{ importData.length }}</strong> origem(ns) no arquivo.
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
                <strong>Mesclar</strong> — Adiciona novas origens, ignora duplicadas
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
                <strong>Substituir</strong> — Remove origens existentes (sem contatos) e importa todas
              </span>
            </label>
          </div>
          
          <div class="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            💡 Origens com contatos associados não serão removidas no modo substituir.
          </div>
        </div>
      </template>
    </AlertDialog>
  </div>
</template>

<style scoped>
/* Adicione estilos específicos da view aqui, se necessário */
</style>

