/**
 * Company Service
 * 
 * Implementa lógica de negócio para operações de empresas
 * Segue princípios SOLID (SRP - Single Responsibility Principle)
 */

import type { Company, CreateCompanyDTO, UpdateCompanyDTO } from '@/types'
import type { ICompanyService, ICompanyRepository, ICacheService, IErrorHandler } from './interfaces'

export class CompanyService implements ICompanyService {
  private readonly CACHE_PREFIX = 'company:'
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutos
  private readonly repository: ICompanyRepository
  private readonly cache: ICacheService
  private readonly errorHandler: IErrorHandler

  constructor(
    repository: ICompanyRepository,
    cache: ICacheService,
    errorHandler: IErrorHandler
  ) {
    this.repository = repository
    this.cache = cache
    this.errorHandler = errorHandler
  }

  /**
   * Carrega empresa do cache ou API
   * @param companyId ID da empresa
   * @returns Dados da empresa
   */
  async loadCompany(companyId: string): Promise<Company> {
    if (!companyId) {
      throw new Error('Company ID is required')
    }

    try {
      // Verificar cache primeiro
      const cacheKey = `${this.CACHE_PREFIX}${companyId}`
      const cached = this.cache.get<Company>(cacheKey)
      
      if (cached) {
        return cached
      }

      // Buscar da API
      const company = await this.repository.findById(companyId)
      
      // Validar dados
      if (!company) {
        throw new Error(`Company ${companyId} not found`)
      }

      // Cache por 5 minutos
      this.cache.set(cacheKey, company, this.CACHE_TTL)
      
      return company
    } catch (error) {
      this.errorHandler.handle(error, `Failed to load company ${companyId}`)
      throw error
    }
  }

  /**
   * Verifica se usuário tem acesso à empresa
   * @param companyId ID da empresa
   * @returns true se tem acesso, false caso contrário
   */
  async verifyUserAccess(companyId: string): Promise<boolean> {
    if (!companyId) return false

    try {
      await this.repository.verifyAccess(companyId)
      return true
    } catch (error) {
      console.warn(`[CompanyService] Access denied to company ${companyId}:`, error)
      return false
    }
  }

  /**
   * Busca todas as empresas do usuário
   * @returns Lista de empresas
   */
  async getUserCompanies(): Promise<Company[]> {
    try {
      const cacheKey = 'user:companies'
      const cached = this.cache.get<Company[]>(cacheKey)
      
      if (cached) {
        return cached
      }

      const companies = await this.repository.findUserCompanies()
      this.cache.set(cacheKey, companies, this.CACHE_TTL)
      
      return companies
    } catch (error) {
      this.errorHandler.handle(error, 'Failed to load user companies')
      throw error
    }
  }

  /**
   * Cria nova empresa
   * @param data Dados da empresa
   * @returns Empresa criada
   */
  async createCompany(data: CreateCompanyDTO): Promise<Company> {
    try {
      const company = await this.repository.create(data)
      
      // Invalidar cache de empresas do usuário
      this.cache.invalidate('user:companies')
      
      return company
    } catch (error) {
      this.errorHandler.handle(error, 'Failed to create company')
      throw error
    }
  }

  /**
   * Atualiza empresa existente
   * @param companyId ID da empresa
   * @param data Dados para atualizar
   * @returns Empresa atualizada
   */
  async updateCompany(companyId: string, data: UpdateCompanyDTO): Promise<Company> {
    try {
      const company = await this.repository.update(companyId, data)
      
      // Invalidar cache da empresa
      this.cache.invalidate(`${this.CACHE_PREFIX}${companyId}`)
      this.cache.invalidate('user:companies')
      
      return company
    } catch (error) {
      this.errorHandler.handle(error, `Failed to update company ${companyId}`)
      throw error
    }
  }

  /**
   * Remove empresa
   * @param companyId ID da empresa
   */
  async deleteCompany(companyId: string): Promise<void> {
    try {
      await this.repository.delete(companyId)
      
      // Invalidar cache
      this.cache.invalidate(`${this.CACHE_PREFIX}${companyId}`)
      this.cache.invalidate('user:companies')
    } catch (error) {
      this.errorHandler.handle(error, `Failed to delete company ${companyId}`)
      throw error
    }
  }
}
