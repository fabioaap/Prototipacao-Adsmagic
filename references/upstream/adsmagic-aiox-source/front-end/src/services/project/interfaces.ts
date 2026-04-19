/**
 * Interfaces para o módulo de Project
 * 
 * Define contratos para services, repositories e tipos relacionados a projetos
 * seguindo princípios SOLID (ISP - Interface Segregation Principle)
 */

import type { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types/project'

/**
 * Interface para operações de repositório de projetos
 */
export interface IProjectRepository {
  findByCompanyId(companyId: string): Promise<Project[]>
  findById(id: string): Promise<Project | null>
  verifyAccess(projectId: string, companyId: string): Promise<void>
  create(companyId: string, data: CreateProjectDTO): Promise<Project>
  update(id: string, data: UpdateProjectDTO): Promise<Project>
  delete(id: string): Promise<void>
}

/**
 * Interface para operações de serviço de projetos
 */
export interface IProjectService {
  getProjects(companyId: string): Promise<Project[]>
  getProject(projectId: string): Promise<Project>
  createProject(companyId: string, data: CreateProjectDTO): Promise<Project>
  updateProject(projectId: string, data: UpdateProjectDTO): Promise<Project>
  deleteProject(projectId: string): Promise<void>
}
