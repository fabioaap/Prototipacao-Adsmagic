/**
 * Project Service
 * 
 * Implementa lógica de negócio para operações de projetos
 * Segue princípios SOLID (SRP - Single Responsibility Principle)
 */

import type { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types/project'
import type { IProjectService, IProjectRepository } from './interfaces'
import type { ICacheService, IErrorHandler } from '@/services/company/interfaces'

export class ProjectService implements IProjectService {
  private readonly CACHE_PREFIX = 'project:'
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutos
  private readonly repository: IProjectRepository
  private readonly cache: ICacheService
  private readonly errorHandler: IErrorHandler

  constructor(
    repository: IProjectRepository,
    cache: ICacheService,
    errorHandler: IErrorHandler
  ) {
    this.repository = repository
    this.cache = cache
    this.errorHandler = errorHandler
  }

  /**
   * Busca projetos de uma empresa
   * @param companyId ID da empresa
   * @returns Lista de projetos
   */
  async getProjects(companyId: string): Promise<Project[]> {
    if (!companyId) {
      throw new Error('Company ID is required')
    }

    try {
      // Verificar cache primeiro
      const cacheKey = `${this.CACHE_PREFIX}company:${companyId}`
      const cached = this.cache.get<Project[]>(cacheKey)
      
      if (cached) {
        console.log(`[ProjectService] Cache hit for company ${companyId} projects`)
        return cached
      }

      // Buscar da API
      console.log(`[ProjectService] Loading projects for company ${companyId} from API`)
      const projects = await this.repository.findByCompanyId(companyId)
      
      // Cache por 5 minutos
      this.cache.set(cacheKey, projects, this.CACHE_TTL)
      
      return projects
    } catch (error) {
      this.errorHandler.handle(error, `Failed to load projects for company ${companyId}`)
      throw error
    }
  }

  /**
   * Busca um projeto específico
   * @param projectId ID do projeto
   * @returns Dados do projeto
   */
  async getProject(projectId: string): Promise<Project> {
    if (!projectId) {
      throw new Error('Project ID is required')
    }

    try {
      // Verificar cache primeiro
      const cacheKey = `${this.CACHE_PREFIX}${projectId}`
      const cached = this.cache.get<Project>(cacheKey)
      
      if (cached) {
        console.log(`[ProjectService] Cache hit for project ${projectId}`)
        return cached
      }

      // Buscar da API
      console.log(`[ProjectService] Loading project ${projectId} from API`)
      const project = await this.repository.findById(projectId)
      
      // Validar dados
      if (!project) {
        throw new Error(`Project ${projectId} not found`)
      }

      // Cache por 5 minutos
      this.cache.set(cacheKey, project, this.CACHE_TTL)
      
      return project
    } catch (error) {
      this.errorHandler.handle(error, `Failed to load project ${projectId}`)
      throw error
    }
  }

  /**
   * Cria novo projeto
   * @param companyId ID da empresa
   * @param data Dados do projeto
   * @returns Projeto criado
   */
  async createProject(companyId: string, data: CreateProjectDTO): Promise<Project> {
    try {
      const project = await this.repository.create(companyId, data)
      
      // Invalidar cache de projetos da empresa
      this.cache.invalidate(`${this.CACHE_PREFIX}company:${companyId}`)
      
      return project
    } catch (error) {
      this.errorHandler.handle(error, `Failed to create project for company ${companyId}`)
      throw error
    }
  }

  /**
   * Atualiza projeto existente
   * @param projectId ID do projeto
   * @param data Dados para atualizar
   * @returns Projeto atualizado
   */
  async updateProject(projectId: string, data: UpdateProjectDTO): Promise<Project> {
    try {
      const project = await this.repository.update(projectId, data)
      
      // Invalidar cache do projeto
      this.cache.invalidate(`${this.CACHE_PREFIX}${projectId}`)
      
      // Invalidar cache de projetos da empresa (se tivermos company_id)
      if (project.company_id) {
        this.cache.invalidate(`${this.CACHE_PREFIX}company:${project.company_id}`)
      }
      
      return project
    } catch (error) {
      this.errorHandler.handle(error, `Failed to update project ${projectId}`)
      throw error
    }
  }

  /**
   * Remove projeto
   * @param projectId ID do projeto
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      // Buscar projeto para obter companyId antes de deletar
      const project = await this.getProject(projectId)
      
      await this.repository.delete(projectId)
      
      // Invalidar cache
      this.cache.invalidate(`${this.CACHE_PREFIX}${projectId}`)
      
      // Invalidar cache de projetos da empresa
      if (project.company_id) {
        this.cache.invalidate(`${this.CACHE_PREFIX}company:${project.company_id}`)
      }
    } catch (error) {
      this.errorHandler.handle(error, `Failed to delete project ${projectId}`)
      throw error
    }
  }
}
