import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectFilters,
} from '@/types/project'
import { projectsApiService } from './api/projectsService'
import { whatsappIntegrationService } from './api/whatsappIntegrationService'

/**
 * Interface do serviço de projetos
 */
export interface ProjectsService {
  /**
   * Lista todos os projetos do usuário
   */
  getProjects(filters?: ProjectFilters): Promise<Project[]>

  /**
   * Busca um projeto por ID
   */
  getProjectById(id: string): Promise<Project | null>

  /**
   * Cria um novo projeto
   */
  createProject(data: CreateProjectData): Promise<Project>

  /**
   * Cria um projeto já ativo com contexto inicial de onboarding do assistente
   */
  createActivatedProject(data: { name: string; segment: string }): Promise<Project>

  /**
   * Atualiza um projeto existente
   */
  updateProject(id: string, data: UpdateProjectData): Promise<Project>

  /**
   * Deleta um projeto
   */
  deleteProject(id: string): Promise<void>

  /**
   * Testa conexão do WhatsApp
   */
  testWhatsAppConnection(id: string): Promise<boolean>
}

/**
 * Implementação real do serviço de projetos usando API
 */
class RealProjectsService implements ProjectsService {
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      // Passar filtros para a API (companyId não é necessário, RLS filtra automaticamente)
      const projects = await projectsApiService.getUserProjects('', filters)
      return projects
    } catch (error) {
      console.error('[RealProjectsService] ❌ Error fetching projects:', error)
      throw error
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const project = await projectsApiService.getProjectById(id)
      return project
    } catch (error) {
      console.error('[RealProjectsService] Error fetching project:', error)
      return null
    }
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      // Obter dados do contexto (empresa atual e usuário)
      const { useCompaniesStore } = await import('@/stores/companies')
      const { useAuthStore } = await import('@/stores/auth')
      
      const companiesStore = useCompaniesStore()
      const authStore = useAuthStore()
      
      if (!companiesStore.currentCompanyId || !authStore.user) {
        throw new Error('Empresa ou usuário não encontrado')
      }
      
      // Mapear CreateProjectData para CreateProjectDTO
      const projectDTO = {
        company_id: companiesStore.currentCompanyId,
        name: data.name,
        description: '',
        company_type: 'individual' as const,
        franchise_count: 1,
        country: 'BR',
        language: 'pt',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        attribution_model: 'last_touch' as const,
        created_by: authStore.user.id
      }
      
      const project = await projectsApiService.createProject(projectDTO)
      return project
    } catch (error) {
      console.error('[RealProjectsService] Error creating project:', error)
      throw error
    }
  }

  async createActivatedProject(data: { name: string; segment: string }): Promise<Project> {
    try {
      const { useCompaniesStore } = await import('@/stores/companies')
      const { useAuthStore } = await import('@/stores/auth')

      const companiesStore = useCompaniesStore()
      const authStore = useAuthStore()

      if (!companiesStore.currentCompanyId || !authStore.user) {
        throw new Error('Empresa ou usuário não encontrado')
      }

      const wizardProgress = {
        current_step: 1,
        data: {
          name: data.name,
          segment: data.segment,
          platforms: {
            metaAds: false,
            googleAds: false,
          },
          metaCampaignType: '',
          trackableLinks: [],
        },
        last_saved_at: new Date().toISOString(),
      }

      const projectDTO = {
        company_id: companiesStore.currentCompanyId,
        name: data.name,
        description: '',
        company_type: 'individual' as const,
        franchise_count: 1,
        country: 'BR',
        language: 'pt',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        attribution_model: 'last_touch' as const,
        created_by: authStore.user.id,
        status: 'active' as const,
        wizard_progress: wizardProgress,
        wizard_current_step: 1,
      }

      return await projectsApiService.createProject(projectDTO)
    } catch (error) {
      console.error('[RealProjectsService] Error creating activated project:', error)
      throw error
    }
  }

  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    try {
      const project = await projectsApiService.updateProject(id, data)
      return project
    } catch (error) {
      console.error('[RealProjectsService] Error updating project:', error)
      throw error
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await projectsApiService.deleteProject(id)
    } catch (error) {
      console.error('[RealProjectsService] Error deleting project:', error)
      throw error
    }
  }

  async testWhatsAppConnection(id: string): Promise<boolean> {
    try {
      const result = await whatsappIntegrationService.checkConnectionStatus(id)
      if (result.success) {
        return result.data.status === 'connected'
      }
      return false
    } catch {
      return false
    }
  }
}

/**
 * Factory para criar instância do serviço de projetos
 */
export function createProjectsService(): ProjectsService {
  // ✅ Migrado para API real - sempre usar RealProjectsService
  return new RealProjectsService()
}

/**
 * Instância global do serviço (singleton)
 */
export const projectsService = createProjectsService()
