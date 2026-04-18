/**
 * Testes unitários para projectWizardAdapter
 */

import { describe, it, expect } from 'vitest'
import { projectWizardAdapter, validateWizardData, sanitizeProjectData } from '../projectWizardAdapter'
import type { ProjectData } from '@/stores/projectWizard'
import type { Project } from '@/types/project'

describe('projectWizardAdapter', () => {
  const mockProjectData: ProjectData = {
    name: 'Meu Projeto',
    segment: 'E-commerce',
    platforms: {
      metaAds: true,
      googleAds: false
    },
    metaCampaignType: 'traffic',
    metaAds: {
      connected: true,
      accountId: '123456',
      pixelId: '789012'
    },
    trackableLinks: [
      {
        id: '1',
        name: 'Link Principal',
        url: 'https://example.com',
        message: 'Olá!'
      }
    ],
    whatsapp: {
      connected: true,
      phoneNumber: '+5511999999999'
    }
  }

  const mockProject: Project = {
    id: 'project-123',
    company_id: 'company-123',
    created_by: 'user-123',
    name: 'Meu Projeto',
    company_type: 'individual',
    country: 'BR',
    language: 'pt',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    attribution_model: 'first_touch',
    whatsapp_connected: true,
    meta_ads_connected: true,
    google_ads_connected: false,
    tiktok_ads_connected: false,
    status: 'draft',
    wizard_progress: {
      current_step: 3,
      data: mockProjectData as unknown as Record<string, unknown>,
      last_saved_at: '2025-01-27T10:00:00Z'
    },
    wizard_current_step: 3,
    wizard_completed_at: null,
    created_at: '2025-01-27T10:00:00Z',
    updated_at: '2025-01-27T10:00:00Z'
  }

  describe('toDatabase', () => {
    it('deve converter ProjectData para formato do banco', () => {
      const result = projectWizardAdapter.toDatabase(mockProjectData)

      expect(result).toEqual({
        name: 'Meu Projeto',
        segment: 'E-commerce',
        platforms: {
          metaAds: true,
          googleAds: false
        },
        metaCampaignType: 'traffic',
        metaAds: {
          connected: true,
          accountId: '123456',
          pixelId: '789012'
        },
        trackableLinks: [
          {
            id: '1',
            name: 'Link Principal',
            url: 'https://example.com',
            message: 'Olá!'
          }
        ],
        whatsapp: {
          connected: true,
          phoneNumber: '+5511999999999'
        }
      })
    })
  })

  describe('fromDatabase', () => {
    it('deve converter dados do banco para ProjectData', () => {
      const result = projectWizardAdapter.fromDatabase(mockProject as any)

      expect(result).toEqual(mockProjectData)
    })

    it('deve retornar null se não houver wizard_progress', () => {
      const projectWithoutWizard = { ...mockProject, wizard_progress: null }
      const result = projectWizardAdapter.fromDatabase(projectWithoutWizard as any)

      expect(result).toBeNull()
    })

    it('deve retornar dados mínimos quando wizard_progress.data é null', () => {
      const projectWithNullData = {
        ...mockProject,
        wizard_progress: {
          current_step: 2,
          data: null,
          last_saved_at: '2025-01-27T10:00:00Z'
        }
      }
      const result = projectWizardAdapter.fromDatabase(projectWithNullData as any)

      expect(result).not.toBeNull()
      expect(result?.name).toBe(mockProject.name)
      expect(result?.segment).toBe('')
      expect(result?.platforms).toEqual({ metaAds: false, googleAds: false })
      expect(result?.trackableLinks).toEqual([])
    })

    it('deve retornar dados mínimos quando wizard_progress.data é undefined', () => {
      const projectWithUndefinedData = {
        ...mockProject,
        wizard_progress: {
          current_step: 2,
          data: undefined,
          last_saved_at: '2025-01-27T10:00:00Z'
        }
      }
      const result = projectWizardAdapter.fromDatabase(projectWithUndefinedData as any)

      expect(result).not.toBeNull()
      expect(result?.name).toBe(mockProject.name)
      expect(result?.segment).toBe('')
      expect(result?.platforms).toEqual({ metaAds: false, googleAds: false })
      expect(result?.trackableLinks).toEqual([])
    })

    it('deve parsear wizard_progress quando for string JSON', () => {
      const wizardProgressString = JSON.stringify({
        current_step: 3,
        data: mockProjectData,
        last_saved_at: '2025-01-27T10:00:00Z'
      })
      const projectWithStringProgress = {
        ...mockProject,
        wizard_progress: wizardProgressString
      }
      const result = projectWizardAdapter.fromDatabase(projectWithStringProgress as any)

      expect(result).not.toBeNull()
      expect(result?.name).toBe(mockProjectData.name)
      expect(result?.segment).toBe(mockProjectData.segment)
    })

    it('deve retornar null quando wizard_progress for string JSON inválida', () => {
      const projectWithInvalidJson = {
        ...mockProject,
        wizard_progress: '{ invalid json }'
      }
      const result = projectWizardAdapter.fromDatabase(projectWithInvalidJson as any)

      expect(result).toBeNull()
    })

    it('deve usar project.name como fallback quando data.name não existe', () => {
      const projectWithoutDataName = {
        ...mockProject,
        wizard_progress: {
          current_step: 2,
          data: {
            segment: 'E-commerce',
            platforms: { metaAds: false, googleAds: false },
            metaCampaignType: '',
            trackableLinks: []
          },
          last_saved_at: '2025-01-27T10:00:00Z'
        }
      }
      const result = projectWizardAdapter.fromDatabase(projectWithoutDataName as any)

      expect(result).not.toBeNull()
      expect(result?.name).toBe(mockProject.name)
      expect(result?.segment).toBe('E-commerce')
    })

    it('deve usar "Novo Projeto" como fallback quando nem data.name nem project.name existem', () => {
      const projectWithoutName = {
        ...mockProject,
        name: '',
        wizard_progress: {
          current_step: 2,
          data: {
            segment: 'E-commerce',
            platforms: { metaAds: false, googleAds: false },
            metaCampaignType: '',
            trackableLinks: []
          },
          last_saved_at: '2025-01-27T10:00:00Z'
        }
      }
      const result = projectWizardAdapter.fromDatabase(projectWithoutName as any)

      expect(result).not.toBeNull()
      expect(result?.name).toBe('Novo Projeto')
    })
  })

  describe('createWizardProgress', () => {
    it('deve criar objeto WizardProgress válido', () => {
      const result = projectWizardAdapter.createWizardProgress(2, mockProjectData)

      expect(result).toEqual({
        current_step: 2,
        data: mockProjectData,
        last_saved_at: expect.any(String)
      })
    })
  })

  describe('getCurrentStep', () => {
    it('deve retornar step atual do projeto', () => {
      const result = projectWizardAdapter.getCurrentStep(mockProject as any)
      expect(result).toBe(3)
    })

    it('deve retornar 1 se wizard_current_step for undefined', () => {
      const projectWithoutStep = { ...mockProject, wizard_current_step: undefined }
      const result = projectWizardAdapter.getCurrentStep(projectWithoutStep as any)
      expect(result).toBe(1)
    })
  })

  describe('hasWizardProgress', () => {
    it('deve retornar true para projeto draft com wizard_progress', () => {
      const result = projectWizardAdapter.hasWizardProgress(mockProject as any)
      expect(result).toBe(true)
    })

    it('deve retornar false para projeto sem wizard_progress', () => {
      const projectWithoutWizard = { ...mockProject, wizard_progress: null }
      const result = projectWizardAdapter.hasWizardProgress(projectWithoutWizard as any)
      expect(result).toBe(false)
    })

    it('deve retornar false para projeto não draft', () => {
      const activeProject = { ...mockProject, status: 'active' }
      const result = projectWizardAdapter.hasWizardProgress(activeProject as any)
      expect(result).toBe(false)
    })
  })

  describe('canActivateProject', () => {
    it('deve retornar true para dados completos', () => {
      const result = projectWizardAdapter.canActivateProject(mockProjectData)
      expect(result).toBe(true)
    })

    it('deve retornar false para dados incompletos', () => {
      const incompleteData = {
        ...mockProjectData,
        name: '',
        platforms: { metaAds: false, googleAds: false }
      }
      const result = projectWizardAdapter.canActivateProject(incompleteData)
      expect(result).toBe(false)
    })
  })
})

