/**
 * Service para operações de progresso do assistente de projetos
 * 
 * Gerencia salvamento, carregamento e conclusão do wizard de criação de projetos
 * usando apiClient como camada única de rede.
 */

import { apiClient, getApiErrorMessage } from './client'
import type { ProjectData } from '@/stores/projectWizard'
import type { Project } from '@/types/project'

// ============================================================================
// INTERFACES
// ============================================================================

export interface SaveProgressData {
  projectId?: string
  companyId: string
  userId: string
  currentStep: number
  projectData: ProjectData
}

export interface WizardProgress {
  current_step: number
  data: ProjectData
  last_saved_at: string
}

// ============================================================================
// SERVICE PRINCIPAL
// ============================================================================

export const projectWizardService = {
  /**
   * Salva progresso do wizard (cria projeto draft se não existir)
   */
  async saveProgress(data: SaveProgressData): Promise<Project> {

    const wizardProgress: WizardProgress = {
      current_step: data.currentStep,
      data: data.projectData,
      last_saved_at: new Date().toISOString()
    }

    try {
      if (data.projectId) {
        // Atualizar projeto existente
        const response = await apiClient.patch(`/projects/${data.projectId}`, {
          wizard_progress: wizardProgress,
          wizard_current_step: data.currentStep,
          updated_at: new Date().toISOString()
        })

        return response.data
      } else {
        // Criar novo projeto draft
        const response = await apiClient.post('/projects', {
          company_id: data.companyId,
          created_by: data.userId,
          name: data.projectData.name || 'Novo Projeto',
          description: '', // Campo obrigatório para o schema
          status: 'draft',
          wizard_progress: wizardProgress,
          wizard_current_step: data.currentStep,
          // Campos obrigatórios com defaults
          company_type: 'individual',
          franchise_count: 1,
          country: 'BR',
          language: 'pt',
          currency: 'BRL',
          timezone: 'America/Sao_Paulo',
          attribution_model: 'first_touch',
          whatsapp_connected: false,
          meta_ads_connected: false,
          google_ads_connected: false,
          tiktok_ads_connected: false
        })

        return response.data
      }
    } catch (error) {
      console.error('[ProjectWizardService] Erro na API:', error)
      const errorMessage = getApiErrorMessage(error)
      throw new Error(errorMessage)
    }
  },

  /**
   * Carrega progresso do wizard
   */
  async loadProgress(projectId: string): Promise<Project> {
    try {
      const response = await apiClient.get(`/projects/${projectId}`)
      return response.data
    } catch (error) {
      console.error('[ProjectWizardService] Erro ao carregar progresso:', error)
      const errorMessage = getApiErrorMessage(error)
      throw new Error(errorMessage)
    }
  },

  /**
   * Completa o wizard e ativa o projeto
   */
  async completeWizard(projectId: string): Promise<Project> {
    try {
      const response = await apiClient.patch(`/projects/${projectId}/complete`, {
        status: 'active',
        wizard_completed_at: new Date().toISOString(),
        wizard_progress: null,
        wizard_current_step: null
      })
      // Backend retorna projeto diretamente (pode estar em response.data ou response.data.data)
      const project = response.data?.data || response.data
      if (!project) {
        throw new Error('Resposta da API não contém dados do projeto')
      }
      return project
    } catch (error) {
      console.error('[ProjectWizardService] Erro ao completar wizard:', error)
      const errorMessage = getApiErrorMessage(error)
      throw new Error(errorMessage)
    }
  },

  /**
   * Lista projetos do usuário
   */
  async listProjects(): Promise<Project[]> {
    try {
      const response = await apiClient.get('/projects')
      return response.data
    } catch (error) {
      console.error('[ProjectWizardService] Erro ao listar projetos:', error)
      const errorMessage = getApiErrorMessage(error)
      throw new Error(errorMessage)
    }
  },

  /**
   * Deleta um projeto draft
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      await apiClient.delete(`/projects/${projectId}`)
    } catch (error) {
      console.error('[ProjectWizardService] Erro ao deletar projeto:', error)
      const errorMessage = getApiErrorMessage(error)
      throw new Error(errorMessage)
    }
  }
}