import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCompaniesStore } from '../companies'
import { useAuthStore } from '../auth'

// Mock dos serviços
vi.mock('@/services/api/companiesService', () => ({
  companiesService: {
    getUserCompanies: vi.fn(),
    createCompany: vi.fn(),
    updateCompany: vi.fn(),
    deleteCompany: vi.fn(),
    getCompanyById: vi.fn().mockResolvedValue(null)
  }
}))

vi.mock('@/services/api/settingsService', () => ({
  settingsService: {
    getCompanySettings: vi.fn(),
    updateCompanySettings: vi.fn()
  }
}))

describe('useCompaniesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Mock authenticated user
    const authStore = useAuthStore()
    authStore.user = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User'
    } as any
  })

  it('should initialize with empty companies', () => {
    const companiesStore = useCompaniesStore()
    expect(companiesStore.companies).toEqual([])
    expect(companiesStore.hasCompanies).toBe(false)
  })

  it('should set current company', async () => {
    const companiesStore = useCompaniesStore()
    
    const mockCompany = {
      id: 'company-123',
      name: 'Test Company',
      industry: 'tech'
    }
    
    await companiesStore.setCurrentCompany(mockCompany as any)
    
    expect(companiesStore.currentCompany).toEqual(mockCompany)
    expect(companiesStore.currentCompanyId).toBe('company-123')
  })

  it('should have correct getters', () => {
    const companiesStore = useCompaniesStore()
    
    // Test initial state
    expect(companiesStore.userCompanies).toEqual([])
    expect(companiesStore.hasCompanies).toBe(false)
    expect(companiesStore.currentCompanyId).toBeNull()
  })
})
