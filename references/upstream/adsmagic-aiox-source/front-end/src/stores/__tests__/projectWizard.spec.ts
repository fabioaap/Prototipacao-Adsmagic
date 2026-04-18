/**
 * Testes unitários para projectWizard store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectWizardStore } from '../projectWizard'
import type { ProjectData } from '../projectWizard'

// Mock dos services
vi.mock('@/services/api/projectWizardService', () => ({
  projectWizardService: {
    saveProgress: vi.fn(),
    loadProgress: vi.fn(),
    completeWizard: vi.fn()
  }
}))

vi.mock('@/services/adapters/projectWizardAdapter', () => ({
  projectWizardAdapter: {
    fromDatabase: vi.fn()
  }
}))

vi.mock('@/stores/companies', () => ({
  useCompaniesStore: () => ({
    currentCompanyId: 'company-123'
  })
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 'user-123' }
  })
}))

describe('projectWizard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('deve ter estado inicial correto', () => {
      const store = useProjectWizardStore()

      expect(store.currentStep).toBe(1)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.currentProjectId).toBeNull()
      expect(store.isSyncing).toBe(false)
      expect(store.projectData.name).toBe('')
      expect(store.projectData.segment).toBe('')
    })
  })

  describe('updateProjectData', () => {
    it('deve atualizar dados do projeto', () => {
      const store = useProjectWizardStore()
      const newData: Partial<ProjectData> = {
        name: 'Novo Projeto',
        segment: 'E-commerce'
      }

      store.updateProjectData(newData)

      expect(store.projectData.name).toBe('Novo Projeto')
      expect(store.projectData.segment).toBe('E-commerce')
    })
  })

  describe('navegação entre steps', () => {
    it('deve avançar para próximo step', () => {
      const store = useProjectWizardStore()
      
      // Configurar dados válidos para step 1
      store.updateProjectData({
        name: 'Projeto Teste',
        segment: 'E-commerce'
      })

      store.nextStep()
      expect(store.currentStep).toBe(2)
    })

    it('deve voltar para step anterior', () => {
      const store = useProjectWizardStore()
      
      // Avançar para step 2
      store.updateProjectData({
        name: 'Projeto Teste',
        segment: 'E-commerce'
      })
      store.nextStep()

      // Voltar
      store.previousStep()
      expect(store.currentStep).toBe(1)
    })
  })

  describe('validações', () => {
    it('deve validar se pode avançar', () => {
      const store = useProjectWizardStore()

      // Dados incompletos - não pode avançar
      expect(store.canProceed).toBe(false)

      // Dados completos - pode avançar
      store.updateProjectData({
        name: 'Projeto Teste',
        segment: 'E-commerce'
      })
      expect(store.canProceed).toBe(true)
    })

    it('deve validar se pode voltar', () => {
      const store = useProjectWizardStore()

      // Step 1 - não pode voltar
      expect(store.canGoBack).toBe(false)

      // Avançar para step 2
      store.updateProjectData({
        name: 'Projeto Teste',
        segment: 'E-commerce'
      })
      store.nextStep()

      // Agora pode voltar
      expect(store.canGoBack).toBe(true)
    })
  })

  describe('steps dinâmicos', () => {
    it('deve mostrar step de tipo de campanha Meta quando Meta Ads está selecionado', () => {
      const store = useProjectWizardStore()
      
      store.updateProjectData({
        name: 'Projeto Teste',
        segment: 'E-commerce',
        platforms: {
          metaAds: true,
          googleAds: false
        }
      })

      expect(store.shouldShowMetaCampaignType).toBe(true)
    })

    it('deve mostrar step de links rastreáveis quando Google Ads está selecionado', () => {
      const store = useProjectWizardStore()
      
      store.updateProjectData({
        name: 'Projeto Teste',
        segment: 'E-commerce',
        platforms: {
          metaAds: false,
          googleAds: true
        }
      })

      expect(store.shouldShowTrackableLinks).toBe(true)
    })
  })

  describe('reset', () => {
    it('deve resetar wizard para estado inicial', () => {
      const store = useProjectWizardStore()
      
      // Modificar estado
      store.updateProjectData({
        name: 'Projeto Teste',
        segment: 'E-commerce'
      })
      store.goToStep(2)

      // Resetar
      store.reset()

      expect(store.currentStep).toBe(1)
      expect(store.currentProjectId).toBeNull()
      expect(store.projectData.name).toBe('')
      expect(store.projectData.segment).toBe('')
      expect(store.error).toBeNull()
    })
  })

  describe('gerenciamento de erros', () => {
    it('deve definir e limpar erros', () => {
      const store = useProjectWizardStore()

      store.setError('Erro de teste')
      expect(store.error).toBe('Erro de teste')

      store.clearError()
      expect(store.error).toBeNull()
    })
  })

  describe('reset', () => {
    it('deve resetar store para estado inicial', () => {
      const store = useProjectWizardStore()

      // Modificar estado
      store.updateProjectData({
        name: 'Projeto Teste',
        segment: 'E-commerce'
      })
      store.nextStep()
      store.setError('Erro')

      // Resetar
      store.reset()

      expect(store.currentStep).toBe(1)
      expect(store.projectData.name).toBe('')
      expect(store.error).toBeNull()
    })
  })
})