describe('validateWizardData', () => {
  it('deve validar dados corretos', () => {
    const validData: ProjectData = {
      name: 'Projeto Teste',
      segment: 'E-commerce',
      platforms: { metaAds: true, googleAds: false },
      metaCampaignType: 'traffic',
      trackableLinks: []
    }

    const result = validateWizardData(validData)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('deve retornar erros para dados inválidos', () => {
    const invalidData: ProjectData = {
      name: '',
      segment: '',
      platforms: { metaAds: false, googleAds: false },
      metaCampaignType: '',
      trackableLinks: []
    }

    const result = validateWizardData(invalidData)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Nome do projeto é obrigatório')
    expect(result.errors).toContain('Segmento é obrigatório')
    expect(result.errors).toContain('Pelo menos uma plataforma deve ser selecionada')
  })
})

describe('sanitizeProjectData', () => {
  it('deve sanitizar dados corretamente', () => {
    const dirtyData: ProjectData = {
      name: '  Projeto Teste  ',
      segment: 'E-commerce',
      platforms: { metaAds: true, googleAds: false },
      metaCampaignType: 'traffic',
      trackableLinks: [],
      metaAds: {
        connected: true,
        accountId: '123',
        pixelId: '456'
      }
    }

    const result = sanitizeProjectData(dirtyData)
    expect(result.name).toBe('Projeto Teste')
    expect(result.platforms.metaAds).toBe(true)
    expect(result.metaAds?.connected).toBe(true)
  })
})
