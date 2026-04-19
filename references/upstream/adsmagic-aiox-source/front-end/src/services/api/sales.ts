/**
 * Sales API Service
 *
 * Gerencia todas as operações relacionadas a vendas.
 * Integrado com Edge Function /sales do backend.
 * 
 * Suporta modo mock para desenvolvimento local.
 *
 * @module services/api/sales
 */

import { apiClient } from './client'
import type { Sale, CreateSaleDTO, UpdateSaleDTO, MarkSaleLostDTO, SaleFilters, PaginatedResponse } from '@/types'
import { MOCK_SALES } from '@/mocks/sales'
import {
  adaptSaleFromBackend,
  adaptSalesListFromBackend,
  adaptCreateSaleToBackend,
  adaptUpdateSaleToBackend,
  adaptMarkLostToBackend,
  adaptSaleFiltersToParams,
  type BackendSale,
  type BackendSalesListResponse
} from './adapters/salesAdapter'

// Flag para alternar entre mock e API real baseado em variável de ambiente
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true

export const salesService = {
  /**
   * Buscar todas as vendas com filtros
   */
  async getAll(filters?: SaleFilters): Promise<PaginatedResponse<Sale>> {

    if (USE_MOCK) {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 300))

      // Aplica filtros nos dados mock
      let filtered = [...MOCK_SALES]

      // Filter by current project ID
      const currentProjectId = localStorage.getItem('current_project_id')
      if (currentProjectId) {
        filtered = filtered.filter(sale => sale.projectId === currentProjectId)
      }

      if (filters?.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(sale =>
          sale.contactId.toLowerCase().includes(search) ||
          sale.origin?.toLowerCase().includes(search)
        )
      }

      if (filters?.status) {
        filtered = filtered.filter(sale => sale.status === filters.status)
      }

      if (filters?.origins && filters.origins.length > 0) {
        filtered = filtered.filter(sale => sale.origin && filters.origins!.includes(sale.origin))
      }

      if (filters?.dateFrom) {
        filtered = filtered.filter(sale =>
          new Date(sale.date) >= new Date(filters.dateFrom!)
        )
      }

      if (filters?.dateTo) {
        filtered = filtered.filter(sale =>
          new Date(sale.date) <= new Date(filters.dateTo!)
        )
      }

      // Paginação
      const page = filters?.page || 1
      const pageSize = filters?.pageSize || 10
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filtered.slice(startIndex, endIndex)

      return {
        data: paginatedData,
        pagination: {
          page,
          pageSize,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize)
        }
      }
    }

    // API real - usa adapters para conversão snake_case ↔ camelCase
    const currentProjectId = localStorage.getItem('current_project_id')
    const params = adaptSaleFiltersToParams({
      ...filters,
      projectId: filters?.projectId || currentProjectId
    })
    
    
    const response = await apiClient.get<BackendSalesListResponse>('/sales', { params })
    
    // Adaptar resposta do backend para frontend
    const adaptedSales = adaptSalesListFromBackend(response.data.data)
    
    return {
      data: adaptedSales,
      pagination: {
        page: Math.floor(response.data.meta.offset / response.data.meta.limit) + 1,
        pageSize: response.data.meta.limit,
        total: response.data.meta.total,
        totalPages: Math.ceil(response.data.meta.total / response.data.meta.limit)
      }
    }
  },

  /**
   * Buscar venda por ID
   */
  async getById(id: string): Promise<Sale | null> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return MOCK_SALES.find(sale => sale.id === id) || null
    }

    const response = await apiClient.get<BackendSale>(`/sales/${id}`)
    return adaptSaleFromBackend(response.data)
  },

  /**
   * Criar nova venda
   */
  async create(data: CreateSaleDTO): Promise<Sale> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const newSale: Sale = {
        id: `mock_${Date.now()}`,
        projectId: data.projectId || localStorage.getItem('current_project_id') || '2',
        contactId: data.contactId,
        value: data.value,
        currency: data.currency,
        date: data.date,
        origin: data.origin,
        status: 'completed',
        trackingParams: data.trackingParams,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      MOCK_SALES.unshift(newSale)
      return newSale
    }

    // Garantir que project_id está presente
    const currentProjectId = localStorage.getItem('current_project_id')
    const backendData = adaptCreateSaleToBackend({
      ...data,
      projectId: data.projectId || currentProjectId || ''
    })
    
    
    const response = await apiClient.post<BackendSale>('/sales', backendData)
    return adaptSaleFromBackend(response.data)
  },

  /**
   * Atualizar venda
   */
  async update(id: string, data: UpdateSaleDTO): Promise<Sale> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const index = MOCK_SALES.findIndex(sale => sale.id === id)
      if (index === -1) throw new Error('Venda não encontrada')

      const existingSale = MOCK_SALES[index]!
      MOCK_SALES[index] = {
        ...existingSale,
        ...data,
        id: existingSale.id, // Garantir que id não seja undefined
        projectId: existingSale.projectId,
        contactId: existingSale.contactId, // contactId não está em UpdateSaleDTO
        updatedAt: new Date().toISOString()
      }

      return MOCK_SALES[index]!
    }

    const backendData = adaptUpdateSaleToBackend(data)
    
    
    const response = await apiClient.patch<BackendSale>(`/sales/${id}`, backendData)
    return adaptSaleFromBackend(response.data)
  },

  /**
   * Marcar venda como perdida
   */
  async markAsLost(id: string, data: MarkSaleLostDTO): Promise<Sale> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const index = MOCK_SALES.findIndex(sale => sale.id === id)
      if (index === -1) throw new Error('Venda não encontrada')

      const existingSale = MOCK_SALES[index]!
      MOCK_SALES[index] = {
        ...existingSale,
        status: 'lost',
        lostReason: data.reason,
        lostObservations: data.lostObservations,
        updatedAt: new Date().toISOString()
      }

      return MOCK_SALES[index]
    }

    const backendData = adaptMarkLostToBackend(data)
    
    
    const response = await apiClient.patch<BackendSale>(`/sales/${id}/lost`, backendData)
    return adaptSaleFromBackend(response.data)
  },

  /**
   * Recuperar venda perdida (volta para status completed)
   */
  async recover(id: string): Promise<Sale> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const index = MOCK_SALES.findIndex(sale => sale.id === id)
      if (index === -1) throw new Error('Venda não encontrada')

      const existingSale = MOCK_SALES[index]!
      MOCK_SALES[index] = {
        ...existingSale,
        status: 'completed',
        lostReason: undefined,
        lostObservations: undefined,
        updatedAt: new Date().toISOString()
      }

      return MOCK_SALES[index]!
    }

    const response = await apiClient.patch<BackendSale>(`/sales/${id}/recover`)
    return adaptSaleFromBackend(response.data)
  },

  /**
   * Deletar venda
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))

      const index = MOCK_SALES.findIndex(sale => sale.id === id)
      if (index !== -1) {
        MOCK_SALES.splice(index, 1)
      }
      return
    }

    await apiClient.delete(`/sales/${id}`)
  },

  /**
   * Buscar vendas por contato
   */
  async getByContact(contactId: string): Promise<Sale[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return MOCK_SALES.filter(sale => sale.contactId === contactId)
    }

    
    // Usar filtro de contact_id em vez de endpoint separado
    const response = await apiClient.get<BackendSalesListResponse>('/sales', {
      params: { contact_id: contactId, limit: '100' }
    })
    
    return adaptSalesListFromBackend(response.data.data)
  },

  /**
   * Buscar métricas de vendas
   */
  async getMetrics(filters?: SaleFilters): Promise<{
    totalRevenue: number
    totalSales: number
    averageTicket: number
    conversionRate: number
  }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))

      const sales = MOCK_SALES.filter(sale => sale.status === 'completed')
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.value, 0)
      const totalSales = sales.length
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

      return {
        totalRevenue,
        totalSales,
        averageTicket,
        conversionRate: 0 // Seria calculado com base em contatos
      }
    }

    const response = await apiClient.get('/sales/metrics', {
      params: filters
    })
    return response.data
  },

  /**
   * Exportar vendas para CSV
   */
  async exportToCSV(filters?: SaleFilters): Promise<Blob> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Filtrar vendas conforme filtros
      let salesToExport = [...MOCK_SALES]

      if (filters?.status) {
        salesToExport = salesToExport.filter(s => s.status === filters.status)
      }
      if (filters?.origins?.length) {
        salesToExport = salesToExport.filter(s => s.origin && filters.origins!.includes(s.origin))
      }
      if (filters?.minValue !== undefined) {
        salesToExport = salesToExport.filter(s => s.value >= filters.minValue!)
      }
      if (filters?.maxValue !== undefined) {
        salesToExport = salesToExport.filter(s => s.value <= filters.maxValue!)
      }

      // Gerar CSV
      const headers = ['ID', 'Valor', 'Status', 'Contato ID', 'Origem ID', 'Cidade', 'País', 'Dispositivo', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Criado Em']
      const rows = salesToExport.map(s => [
        s.id,
        s.value.toString(),
        s.status,
        s.contactId || '',
        s.origin || '',
        s.city || '',
        s.country || '',
        s.device || '',
        s.utmSource || '',
        s.utmMedium || '',
        s.utmCampaign || '',
        s.createdAt
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      return new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
    }

    const response = await apiClient.get('/sales/export', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  }
}
