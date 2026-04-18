<!--
  Step 1: Informações básicas do projeto
  Coleta nome e segmento
-->

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectWizardStore } from '@/stores/projectWizard'
import { HelpCircle, AlertCircle, CheckCircle2, Sparkles, ShoppingCart, Building2, GraduationCap, Rocket, LayoutGrid } from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Badge from '@/components/ui/Badge.vue'
import Tooltip from '@/components/ui/Tooltip.vue'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()

// ============================================================================
// STORE
// ============================================================================

const wizardStore = useProjectWizardStore()

// ============================================================================
// ESTADO LOCAL
// ============================================================================

const projectName = ref('')
const projectSegment = ref('')
const selectedTemplate = ref<string | null>(null)

// Templates pré-configurados
interface ProjectTemplate {
  id: string
  name: string
  segment: string
  description: string
  icon: typeof ShoppingCart
  color: string
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    segment: 'ecommerce',
    description: 'Loja virtual com foco em vendas online',
    icon: ShoppingCart,
    color: 'bg-blue-500',
  },
  {
    id: 'local-services',
    name: 'Serviços Locais',
    segment: 'local-services',
    description: 'Negócios com atendimento presencial',
    icon: Building2,
    color: 'bg-green-500',
  },
  {
    id: 'infoproduct',
    name: 'Infoproduto',
    segment: 'infoproduct',
    description: 'Cursos, ebooks e produtos digitais',
    icon: GraduationCap,
    color: 'bg-purple-500',
  },
  {
    id: 'saas',
    name: 'SaaS',
    segment: 'saas',
    description: 'Software como serviço, assinaturas',
    icon: Rocket,
    color: 'bg-orange-500',
  },
  {
    id: 'custom',
    name: 'Personalizado',
    segment: '',
    description: 'Configure do zero',
    icon: LayoutGrid,
    color: 'bg-slate-500',
  },
]

// Função para aplicar template
function applyTemplate(template: ProjectTemplate) {
  selectedTemplate.value = template.id
  if (template.segment) {
    projectSegment.value = template.segment
  }
  // Se for template custom, limpa segmento para usuário escolher
  if (template.id === 'custom') {
    projectSegment.value = ''
  }
}

// Opções de segmento
const segmentOptions = [
  { value: '', label: t('projectWizard.step1.segmentPlaceholder') },
  { value: 'ecommerce', label: t('projectWizard.step1.segments.ecommerce') },
  { value: 'local-services', label: t('projectWizard.step1.segments.localServices') },
  { value: 'infoproduct', label: t('projectWizard.step1.segments.infoproduct') },
  { value: 'saas', label: t('projectWizard.step1.segments.saas') },
  { value: 'other', label: t('projectWizard.step1.segments.other') },
]

// ============================================================================
// COMPUTED
// ============================================================================

// Validação inline do nome do projeto
const nameValidation = computed(() => {
  const name = projectName.value.trim()
  if (!name) return { valid: false, message: '', touched: false }
  if (name.length < 3) return { valid: false, message: 'Nome deve ter pelo menos 3 caracteres', touched: true }
  if (name.length > 50) return { valid: false, message: 'Nome deve ter no máximo 50 caracteres', touched: true }
  return { valid: true, message: '', touched: true }
})

// ============================================================================
// WATCHERS
// ============================================================================

// Atualiza a store quando os valores mudam
watch([projectName, projectSegment], () => {
  wizardStore.updateProjectData({
    name: projectName.value,
    segment: projectSegment.value,
  })
})

// Observa mudanças na store e atualiza campos locais (para quando dados chegam do backend)
watch(
  () => wizardStore.projectData.name,
  (newName) => {
    if (newName !== undefined && newName !== projectName.value) {
      projectName.value = newName || ''
    }
  },
  { immediate: true }
)

watch(
  () => wizardStore.projectData.segment,
  (newSegment) => {
    if (newSegment !== undefined && newSegment !== projectSegment.value) {
      projectSegment.value = newSegment || ''
    }
  },
  { immediate: true }
)

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  // Carrega valores da store
  projectName.value = wizardStore.projectData.name || ''
  projectSegment.value = wizardStore.projectData.segment || ''
})
</script>

