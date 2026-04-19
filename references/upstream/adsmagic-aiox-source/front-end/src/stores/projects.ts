import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectFilters,
  ProjectSortType,
} from '@/types/project'
import { projectsService } from '@/services/projects'
import { cacheService } from '@/services/cache/cacheService'
import { setCurrentProjectId } from '@/composables/useCurrentProjectId'

/**
 * Store para gerenciamento de projetos
 */
export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Filtros
  const searchTerm = ref('')
  const sortBy = ref<ProjectSortType>('created_at')
  const whatsappStatusFilter = ref<'connected' | 'disconnected' | undefined>(undefined)
  const metricsStartDate = ref<string | undefined>(undefined)
  const metricsEndDate = ref<string | undefined>(undefined)

  // Getters
  const filters = computed<ProjectFilters>(() => ({
    search: searchTerm.value || undefined,
    sortBy: sortBy.value,
    whatsappStatus: whatsappStatusFilter.value,
    startDate: metricsStartDate.value,
    endDate: metricsEndDate.value,
  }))

  const projectsCount = computed(() => projects.value.length)

  const connectedProjectsCount = computed(
    () => projects.value.filter((p) => p.whatsappStatus === 'connected').length
  )

  const disconnectedProjectsCount = computed(
    () => projects.value.filter((p) => p.whatsappStatus === 'disconnected').length
  )

  const totalMetrics = computed(() => {
    return projects.value.reduce(
      (acc, project) => ({
        investment: acc.investment + (project.metrics?.investment || 0),
        contacts: acc.contacts + (project.metrics?.contacts || 0),
        sales: acc.sales + (project.metrics?.sales || 0),
        revenue: acc.revenue + (project.metrics?.revenue || 0),
      }),
      { investment: 0, contacts: 0, sales: 0, revenue: 0 }
    )
  })

  const averageConversionRate = computed(() => {
    const projectsWithSales = projects.value.filter((p) => (p.metrics?.contacts || 0) > 0)
    if (projectsWithSales.length === 0) return 0

    const sum = projectsWithSales.reduce((acc, p) => acc + (p.metrics?.conversionRate || 0), 0)
    return sum / projectsWithSales.length
  })

  /**
   * Aguarda empresa estar disponível com retry logic
   * Retorna true se empresa foi carregada, false se timeout
   */
  async function waitForCompany(maxRetries: number = 10, delayMs: number = 500): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {

        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()
        if (!authStore.token) {
          console.warn('[Projects Store] ⚠️ No auth token available while waiting for company')
          return false
        }

        const { useCompaniesStore } = await import('@/stores/companies')
        const companiesStore = useCompaniesStore()

        if (companiesStore.currentCompanyId) {
          return true
        }

        // Se não tem empresa, tentar inicializar
        if (attempt === 1) {
          await companiesStore.initialize()
        }

        if (companiesStore.currentCompanyId) {
          return true
        }

        // Aguardar antes da próxima tentativa
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      } catch (err) {
        console.error(`[Projects Store] ❌ Error in attempt ${attempt}:`, err)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      }
    }

    console.error('[Projects Store] ❌ Timeout waiting for company')
    return false
  }

  // Actions
  async function fetchProjects(forceRefresh: boolean = false) {

    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    if (!authStore.token) {
      console.warn('[Projects Store] ⚠️ No auth token available, skipping fetchProjects')
      error.value = 'Sessão não autenticada'
      projects.value = []
      return
    }

    // Aguardar empresa estar disponível
    const companyAvailable = await waitForCompany()
    if (!companyAvailable) {
      console.warn('[Projects Store] ⚠️ No company available after retries')
      error.value = 'Nenhuma empresa selecionada'
      return
    }

    // Obter companyId após confirmação
    const { useCompaniesStore } = await import('@/stores/companies')
    const companiesStore = useCompaniesStore()
    const companyId = companiesStore.currentCompanyId

    // Verificar se há filtros ativos (pesquisa, ordenação ou período de métricas)
    const hasActiveFilters = Boolean(
      filters.value.search ||
      (filters.value.sortBy && filters.value.sortBy !== 'created_at') ||
      (filters.value.startDate && filters.value.endDate)
    )

    // Verificar cache primeiro (só se não for force refresh E não houver filtros ativos)
    // Filtros devem sempre fazer requisição ao backend para aplicar busca/ordenação/período
    const cacheKey = `projects:${companyId}:${filters.value.startDate || 'all'}:${filters.value.endDate || 'all'}`
    const shouldUseCache = !forceRefresh && !hasActiveFilters
    const cachedData = shouldUseCache ? cacheService.get<Project[]>(cacheKey) : null

    if (cachedData) {
      projects.value = cachedData
      return
    }

    // Se forceRefresh ou houver filtros, invalidar cache antes de buscar
    if (forceRefresh || hasActiveFilters) {
      if (forceRefresh) {
      }
      if (hasActiveFilters) {
      }
      cacheService.invalidate(cacheKey)
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await projectsService.getProjects(filters.value)
      projects.value = result

      // Armazenar no cache apenas se não houver filtros ativos (5 minutos)
      // Projetos filtrados não devem ser cacheados pois podem mudar com os filtros
      if (!hasActiveFilters) {
        cacheService.set(cacheKey, result, 5 * 60 * 1000)
      }
    } catch (err) {
      console.error('[Projects Store] ❌ Error fetching projects:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao carregar projetos'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProjectById(id: string) {
    isLoading.value = true
    error.value = null

    try {
      const project = await projectsService.getProjectById(id)
      currentProject.value = project
      return project
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar projeto'
      console.error('Erro ao buscar projeto:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createProject(data: CreateProjectData) {
    isLoading.value = true
    error.value = null

    try {
      const newProject = await projectsService.createProject(data)
      projects.value.unshift(newProject) // Adiciona no início

      // Invalidar cache de projetos
      const { useCompaniesStore } = await import('@/stores/companies')
      const companiesStore = useCompaniesStore()
      if (companiesStore.currentCompanyId) {
        cacheService.invalidatePattern(`projects:${companiesStore.currentCompanyId}`)
      }

      return newProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar projeto'
      console.error('Erro ao criar projeto:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createActivatedProject(data: { name: string; segment: string }) {
    isLoading.value = true
    error.value = null

    try {
      const newProject = await projectsService.createActivatedProject(data)
      projects.value.unshift(newProject)

      const { useCompaniesStore } = await import('@/stores/companies')
      const companiesStore = useCompaniesStore()
      if (companiesStore.currentCompanyId) {
        cacheService.invalidatePattern(`projects:${companiesStore.currentCompanyId}`)
      }

      return newProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar projeto'
      console.error('Erro ao criar projeto ativo:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateProject(id: string, data: UpdateProjectData) {
    isLoading.value = true
    error.value = null

    try {
      const updatedProject = await projectsService.updateProject(id, data)

      // Invalidar cache de projetos
      const { useCompaniesStore } = await import('@/stores/companies')
      const companiesStore = useCompaniesStore()
      if (companiesStore.currentCompanyId) {
        cacheService.invalidatePattern(`projects:${companiesStore.currentCompanyId}`)
      }

      // Atualiza na lista
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      // Atualiza projeto atual se for o mesmo
      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject
      }

      return updatedProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar projeto'
      console.error('Erro ao atualizar projeto:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteProject(id: string) {
    isLoading.value = true
    error.value = null

    try {
      await projectsService.deleteProject(id)

      // Invalidar cache de projetos
      const { useCompaniesStore } = await import('@/stores/companies')
      const companiesStore = useCompaniesStore()
      if (companiesStore.currentCompanyId) {
        cacheService.invalidatePattern(`projects:${companiesStore.currentCompanyId}`)
      }

      // Remove da lista
      projects.value = projects.value.filter((p) => p.id !== id)

      // Limpa projeto atual se for o mesmo
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar projeto'
      console.error('Erro ao deletar projeto:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Duplica um projeto existente com novo nome
   * Copia configurações mas reseta métricas e status
   */
  async function duplicateProject(sourceProject: Project, newName?: string) {
    isLoading.value = true
    error.value = null

    try {
      // Criar novo projeto com nome duplicado
      const duplicatedName = newName || `${sourceProject.name} (cópia)`

      const newProject = await projectsService.createProject({
        name: duplicatedName,
      })

      // Adicionar à lista de projetos
      projects.value.unshift(newProject)

      // Invalidar cache
      const { useCompaniesStore } = await import('@/stores/companies')
      const companiesStore = useCompaniesStore()
      if (companiesStore.currentCompanyId) {
        cacheService.invalidatePattern(`projects:${companiesStore.currentCompanyId}`)
      }

      return newProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao duplicar projeto'
      console.error('Erro ao duplicar projeto:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function testWhatsAppConnection(id: string) {
    try {
      const isConnected = await projectsService.testWhatsAppConnection(id)

      if (isConnected) {
        // Atualiza status do projeto
        await updateProject(id, { whatsappStatus: 'connected' })
      }

      return isConnected
    } catch (err) {
      console.error('Erro ao testar conexão WhatsApp:', err)
      return false
    }
  }

  function setSearchTerm(term: string) {
    searchTerm.value = term
  }

  function setSortBy(sort: ProjectSortType) {
    sortBy.value = sort
  }

  function setWhatsAppStatusFilter(status: 'connected' | 'disconnected' | undefined) {
    whatsappStatusFilter.value = status
  }

  function setMetricsPeriod(startDate?: string, endDate?: string) {
    metricsStartDate.value = startDate || undefined
    metricsEndDate.value = endDate || undefined
  }

  function clearFilters() {
    searchTerm.value = ''
    sortBy.value = 'created_at'
    whatsappStatusFilter.value = undefined
    metricsStartDate.value = undefined
    metricsEndDate.value = undefined
  }

  function clearError() {
    error.value = null
  }

  async function setCurrentProject(project: Project | null) {
    const { useCompaniesStore } = await import('@/stores/companies')
    const companiesStore = useCompaniesStore()

    // Em modo mock (Supabase desabilitado), não bloqueie por empresa
    const isMockMode = import.meta.env.VITE_USE_SUPABASE !== 'true'

    if (project && !isMockMode && companiesStore.currentCompanyId !== project.company_id) {
      // Cenário comum pós-F5: empresa ainda não sincronizada quando o projeto já foi carregado.
      // Em vez de bloquear a seleção do projeto, sincronizamos o contexto da empresa.
      const matchingCompany = companiesStore.companies.find((company) => company.id === project.company_id)
      if (matchingCompany) {
        // Não bloquear navegação por operações secundárias de sync de empresa.
        void companiesStore.setCurrentCompany(matchingCompany).catch((error) => {
          console.warn('[Projects] Failed to sync matching company while setting project:', error)
        })
      } else if (!companiesStore.currentCompanyId) {
        try {
          await companiesStore.fetchCompanies({ force: true, reason: 'guard' })
          const fetchedCompany = companiesStore.companies.find((company) => company.id === project.company_id)
          if (fetchedCompany) {
            void companiesStore.setCurrentCompany(fetchedCompany).catch((error) => {
              console.warn('[Projects] Failed to sync fetched company while setting project:', error)
            })
          }
        } catch (error) {
          console.warn('[Projects] Failed to sync company while setting current project:', error)
        }
      } else {
        // Não bloquear a seleção do projeto quando o backend já validou o acesso no guard.
        console.warn('[Projects] Project company differs from current company context; continuing with route project')
      }
    }

    // Em mock, se não houver empresa selecionada, defina baseada no projeto
    if (project && isMockMode && !companiesStore.currentCompanyId) {
      companiesStore.companies = companiesStore.companies || []
      // Se a empresa já existe na lista, usar; caso contrário, criar rascunho mínimo
      const existing = companiesStore.companies.find((c: any) => c.id === project.company_id)
      if (existing) {
        companiesStore.currentCompany = existing
      } else {
        const mockCompany = { id: project.company_id || 'company_mock', name: 'Empresa Mock' } as any
        companiesStore.companies.push(mockCompany)
        companiesStore.currentCompany = mockCompany
      }
      if (companiesStore.currentCompany?.id) {
        localStorage.setItem('current_company_id', companiesStore.currentCompany.id)
      }
    }

    currentProject.value = project

    // Usar composable reativo em vez de localStorage diretamente
    // Isso permite que outros stores observem mudanças de projeto
    setCurrentProjectId(project?.id ?? null)
  }

  // Carregar projeto específico
  async function loadProject(projectId: string): Promise<Project | null> {
    try {
      isLoading.value = true
      error.value = null

      // Verificar se o projeto já está carregado
      const existingProject = projects.value.find(p => p.id === projectId)
      if (existingProject) {
        return existingProject
      }

      // Carregar projeto do backend
      const response = await projectsService.getProjectById(projectId)
      if (response) {
        // Adicionar à lista de projetos se não existir
        const projectIndex = projects.value.findIndex(p => p.id === projectId)
        if (projectIndex === -1) {
          projects.value.push(response)
        } else {
          projects.value[projectIndex] = response
        }

        return response
      }

      return null
    } catch (err) {
      console.error('[Projects Store] Error loading project:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao carregar projeto'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inicialização robusta da store de projetos
   * Aguarda empresa estar carregada antes de buscar projetos
   */
  async function initialize() {

    try {
      // Aguardar empresa estar disponível com retry logic
      const companyAvailable = await waitForCompany()

      if (companyAvailable) {
        await fetchProjects()
      } else {
        console.warn('[Projects Store] ⚠️ No company available, skipping projects fetch')
        error.value = 'Nenhuma empresa selecionada'
      }

      // Restore current project from localStorage
      const savedProjectId = localStorage.getItem('current_project_id')
      if (savedProjectId) {
        const savedProject = projects.value.find(p => p.id === savedProjectId)
        if (savedProject) {
          await setCurrentProject(savedProject)
        } else {
          // Projeto pode não estar na lista atual (filtro/cache/race de bootstrap).
          // Tenta carregar diretamente antes de limpar o contexto.
          const loadedProject = await loadProject(savedProjectId)
          if (loadedProject) {
            await setCurrentProject(loadedProject)
          } else {
            // Project not found, clear saved ID
            localStorage.removeItem('current_project_id')
            setCurrentProjectId(null)
          }
        }
      }
    } catch (err) {
      console.error('[Projects Store] ❌ Initialization failed:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao inicializar projetos'
    }
  }

  /**
   * Invalida cache de projetos para a empresa atual
   * Útil quando projetos são criados/atualizados externamente (ex: wizard)
   */
  async function invalidateCache() {
    const { useCompaniesStore } = await import('@/stores/companies')
    const companiesStore = useCompaniesStore()

    if (companiesStore.currentCompanyId) {
      const cacheKey = `projects:${companiesStore.currentCompanyId}`
      cacheService.invalidate(cacheKey)
    }
  }

  return {
    // State
    projects,
    currentProject,
    isLoading,
    error,
    searchTerm,
    sortBy,
    whatsappStatusFilter,

    // Getters
    filters,
    projectsCount,
    connectedProjectsCount,
    disconnectedProjectsCount,
    totalMetrics,
    averageConversionRate,

    // Actions
    fetchProjects,
    fetchProjectById,
    createProject,
    createActivatedProject,
    updateProject,
    deleteProject,
    duplicateProject,
    testWhatsAppConnection,
    setSearchTerm,
    setSortBy,
    setWhatsAppStatusFilter,
    setMetricsPeriod,
    clearFilters,
    clearError,
    setCurrentProject,
    loadProject,
    initialize,
    invalidateCache,
  }
})
