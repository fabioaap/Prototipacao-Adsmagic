/**
 * Mock data for dashboard metrics
 *
 * Contains realistic dashboard data calculated from:
 * - Sales data (revenue, conversion rates)
 * - Contact data (leads, funnel stages)
 * - Link data (clicks, performance)
 * - Event data (tracking, automation)
 * - Project isolation
 *
 * @module mocks/dashboard
 */

import type { DashboardMetrics, TimeSeriesData, OriginPerformance, MetricWithComparison } from '@/types'
import { MOCK_SALES } from './sales'
import { MOCK_CONTACTS } from './contacts'
import { MOCK_LINKS } from './links'
import { MOCK_ORIGINS } from './origins'

/**
 * Calculate dashboard metrics for project '2'
 */
function calculateProjectMetrics(): DashboardMetrics {
  // Filter data for project '2'
  const projectSales = MOCK_SALES.filter(sale => sale.projectId === '2')
  const projectContacts = MOCK_CONTACTS.filter(contact => contact.projectId === '2')
  const projectLinks = MOCK_LINKS.filter(link => link.projectId === '2')

  // Calculate metrics
  const wonSales = projectSales.filter(sale => sale.status === 'completed')
  const totalRevenue = wonSales.reduce((sum, sale) => sum + sale.value, 0)
  const totalInvestment = 25000 // Mock investment data
  const totalContacts = projectContacts.length
  const totalSales = wonSales.length
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0
  const roi = totalInvestment > 0 ? totalRevenue / totalInvestment : 0
  const costPerSale = totalSales > 0 ? totalInvestment / totalSales : 0
  const conversionRate = totalContacts > 0 ? (totalSales / totalContacts) * 100 : 0
  
  // Calculate ad metrics from links
  const totalClicks = projectLinks.reduce((sum, link) => sum + link.stats.clicks, 0)
  const totalImpressions = totalClicks * 20 // Estimate impressions (CTR ~5%)
  const cpc = totalClicks > 0 ? totalInvestment / totalClicks : 0
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  // Previous period values (mock - 30% lower)
  const previousRevenue = totalRevenue * 0.7
  const previousSales = Math.floor(totalSales * 0.7)
  const previousRoi = roi * 0.8

  // Calculate contact rate
  const contactRate = totalClicks > 0 ? (totalContacts / totalClicks) * 100 : 0

  return {
    totalInvestment,
    totalRevenue,
    totalContacts,
    totalSales,
    averageTicket,
    roi: {
      current: roi,
      previous: previousRoi,
      change: previousRoi > 0 ? ((roi - previousRoi) / previousRoi) * 100 : 0,
      trend: roi > previousRoi ? 'up' : roi < previousRoi ? 'down' : 'stable'
    },
    costPerSale,
    conversionRate,
    impressions: totalImpressions,
    clicks: totalClicks,
    cpc,
    ctr,
    revenue: {
      current: totalRevenue,
      previous: previousRevenue,
      change: previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      trend: totalRevenue > previousRevenue ? 'up' : totalRevenue < previousRevenue ? 'down' : 'stable'
    },
    sales: {
      current: totalSales,
      previous: previousSales,
      change: previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0,
      trend: totalSales > previousSales ? 'up' : totalSales < previousSales ? 'down' : 'stable'
    },
    funnel: {
      impressions: totalImpressions,
      clicks: totalClicks,
      contacts: totalContacts,
      sales: totalSales,
      ctr,
      contactRate,
      conversionRate
    },
    financial: {
      adSpend: totalInvestment,
      averageTicket,
      costPerSale,
      costPerClick: cpc
    }
  }
}

/**
 * Generate time series data for the last 30 days
 */
function generateTimeSeriesData(): TimeSeriesData[] {
  const data: TimeSeriesData[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Generate realistic daily data with some variation
    const baseContacts = 15 + Math.floor(Math.random() * 10)
    const baseSales = Math.floor(baseContacts * 0.1) + Math.floor(Math.random() * 3)
    
    data.push({
      date: date.toISOString().split('T')[0] as string,
      contacts: baseContacts,
      sales: baseSales,
      revenue: baseSales * (1500 + Math.random() * 1000) // Estimativa de receita
    })
  }
  
  return data
}

/**
 * Generate origin performance data
 */
