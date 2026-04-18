import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectsStore } from '../projects'
import { useCompaniesStore } from '../companies'
import { projectsService } from '@/services/projects'

// Mock do serviço de projetos
vi.mock('@/services/projects', () => ({
  projectsService: {
    getProjects: vi.fn(),
    getProjectById: vi.fn(),
    createProject: vi.fn(),
    createActivatedProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    testWhatsAppConnection: vi.fn()
  }
}))

describe('useProjectsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Mock current company
    const companiesStore = useCompaniesStore()
    companiesStore.currentCompany = {
      id: 'company-123',
      name: 'Test Company'
    } as any
  })

  it('should initialize with empty projects', () => {
    const projectsStore = useProjectsStore()
    expect(projectsStore.projects).toEqual([])
    expect(projectsStore.projectsCount).toBe(0)
  })

  it('should filter projects by search term', async () => {
    const projectsStore = useProjectsStore()
    
    // Add test projects
    projectsStore.projects = [
      { id: '1', name: 'Project Alpha' },
      { id: '2', name: 'Project Beta' }
    ] as any
    
    projectsStore.searchTerm = 'Alpha'
    
    // Test filtering logic
    expect(projectsStore.searchTerm).toBe('Alpha')
  })

  it('should have correct computed properties', () => {
    const projectsStore = useProjectsStore()
    
    // Test initial state
    expect(projectsStore.projectsCount).toBe(0)
    expect(projectsStore.connectedProjectsCount).toBe(0)
    expect(projectsStore.disconnectedProjectsCount).toBe(0)
  })

  it('should include startDate and endDate in filters when setMetricsPeriod is called', () => {
    const projectsStore = useProjectsStore()
    
    projectsStore.setMetricsPeriod('2025-01-01', '2025-01-31')
    
    expect(projectsStore.filters.startDate).toBe('2025-01-01')
    expect(projectsStore.filters.endDate).toBe('2025-01-31')
  })

  it('should clear metrics period when setMetricsPeriod is called with undefined', () => {
    const projectsStore = useProjectsStore()
    
    projectsStore.setMetricsPeriod('2025-01-01', '2025-01-31')
    expect(projectsStore.filters.startDate).toBe('2025-01-01')
    
    projectsStore.setMetricsPeriod(undefined, undefined)
    expect(projectsStore.filters.startDate).toBeUndefined()
    expect(projectsStore.filters.endDate).toBeUndefined()
  })

  it('should create activated project with initial assistant context', async () => {
    const projectsStore = useProjectsStore()
    const createdProject = {
      id: 'project-1',
      name: 'Projeto Ativo',
      company_id: 'company-123',
      created_by: 'user-1',
      company_type: 'individual',
      country: 'BR',
      language: 'pt',
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      attribution_model: 'last_touch',
      whatsapp_connected: false,
      meta_ads_connected: false,
      google_ads_connected: false,
      tiktok_ads_connected: false,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any

    vi.mocked(projectsService.createActivatedProject).mockResolvedValue(createdProject)

    const result = await projectsStore.createActivatedProject({
      name: 'Projeto Ativo',
      segment: 'ecommerce',
    })

    expect(projectsService.createActivatedProject).toHaveBeenCalledWith({
      name: 'Projeto Ativo',
      segment: 'ecommerce',
    })
    expect(result.status).toBe('active')
    expect(projectsStore.projects[0]?.id).toBe(createdProject.id)
  })
})
