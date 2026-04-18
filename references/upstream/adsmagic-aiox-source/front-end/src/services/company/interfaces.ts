/**
 * Interfaces para o módulo de Company
 * 
 * Define contratos para services, repositories e tipos relacionados a empresas
 * seguindo princípios SOLID (ISP - Interface Segregation Principle)
 */

import type { Company, CreateCompanyDTO, UpdateCompanyDTO } from '@/types'

/**
 * Interface para operações de cache
 */
export interface ICacheService {
  get<T>(key: string): T | null
  set<T>(key: string, data: T, expiresIn?: number): void
  invalidate(key: string): void
  invalidatePattern(pattern: string): void
  clear(): void
}

/**
 * Interface para tratamento de erros
 */
export interface IErrorHandler {
  handle(error: unknown, context: string): void
}

/**
 * Interface para operações de repositório de empresas
 */
export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>
  findUserCompanies(): Promise<Company[]>
  verifyAccess(companyId: string): Promise<void>
  create(data: CreateCompanyDTO): Promise<Company>
  update(id: string, data: UpdateCompanyDTO): Promise<Company>
  delete(id: string): Promise<void>
}

/**
 * Interface para operações de serviço de empresas
 */
export interface ICompanyService {
  loadCompany(companyId: string): Promise<Company>
  verifyUserAccess(companyId: string): Promise<boolean>
  getUserCompanies(): Promise<Company[]>
  createCompany(data: CreateCompanyDTO): Promise<Company>
  updateCompany(companyId: string, data: UpdateCompanyDTO): Promise<Company>
  deleteCompany(companyId: string): Promise<void>
}