function generateOriginPerformance(): OriginPerformance[] {
  const origins = MOCK_ORIGINS.filter(origin => 
    origin.type === 'system' || (origin.type === 'custom' && origin.projectId === '2')
  )
  
  return origins.map(origin => {
    // Get links for this origin
    const originLinks = MOCK_LINKS.filter(link => 
      link.originId === origin.id && link.projectId === '2'
    )
    
    // Calculate metrics
    const totalClicks = originLinks.reduce((sum, link) => sum + link.stats.clicks, 0)
    const totalContacts = originLinks.reduce((sum, link) => sum + link.stats.contacts, 0)
    const totalSales = originLinks.reduce((sum, link) => sum + link.stats.sales, 0)
    const totalRevenue = originLinks.reduce((sum, link) => sum + link.stats.revenue, 0)
    
    // Estimate investment based on clicks and CPC
    const estimatedCpc = origin.id === 'origin-google-ads' ? 2.5 : 
                        origin.id === 'origin-meta-ads' ? 1.8 :
                        origin.id === 'origin-instagram' ? 1.2 :
                        origin.id === 'origin-tiktok-ads' ? 1.5 : 1.0
    
    const investment = totalClicks * estimatedCpc
    const conversionRate = totalContacts > 0 ? (totalSales / totalContacts) * 100 : 0
    const roi = investment > 0 ? totalRevenue / investment : 0
    const costPerSale = totalSales > 0 ? investment / totalSales : 0
    const costPerContact = totalContacts > 0 ? investment / totalContacts : 0
    
    return {
      origin: origin.name,
      investment,
      contacts: totalContacts,
      sales: totalSales,
      revenue: totalRevenue,
      conversionRate,
      roi,
      costPerSale,
      costPerContact
    }
  })
}

/**
 * Mock dashboard metrics for project '2'
 */
export const MOCK_DASHBOARD_METRICS: DashboardMetrics = calculateProjectMetrics()

/**
 * Mock time series data for the last 30 days
 */
export const MOCK_TIME_SERIES_DATA: TimeSeriesData[] = generateTimeSeriesData()

/**
 * Mock origin performance data
 */
export const MOCK_ORIGIN_PERFORMANCE: OriginPerformance[] = generateOriginPerformance()

/**
 * Helper functions for dashboard data
 */

/**
 * Get dashboard metrics for a specific project
 */
export function getDashboardMetrics(projectId: string): DashboardMetrics {
  if (projectId === '2') {
    return MOCK_DASHBOARD_METRICS
  }
  
  // Return empty metrics for other projects
  const emptyMetric: MetricWithComparison = {
    current: 0,
    previous: 0,
    change: 0,
    trend: 'stable'
  }
  
  return {
    totalInvestment: 0,
    totalRevenue: 0,
    totalContacts: 0,
    totalSales: 0,
    averageTicket: 0,
    roi: emptyMetric,
    costPerSale: 0,
    conversionRate: 0,
    impressions: 0,
    clicks: 0,
    cpc: 0,
    ctr: 0,
    revenue: emptyMetric,
    sales: emptyMetric,
    funnel: {
      impressions: 0,
      clicks: 0,
      contacts: 0,
      sales: 0,
      ctr: 0,
      contactRate: 0,
      conversionRate: 0
    },
    financial: {
      adSpend: 0,
      averageTicket: 0,
      costPerSale: 0,
      costPerClick: 0
    }
  }
}

/**
 * Get time series data for a specific project and period
 */
export function getTimeSeriesData(projectId: string, _period: string = '30d'): TimeSeriesData[] {
  if (projectId !== '2') {
    return []
  }
  
  // For now, return the same data regardless of period
  // In a real implementation, this would filter by date range
  return MOCK_TIME_SERIES_DATA
}

/**
 * Get origin performance data for a specific project
 */
export function getOriginPerformance(projectId: string): OriginPerformance[] {
  if (projectId !== '2') {
    return []
  }
  
  return MOCK_ORIGIN_PERFORMANCE
}

/**
 * Get top performing origins
 */
export function getTopPerformingOrigins(projectId: string, limit: number = 5): OriginPerformance[] {
  const performance = getOriginPerformance(projectId)
  return performance
    .sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0))
    .slice(0, limit)
}

/**
 * Get recent sales for dashboard
 */
export function getRecentSales(projectId: string, limit: number = 5) {
  if (projectId !== '2') {
    return []
  }
  
  const projectSales = MOCK_SALES.filter(sale => sale.projectId === projectId)
  const wonSales = projectSales.filter(sale => sale.status === 'completed')
  
  return wonSales
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(sale => {
      const contact = MOCK_CONTACTS.find(c => c.id === sale.contactId)
      return {
        id: sale.id,
        contactName: contact?.name || 'Contato não encontrado',
        value: sale.value,
        createdAt: sale.createdAt
      }
    })
}

