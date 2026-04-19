/**
 * Testes unitários para CompanyService
 * 
 * Testa lógica de negócio e integração com cache e error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CompanyService } from './CompanyService'
import type { ICompanyRepository, ICacheService, IErrorHandler } from './interfaces'
import type { Company, CreateCompanyDTO, UpdateCompanyDTO } from '@/types'

// Mock data
const mockCompany: Company = {
  id: 'company-1',
  name: 'Test Company',
  description: 'Test Description',
  country: 'BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  industry: null,
  size: null,
  website: 'https://test.com',
  logo_url: 'https://test.com/logo.png',
  is_active: true,
  created_at: '2025-01-27T00:00:00Z',
  updated_at: '2025-01-27T00:00:00Z'
}

const mockCreateData: CreateCompanyDTO = {
  name: 'New Company',
  description: 'New Description',
  website: 'https://new.com',
  country: 'BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo'
}

const mockUpdateData: UpdateCompanyDTO = {
  name: 'Updated Company',
  description: 'Updated Description'
}

describe('CompanyService', () => {
  let companyService: CompanyService
  let mockRepository: ICompanyRepository
  let mockCache: ICacheService
  let mockErrorHandler: IErrorHandler

  beforeEach(() => {
    // Criar mocks
    mockRepository = {
      findById: vi.fn(),
      findUserCompanies: vi.fn(),
      verifyAccess: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as any

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      invalidate: vi.fn(),
      invalidatePattern: vi.fn(),
      clear: vi.fn()
    } as any

    mockErrorHandler = {
      handle: vi.fn()
    } as any

    // Instanciar service
    companyService = new CompanyService(
      mockRepository,
      mockCache,
      mockErrorHandler
    )
  })

  describe('loadCompany', () => {
    it('should return cached company if available', async () => {
      // Arrange
      const companyId = 'company-1'
      vi.mocked(mockCache.get).mockReturnValue(mockCompany)

      // Act
      const result = await companyService.loadCompany(companyId)

      // Assert
      expect(result).toEqual(mockCompany)
      expect(mockCache.get).toHaveBeenCalledWith('company:company-1')
      expect(mockRepository.findById).not.toHaveBeenCalled()
    })

    it('should fetch from API and cache result if not cached', async () => {
      // Arrange
      const companyId = 'company-1'
      vi.mocked(mockCache.get).mockReturnValue(null)
      vi.mocked(mockRepository.findById).mockResolvedValue(mockCompany)

      // Act
      const result = await companyService.loadCompany(companyId)

      // Assert
      expect(result).toEqual(mockCompany)
      expect(mockRepository.findById).toHaveBeenCalledWith(companyId)
      expect(mockCache.set).toHaveBeenCalledWith(
        'company:company-1',
        mockCompany,
        300000 // 5 minutos
      )
    })

    it('should throw error if company not found', async () => {
      // Arrange
      const companyId = 'company-1'
      vi.mocked(mockCache.get).mockReturnValue(null)
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      // Act & Assert
      await expect(companyService.loadCompany(companyId)).rejects.toThrow(
        'Company company-1 not found'
      )
      expect(mockErrorHandler.handle).toHaveBeenCalled()
    })

    it('should throw error if companyId is empty', async () => {
      // Act & Assert
      await expect(companyService.loadCompany('')).rejects.toThrow(
        'Company ID is required'
      )
    })

    it('should handle repository errors', async () => {
      // Arrange
      const companyId = 'company-1'
      const repositoryError: any = new Error('Repository error')
      vi.mocked(mockCache.get).mockReturnValue(null)
      vi.mocked(mockRepository.findById).mockRejectedValue(repositoryError)

      // Act & Assert
      await expect(companyService.loadCompany(companyId)).rejects.toThrow(repositoryError)
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        repositoryError,
        'Failed to load company company-1'
      )
    })
  })

  describe('verifyUserAccess', () => {
    it('should return true if user has access', async () => {
      // Arrange
      const companyId = 'company-1'
      vi.mocked(mockRepository.verifyAccess).mockResolvedValue(undefined)

      // Act
      const result = await companyService.verifyUserAccess(companyId)

      // Assert
      expect(result).toBe(true)
      expect(mockRepository.verifyAccess).toHaveBeenCalledWith(companyId)
    })

    it('should return false if user does not have access', async () => {
      // Arrange
      const companyId = 'company-1'
      vi.mocked(mockRepository.verifyAccess).mockRejectedValue(new Error('Access denied'))

      // Act
      const result = await companyService.verifyUserAccess(companyId)

      // Assert
      expect(result).toBe(false)
    })

    it('should return false if companyId is empty', async () => {
      // Act
      const result = await companyService.verifyUserAccess('')

      // Assert
      expect(result).toBe(false)
      expect(mockRepository.verifyAccess).not.toHaveBeenCalled()
    })
  })

  describe('getUserCompanies', () => {
    it('should return cached companies if available', async () => {
      // Arrange
      const companies = [mockCompany]
      vi.mocked(mockCache.get).mockReturnValue(companies)

      // Act
      const result = await companyService.getUserCompanies()

      // Assert
      expect(result).toEqual(companies)
      expect(mockCache.get).toHaveBeenCalledWith('user:companies')
      expect(mockRepository.findUserCompanies).not.toHaveBeenCalled()
    })

    it('should fetch from API and cache result if not cached', async () => {
      // Arrange
      const companies = [mockCompany]
      vi.mocked(mockCache.get).mockReturnValue(null)
      vi.mocked(mockRepository.findUserCompanies).mockResolvedValue(companies)

      // Act
      const result = await companyService.getUserCompanies()

      // Assert
      expect(result).toEqual(companies)
      expect(mockRepository.findUserCompanies).toHaveBeenCalled()
      expect(mockCache.set).toHaveBeenCalledWith('user:companies', companies, 300000)
    })

    it('should handle repository errors', async () => {
      // Arrange
      const repositoryError: any = new Error('Repository error')
      vi.mocked(mockCache.get).mockReturnValue(null)
      vi.mocked(mockRepository.findUserCompanies).mockRejectedValue(repositoryError)

      // Act & Assert
      await expect(companyService.getUserCompanies()).rejects.toThrow(repositoryError)
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        repositoryError,
        'Failed to load user companies'
      )
    })
  })

  describe('createCompany', () => {
    it('should create company and invalidate cache', async () => {
      // Arrange
      vi.mocked(mockRepository.create).mockResolvedValue(mockCompany)

      // Act
      const result = await companyService.createCompany(mockCreateData)

      // Assert
      expect(result).toEqual(mockCompany)
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateData)
      expect(mockCache.invalidate).toHaveBeenCalledWith('user:companies')
    })

    it('should handle repository errors', async () => {
      // Arrange
      const repositoryError: any = new Error('Repository error')
      vi.mocked(mockRepository.create).mockRejectedValue(repositoryError)

      // Act & Assert
      await expect(companyService.createCompany(mockCreateData)).rejects.toThrow(repositoryError)
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        repositoryError,
        'Failed to create company'
      )
    })
  })

  describe('updateCompany', () => {
    it('should update company and invalidate cache', async () => {
      // Arrange
      const companyId = 'company-1'
      vi.mocked(mockRepository.update).mockResolvedValue(mockCompany)

      // Act
      const result = await companyService.updateCompany(companyId, mockUpdateData)

      // Assert
      expect(result).toEqual(mockCompany)
      expect(mockRepository.update).toHaveBeenCalledWith(companyId, mockUpdateData)
      expect(mockCache.invalidate).toHaveBeenCalledWith('company:company-1')
      expect(mockCache.invalidate).toHaveBeenCalledWith('user:companies')
    })

    it('should handle repository errors', async () => {
      // Arrange
      const companyId = 'company-1'
      const repositoryError: any = new Error('Repository error')
      vi.mocked(mockRepository.update).mockRejectedValue(repositoryError)

      // Act & Assert
      await expect(companyService.updateCompany(companyId, mockUpdateData)).rejects.toThrow(repositoryError)
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        repositoryError,
        'Failed to update company company-1'
      )
    })
  })

  describe('deleteCompany', () => {
    it('should delete company and invalidate cache', async () => {
      // Arrange
      const companyId = 'company-1'
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined)

      // Act
      await companyService.deleteCompany(companyId)

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith(companyId)
      expect(mockCache.invalidate).toHaveBeenCalledWith('company:company-1')
      expect(mockCache.invalidate).toHaveBeenCalledWith('user:companies')
    })

    it('should handle repository errors', async () => {
      // Arrange
      const companyId = 'company-1'
      const repositoryError: any = new Error('Repository error')
      vi.mocked(mockRepository.delete).mockRejectedValue(repositoryError)

      // Act & Assert
      await expect(companyService.deleteCompany(companyId)).rejects.toThrow(repositoryError)
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        repositoryError,
        'Failed to delete company company-1'
      )
    })
  })
})
