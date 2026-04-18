/**
 * Project Repository
 * 
 * Implementa acesso a dados para operações de projetos
 * Segue princípios SOLID (SRP - Single Responsibility Principle)
 */

import { apiClient } from '@/services/api/client'
import type { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types/project'
import type { IProjectRepository } from './interfaces'
import { isAxiosError } from 'axios'

export class ProjectRepository implements IProjectRepository {
  private readonly baseUrl = '/projects'

  async findByCompanyId(companyId: string): Promise<Project[]> {
    try {
      const response = await apiClient.get(this.baseUrl, {
        params: { companyId }
      })
      return response.data.data || []
    } catch (error) {
      throw error
    }
  }

  async findById(id: string): Promise<Project | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`)
      return response.data.data || null
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async verifyAccess(projectId: string, companyId: string): Promise<void> {
    try {
      await apiClient.get(`${this.baseUrl}/${projectId}/access`, {
        params: { companyId }
      })
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 403) {
        throw new Error('Access denied')
      }
      throw error
    }
  }

  async create(companyId: string, data: CreateProjectDTO): Promise<Project> {
    try {
      const response = await apiClient.post(this.baseUrl, {
        ...data,
        companyId
      })
      return response.data.data
    } catch (error) {
      throw error
    }
  }

  async update(id: string, data: UpdateProjectDTO): Promise<Project> {
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
