/**
 * Link Adapter
 * Converts between backend (snake_case) and frontend (camelCase) formats
 * 
 * Backend contract: /back-end/types.ts:205-235
 */

import type { Link } from '@/types/models'

/**
 * Backend TrackableLink type (snake_case from database)
 */
export interface BackendLink {
  id: string
  project_id: string
  name: string
  destination_url: string | null
  tracking_url: string | null
  whatsapp_number?: string | null
  short_url?: string
  initial_message?: string | null
  origin_id: string | null
  is_active: boolean
  clicks_count?: number
  contacts_count?: number
  sales_count?: number
  revenue?: number
  stats?: {
    clicks: number
    contacts: number
    sales: number
    revenue: number
  }
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
  created_at: string
  updated_at: string
}

/**
 * Converts backend Link to frontend format
 * Maps snake_case → camelCase
 */
export function adaptLinkFromBackend(raw: BackendLink): Link {
  const stats = raw.stats ?? {
    clicks: raw.clicks_count ?? 0,
    contacts: raw.contacts_count ?? 0,
    sales: raw.sales_count ?? 0,
    revenue: raw.revenue ?? 0,
  }

  const trackingUrl = raw.tracking_url ?? ''

  return {
    id: raw.id,
    projectId: raw.project_id,
    name: raw.name,
    destinationUrl: raw.destination_url ?? '',
    trackingUrl,
    url: trackingUrl,  // Alias for compatibility
    shortUrl: raw.short_url,
    initialMessage: raw.initial_message ?? undefined,
    originId: raw.origin_id ?? '',
    whatsappNumber: raw.whatsapp_number ?? undefined,
    isActive: raw.is_active,
    stats,
    utmSource: raw.utm_source ?? undefined,
    utmMedium: raw.utm_medium ?? undefined,
    utmCampaign: raw.utm_campaign ?? undefined,
    utmTerm: raw.utm_term ?? undefined,
    utmContent: raw.utm_content ?? undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

/**
 * Converts frontend Link to backend format
 * Maps camelCase → snake_case
 */
export function adaptLinkToBackend(link: Partial<Link>): Partial<BackendLink> {
  return {
    ...(link.id && { id: link.id }),
    ...(link.projectId && { project_id: link.projectId }),
    ...(link.name && { name: link.name }),
    ...(link.destinationUrl && { destination_url: link.destinationUrl }),
    ...(link.trackingUrl && { tracking_url: link.trackingUrl }),
    ...(link.shortUrl && { short_url: link.shortUrl }),
    ...(link.initialMessage && { initial_message: link.initialMessage }),
    ...(link.originId && { origin_id: link.originId }),
    ...(link.isActive !== undefined && { is_active: link.isActive }),
    ...(link.stats && { stats: link.stats }),
    ...(link.utmSource && { utm_source: link.utmSource }),
    ...(link.utmMedium && { utm_medium: link.utmMedium }),
    ...(link.utmCampaign && { utm_campaign: link.utmCampaign }),
    ...(link.utmTerm && { utm_term: link.utmTerm }),
    ...(link.utmContent && { utm_content: link.utmContent }),
    ...(link.createdAt && { created_at: link.createdAt }),
    ...(link.updatedAt && { updated_at: link.updatedAt }),
  }
}

/**
 * Converts array of backend Links to frontend format
 */
export function adaptLinksFromBackend(rawList: BackendLink[]): Link[] {
  return rawList.map(adaptLinkFromBackend)
}
