/**
 * Adapter para conversão entre ProjectData (store) e formato do banco de dados
 * 
 * Gerencia a serialização/deserialização dos dados do wizard entre
 * o formato usado na store e o formato armazenado no banco.
 */

import type { ProjectData } from '@/stores/projectWizard'
import type { Project } from '@/types/project'

// ============================================================================
// INTERFACES
// ============================================================================

export interface WizardProgressData {
  current_step: number
  data: ProjectData
  last_saved_at: string
}

export interface DatabaseProjectData {
  name: string
  segment: string
  platforms: {
    metaAds: boolean
    googleAds: boolean
  }
  metaCampaignType?: string
  metaAds?: {
    connected: boolean
    accountId?: string
    pixelId?: string
  }
  googleAds?: {
    connected: boolean
    accountId?: string
    events: Array<{
      id: string
      name: string
      defaultValue: number
      allowMultiplePurchases: boolean
    }>
  }
  trackableLinks?: Array<{
    id: string
    name: string
    url: string
    message: string
  }>
  whatsapp?: {
    connected: boolean
    phoneNumber?: string
    qrCode?: string
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Valida e converte metaCampaignType para o tipo correto
 */
function validateMetaCampaignType(
  value: unknown
): '' | 'messages' | 'traffic' | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  
  if (value === '' || value === 'messages' || value === 'traffic') {
    return value
  }
  
  return undefined
}

// ============================================================================
// ADAPTER PRINCIPAL
// ============================================================================

export const projectWizardAdapter = {
  /**
   * Converte ProjectData da store para formato do banco
   */
  toDatabase(data: ProjectData): DatabaseProjectData {
    return {
      name: data.name,
      segment: data.segment,
      platforms: data.platforms,
      metaCampaignType: data.metaCampaignType,
      metaAds: data.metaAds,
      googleAds: data.googleAds,
      trackableLinks: data.trackableLinks,
      whatsapp: data.whatsapp
    }
  },

  /**
   * Converte dados do banco para ProjectData da store
   */
  fromDatabase(project: Project): ProjectData | null {
    // Validar se wizard_progress existe
    if (!project.wizard_progress) {
      return null
    }

    // Parsear wizard_progress se for string JSON (caso venha serializado do banco)
    let wizardProgress: WizardProgressData | null = null
    if (typeof project.wizard_progress === 'string') {
      try {
        wizardProgress = JSON.parse(project.wizard_progress) as WizardProgressData
      } catch (error) {
        console.error('[ProjectWizardAdapter] Erro ao parsear wizard_progress JSON:', error)
        return null
      }
    } else if (typeof project.wizard_progress === 'object' && project.wizard_progress !== null) {
      // Converter WizardProgress (com data: Record<string, unknown>) para WizardProgressData
      const progress = project.wizard_progress as { current_step: number; data: Record<string, unknown>; last_saved_at: string }
      wizardProgress = {
        current_step: progress.current_step,
        data: progress.data as unknown as ProjectData,
        last_saved_at: progress.last_saved_at
      } as WizardProgressData
    }

    // Validar se wizard_progress parseado é válido
    if (!wizardProgress) {
      return null
    }

    // Validar se data existe e não é null/undefined
    const data = wizardProgress.data as DatabaseProjectData | null | undefined
    if (!data) {
      // Se não há data, retornar dados mínimos baseados no projeto
      return {
        name: project.name || 'Novo Projeto',
        segment: '',
        platforms: {
          metaAds: false,
          googleAds: false
        },
        metaCampaignType: '',
        trackableLinks: []
      }
    }

    // Construir ProjectData com fallbacks seguros
    return {
      name: data.name || project.name || 'Novo Projeto',
      segment: data.segment || '',
      platforms: data.platforms || { metaAds: false, googleAds: false },
      metaCampaignType: validateMetaCampaignType(data.metaCampaignType) ?? '',
      metaAds: data.metaAds,
      googleAds: data.googleAds,
      trackableLinks: data.trackableLinks || [],
      whatsapp: data.whatsapp
    }
  },

  /**
   * Cria objeto WizardProgress para salvar no banco
   */
  createWizardProgress(currentStep: number, projectData: ProjectData): WizardProgressData {
    return {
      current_step: currentStep,
      data: projectData,
      last_saved_at: new Date().toISOString()
    }
  },

  /**
   * Extrai step atual do projeto
   */
  getCurrentStep(project: Project): number {
    return project.wizard_current_step || 1
  },

  /**
   * Verifica se projeto tem wizard progress
   */
  hasWizardProgress(project: Project): boolean {
    return !!(project.wizard_progress && project.status === 'draft')
  },

  /**
   * Verifica se wizard foi completado
   */
  isWizardCompleted(project: Project): boolean {
    return !!(project.wizard_completed_at && !project.wizard_progress)
  },

  /**
   * Valida se ProjectData está completo para ativação
   */
  canActivateProject(projectData: ProjectData): boolean {
    return !!(
      projectData.name &&
      projectData.segment &&
      (projectData.platforms.metaAds || projectData.platforms.googleAds)
    )
  },

  /**
   * Cria dados mínimos para projeto draft
   */
  createMinimalProjectData(name: string = 'Novo Projeto'): ProjectData {
    return {
      name,
      segment: '',
      platforms: {
        metaAds: false,
        googleAds: false
      },
      metaCampaignType: '',
      trackableLinks: []
    }
  },

  /**
   * Cria estado inicial do assistente a partir dos dados atuais do projeto.
   * Útil para projetos ativos sem wizard_progress.
   */
  fromProjectSnapshot(project: Project): ProjectData {
    return {
      name: project.name || 'Novo Projeto',
      segment: '',
      platforms: {
        metaAds: Boolean(project.meta_ads_connected),
        googleAds: Boolean(project.google_ads_connected)
      },
      metaCampaignType: '',
      metaAds: project.meta_ads_connected
        ? {
            connected: true
          }
        : undefined,
      googleAds: project.google_ads_connected
        ? {
            connected: true,
            events: []
          }
        : undefined,
      trackableLinks: [],
      whatsapp: project.whatsapp_connected
        ? {
            connected: true
          }
        : undefined
    }
  }
}

// ============================================================================
// UTILITÁRIOS DE VALIDAÇÃO
// ============================================================================

/**
 * Valida se dados do wizard são válidos
 */
export function validateWizardData(data: ProjectData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name?.trim()) {
    errors.push('Nome do projeto é obrigatório')
  }

