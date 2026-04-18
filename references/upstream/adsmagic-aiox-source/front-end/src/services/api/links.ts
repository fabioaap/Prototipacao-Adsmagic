/**
 * Links API Service
 *
 * Gerencia todas as operações relacionadas a links de rastreamento.
 * Segue o padrão "Mock First, API Ready" para desenvolvimento.
 *
 * @module services/api/links
 */

import { apiClient } from './client'
import type { Link, CreateLinkDTO, UpdateLinkDTO, LinkStats } from '@/types'
import { MOCK_LINKS } from '@/mocks/links'

// Mock data para desenvolvimento (usando mocks centralizados)
// const MOCK_LINKS: Link[] = [
//   {
//     id: '1',
//     name: 'Link Principal',
//     url: 'https://adsmagic.com.br/click?link=1',
//     initialMessage: 'Olá! Vim do Google Ads',
//     isActive: true,
//     stats: {
//       clicks: 150,
//       contacts: 25,
//       sales: 5,
//       revenue: 2500
//     },
//     createdAt: '2025-10-20T10:00:00Z'
//   },
//   {
//     id: '2',
//     name: 'Link Facebook',
//     url: 'https://adsmagic.com.br/click?link=2',
//     initialMessage: 'Oi! Vi seu anúncio no Facebook',
//     isActive: true,
//     stats: {
//       clicks: 89,
//       contacts: 18,
//       sales: 3,
//       revenue: 1200
//     },
//     createdAt: '2025-10-19T14:30:00Z'
//   },
//   {
//     id: '3',
//     name: 'Link TikTok',
//     url: 'https://adsmagic.com.br/click?link=3',
//     initialMessage: 'Eaí! Vi seu vídeo no TikTok',
//     isActive: false,
//     stats: {
//       clicks: 45,
//       contacts: 8,
//       sales: 1,
//       revenue: 400
//     },
//     createdAt: '2025-10-18T09:15:00Z'
//   }
// ]

// Flag para alternar entre mock e API real
const USE_MOCK = false

export const linksService = {
  /**
   * Buscar todos os links
   */
  async getAll(): Promise<Link[]> {
    if (USE_MOCK) {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Filter by current project ID
      const currentProjectId = localStorage.getItem('current_project_id')
      if (currentProjectId) {
        return MOCK_LINKS.filter(link => link.projectId === currentProjectId)
      }
      
      return [...MOCK_LINKS]
    }

    const response = await apiClient.get<Link[]>('/links')
    return response.data
  },

  /**
   * Buscar link por ID
   */
  async getById(id: string): Promise<Link | null> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return MOCK_LINKS.find(link => link.id === id) || null
    }

    const response = await apiClient.get<Link>(`/links/${id}`)
    return response.data
  },

  /**
   * Criar novo link
   */
  async create(data: CreateLinkDTO): Promise<Link> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const id = `mock_${Date.now()}`
      const trackingUrl = `https://adsmagic.com.br/click?link=${id}`
      
      const newLink: Link = {
        id,
        projectId: localStorage.getItem('current_project_id') || '2',
        name: data.name,
        url: trackingUrl,
        trackingUrl,
        originId: data.originId,
        destinationUrl: data.url || trackingUrl,
        initialMessage: data.initialMessage,
        isActive: true,
        stats: {
          clicks: 0,
          contacts: 0,
          sales: 0,
          revenue: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      MOCK_LINKS.unshift(newLink)
      return newLink
    }

    const response = await apiClient.post<Link>('/links', data)
    return response.data
  },

  /**
   * Atualizar link
   */
  async update(id: string, data: UpdateLinkDTO): Promise<Link> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))

      const index = MOCK_LINKS.findIndex(link => link.id === id)
      if (index === -1) throw new Error('Link não encontrado')

      const existingLink = MOCK_LINKS[index]!
      const updatedLink: Link = {
        id: existingLink.id,
        projectId: existingLink.projectId,
        name: (data.name ?? existingLink.name) as string,
        url: existingLink.url,
        trackingUrl: existingLink.trackingUrl,
        originId: existingLink.originId,
        destinationUrl: existingLink.destinationUrl,
        initialMessage: data.initialMessage ?? existingLink.initialMessage,
        isActive: data.isActive ?? existingLink.isActive,
        stats: existingLink.stats,
        createdAt: existingLink.createdAt,
        updatedAt: new Date().toISOString()
      }
      
      MOCK_LINKS[index] = updatedLink
      return updatedLink
    }

    const response = await apiClient.patch<Link>(`/links/${id}`, data)
    return response.data
  },

  /**
   * Deletar link
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))

      const index = MOCK_LINKS.findIndex(link => link.id === id)
      if (index !== -1) {
        MOCK_LINKS.splice(index, 1)
      }
      return
    }

    await apiClient.delete(`/links/${id}`)
  },

  /**
   * Buscar estatísticas de um link
   */
  async getStats(id: string): Promise<LinkStats> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))

      const link = MOCK_LINKS.find(l => l.id === id)
      if (!link) throw new Error('Link não encontrado')

      return {
        clicks: link.stats.clicks,
        contacts: link.stats.contacts,
        sales: link.stats.sales,
        revenue: link.stats.revenue
      }
    }

    const response = await apiClient.get<LinkStats>(`/links/${id}/stats`)
    return response.data
  },

  /**
   * Ativar/desativar link
   */
  async toggleActive(id: string): Promise<Link> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300))

      const index = MOCK_LINKS.findIndex(link => link.id === id)
      if (index === -1) throw new Error('Link não encontrado')

      const existingLink = MOCK_LINKS[index]!
      const updatedLink: Link = {
        id: existingLink.id,
        projectId: existingLink.projectId,
        name: existingLink.name,
        url: existingLink.url,
        trackingUrl: existingLink.trackingUrl,
        originId: existingLink.originId,
        destinationUrl: existingLink.destinationUrl,
        initialMessage: existingLink.initialMessage,
        isActive: !existingLink.isActive,
        stats: existingLink.stats,
        createdAt: existingLink.createdAt,
        updatedAt: new Date().toISOString()
      }
      
      MOCK_LINKS[index] = updatedLink
      return updatedLink
    }

    const response = await apiClient.patch<Link>(`/links/${id}/toggle`)
    return response.data
  },

  /**
   * Buscar métricas gerais de links
   */
  async getMetrics(): Promise<{
    totalLinks: number
    activeLinks: number
    totalClicks: number
    totalConversions: number
    totalRevenue: number
    averageConversionRate: number
  }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))

      const totalLinks = MOCK_LINKS.length
      const activeLinks = MOCK_LINKS.filter(l => l.isActive).length
      const totalClicks = MOCK_LINKS.reduce((sum, link) => sum + link.stats.clicks, 0)
      const totalConversions = MOCK_LINKS.reduce((sum, link) => sum + link.stats.contacts, 0)
      const totalRevenue = MOCK_LINKS.reduce((sum, link) => sum + link.stats.revenue, 0)
      const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

      return {
        totalLinks,
        activeLinks,
        totalClicks,
        totalConversions,
        totalRevenue,
        averageConversionRate
      }
    }

    const response = await apiClient.get('/links/metrics')
    return response.data
  }
}