/**
 * Get funnel conversion data
 */
export function getFunnelConversionData(projectId: string) {
  if (projectId !== '2') {
    return []
  }
  
  const projectContacts = MOCK_CONTACTS.filter(contact => contact.projectId === projectId)
  
  // Count contacts by stage
  const stageCounts = projectContacts.reduce((acc, contact) => {
    const stage = contact.stage
    acc[stage] = (acc[stage] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Calculate conversion rates
  const totalContacts = projectContacts.length
  
  return Object.entries(stageCounts).map(([stage, count]) => ({
    stage,
    count,
    conversionRate: totalContacts > 0 ? (count / totalContacts) * 100 : 0
  }))
}

/**
 * Get daily performance data
 */
export function getDailyPerformance(projectId: string, days: number = 7) {
  if (projectId !== '2') {
    return []
  }
  
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Generate realistic daily performance
    const contacts = 10 + Math.floor(Math.random() * 15)
    const sales = Math.floor(contacts * 0.1) + Math.floor(Math.random() * 2)
    const revenue = sales * (1500 + Math.random() * 1000)
    const investment = contacts * (1.5 + Math.random() * 1.0)
    
    data.push({
      date: date.toISOString().split('T')[0],
      contacts,
      sales,
      revenue,
      investment,
      roi: investment > 0 ? revenue / investment : 0
    })
  }
  
  return data
}

/**
 * Get conversion funnel data
 */
export function getConversionFunnel(projectId: string) {
  if (projectId !== '2') {
    return []
  }
  
  const projectContacts = MOCK_CONTACTS.filter(contact => contact.projectId === projectId)
  
  // Define funnel stages
  const stages = [
    { id: 'stage-contact-initiated', name: 'Contato Iniciado' },
    { id: 'stage-qualification', name: 'Qualificação' },
    { id: 'stage-proposal-sent', name: 'Proposta Enviada' },
    { id: 'stage-negotiation', name: 'Negociação' },
    { id: 'stage-sale', name: 'Venda Realizada' }
  ]
  
  return stages.map(stage => {
    const count = projectContacts.filter(contact => contact.stage === stage.id).length
    const conversionRate = projectContacts.length > 0 ? (count / projectContacts.length) * 100 : 0
    
    return {
      stage: stage.name,
      count,
      conversionRate
    }
  })
}

/**
 * Get performance comparison (current vs previous period)
 */
export function getPerformanceComparison(projectId: string) {
  if (projectId !== '2') {
    return null
  }
  
  const currentMetrics = getDashboardMetrics(projectId)
  
  // Mock previous period data (30% lower performance)
  const previousMetrics = {
    totalInvestment: currentMetrics.totalInvestment * 0.7,
    totalRevenue: currentMetrics.totalRevenue * 0.7,
    totalContacts: Math.floor(currentMetrics.totalContacts * 0.7),
    totalSales: Math.floor(currentMetrics.totalSales * 0.7),
    averageTicket: currentMetrics.averageTicket * 0.9,
    roi: {
      current: currentMetrics.roi.current * 0.8,
      previous: currentMetrics.roi.previous * 0.8,
      change: currentMetrics.roi.change * 0.8,
      trend: currentMetrics.roi.trend
    },
    costPerSale: currentMetrics.costPerSale * 1.1,
    conversionRate: currentMetrics.conversionRate * 0.9,
    impressions: Math.floor(currentMetrics.impressions * 0.7),
    clicks: Math.floor(currentMetrics.clicks * 0.7),
    cpc: currentMetrics.cpc * 1.1,
    ctr: currentMetrics.ctr * 0.9
  }
  
  return {
    current: currentMetrics,
    previous: previousMetrics,
    changes: {
      totalInvestment: ((currentMetrics.totalInvestment - previousMetrics.totalInvestment) / previousMetrics.totalInvestment) * 100,
      totalRevenue: ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue) * 100,
      totalContacts: ((currentMetrics.totalContacts - previousMetrics.totalContacts) / previousMetrics.totalContacts) * 100,
      totalSales: ((currentMetrics.totalSales - previousMetrics.totalSales) / previousMetrics.totalSales) * 100,
      roi: ((currentMetrics.roi.current - previousMetrics.roi.current) / previousMetrics.roi.current) * 100,
      conversionRate: ((currentMetrics.conversionRate - previousMetrics.conversionRate) / previousMetrics.conversionRate) * 100
    }
  }
}