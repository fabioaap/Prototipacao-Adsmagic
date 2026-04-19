/**
 * Mock data for tracking links
 *
 * Contains 10 realistic tracking links with varied:
 * - Names and descriptions
 * - URLs
 * - Origin associations
 * - Statistics (clicks, conversions, revenue)
 * - Project isolation
 *
 * @module mocks/links
 */

import type { Link, CreateLinkDTO, UpdateLinkDTO, LinkStats } from '@/types'

/**
 * Generate mock link data
 */
const generateMockLink = (
  id: string, 
  name: string, 
  url: string, 
  originId: string, 
  isActive: boolean = true,
  stats: LinkStats = {
    clicks: Math.floor(Math.random() * 1000),
    contacts: Math.floor(Math.random() * 500),
    sales: Math.floor(Math.random() * 50),
    revenue: Math.floor(Math.random() * 10000),
  }
): Link => {
  const trackingUrl = `${window.location.origin}/l/${id}`
  
  return {
    id,
    projectId: '2',
    name,
    url: trackingUrl,
    trackingUrl,
    destinationUrl: url, // URL final de destino
    originId,
    initialMessage: `Olá! Cheguei pelo link ${name}.`,
    isActive,
    stats,
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Mock tracking links data (10 records)
 */
export const MOCK_LINKS: Link[] = [
  // Google Ads Links
  generateMockLink(
    'link-001',
    'Google Ads - Odontologia Sorriso',
    'https://adsmagic.com/go/odontologia-sorriso',
    'origin-google-ads',
    true,
    {
      clicks: 1250,
      contacts: 89,
      sales: 12,
      revenue: 28500
    }
  ),
  generateMockLink(
    'link-002',
    'Google Ads - Consultoria Empresarial',
    'https://adsmagic.com/go/consultoria-empresarial',
    'origin-google-ads',
    true,
    {
      clicks: 890,
      contacts: 45,
      sales: 8,
      revenue: 15600
    }
  ),
  generateMockLink(
    'link-003',
    'Google Ads - E-commerce Moda',
    'https://adsmagic.com/go/ecommerce-moda',
    'origin-google-ads',
    true,
    {
      clicks: 2100,
      contacts: 156,
      sales: 23,
      revenue: 42000
    }
  ),

  // Meta Ads Links
  generateMockLink(
    'link-004',
    'Meta Ads - Academia Fitness',
    'https://adsmagic.com/go/academia-fitness',
    'origin-meta-ads',
    true,
    {
      clicks: 1800,
      contacts: 134,
      sales: 18,
      revenue: 32400
    }
  ),
  generateMockLink(
    'link-005',
    'Meta Ads - Clínica Estética',
    'https://adsmagic.com/go/clinica-estetica',
    'origin-meta-ads',
    true,
    {
      clicks: 950,
      contacts: 67,
      sales: 9,
      revenue: 18900
    }
  ),

  // Instagram Links
  generateMockLink(
    'link-006',
    'Instagram - Loja de Roupas',
    'https://adsmagic.com/go/instagram-roupas',
    'origin-instagram',
    true,
    {
      clicks: 3200,
      contacts: 245,
      sales: 31,
      revenue: 62000
    }
  ),
  generateMockLink(
    'link-007',
    'Instagram - Restaurante Gourmet',
    'https://adsmagic.com/go/instagram-restaurante',
    'origin-instagram',
    true,
    {
      clicks: 1500,
      contacts: 98,
      sales: 15,
      revenue: 22500
    }
  ),

  // TikTok Ads Links
  generateMockLink(
    'link-008',
    'TikTok Ads - Curso Online',
    'https://adsmagic.com/go/tiktok-curso-online',
    'origin-tiktok-ads',
    true,
    {
      clicks: 2800,
      contacts: 189,
      sales: 25,
      revenue: 47500
    }
  ),

  // Custom Origins Links
  generateMockLink(
    'link-009',
    'LinkedIn - B2B Consultoria',
    'https://adsmagic.com/go/linkedin-b2b',
    'origin-custom-1',
    true,
    {
      clicks: 450,
      contacts: 23,
      sales: 4,
      revenue: 8400
    }
  ),
  generateMockLink(
    'link-010',
    'Evento - Feira de Negócios',
    'https://adsmagic.com/go/evento-feira',
    'origin-custom-2',
    false, // Inactive link
    {
      clicks: 120,
      contacts: 8,
      sales: 1,
      revenue: 2100
    }
  )
]

/**
 * Helper functions for mock links operations
 */

/**
 * Filter links by project ID
 */
export function filterLinksByProject(links: Link[], projectId: string): Link[] {
  return links.filter(link => link.projectId === projectId)
}

/**
 * Filter links by origin ID
 */
export function filterLinksByOrigin(links: Link[], originId: string): Link[] {
  return links.filter(link => link.originId === originId)
}

/**
 * Filter links by active status
 */
export function filterLinksByActive(links: Link[], isActive: boolean): Link[] {
  return links.filter(link => link.isActive === isActive)
}

/**
 * Get links statistics
 */
export function getLinksStats(links: Link[]) {
  const activeLinks = links.filter(link => link.isActive)
  const totalClicks = links.reduce((sum, link) => sum + link.stats.clicks, 0)
  const totalContacts = links.reduce((sum, link) => sum + link.stats.contacts, 0)
  const totalSales = links.reduce((sum, link) => sum + link.stats.sales, 0)
  const totalRevenue = links.reduce((sum, link) => sum + link.stats.revenue, 0)
  
  const averageCtr = totalClicks > 0 ? (totalContacts / totalClicks) * 100 : 0
  const averageConversion = totalContacts > 0 ? (totalSales / totalContacts) * 100 : 0
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0
  
  return {
    totalLinks: links.length,
    activeLinks: activeLinks.length,
    inactiveLinks: links.length - activeLinks.length,
    totalClicks,
    totalContacts,
    totalSales,
    totalRevenue,
    averageCtr,
    averageConversion,
    averageTicket
  }
}

/**
 * Get top performing links
 */
export function getTopPerformingLinks(links: Link[], limit: number = 5): Link[] {
  return links
    .filter(link => link.isActive)
    .sort((a, b) => b.stats.revenue - a.stats.revenue)
    .slice(0, limit)
}

/**
 * Get links by origin performance
 */
export function getLinksByOriginPerformance(links: Link[]) {
  const originStats = links.reduce((acc, link) => {
    const originId = link.originId
    if (!acc[originId]) {
      acc[originId] = {
        originId,
        totalClicks: 0,
        totalContacts: 0,
        totalSales: 0,
        totalRevenue: 0,
        linkCount: 0
      }
    }
    
    acc[originId].totalClicks += link.stats.clicks
    acc[originId].totalContacts += link.stats.contacts
    acc[originId].totalSales += link.stats.sales
    acc[originId].totalRevenue += link.stats.revenue
    acc[originId].linkCount += 1
    
    return acc
  }, {} as Record<string, any>)
  
  return Object.values(originStats).map((stats: any) => ({
    ...stats,
    averageCtr: stats.totalClicks > 0 ? (stats.totalContacts / stats.totalClicks) * 100 : 0,
    averageConversion: stats.totalContacts > 0 ? (stats.totalSales / stats.totalContacts) * 100 : 0,
    averageTicket: stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0
  }))
}

/**
 * Create a new link
 */
export function createMockLink(data: CreateLinkDTO): Link {
  const id = `link-${Date.now()}`
  const trackingUrl = data.url || `${window.location.origin}/l/${id}`
  
  const newLink: Link = {
    id,
    name: data.name as string,
    url: trackingUrl,
    trackingUrl,
    destinationUrl: data.destinationUrl || trackingUrl,
    originId: data.originId as string,
    initialMessage: data.initialMessage || `Olá! Cheguei pelo link ${data.name}.`,
    isActive: data.isActive !== false,
    stats: {
      clicks: 0,
      contacts: 0,
      sales: 0,
      revenue: 0
    },
    projectId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  MOCK_LINKS.push(newLink)
  return newLink
}

/**
 * Update a link
 */
export function updateMockLink(id: string, data: UpdateLinkDTO): Link | null {
  const linkIndex = MOCK_LINKS.findIndex(link => link.id === id)
  
  if (linkIndex === -1) {
    return null
  }
  
  const existingLink = MOCK_LINKS[linkIndex]
  if (!existingLink) {
    return null
  }
  
  const trackingUrl = data.destinationUrl ? `${window.location.origin}/l/${existingLink.id}` : existingLink.trackingUrl
  
  const updatedLink: Link = {
    ...existingLink,
    ...data,
    url: trackingUrl || existingLink.url,
    trackingUrl: trackingUrl || existingLink.trackingUrl,
    id: existingLink.id,
    name: (data.name || existingLink.name) as string,
    projectId: existingLink.projectId,
    originId: existingLink.originId, // originId não está em UpdateLinkDTO
    updatedAt: new Date().toISOString(),
  }
  
  MOCK_LINKS[linkIndex] = updatedLink
  return updatedLink
}

/**
 * Delete a link
 */
export function deleteMockLink(id: string): boolean {
  const linkIndex = MOCK_LINKS.findIndex(link => link.id === id)
  
  if (linkIndex === -1) {
    return false
  }
  
  MOCK_LINKS.splice(linkIndex, 1)
  return true
}

/**
 * Toggle link active status
 */
export function toggleMockLinkActive(id: string): Link | null {
  const linkIndex = MOCK_LINKS.findIndex(link => link.id === id)
  
  if (linkIndex === -1) {
    return null
  }
  
  const link = MOCK_LINKS[linkIndex]
  if (!link) return null
  
  link.isActive = !link.isActive
  link.updatedAt = new Date().toISOString()
  
  return link
}

/**
 * Get link by ID
 */
export function getMockLinkById(id: string): Link | null {
  return MOCK_LINKS.find(link => link.id === id) || null
}

/**
 * Get links by project
 */
export function getLinksByProject(projectId: string): Link[] {
  return MOCK_LINKS.filter(link => link.projectId === projectId)
}

/**
 * Get link statistics
 */
export function getMockLinkStats(id: string): LinkStats | null {
  const link = getMockLinkById(id)
  return link ? link.stats : null
}

/**
 * Update link statistics (simulate click/conversion)
 */
export function updateMockLinkStats(id: string, stats: Partial<LinkStats>): Link | null {
  const linkIndex = MOCK_LINKS.findIndex(link => link.id === id)
  
  if (linkIndex === -1) {
    return null
  }
  
  const link = MOCK_LINKS[linkIndex]
  if (!link) return null
  
  link.stats = {
    ...link.stats,
    ...stats
  }
  link.updatedAt = new Date().toISOString()
  
  return link
}

/**
 * Simulate link click
 */
export function simulateMockLinkClick(id: string): Link | null {
  const link = getMockLinkById(id)
  if (!link || !link.isActive) {
    return null
  }
  
  return updateMockLinkStats(id, {
    clicks: link.stats.clicks + 1
  })
}

/**
 * Simulate link conversion
 */
export function simulateMockLinkConversion(id: string, revenue: number = 0): Link | null {
  const link = getMockLinkById(id)
  if (!link || !link.isActive) {
    return null
  }
  
  return updateMockLinkStats(id, {
    contacts: link.stats.contacts + 1,
    sales: link.stats.sales + 1,
    revenue: link.stats.revenue + revenue
  })
}
