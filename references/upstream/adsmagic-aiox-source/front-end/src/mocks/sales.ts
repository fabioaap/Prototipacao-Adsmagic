/**
 * Mock data for sales
 *
 * Contains 20 realistic sales with varied:
 * - Values (R$ 500 - R$ 5.000)
 * - Status (won, lost)
 * - Contact references
 * - Dates (last 90 days)
 * - Project isolation
 *
 * @module mocks/sales
 */

import type { Sale, CreateSaleDTO, UpdateSaleDTO, MarkSaleLostDTO, SaleFilters, PaginatedResponse } from '@/types'
import { MOCK_CONTACTS } from './contacts'

/**
 * Generate mock sale data
 */
const generateMockSale = (id: string, contactId: string, value: number, status: 'completed' | 'lost' = 'completed'): Sale => ({
  id,
  projectId: 'mock-project-001', // Match current mock project ID
  contactId,
  value,
  currency: 'BRL',
  date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  origin: MOCK_CONTACTS.find(c => c.id === contactId)?.origin || 'unknown',
  status,
  lostReason: status === 'lost' ? 'price_too_high' : undefined,
  lostObservations: status === 'lost' ? 'Cliente achou o preço muito alto' : undefined,
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
})

/**
 * Mock sales data (20 records)
 */
export const MOCK_SALES: Sale[] = [
  // Vendas Ganhas - Dr. Leticia Lopes
  generateMockSale('sale-001', 'contact-001', 2500, 'completed'), // Dr. Leticia Lopes - Odontologia
  generateMockSale('sale-002', 'contact-001', 1800, 'completed'), // Dr. Leticia Lopes - Segunda venda

  // Vendas Ganhas - João Silva
  generateMockSale('sale-003', 'contact-002', 1200, 'completed'), // João Silva

  // Vendas Ganhas - Maria Oliveira
  generateMockSale('sale-004', 'contact-003', 3200, 'completed'), // Maria Oliveira
  generateMockSale('sale-005', 'contact-003', 950, 'completed'), // Maria Oliveira - Segunda venda

  // Vendas Ganhas - Carlos Santos
  generateMockSale('sale-006', 'contact-004', 2100, 'completed'), // Carlos Santos

  // Vendas Ganhas - Ana Costa
  generateMockSale('sale-007', 'contact-005', 1500, 'completed'), // Ana Costa
  generateMockSale('sale-008', 'contact-005', 2800, 'completed'), // Ana Costa - Segunda venda

  // Vendas Ganhas - Pedro Lima
  generateMockSale('sale-009', 'contact-006', 1900, 'completed'), // Pedro Lima

  // Vendas Ganhas - Fernanda Rocha
  generateMockSale('sale-010', 'contact-007', 2400, 'completed'), // Fernanda Rocha

  // Vendas Ganhas - Roberto Alves
  generateMockSale('sale-011', 'contact-008', 1600, 'completed'), // Roberto Alves

  // Vendas Ganhas - Juliana Mendes
  generateMockSale('sale-012', 'contact-009', 2200, 'completed'), // Juliana Mendes

  // Vendas Ganhas - Marcos Pereira
  generateMockSale('sale-013', 'contact-010', 1800, 'completed'), // Marcos Pereira

  // Vendas Perdidas
  generateMockSale('sale-014', 'contact-011', 0, 'lost'), // Venda perdida - Cliente indeciso
  generateMockSale('sale-015', 'contact-012', 0, 'lost'), // Venda perdida - Preço alto
  generateMockSale('sale-016', 'contact-013', 0, 'lost'), // Venda perdida - Concorrência
  generateMockSale('sale-017', 'contact-014', 0, 'lost'), // Venda perdida - Sem orçamento
  generateMockSale('sale-018', 'contact-015', 0, 'lost'), // Venda perdida - Não interessado

  // Vendas Ganhas - Valores Altos
  generateMockSale('sale-019', 'contact-016', 4500, 'completed'), // Venda alta - Cliente VIP
  generateMockSale('sale-020', 'contact-017', 3800, 'completed'), // Venda alta - Pacote completo
]

/**
 * Helper functions for mock sales operations
 */

/**
 * Filter sales by project ID
 */
export function filterSalesByProject(sales: Sale[], projectId: string): Sale[] {
  return sales.filter(sale => sale.projectId === projectId)
}

/**
 * Filter sales by contact ID
 */
export function filterSalesByContact(sales: Sale[], contactId: string): Sale[] {
  return sales.filter(sale => sale.contactId === contactId)
}

/**
 * Filter sales by status (won/lost)
 */
export function filterSalesByStatus(sales: Sale[], status: 'completed' | 'lost'): Sale[] {
  return sales.filter(sale => sale.status === status)
}

/**
 * Filter sales by date range
 */
export function filterSalesByDateRange(sales: Sale[], startDate: string, endDate: string): Sale[] {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return sales.filter(sale => {
    const saleDate = new Date(sale.createdAt)
    return saleDate >= start && saleDate <= end
  })
}

/**
 * Get sales statistics
 */
