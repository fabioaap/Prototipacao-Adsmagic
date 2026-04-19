import { apiClient } from './client'
import { supabase } from './supabaseClient'
import axios from 'axios'
import type { CompanyUser, CreateCompanyDTO, UpdateCompanyDTO, InviteUserDTO } from '@/types'

export type CompanyApiErrorCode =
  | 'COMPANY_ALREADY_EXISTS'
  | 'RLS_FORBIDDEN'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN_ERROR'

export interface CompaniesApiError extends Error {
  status?: number
  code?: CompanyApiErrorCode
}

function normalizeCompaniesApiError(error: unknown): CompaniesApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as { error?: string; code?: CompanyApiErrorCode; message?: string } | undefined
    const normalizedError = new Error(
      data?.error || data?.message || error.message || 'Erro na API de empresas'
    ) as CompaniesApiError

    normalizedError.status = status
    normalizedError.code = data?.code || 'UNKNOWN_ERROR'
    return normalizedError
  }

  if (error instanceof Error) {
    return error as CompaniesApiError
  }

  const fallbackError = new Error('Erro desconhecido ao processar empresas') as CompaniesApiError
  fallbackError.code = 'UNKNOWN_ERROR'
  return fallbackError
}

export function isCompanyAlreadyExistsError(error: unknown): boolean {
  const normalized = normalizeCompaniesApiError(error)
  return normalized.status === 409 && normalized.code === 'COMPANY_ALREADY_EXISTS'
}

export function isRlsForbiddenError(error: unknown): boolean {
  const normalized = normalizeCompaniesApiError(error)
  return normalized.status === 403 && (normalized.code === 'RLS_FORBIDDEN' || normalized.code === 'FORBIDDEN')
}

export const companiesService = {
  /**
   * Busca todas as empresas do usuário autenticado
   */
  async getUserCompanies(_userId: string) {
    try {
      const response = await apiClient.get('/companies')
      if (import.meta.env.DEV) {
      }

      const companies = response.data?.data || response.data || []
      return companies
    } catch (error) {
      console.error('[CompaniesService] ❌ Error fetching companies:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } }
        console.error('[CompaniesService] ❌ Error response:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data
        })
      }
      throw error
    }
  },

  /**
   * Busca uma empresa por ID
   */
  async getCompanyById(companyId: string) {
    try {
      const response = await apiClient.get(`/companies/${companyId}`)
      return response.data.data
    } catch (error) {
      console.error('[CompaniesService] Error fetching company:', error)
      throw error
    }
  },

  /**
   * Cria uma nova empresa
   */
  async createCompany(companyData: CreateCompanyDTO, _userId: string) {
    try {
      const response = await apiClient.post('/companies', companyData)
      const companyResult = response?.data?.data || response?.data || companyData
      return companyResult
    } catch (error) {
      const normalizedError = normalizeCompaniesApiError(error)
      console.error('[CompaniesService] Error creating company:', {
        message: normalizedError.message,
        status: normalizedError.status,
        code: normalizedError.code
      })
      throw normalizedError
    }
  },

  /**
   * Atualiza uma empresa
   */
  async updateCompany(companyId: string, updates: UpdateCompanyDTO) {
    try {
      const response = await apiClient.patch(`/companies/${companyId}`, updates)
      return response.data.data
    } catch (error) {
      console.error('[CompaniesService] Error updating company:', error)
      throw error
    }
  },

  /**
   * Deleta uma empresa (soft delete)
   */
  async deleteCompany(companyId: string) {
    try {
      await apiClient.delete(`/companies/${companyId}`)
    } catch (error) {
      console.error('[CompaniesService] Error deleting company:', error)
      throw error
    }
  },

  /**
   * Busca usuários de uma empresa
   */
  async getCompanyUsers(companyId: string) {
    const { data, error } = await supabase
      .from('company_users')
      .select(`
        *,
        user_profiles (
          id,
          first_name,
          last_name,
          avatar_url,
          phone
        )
      `)
      .eq('company_id', companyId)
      .eq('is_active', true)

    if (error) throw error
    return data
  },

  /**
   * Convida usuário para empresa
   */
  async inviteUser(companyId: string, inviteData: InviteUserDTO, invitedBy: string) {
    // Buscar usuário por email
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', inviteData.email)
      .single()

    if (profileError) throw new Error('Usuário não encontrado')

    // Criar convite
    const { data, error } = await supabase
      .from('company_users')
      .insert({
        company_id: companyId,
        user_id: profile.id,
        role: inviteData.role,
        permissions: inviteData.permissions,
        is_active: false,
        invited_by: invitedBy,
        invited_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Remove usuário da empresa
   */
  async removeUser(companyId: string, userId: string) {
    const { error } = await supabase
      .from('company_users')
      .update({ is_active: false })
      .eq('company_id', companyId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Atualiza role de usuário
   */
  async updateUserRole(companyId: string, userId: string, role: CompanyUser['role']) {
    const { error } = await supabase
      .from('company_users')
      .update({ role })
      .eq('company_id', companyId)
      .eq('user_id', userId)

    if (error) throw error
  }
}