  if (!data.segment) {
    errors.push('Segmento é obrigatório')
  }

  if (!data.platforms.metaAds && !data.platforms.googleAds) {
    errors.push('Pelo menos uma plataforma deve ser selecionada')
  }

  if (data.platforms.metaAds && !data.metaCampaignType) {
    errors.push('Tipo de campanha Meta é obrigatório quando Meta Ads está selecionado')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitiza dados antes de salvar no banco
 */
export function sanitizeProjectData(data: ProjectData): ProjectData {
  return {
    ...data,
    name: data.name?.trim() || '',
    segment: data.segment || '',
    platforms: {
      metaAds: Boolean(data.platforms?.metaAds),
      googleAds: Boolean(data.platforms?.googleAds)
    },
    metaCampaignType: data.metaCampaignType || '',
    trackableLinks: data.trackableLinks || [],
    metaAds: data.metaAds ? {
      connected: Boolean(data.metaAds.connected),
      accountId: data.metaAds.accountId || undefined,
      pixelId: data.metaAds.pixelId || undefined
    } : undefined,
    googleAds: data.googleAds ? {
      connected: Boolean(data.googleAds.connected),
      accountId: data.googleAds.accountId || undefined,
      events: data.googleAds.events || []
    } : undefined,
    whatsapp: data.whatsapp ? {
      connected: Boolean(data.whatsapp.connected),
      phoneNumber: data.whatsapp.phoneNumber || undefined,
      qrCode: data.whatsapp.qrCode || undefined
    } : undefined
  }
}
