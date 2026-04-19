<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Plus, Filter } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import AlertDialog from '@/components/ui/AlertDialog.vue'
import { useProjectsStore } from '@/stores/projects'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { ProjectSortType, Project, CreateProjectData } from '@/types/project'
import { watchDebounced } from '@vueuse/core'
import { useCompaniesStore } from '@/stores/companies'
import { useBillingStore } from '@/stores/billing'
import { useToast } from '@/components/ui/toast/use-toast'

// ============================================================================
// I18N
// ============================================================================

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

import Button from '@/components/ui/Button.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import Select from '@/components/ui/Select.vue'
import Input from '@/components/ui/Input.vue'
import ProjectsTable from '@/components/projects/ProjectsTable.vue'
import ProjectsMetrics from '@/components/projects/ProjectsMetrics.vue'
import ProjectsFilters from '@/components/projects/ProjectsFilters.vue'
import type { ProjectFilters } from '@/components/projects/ProjectsFilters.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Modal from '@/components/ui/Modal.vue'
import DashboardSection from '@/components/ui/DashboardSection.vue'

const projectsStore = useProjectsStore()
const companiesStore = useCompaniesStore()
const billingStore = useBillingStore()
const { toast } = useToast()
const confirmDialog = useConfirmDialog()

// State
const showDeleteModal = ref(false)
const projectToDelete = ref<Project | null>(null)
const isDeleting = ref(false)
const showCreateProjectModal = ref(false)
const createProjectName = ref('')
const createProjectSegment = ref('')
const isCreatingProject = ref(false)
const createProjectFormError = ref<string | null>(null)

// Filters state
const showFiltersModal = ref(false)
const activeFilters = ref<ProjectFilters>({
  status: '',
  dateFrom: '',
  dateTo: '',
  hasWizardPending: null,
})

const segmentOptions = computed(() => [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'local-services', label: 'Serviços Locais' },
  { value: 'infoproduct', label: 'Infoproduto' },
  { value: 'saas', label: 'SaaS' },
  { value: 'other', label: 'Outro' },
])

const isCreateProjectFormValid = computed(() => {
  return createProjectName.value.trim().length >= 3 && createProjectSegment.value.trim().length > 0
})

// Opções de ordenação
const sortOptions = computed(() => [
  { value: 'created_at', label: t('projects.sortOptions.created_at') },
  { value: 'name_asc', label: t('projects.sortOptions.name_asc') },
  { value: 'name_desc', label: t('projects.sortOptions.name_desc') },
])

// Computed para verificar se há filtros ativos
const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.status !== '' ||
    activeFilters.value.dateFrom !== '' ||
    activeFilters.value.dateTo !== '' ||
    activeFilters.value.hasWizardPending !== null
  )
})

// Computed para projetos filtrados
const filteredProjects = computed(() => {
  let projects = projectsStore.projects
  
  // Filtro de status
  if (activeFilters.value.status === 'active') {
    projects = projects.filter(p => p.status === 'active')
  } else if (activeFilters.value.status === 'archived') {
    projects = projects.filter(p => p.status === 'archived')
  }
  
  // Filtro de wizard pendente
  if (activeFilters.value.hasWizardPending === true) {
    projects = projects.filter(p => {
      const currentStep = p.wizard_current_step ?? p.wizard_progress?.current_step ?? 1
      const isComplete = p.wizard_progress?.current_step ? p.wizard_progress.current_step >= 5 : false
      return !isComplete && currentStep < 5
    })
  } else if (activeFilters.value.hasWizardPending === false) {
    projects = projects.filter(p => {
      const isComplete = p.wizard_progress?.current_step ? p.wizard_progress.current_step >= 5 : false
      return isComplete
    })
  }

  // Nota: Período (dateFrom/dateTo) não filtra a lista de projetos; apenas as métricas são calculadas no período via API.
  return projects
})

// Projetos draft com wizard pendente (computed removido - não usado)

