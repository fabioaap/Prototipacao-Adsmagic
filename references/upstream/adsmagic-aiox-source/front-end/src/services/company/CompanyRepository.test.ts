/**
 * Testes unitários para CompanyRepository
 * 
 * Testa integração com API e tratamento de erros HTTP
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CompanyRepository } from './CompanyRepository'
import type { Company, CreateCompanyDTO, UpdateCompanyDTO } from '@/types'

// Mock do apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

import { apiClient } from '@/services/api/client'

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

describe('CompanyRepository', () => {
  let companyRepository: CompanyRepository

  beforeEach(() => {
    companyRepository = new CompanyRepository()
    vi.clearAllMocks()
  })

  describe('findById', () => {
    it('should return company data when found', async () => {
      // Arrange
      const companyId = 'company-1'
      ;(apiClient.get as any).mockResolvedValue({
        data: { data: mockCompany }
      })

      // Act
      const result = await companyRepository.findById(companyId)

      // Assert
      expect(result).toEqual(mockCompany)
      expect(apiClient.get).toHaveBeenCalledWith('/companies/company-1')
    })

    it('should return null when company not found (404)', async () => {
      // Arrange
      const companyId = 'company-1'
      const error = { response: { status: 404 } } as any
      ;(apiClient.get as any).mockRejectedValue(error)

      // Act
      const result = await companyRepository.findById(companyId)

      // Assert
      expect(result).toBeNull()
    })

    it('should throw error for other HTTP errors', async () => {
      // Arrange
      const companyId = 'company-1'
      const serverError: any = new Error('Server error')
      serverError.response = { status: 500 }
      vi.mocked(apiClient.get).mockRejectedValue(serverError)

      // Act & Assert
      await expect(companyRepository.findById(companyId)).rejects.toThrow(serverError)
    })

    it('should return null when response data is empty', async () => {
      // Arrange
      const companyId = 'company-1'
      ;(apiClient.get as any).mockResolvedValue({
        data: { data: null }
      })

      // Act
      const result = await companyRepository.findById(companyId)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('findUserCompanies', () => {
    it('should return array of companies', async () => {
      // Arrange
      const companies: Company[] = [mockCompany]
      ;(apiClient.get as any).mockResolvedValue({
        data: { data: companies }
      })

      // Act
      const result = await companyRepository.findUserCompanies()

      // Assert
      expect(result).toEqual(companies)
      expect((apiClient as any).get).toHaveBeenCalledWith('/companies')
    })

    it('should return empty array when no companies', async () => {
      // Arrange
      ;(apiClient.get as any).mockResolvedValue({
        data: { data: [] }
      })

      // Act
      const result = await companyRepository.findUserCompanies()

      // Assert
      expect(result).toEqual([])
    })

    it('should return empty array when response data is null', async () => {
      // Arrange
      ;(apiClient.get as any).mockResolvedValue({
        data: { data: null }
      })

      // Act
      const result = await companyRepository.findUserCompanies()

      // Assert
      expect(result).toEqual([])
    })

    it('should throw error for API failures', async () => {
      // Arrange
      const error: any = new Error('API Error')
      ;(apiClient.get as any).mockRejectedValue(error)

      // Act & Assert
      await expect(companyRepository.findUserCompanies()).rejects.toThrow(error)
    })
  })

  describe('verifyAccess', () => {
    it('should resolve when access is granted', async () => {
      // Arrange
      const companyId = 'company-1'
      ;(apiClient.get as any).mockResolvedValue({ data: {} })

      // Act
      await companyRepository.verifyAccess(companyId)

      // Assert
      expect((apiClient as any).get).toHaveBeenCalledWith('/companies/company-1/access')
    })

    it('should throw error when access is denied (403)', async () => {
      // Arrange
      const companyId = 'company-1'
      const accessError: any = { response: { status: 403 } }
      vi.mocked(apiClient.get).mockRejectedValue(accessError)

      // Act & Assert
      await expect(companyRepository.verifyAccess(companyId)).rejects.toThrow(
        'Access denied'
      )
    })

    it('should throw error for other HTTP errors', async () => {
      // Arrange
      const companyId = 'company-1'
      const serverError: any = new Error('Server error')
      serverError.response = { status: 500 }
      vi.mocked(apiClient.get).mockRejectedValue(serverError)

      // Act & Assert
      await expect(companyRepository.verifyAccess(companyId)).rejects.toThrow(serverError)
    })
  })

  describe('create', () => {
    it('should create company and return created data', async () => {
      // Arrange
      ;(apiClient.post as any).mockResolvedValue({
        data: { data: mockCompany }
      })

      // Act
      const result = await companyRepository.create(mockCreateData)

      // Assert
      expect(result).toEqual(mockCompany)
      expect((apiClient as any).post).toHaveBeenCalledWith('/companies', mockCreateData)
    })

    it('should throw error for API failures', async () => {
      // Arrange
      const error: any = new Error('API Error')
      ;(apiClient.post as any).mockRejectedValue(error)

      // Act & Assert
      await expect(companyRepository.create(mockCreateData)).rejects.toThrow(error)
    })
  })

  describe('update', () => {
    it('should update company and return updated data', async () => {
      // Arrange
      const companyId = 'company-1'
      ;(apiClient.put as any).mockResolvedValue({
        data: { data: mockCompany }
      })

      // Act
      const result = await companyRepository.update(companyId, mockUpdateData)

      // Assert
      expect(result).toEqual(mockCompany)
      expect((apiClient as any).put).toHaveBeenCalledWith('/companies/company-1', mockUpdateData)
    })

    it('should throw error for API failures', async () => {
      // Arrange
      const companyId = 'company-1'
      const error: any = new Error('API Error')
      ;(apiClient.put as any).mockRejectedValue(error)

      // Act & Assert
      await expect(companyRepository.update(companyId, mockUpdateData)).rejects.toThrow(error)
    })
  })

  describe('delete', () => {
    it('should delete company successfully', async () => {
      // Arrange
      const companyId = 'company-1'
      ;(apiClient.delete as any).mockResolvedValue({ data: {} })

      // Act
      await companyRepository.delete(companyId)

      // Assert
      expect((apiClient as any).delete).toHaveBeenCalledWith('/companies/company-1')
    })

    it('should throw error for API failures', async () => {
      // Arrange
      const companyId = 'company-1'
      const error: any = new Error('API Error')
      ;(apiClient.delete as any).mockRejectedValue(error)

      // Act & Assert
      await expect(companyRepository.delete(companyId)).rejects.toThrow(error)
    })
  })
})
