<template>
  <div class="space-y-6">
    <!-- Project Information -->
    <div class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Informações do Projeto</h3>
        <p class="text-sm text-muted-foreground">
          Configure as informações básicas do seu projeto
        </p>
      </div>

      <div class="grid gap-4">
        <!-- Project Name -->
        <div class="space-y-2">
          <Label for="projectName">Nome do Projeto</Label>
          <Input
            id="projectName"
            v-model="formData.projectName"
            placeholder="Digite o nome do projeto"
            :disabled="loading"
            @blur="handleNameBlur"
            @input="nameError = ''"
            :aria-invalid="nameError ? 'true' : undefined"
            aria-describedby="projectName-error"
            :class="nameError ? 'border-destructive focus-visible:ring-destructive' : ''"
          />
          <p v-if="nameError" id="projectName-error" class="text-xs text-destructive" role="alert">{{ nameError }}</p>
        </div>

        <!-- Project Description -->
        <div class="space-y-2">
          <Label for="projectDescription">Descrição (Opcional)</Label>
          <Textarea
            id="projectDescription"
            v-model="formData.projectDescription"
            placeholder="Descreva brevemente o projeto"
            :disabled="loading"
            :rows="3"
          />
        </div>

        <!-- Project ID (Read-only) -->
        <div class="space-y-2">
          <Label for="projectId">ID do Projeto</Label>
          <div class="flex items-center space-x-2">
            <Input
              id="projectId"
              :value="projectId"
              readonly
              class="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              @click="handleCopyProjectId"
              :disabled="loading"
              aria-label="Copiar ID do projeto"
            >
              <Copy class="h-4 w-4" />
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            Use este ID para integrações e APIs
          </p>
        </div>

        <!-- Created At -->
        <div class="space-y-2">
          <Label>Criado em</Label>
          <p class="text-sm text-muted-foreground">
            {{ formatSafeDateTime(formData.createdAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Attribution Model -->
    <div class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Modelo de Atribuição</h3>
        <p class="text-sm text-muted-foreground">
          Escolha como as conversões serão atribuídas às origens
        </p>
      </div>

      <ModelAttributionSelector
        v-model="formData.attributionModel"
        :disabled="loading"
      />
    </div>

    <!-- Revenue Goal -->
    <div class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2">Meta de Receita</h3>
        <p class="text-sm text-muted-foreground">
          Defina uma meta mensal para acompanhar o desempenho financeiro
        </p>
      </div>

      <div class="space-y-2">
        <Label for="revenueGoal">Meta Mensal (R$)</Label>
        <Input
          id="revenueGoal"
          v-model="revenueGoalInput"
          type="text"
          inputmode="decimal"
          placeholder="50.000,00 ou 50000.00"
          :disabled="loading"
          @blur="handleRevenueGoalBlur"
        />
        <p class="text-xs text-muted-foreground">
          Valor esperado de receita por mês. Use vírgula ou ponto para decimais.
        </p>
      </div>

      <!-- CTA Ver Resultado (aparece quando meta está salva) -->
      <div
        v-if="hasSavedRevenueGoal"
        class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between"
      >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <TrendingUp class="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 class="font-semibold text-blue-900">
              Meta configurada com sucesso!
            </h4>
            <p class="text-sm text-blue-700">
              Veja o progresso da sua meta no dashboard
            </p>
          </div>
        </div>
        <Button
          variant="default"
          class="bg-blue-600 hover:bg-blue-700 text-white"
          @click="goToDashboard"
        >
          Ver Resultado
        </Button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="space-y-4">
      <div>
        <h3 class="section-title-sm mb-2 text-destructive">Zona de Perigo</h3>
        <p class="text-sm text-muted-foreground">
          Ações que afetam permanentemente o projeto
        </p>
      </div>

      <div class="space-y-3">
        <!-- Archive Project -->
        <div class="border border-warning/20 bg-warning/5 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-warning">Arquivar Projeto</h4>
              <p class="text-sm text-warning/80 mt-1">
                Remove o projeto da lista ativa. Os dados são preservados e podem ser restaurados depois.
              </p>
            </div>
            <Button
              variant="outline"
              @click="handleArchiveProject"
              :disabled="loading"
              class="border-warning text-warning hover:bg-warning/10"
            >
              <Archive class="h-4 w-4" />
              Arquivar
            </Button>
          </div>
        </div>

        <!-- Delete Project -->
        <div class="border border-destructive/20 bg-destructive/5 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-destructive">Deletar Projeto</h4>
              <p class="text-sm text-destructive/80 mt-1">
                <strong>AÇÃO IRREVERSÍVEL</strong> - Remove todos os dados permanentemente.
              </p>
            </div>
            <Button
              variant="destructive"
              @click="handleDeleteProject"
              :disabled="loading"
            >
              <Trash2 class="h-4 w-4" />
              Deletar
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex items-center justify-end pt-4 border-t">
      <Tooltip v-if="!hasChanges && !loading" side="left">
        <template #trigger>
          <span
            class="inline-block"
            tabindex="0"
            role="button"
            aria-disabled="true"
            aria-label="Salvar Alterações — desabilitado"
          >
            <Button
              :disabled="true"
              :loading="loading"
              aria-hidden="true"
            >
              <Save class="h-4 w-4" />
              Salvar Alterações
            </Button>
          </span>
        </template>
        Altere um campo para salvar
      </Tooltip>
      <Button
        v-else
        @click="handleSave"
        :disabled="loading"
        :loading="loading"
      >
        <Save class="h-4 w-4" />
        Salvar Alterações
      </Button>
    </div>

    <!-- Confirmation Modals -->
    <AlertDialog
      :model-value="isArchiveModalOpen"
      title="Arquivar Projeto"
      description="Tem certeza que deseja arquivar este projeto? Ele será removido da lista ativa, mas os dados serão preservados e poderão ser restaurados depois."
      confirm-text="Arquivar"
      cancel-text="Cancelar"
      variant="warning"
      @update:model-value="isArchiveModalOpen = $event"
      @confirm="handleConfirmArchive"
    />

    <AlertDialog
      :model-value="isDeleteModalOpen"
      title="Deletar Projeto"
      description="ATENÇÃO: Esta ação é IRREVERSÍVEL! Todos os dados serão removidos permanentemente, incluindo contatos, vendas, links e eventos."
      confirm-text="Deletar Permanentemente"
      cancel-text="Cancelar"
      variant="destructive"
      @update:model-value="isDeleteModalOpen = $event"
      @confirm="handleConfirmDelete"
    />

    <!-- Delete Confirmation with Project Name -->
    <Modal :model-value="isDeleteConfirmModalOpen" @update:model-value="isDeleteConfirmModalOpen = $event">
      <template #content>
        <div class="max-w-md mx-auto p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 class="h-8 w-8 text-destructive" />
            </div>
            <h2 class="section-title-md mb-2">Confirmar Exclusão</h2>
            <p class="text-sm text-muted-foreground">
              Para confirmar a exclusão, digite o nome do projeto:
            </p>
            <p class="text-sm font-medium mt-2">{{ formData.projectName }}</p>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="confirmProjectName">Nome do Projeto</Label>
              <Input
                id="confirmProjectName"
                v-model="confirmProjectName"
                placeholder="Digite o nome do projeto"
                :disabled="loading"
              />
            </div>

            <div class="flex items-center space-x-2">
              <input
                v-model="confirmDelete"
                type="checkbox"
                :disabled="loading"
                class="rounded border-border"
              />
              <Label class="text-sm">
                Entendo que esta ação é irreversível
              </Label>
            </div>
          </div>

          <div class="flex items-center justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              @click="isDeleteConfirmModalOpen = false"
              :disabled="loading"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              @click="handleFinalDelete"
              :disabled="!canDelete || loading"
              :loading="loading"
            >
              <Trash2 class="h-4 w-4" />
              Deletar Permanentemente
            </Button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Copy, 
  Archive, 
  Trash2, 
  Save,
  TrendingUp
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Label from '@/components/ui/Label.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import Modal from '@/components/ui/Modal.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import ModelAttributionSelector from '@/components/settings/ModelAttributionSelector.vue'
import type { GeneralSettings } from '@/types/models'
import { formatSafeDateTime } from '@/utils/formatters'
import { useToast } from '@/components/ui/toast/use-toast'

interface Props {
  /**
   * ID do projeto
   */
  projectId: string
  /**
   * Se true, indica loading state
   */
  loading?: boolean
  /**
   * Configurações atuais (opcional)
   */
  settings?: GeneralSettings
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  save: [data: GeneralSettings]
  archive: []
  delete: []
}>()

// ============================================================================
// COMPOSABLES
// ============================================================================

const router = useRouter()
const { toast } = useToast()

// ============================================================================
// STATE
// ============================================================================

const formData = ref<GeneralSettings>({
  projectId: props.projectId,
  projectName: props.settings?.projectName || '',
  projectDescription: props.settings?.projectDescription || '',
  attributionModel: props.settings?.attributionModel || 'first_touch',
  revenueGoal: props.settings?.revenueGoal || undefined,
  createdAt: props.settings?.createdAt || new Date().toISOString()
})

/**
 * Input de meta de receita como string para aceitar vírgula e ponto
 * Inicializado com valor formatado se existir
 */
const revenueGoalInput = ref<string>(
  props.settings?.revenueGoal && props.settings.revenueGoal > 0
    ? props.settings.revenueGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : ''
)

const nameError = ref('')
const isArchiveModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleteConfirmModalOpen = ref(false)
const confirmProjectName = ref('')
const confirmDelete = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Formata o valor numérico para exibição (com vírgula)
 */
const formatRevenueGoalDisplay = (value: number | undefined): string => {
  if (!value || value <= 0) return ''
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Converte string do input para número (aceita vírgula e ponto)
 */
const parseRevenueGoalInput = (input: string): number | undefined => {
  if (!input || input.trim() === '') return undefined
  
  // Remove espaços e substitui vírgula por ponto
  const normalized = input.trim().replace(/\s/g, '').replace(',', '.')
  
  // Remove pontos que são separadores de milhar (mantém apenas o último ponto decimal)
  const parts = normalized.split('.')
  let cleanValue = ''
  if (parts.length > 1) {
    // Junta tudo menos o último elemento (decimais)
    cleanValue = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1]
  } else {
    cleanValue = normalized
  }
  
  const parsed = parseFloat(cleanValue)
  return !isNaN(parsed) && parsed > 0 ? parsed : undefined
}

/**
 * Handler para quando o campo nome perde o foco — valida campo obrigatório
 */
const handleNameBlur = () => {
  if (!formData.value.projectName.trim()) {
    nameError.value = 'Nome do projeto é obrigatório'
  } else {
    nameError.value = ''
  }
}

/**
 * Handler para quando o input perde o foco
 */
const handleRevenueGoalBlur = () => {
  console.log('🔄 [Blur] Input value:', revenueGoalInput.value)
  const parsed = parseRevenueGoalInput(revenueGoalInput.value)
  console.log('🔄 [Blur] Parsed value:', parsed)
  formData.value.revenueGoal = parsed
  console.log('🔄 [Blur] formData.revenueGoal set to:', formData.value.revenueGoal)
  
  // Atualiza o input com o valor formatado
  if (parsed && parsed > 0) {
    const formatted = formatRevenueGoalDisplay(parsed)
    console.log('🔄 [Blur] Formatted value:', formatted)
    revenueGoalInput.value = formatted
  } else {
    console.log('🔄 [Blur] No formatting - parsed value invalid')
  }
}

/**
 * Verifica se existe uma meta de receita salva
 */
const hasSavedRevenueGoal = computed(() => {
  return !!(props.settings?.revenueGoal && props.settings.revenueGoal > 0)
})

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Verifica se há mudanças não salvas
 */
const hasChanges = computed(() => {
  if (!props.settings) return true
  
  return (
    formData.value.projectName !== props.settings.projectName ||
    formData.value.projectDescription !== props.settings.projectDescription ||
    formData.value.attributionModel !== props.settings.attributionModel ||
    formData.value.revenueGoal !== props.settings.revenueGoal
  )
})

/**
 * Verifica se pode deletar (nome correto + checkbox marcado)
 */
const canDelete = computed(() => {
  return (
    confirmProjectName.value === formData.value.projectName &&
    confirmDelete.value
  )
})

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Sincroniza formData com props quando settings mudam
 */
watch(
  () => props.settings,
  (newSettings) => {
    if (newSettings) {
      formData.value = { ...newSettings }
      // Inicializa o input de receita com o valor formatado
      revenueGoalInput.value = formatRevenueGoalDisplay(newSettings.revenueGoal)
    }
  },
  { immediate: true }
)



// ============================================================================
// METHODS
// ============================================================================

const handleCopyProjectId = async () => {
  try {
    await navigator.clipboard.writeText(props.projectId)
    toast({
      title: 'Copiado!',
      description: 'ID do projeto copiado para a área de transferência'
    })
  } catch (error) {
    toast({
      title: 'Erro',
      description: 'Não foi possível copiar o ID',
      variant: 'destructive'
    })
  }
}

const goToDashboard = () => {
  router.push({
    name: 'dashboard-v2',
    params: { 
      locale: router.currentRoute.value.params.locale,
      projectId: props.projectId 
    }
  })
}

// ============================================================================
// HANDLERS
// ============================================================================

const handleSave = () => {
  if (!formData.value.projectName.trim()) {
    nameError.value = 'Nome do projeto é obrigatório'
    return
  }
  nameError.value = ''
  emit('save', { ...formData.value })
}

const handleArchiveProject = () => {
  isArchiveModalOpen.value = true
}

const handleDeleteProject = () => {
  isDeleteModalOpen.value = true
}

const handleConfirmArchive = () => {
  emit('archive')
  isArchiveModalOpen.value = false
}

const handleConfirmDelete = () => {
  isDeleteModalOpen.value = false
  isDeleteConfirmModalOpen.value = true
}

const handleFinalDelete = () => {
  emit('delete')
  isDeleteConfirmModalOpen.value = false
  confirmProjectName.value = ''
  confirmDelete.value = false
}
</script>