export function getSalesStats(sales: Sale[]) {
  const wonSales = sales.filter(sale => sale.status === 'completed')
  const lostSales = sales.filter(sale => sale.status === 'lost')

  const totalRevenue = wonSales.reduce((sum, sale) => sum + sale.value, 0)
  const averageTicket = wonSales.length > 0 ? totalRevenue / wonSales.length : 0
  const conversionRate = sales.length > 0 ? (wonSales.length / sales.length) * 100 : 0

  return {
    totalSales: sales.length,
    wonSales: wonSales.length,
    lostSales: lostSales.length,
    totalRevenue,
    averageTicket,
    conversionRate
  }
}

/**
 * Paginate sales
 */
export function paginateSales(sales: Sale[], page: number, pageSize: number): PaginatedResponse<Sale> {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  const paginatedSales = sales.slice(startIndex, endIndex)

  return {
    data: paginatedSales,
    pagination: {
      page,
      pageSize,
      total: sales.length,
      totalPages: Math.ceil(sales.length / pageSize)
    }
  }
}

/**
 * Apply filters to sales
 */
export function applySalesFilters(sales: Sale[], filters: SaleFilters): Sale[] {
  let filteredSales = [...sales]

  // Filter by project ID
  if (filters.projectId) {
    filteredSales = filteredSales.filter(sale => sale.projectId === filters.projectId)
  }

  // Filter by contact ID
  if (filters.contactId) {
    filteredSales = filteredSales.filter(sale => sale.contactId === filters.contactId)
  }

  // Filter by status
  if (filters.status !== undefined) {
    filteredSales = filteredSales.filter(sale => sale.status === filters.status)
  }

  // Filter by date range
  if (filters.startDate && filters.endDate) {
    filteredSales = filterSalesByDateRange(filteredSales, filters.startDate, filters.endDate)
  } else if (filters.dateFrom && filters.dateTo) {
    filteredSales = filterSalesByDateRange(filteredSales, filters.dateFrom, filters.dateTo)
  }

  // Filter by value range
  if (filters.minValue !== undefined) {
    filteredSales = filteredSales.filter(sale => sale.value >= filters.minValue!)
  }

  if (filters.maxValue !== undefined) {
    filteredSales = filteredSales.filter(sale => sale.value <= filters.maxValue!)
  }

  // Sort by date (newest first)
  filteredSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return filteredSales
}

/**
 * Create a new sale
 */
export function createMockSale(data: CreateSaleDTO): Sale {
  const newSale: Sale = {
    id: `sale-${Date.now()}`,
    contactId: data.contactId,
    value: data.value,
    currency: data.currency,
    date: data.date,
    status: 'completed',
    origin: data.origin || MOCK_CONTACTS.find(c => c.id === data.contactId)?.origin || 'unknown',
    projectId: 'mock-project-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  MOCK_SALES.push(newSale)
  return newSale
}

/**
 * Update a sale
 */
export function updateMockSale(id: string, data: UpdateSaleDTO): Sale | null {
  const saleIndex = MOCK_SALES.findIndex(sale => sale.id === id)

  if (saleIndex === -1) {
    return null
  }

  const existingSale = MOCK_SALES[saleIndex]!
  const updatedSale: Sale = {
    id: existingSale.id,
    projectId: existingSale.projectId,
    contactId: existingSale.contactId,
    value: data.value ?? existingSale.value,
    currency: data.currency ?? existingSale.currency,
    date: data.date ?? existingSale.date,
    origin: data.origin ?? existingSale.origin,
    status: existingSale.status,
    lostReason: existingSale.lostReason,
    lostObservations: existingSale.lostObservations,
    trackingParams: existingSale.trackingParams,
    createdAt: existingSale.createdAt,
    updatedAt: new Date().toISOString(),
  }

  MOCK_SALES[saleIndex] = updatedSale
  return updatedSale
}

/**
 * Mark a sale as lost
 */
export function markMockSaleAsLost(id: string, data: MarkSaleLostDTO): Sale | null {
  const saleIndex = MOCK_SALES.findIndex(sale => sale.id === id)

  if (saleIndex === -1) {
    return null
  }

  const existingSale = MOCK_SALES[saleIndex]!
  const updatedSale: Sale = {
    id: existingSale.id,
    projectId: existingSale.projectId,
    contactId: existingSale.contactId,
    value: existingSale.value,
    currency: existingSale.currency,
    date: existingSale.date,
    origin: existingSale.origin,
    status: 'lost',
    lostReason: data.lostReason,
    lostObservations: data.lostObservations,
    trackingParams: existingSale.trackingParams,
    createdAt: existingSale.createdAt,
    updatedAt: new Date().toISOString(),
  }

  MOCK_SALES[saleIndex] = updatedSale
  return updatedSale
}

/**
 * Delete a sale
 */
export function deleteMockSale(id: string): boolean {
  const saleIndex = MOCK_SALES.findIndex(sale => sale.id === id)

  if (saleIndex === -1) {
    return false
  }

  MOCK_SALES.splice(saleIndex, 1)
  return true
}

/**
 * Get sales by contact
 */
export function getSalesByContact(contactId: string): Sale[] {
  return MOCK_SALES.filter(sale => sale.contactId === contactId)
}

/**
 * Get sales by project
 */
export function getSalesByProject(projectId: string): Sale[] {
  return MOCK_SALES.filter(sale => sale.projectId === projectId)
}