<template>
  <div class="step-project-info">
    <div class="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Cabeçalho do step -->
      <div class="text-center mb-4">
        <h2 class="text-xl sm:text-2xl font-bold">
          {{ t('projectWizard.step1.title') }}
        </h2>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ t('projectWizard.step1.description') }}
        </p>
      </div>

      <!-- Formulário -->
      <div class="space-y-6">
        <!-- Seção de Templates -->
        <div class="space-y-3">
          <label class="flex items-center gap-2 text-sm font-medium">
            <Sparkles class="h-4 w-4 text-primary" />
            Comece com um template
            <Badge variant="secondary" class="text-xs">Opcional</Badge>
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              v-for="template in projectTemplates"
              :key="template.id"
              type="button"
              class="flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:border-primary/50 hover:bg-muted/50"
              :class="[
                selectedTemplate === template.id 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-border'
              ]"
              @click="applyTemplate(template)"
            >
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                :class="template.color"
              >
                <component :is="template.icon" class="h-5 w-5 text-white" />
              </div>
              <span class="text-sm font-medium text-center">{{ template.name }}</span>
              <span class="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
                {{ template.description }}
              </span>
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">Detalhes do projeto</span>
          </div>
        </div>

        <!-- Nome do projeto -->
        <div class="space-y-2">
          <label for="project-name" class="flex items-center gap-2 text-sm font-medium">
            {{ t('projectWizard.step1.nameLabel') }}
            <span class="text-destructive">*</span>
            <Tooltip side="top">
              <template #trigger>
                <HelpCircle class="h-4 w-4 text-muted-foreground cursor-help" />
              </template>
              Use um nome descritivo que identifique facilmente seu projeto. Exemplo: "Loja Virtual - Black Friday 2025"
            </Tooltip>
          </label>
          <div class="relative">
            <Input
              id="project-name"
              v-model="projectName"
              type="text"
              :placeholder="t('projectWizard.step1.namePlaceholder')"
              required
              class="w-full pr-10"
              :class="{
                'border-destructive focus:ring-destructive': nameValidation.touched && !nameValidation.valid,
                'border-green-500 focus:ring-green-500': nameValidation.touched && nameValidation.valid
              }"
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle2 v-if="nameValidation.touched && nameValidation.valid" class="h-4 w-4 text-green-500" />
              <AlertCircle v-else-if="nameValidation.touched && !nameValidation.valid" class="h-4 w-4 text-destructive" />
            </div>
          </div>
          <p v-if="nameValidation.touched && !nameValidation.valid" class="text-xs text-destructive">
            {{ nameValidation.message }}
          </p>
          <p v-else class="text-xs text-muted-foreground">
            {{ t('projectWizard.step1.nameHint') }}
          </p>
        </div>

        <!-- Segmento -->
        <div class="space-y-2">
          <label for="project-segment" class="flex items-center gap-2 text-sm font-medium">
            {{ t('projectWizard.step1.segmentLabel') }}
            <span class="text-destructive">*</span>
            <Tooltip side="top">
              <template #trigger>
                <HelpCircle class="h-4 w-4 text-muted-foreground cursor-help" />
              </template>
              O segmento ajuda a configurar métricas e relatórios específicos para seu tipo de negócio.
            </Tooltip>
          </label>
          <Select
            id="project-segment"
            v-model="projectSegment"
            :options="segmentOptions"
            required
            class="w-full"
          />
          <div class="flex items-start space-x-2">
            <Badge variant="secondary" class="mt-1">
              {{ t('projectWizard.step1.canChangeLater') }}
            </Badge>
          </div>
        </div>

        <!-- Texto auxiliar -->
        <div class="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p class="text-sm text-muted-foreground">
            {{ t('projectWizard.step1.helpText') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-project-info {
  min-height: 400px;
}
</style>
