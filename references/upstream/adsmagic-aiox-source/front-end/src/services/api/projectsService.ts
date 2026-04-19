import { apiClient, getApiErrorMessage } from './client'
import { supabase } from './supabaseClient'
import type { Project, CreateProjectDTO, UpdateProjectDTO, ProjectUser, ProjectFilters } from '@/types/project'
import { adaptProject, adaptProjects } from '@/services/adapters/projectAdapter'

export const projectsApiService = {
  /**
   * Busca projetos de uma empresa com filtros opcionais
   * 
   * @param companyId - ID da empresa (não usado, RLS filtra automaticamente)
   * @param filters - Filtros opcionais (search, sortBy, whatsappStatus)
   * @returns Array de projetos adaptados
   */
  async getUserProjects(_companyId: string, filters?: ProjectFilters) {
    try {
      const params: Record<string, string> = {}
      
      // Sempre solicitar métricas para que campos estejam sempre presentes (zerados quando não houver dados)
      params.with_metrics = 'true'
      
      // Adicionar filtro de pesquisa
      if (filters?.search) {
        params.search = filters.search
      }
      
      // Adicionar ordenação (mapear sortBy do frontend para sort do backend)
      if (filters?.sortBy) {
        params.sort = filters.sortBy
      }
      
      // whatsappStatus ainda não suportado no backend, deixar para futuro
      // if (filters?.whatsappStatus) {
      //   params.whatsapp_status = filters.whatsappStatus === 'connected' ? 'true' : 'false'
      // }

      // Período para métricas (ambos devem ser informados juntos)
      if (filters?.startDate && filters?.endDate) {
        params.start_date = filters.startDate
        params.end_date = filters.endDate
      }

      const response = await apiClient.get('/projects', { params })
      
      // Backend retorna { data: Project[], meta: {...} }
      // Verificar estrutura e extrair array de projetos
      const projects = response.data?.data || response.data || []
      
      // Aplicar adapter para mapear whatsapp_connected → whatsappStatus e garantir métricas zeradas
      return adaptProjects(projects)
    } catch (error) {
      console.error('[ProjectsApiService] Error fetching projects:', error)
      throw new Error(getApiErrorMessage(error))
    }
  },

  /**
   * Busca projetos de uma empresa com paginação
   */
  async getUserProjectsPaginated(_companyId: string, page = 1, limit = 20) {
    try {
      const response = await apiClient.get('/projects', {
        params: { page, limit }
      })
      return { data: response.data || [], total: response.data?.length || 0 }
    } catch (error) {
      console.error('[ProjectsApiService] Error fetching paginated projects:', error)
      throw new Error(getApiErrorMessage(error))
    }
  },

  /**
   * Busca um projeto por ID
   */
  async getProjectById(projectId: string) {
    try {
      const response = await apiClient.get(`/projects/${projectId}`)
      // Backend retorna projeto diretamente (não envolto em { data: ... })
      // Mas verificamos ambos os formatos para compatibilidade
      const projectData = response.data?.data || response.data
      // Aplicar adapter para mapear whatsapp_connected → whatsappStatus
      return projectData ? adaptProject(projectData) : null
    } catch (error) {
      console.error('[ProjectsApiService] Error fetching project:', error)
      throw new Error(getApiErrorMessage(error))
    }
  },

  /**
   * Cria um novo projeto
   */
  async createProject(projectData: CreateProjectDTO): Promise<Project> {
    try {
      const response = await apiClient.post('/projects', projectData)
      // Backend retorna projeto diretamente (não envolto em { data: ... })
      const projectDataResponse = response.data?.data || response.data
      if (!projectDataResponse) {
        throw new Error('Resposta da API não contém dados do projeto')
      }
      // Aplicar adapter para mapear whatsapp_connected → whatsappStatus
      return adaptProject(projectDataResponse)
    } catch (error) {
      console.error('[ProjectsApiService] Error creating project:', error)
      throw new Error(getApiErrorMessage(error))
    }
  },

  /**
   * Atualiza um projeto
   */
  async updateProject(projectId: string, updates: UpdateProjectDTO): Promise<Project> {
    try {
      const response = await apiClient.patch(`/projects/${projectId}`, updates)
      // Backend retorna projeto diretamente (não envolto em { data: ... })
      const projectDataResponse = response.data?.data || response.data
      if (!projectDataResponse) {
        throw new Error('Resposta da API não contém dados do projeto')
      }
      // Aplicar adapter para mapear whatsapp_connected → whatsappStatus
      return adaptProject(projectDataResponse)
    } catch (error) {
      console.error('[ProjectsApiService] Error updating project:', error)
      throw new Error(getApiErrorMessage(error))
    }
  },

  /**
   * Deleta um projeto (soft delete)
   */
  async deleteProject(projectId: string) {
    try {
      await apiClient.delete(`/projects/${projectId}`)
    } catch (error) {
      console.error('[ProjectsApiService] Error deleting project:', error)
      throw new Error(getApiErrorMessage(error))
    }
  },

  /**
   * Busca usuários de um projeto
   */
  async getProjectUsers(projectId: string) {
    const { data, error } = await supabase
      .from('project_users')
      .select(`
        *,
        user_profiles (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)

    if (error) throw error
    return data
  },

  /**
   * Adiciona usuário a um projeto
   */
  async addUserToProject(projectId: string, userId: string, role: ProjectUser['role']) {
    const { data, error } = await supabase
      .from('project_users')
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Remove usuário de um projeto
   */
  async removeUserFromProject(projectId: string, userId: string) {
    const { error } = await supabase
      .from('project_users')
      .update({ is_active: false })
      .eq('project_id', projectId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Atualiza role de usuário em projeto
   */
  async updateUserRole(projectId: string, userId: string, role: ProjectUser['role']) {
    const { error } = await supabase
      .from('project_users')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId)

    if (error) throw error
  }
}
