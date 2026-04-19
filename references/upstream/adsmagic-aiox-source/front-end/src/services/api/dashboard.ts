/**
 * Dashboard API Service
 *
 * Gerencia todas as operações relacionadas ao dashboard e métricas.
 * Segue o padrão "Mock First, API Ready" para desenvolvimento.
 *
 * @module services/api/dashboard
 */

import { apiClient } from './client'
import type { DashboardMetrics, TimeSeriesData, OriginPerformance } from '@/types'
import { getDashboardMetrics, getTimeSeriesData, getOriginPerformance } from '@/mocks/dashboard'

// Flag para alternar entre mock e API real
const USE_MOCK = false

export const dashboardService = {
  /**
   * Buscar métricas do dashboard
   */
  async getMetrics(period?: '7d' | '30d' | '90d' | 'all'): Promise<DashboardMetrics> {
    if (USE_MOCK) {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Get metrics for current project
      const currentProjectId = localStorage.getItem('current_project_id')
      return getDashboardMetrics(currentProjectId || '2')
    }

    const response = await apiClient.get<DashboardMetrics>('/dashboard/metrics', {
      params: { period }
    })
    return response.data
  },

  /**
   * Buscar dados de série temporal
   */
  async getTimeSeries(period?: '7d' | '30d' | '90d' | 'all'): Promise<TimeSeriesData[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Get time series for current project
      const currentProjectId = localStorage.getItem('current_project_id')
      return getTimeSeriesData(currentProjectId || '2', period || '30d')
    }

    const response = await apiClient.get<TimeSeriesData[]>('/dashboard/time-series', {
      params: { period }
    })
    return response.data
  },

  /**
   * Buscar performance por origem
   */
  async getOriginPerformance(period?: '7d' | '30d' | '90d' | 'all'): Promise<OriginPerformance[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Get origin performance for current project
      const currentProjectId = localStorage.getItem('current_project_id')
      return getOriginPerformance(currentProjectId || '2')
    }

    const response = await apiClient.get<OriginPerformance[]>('/dashboard/origin-performance', {
      params: { period }
    })
    return response.data
  },

  /**
   * Buscar últimas vendas
   */
  async getLatestSales(limit: number = 5): Promise<Array<{
    id: string
    contactId: string
    value: number
    currency: string
    date: string
    origin: string
  }>> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return [
        {
          id: '1',
          contactId: '1',
          value: 1000,
          currency: 'BRL',
          date: '2025-10-20T10:00:00Z',
          origin: 'Google Ads'
        },
        {
          id: '2',
          contactId: '2',
          value: 500,
          currency: 'BRL',
          date: '2025-10-19T14:30:00Z',
          origin: 'Meta Ads'
        },
        {
          id: '3',
          contactId: '3',
          value: 750,
          currency: 'BRL',
          date: '2025-10-18T09:15:00Z',
          origin: 'TikTok Ads'
        }
      ].slice(0, limit)
    }

    const response = await apiClient.get('/dashboard/latest-sales', {
      params: { limit }
    })
    return response.data
  },

  /**
   * Buscar atividades recentes
   */
  async getRecentActivities(limit: number = 10): Promise<Array<{
    id: string
    type: 'contact' | 'sale' | 'event'
    description: string
    timestamp: string
    metadata?: Record<string, any>
  }>> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return [
        {
          id: '1',
          type: 'sale' as const,
          description: 'Nova venda de R$ 1.000,00',
          timestamp: '2025-10-20T10:00:00Z',
          metadata: { value: 1000, origin: 'Google Ads' }
        },
        {
          id: '2',
          type: 'contact' as const,
          description: 'Novo contato via Meta Ads',
          timestamp: '2025-10-20T09:30:00Z',
          metadata: { origin: 'Meta Ads' }
        },
        {
          id: '3',
          type: 'event' as const,
          description: 'Evento enviado para TikTok',
          timestamp: '2025-10-20T09:15:00Z',
          metadata: { platform: 'tiktok', type: 'purchase' }
        }
      ].slice(0, limit)
    }

    const response = await apiClient.get('/dashboard/recent-activities', {
      params: { limit }
    })
    return response.data
  },

  /**
   * Buscar comparação de períodos
   */
  async getPeriodComparison(
    currentPeriod: '7d' | '30d' | '90d',
    compareWith: 'previous' | 'last_year'
  ): Promise<{
    current: DashboardMetrics
    previous: DashboardMetrics
    changes: {
      contacts: number
      sales: number
      revenue: number
      conversionRate: number
    }
  }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const previousMetrics: DashboardMetrics = {
        totalInvestment: 17500,
        totalRevenue: 35000,
        totalContacts: 1000,
        totalSales: 70,
        averageTicket: 500,
        costPerSale: 250,
        conversionRate: 7.0,
        impressions: 200000,
        clicks: 10000,
        cpc: 1.75,
        ctr: 5.0,
        revenue: {
          current: 35000,
          previous: 30000,
          change: 16.67
        },
        sales: {
          current: 70,
          previous: 60,
          change: 16.67
        },
        roi: {
          current: 2.0,
          previous: 1.7,
          change: 17.65
        },
        funnel: {
          impressions: 200000,
          clicks: 10000,
          contacts: 1000,
          sales: 70,
          ctr: 5.0,
          contactRate: 10.0,
          conversionRate: 7.0
        },
        financial: {
          adSpend: 12000,
          averageTicket: 500,
          costPerSale: 171.43,
          costPerClick: 1.2
        }
      }

      // Get metrics for current project
      const currentProjectId = localStorage.getItem('current_project_id')
      const currentMetrics = getDashboardMetrics(currentProjectId || '2')
      
      return {
        current: currentMetrics,
        previous: previousMetrics,
        changes: {
          contacts: 25.0, // +25%
          sales: 27.14,   // +27.14%
          revenue: 28.57, // +28.57%
          conversionRate: 1.71 // +1.71%
        }
      }
    }

    const response = await apiClient.get('/dashboard/period-comparison', {
      params: { currentPeriod, compareWith }
    })
    return response.data
  }
}
