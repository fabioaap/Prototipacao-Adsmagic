/**
 * Company Repository
 * 
 * Implementa acesso a dados para operações de empresas
 * Segue princípios SOLID (SRP - Single Responsibility Principle)
 */

import { apiClient } from '@/services/api/client'
import type { Company, CreateCompanyDTO, UpdateCompanyDTO } from '@/types'
import type { ICompanyRepository } from './interfaces'

export class CompanyRepository implements ICompanyRepository {
  private readonly baseUrl = '/companies'

  async findById(id: string): Promise<Company | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`)
      return response.data.data || null
    } catch (error: unknown) {
      const status = (error as any)?.response?.status
      if (status === 404) {
        return null
      }
      throw error
    }
  }

  async findUserCompanies(): Promise<Company[]> {
    try {
      const response = await apiClient.get(this.baseUrl)
      return response.data.data || []
    } catch (error) {
      throw error
    }
  }

  async verifyAccess(companyId: string): Promise<void> {
    try {
      await apiClient.get(`${this.baseUrl}/${companyId}/access`)
    } catch (error: unknown) {
      const status = (error as any)?.response?.status
      if (status === 403) {
        throw new Error('Access denied')
      }
      throw error
    }
  }

  async create(data: CreateCompanyDTO): Promise<Company> {
    try {
      const response = await apiClient.post(this.baseUrl, data)
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  async update(id: string, data: UpdateCompanyDTO): Promise<Company> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data)
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      throw error
    }
  }
}