// Lifecycle
onMounted(async () => {
  try {
    // Verificar empresa primeiro
    await checkCompanyAndRedirect()

    // Inicializar projetos e billing em paralelo
    await Promise.allSettled([
      projectsStore.initialize(),
      billingStore.fetchLimits(),
    ])
  } catch (error) {
    console.error('[Projects] ❌ Error during initialization:', error)
    if (error instanceof Error) {
      console.error('[Projects] ❌ Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
  }
})

// Watchers
watchDebounced(
  () => projectsStore.searchTerm,
  async () => {
    await projectsStore.fetchProjects()
  },
  { debounce: 300 }
)

watch(
  () => projectsStore.sortBy,
  async () => {
    await projectsStore.fetchProjects()
  }
)

watch(
  () => companiesStore.currentCompanyId,
  async (newCompanyId, oldCompanyId) => {
    if (!newCompanyId || newCompanyId === oldCompanyId) {
      return
    }

    await projectsStore.fetchProjects(true)
  }
)

// Recarrega projetos quando voltar para esta view (ex: após salvar no wizard)
let previousRouteName: string | undefined = undefined
watch(
  () => route.name,
  async (currentRouteName, previousRouteNameValue) => {
    // Só recarrega se:
    // 1. A rota atual é 'projects'
    // 2. A rota anterior não era 'projects' (evita recarregar quando já está em projects)
    // 3. Já foi inicializado (evita recarregar no mount inicial)
    if (
      currentRouteName === 'projects' &&
      previousRouteNameValue !== 'projects' &&
      previousRouteName !== undefined
    ) {
      try {
        // Verificar se veio do wizard para forçar refresh
        const fromWizard = previousRouteNameValue === 'project-wizard'
        await projectsStore.fetchProjects(fromWizard)
      } catch (error) {
        console.error('[Projects] ❌ Error refreshing projects:', error)
      }
    }
    previousRouteName = currentRouteName as string | undefined
  },
  { immediate: true }
)

// ============================================================================
// VERIFICAÇÃO DE EMPRESA
// ============================================================================

/**
 * Verifica se usuário tem empresa vinculada de forma robusta
 * Se não tiver, redireciona para onboarding
 */
async function checkCompanyAndRedirect(): Promise<void> {
  try {
    if (!companiesStore.hasCompanies) {
      await companiesStore.fetchCompanies({ reason: 'view' })
    }

    if (!companiesStore.currentCompanyId && companiesStore.companies.length > 0) {
      const firstCompany = companiesStore.companies[0]
      if (firstCompany) {
        await companiesStore.setCurrentCompany(firstCompany)
      }
    }
    
    // Verificar se tem empresa após inicialização
    if (!companiesStore.hasCompanies) {
      const locale = route.params.locale as string || 'pt'
      await router.push(`/${locale}/onboarding`)
      return
    }
    
  } catch (error) {
    console.error('[Projects] ❌ Error checking company:', error)
    
    // Exibir erro amigável para o usuário
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro ao carregar dados da empresa'
    
    // Log detalhado do erro
    if (import.meta.env.DEV) {
      console.error('[Projects] ❌ Error details:', {
        message: errorMessage,
        error: error instanceof Error ? error.stack : error,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      })
    }
    
    // Em caso de erro, redirecionar para onboarding como fallback
    const locale = route.params.locale as string || 'pt'
    await router.push(`/${locale}/onboarding`)
  }
}

// ============================================================================
// HANDLERS
// ============================================================================

function handleSearch(term: string) {
  projectsStore.setSearchTerm(term)
}

function handleClearSearch() {
  projectsStore.setSearchTerm('')
}

function handleSortChange(value: string) {
  projectsStore.setSortBy(value as ProjectSortType)
}

function handleOpenFilters() {
  showFiltersModal.value = true
}

function handleApplyFilters(filters: ProjectFilters) {
  activeFilters.value = { ...filters }
  showFiltersModal.value = false
  // Watch em dateFrom/dateTo reage e chama setMetricsPeriod + fetchProjects
  projectsStore.setMetricsPeriod(filters.dateFrom || undefined, filters.dateTo || undefined)
  void projectsStore.fetchProjects(true)
}

function handleClearFilters() {
  activeFilters.value = {
    status: '',
    dateFrom: '',
    dateTo: '',
    hasWizardPending: null,
  }
  showFiltersModal.value = false
  projectsStore.setMetricsPeriod(undefined, undefined)
  void projectsStore.fetchProjects(true)
}

async function handleCreateProject() {
  if (!companiesStore.currentCompanyId) {
    await companiesStore.fetchCompanies({ reason: 'view' })
  }

  if (!companiesStore.hasCompanies) {
    const locale = route.params.locale as string || 'pt'
    await router.push(`/${locale}/onboarding`)
    return
  }

  // Check project limit from billing
  if (!billingStore.limits) {
    await billingStore.fetchLimits()
  }
  if (!billingStore.canCreateProject) {
    const locale = route.params.locale as string || 'pt'
    toast({
      title: t('trial.limits.projectsReached'),
      description: t('trial.limits.upgradeCta'),
      variant: 'destructive',
    })
    await router.push(`/${locale}/pricing`)
    return
  }

  createProjectName.value = ''
  createProjectSegment.value = ''
  createProjectFormError.value = null
  showCreateProjectModal.value = true
}

function closeCreateProjectModal() {
  if (isCreatingProject.value) {
    return
  }

  showCreateProjectModal.value = false
  createProjectFormError.value = null
}

async function submitCreateProject() {
  if (isCreatingProject.value) {
    return
  }

  const payload: CreateProjectData = {
    name: createProjectName.value.trim(),
  }

  if (payload.name.length < 3 || createProjectSegment.value.trim().length === 0) {
    createProjectFormError.value = 'Preencha nome e segmento para continuar.'
    return
  }

  isCreatingProject.value = true
  createProjectFormError.value = null

  try {
    const project = await projectsStore.createActivatedProject({
      name: payload.name,
      segment: createProjectSegment.value,
    })

    await projectsStore.setCurrentProject(project)
    showCreateProjectModal.value = false

    const locale = route.params.locale as string || 'pt'
    await router.push({
      name: 'dashboard-v2',
      params: {
        locale,
        projectId: project.id,
      },
    })
  } catch (error) {
    console.error('[Projects] ❌ Erro ao criar projeto:', error)
    createProjectFormError.value = 'Não foi possível criar o projeto. Tente novamente.'
  } finally {
    isCreatingProject.value = false
  }
}

async function handleProjectClick(project: Project) {
  try {
    await projectsStore.setCurrentProject(project)

    const locale = route.params.locale as string || 'pt'
    await router.push({
      name: 'dashboard-v2',
      params: {
        locale,
        projectId: project.id
      }
    })
  } catch (error) {
    console.error('[Projects] ❌ Erro ao abrir projeto:', error)
  }
}

// ============================================================================
// HANDLERS: EDIT E DELETE PROJETOS
// ============================================================================

/**
 * Abre o wizard para editar um projeto existente
 */
function handleEditProject(project: Project) {
  const locale = route.params.locale as string || 'pt'
  router.push({
    path: `/${locale}/project/new`,
    query: { projectId: project.id }
  })
}

/**
 * Abre modal de confirmação para deletar projeto
 */
function handleDeleteProject(project: Project) {
  projectToDelete.value = project
  showDeleteModal.value = true
}

/**
 * Arquiva um projeto (muda status para 'archived')
 */
async function handleArchiveProject(project: Project) {
  try {
    await projectsStore.updateProject(project.id, { status: 'archived' })
    await projectsStore.fetchProjects(true)
  } catch (error) {
    console.error('[Projects] ❌ Erro ao arquivar projeto:', error)
    toast({ title: t('projects.errors.operationFailed'), variant: 'destructive' })
  }
}

/**
 * Bulk delete de projetos
 */
async function handleBulkDeleteProjects(projectIds: string[]) {
  const confirmed = await confirmDialog.confirm({
    title: 'Excluir Projetos',
    description: `Tem certeza que deseja excluir ${projectIds.length} projeto(s)?`,
    confirmText: 'Excluir',
    cancelText: 'Cancelar',
    variant: 'destructive'
  })

  if (!confirmed) {
    return
  }
  
  try {
    await Promise.all(projectIds.map(id => projectsStore.deleteProject(id)))
    await projectsStore.fetchProjects(true)
  } catch (error) {
    console.error('[Projects] ❌ Erro ao excluir projetos:', error)
    toast({ title: t('projects.errors.operationFailed'), variant: 'destructive' })
  }
}

/**
 * Bulk archive de projetos
 */
async function handleBulkArchiveProjects(projectIds: string[]) {
  try {
    await Promise.all(
      projectIds.map(id => projectsStore.updateProject(id, { status: 'archived' }))
    )
    await projectsStore.fetchProjects(true)
  } catch (error) {
    console.error('[Projects] ❌ Erro ao arquivar projetos:', error)
    toast({ title: t('projects.errors.operationFailed'), variant: 'destructive' })
  }
}

/**
 * Bulk export de projetos
 */
function handleBulkExportProjects(projectIds: string[]) {
  const projects = projectsStore.projects.filter(p => projectIds.includes(p.id))
  
  // Criar CSV dos projetos selecionados
  const headers = ['Nome', 'Status', 'Investimento', 'Contatos', 'Vendas', 'Taxa Conversão', 'Receita', 'Criado em']
  const rows = projects.map(p => [
    p.name || '',
    p.status || '',
    p.metrics?.investment || 0,
    p.metrics?.contacts || 0,
    p.metrics?.sales || 0,
    p.metrics?.conversionRate || 0,
    p.metrics?.revenue || 0,
    p.createdAt || '',
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `projetos-selecionados-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Confirma e executa a exclusão do projeto
 */
async function confirmDeleteProject() {
  if (!projectToDelete.value) return

  isDeleting.value = true
  try {
    await projectsStore.deleteProject(projectToDelete.value.id)
    showDeleteModal.value = false
    projectToDelete.value = null
  } catch (error) {
    console.error('[Projects] ❌ Erro ao excluir projeto:', error)
    toast({ title: t('projects.errors.operationFailed'), variant: 'destructive' })
  } finally {
    isDeleting.value = false
  }
}

/**
 * Cancela a exclusão do projeto
 */
function cancelDeleteProject() {
  showDeleteModal.value = false
  projectToDelete.value = null
}

/**
 * Duplica um projeto existente
 * Cria uma cópia do projeto com novo nome
 */
async function handleDuplicateProject(project: Project) {
  try {
    const duplicated = await projectsStore.duplicateProject(project)
    
    // Atualizar lista de projetos
    await projectsStore.fetchProjects(true)
    
    // Navegar para o wizard do projeto duplicado para configuração
    const locale = route.params.locale as string || 'pt'
    router.push({
      path: `/${locale}/project/new`,
      query: { projectId: duplicated.id }
    })
  } catch (error) {
    console.error('[Projects] ❌ Erro ao duplicar projeto:', error)
    toast({ title: t('projects.errors.operationFailed'), variant: 'destructive' })
  }
}

</script>

<template>
  <AppLayout>
    <div class="page-shell section-stack-md">
    <!-- Header -->
    <div class="page-header-section">
      <PageHeader
        :title="t('projects.title')"
        :description="t('projects.subtitle')"
      />

      <div class="page-actions w-full sm:w-auto">
        <Button class="w-full sm:w-auto" @click="handleCreateProject" size="default">
          <Plus class="h-4 w-4 mr-2" />
          {{ t('projects.createNew') }}
        </Button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-start">
      <!-- Search -->
      <div class="w-full">
        <SearchInput
          :model-value="projectsStore.searchTerm"
          @update:model-value="projectsStore.setSearchTerm"
          @search="handleSearch"
          @clear="handleClearSearch"
          :placeholder="t('projects.searchPlaceholder')"
        />
      </div>

      <!-- Filters Button -->
      <Button
        variant="outline"
        size="default"
        @click="handleOpenFilters"
        :class="{ 'border-primary text-primary': hasActiveFilters }"
        class="w-full sm:w-auto justify-center"
      >
        <Filter class="h-4 w-4 mr-2" />
        Filtros
        <span v-if="hasActiveFilters" class="ml-1 px-1.5 py-0.5 bg-primary text-white rounded-full text-xs">
          •
        </span>
      </Button>

      <!-- Sort -->
      <div class="w-full sm:w-[260px]">
        <Select
          :model-value="projectsStore.sortBy"
          @update:model-value="handleSortChange"
          :options="sortOptions"
          :placeholder="t('projects.sortBy')"
        />
      </div>
    </div>

    <!-- Stats Section -->
    <DashboardSection
      :title="t('projects.statistics.title')"
      :description="t('projects.statistics.description')"
      variant="bordered"
    >
      <div class="p-4 sm:p-6">
        <ProjectsMetrics
          :projects="filteredProjects"
          :loading="projectsStore.isLoading"
        />
      </div>
    </DashboardSection>

    <!-- Placeholder para manter compatibilidade -->
    <div v-if="false" class="hidden">
      <div class="rounded-lg border border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-muted-foreground">{{ t('projects.stats.averageConversionRate') }}</p>
        </div>
        <p class="text-2xl font-bold text-foreground mt-2">
          {{ projectsStore.averageConversionRate.toFixed(2) }}%
        </p>
      </div>
    </div>

    <!-- Projects Table -->
    <ProjectsTable
      :projects="filteredProjects"
      :is-loading="projectsStore.isLoading"
      @project-click="handleProjectClick"
      @edit="handleEditProject"
      @delete="handleDeleteProject"
      @archive="handleArchiveProject"
      @duplicate="handleDuplicateProject"
      @bulk-delete="handleBulkDeleteProjects"
      @bulk-archive="handleBulkArchiveProjects"
      @bulk-export="handleBulkExportProjects"
    />

    <Modal
      v-model="showCreateProjectModal"
      title="Criar novo projeto"
      description="Preencha os dados iniciais para ativar o projeto e ir direto para a dashboard."
      size="md"
    >
      <form class="space-y-4" @submit.prevent="submitCreateProject">
        <div class="space-y-2">
          <label class="text-sm font-medium" for="create-project-name">
            Nome do projeto
          </label>
          <Input
            id="create-project-name"
            v-model="createProjectName"
            type="text"
            placeholder="Ex: Clínica Sorriso - Março"
            :disabled="isCreatingProject"
          />
          <p class="text-xs text-muted-foreground">
            Use um nome fácil de identificar para sua operação.
          </p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium" for="create-project-segment">
            Segmento
          </label>
          <Select
            id="create-project-segment"
            :model-value="createProjectSegment"
            :options="segmentOptions"
            :disabled="isCreatingProject"
            @update:model-value="createProjectSegment = $event"
          />
        </div>

        <p v-if="createProjectFormError" class="text-sm text-destructive">
          {{ createProjectFormError }}
        </p>

        <div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            type="button"
            :disabled="isCreatingProject"
            @click="closeCreateProjectModal"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            :disabled="!isCreateProjectFormValid || isCreatingProject"
          >
            <template v-if="isCreatingProject">Criando...</template>
            <template v-else>Criar projeto e ir para dashboard</template>
          </Button>
        </div>
      </form>
    </Modal>

    <!-- Modal de Confirmação de Exclusão -->
    <Modal 
      v-model="showDeleteModal"
      title="Excluir Projeto"
      :description="`Tem certeza que deseja excluir o projeto '${projectToDelete?.name || ''}'? Esta ação não pode ser desfeita.`"
      size="sm"
    >
      <div class="flex flex-col gap-3 pt-2">
        <Button 
          variant="destructive"
          class="w-full"
          :disabled="isDeleting"
          @click="confirmDeleteProject"
        >
          <template v-if="isDeleting">
            Excluindo...
          </template>
          <template v-else>
            🗑️ Sim, excluir projeto
          </template>
        </Button>

        <Button 
          variant="outline"
          class="w-full"
          :disabled="isDeleting"
          @click="cancelDeleteProject"
        >
          Cancelar
        </Button>
      </div>
    </Modal>

    <!-- Filters Modal -->
    <ProjectsFilters
      :open="showFiltersModal"
      :filters="activeFilters"
      @update:open="showFiltersModal = $event"
      @apply="handleApplyFilters"
      @clear="handleClearFilters"
    />

    </div>
  </AppLayout>

  <!-- Dialog de Confirmação -->
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
</template>
