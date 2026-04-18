/**
 * Sale Adapter
 * Converts between backend (snake_case) and frontend (camelCase) formats
 * 
 * Backend contract: /back-end/types.ts:180-199
 * 
 * Key mappings:
 * - sale_date ↔ date
 * - lost_observations ↔ lostObservations
 */

import type { Sale, TrackingParams } from '@/types/models'

/**
 * Backend Sale type (snake_case from database)
 */
export interface BackendSale {
  id: string
  project_id: string
  contact_id: string
  value: number
  currency: string
  sale_date: string
  origin_id?: string
  status: 'completed' | 'lost'
  lost_reason?: string
  lost_observations?: string
  tracking_params: Record<string, unknown>
  created_at: string
  updated_at: string
}

/**
 * Converts backend tracking params to frontend format
 * Validates and extracts known tracking parameters
 */
function adaptTrackingParams(raw: Record<string, unknown>): TrackingParams | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined
  }

  const params: TrackingParams = {}
  
  if (typeof raw.gclid === 'string') params.gclid = raw.gclid
  if (typeof raw.gbraid === 'string') params.gbraid = raw.gbraid
  if (typeof raw.wbraid === 'string') params.wbraid = raw.wbraid
  if (typeof raw.fbclid === 'string') params.fbclid = raw.fbclid
  if (typeof raw.ttpclid === 'string') params.ttpclid = raw.ttpclid

  // Return undefined if no valid params found
  return Object.keys(params).length > 0 ? params : undefined
}

/**
 * Converts backend Sale to frontend format
 * Maps snake_case → camelCase
 */
export function adaptSaleFromBackend(raw: BackendSale): Sale {
  return {
    id: raw.id,
    projectId: raw.project_id,
    contactId: raw.contact_id,
    value: raw.value,
    currency: raw.currency,
    date: raw.sale_date,  // Maps sale_date → date
    origin: raw.origin_id,
    status: raw.status,
    lostReason: raw.lost_reason,
    lostObservations: raw.lost_observations,  // Maps lost_observations
    trackingParams: adaptTrackingParams(raw.tracking_params),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

/**
 * Converts frontend Sale to backend format
 * Maps camelCase → snake_case
 */
export function adaptSaleToBackend(sale: Partial<Sale>): Partial<BackendSale> {
  return {
    ...(sale.id && { id: sale.id }),
    ...(sale.projectId && { project_id: sale.projectId }),
    ...(sale.contactId && { contact_id: sale.contactId }),
    ...(sale.value !== undefined && { value: sale.value }),
    ...(sale.currency && { currency: sale.currency }),
    ...(sale.date && { sale_date: sale.date }),  // Maps date → sale_date
    ...(sale.origin && { origin_id: sale.origin }),
    ...(sale.status && { status: sale.status }),
    ...(sale.lostReason && { lost_reason: sale.lostReason }),
    ...(sale.lostObservations && { lost_observations: sale.lostObservations }),
    ...(sale.trackingParams && { tracking_params: sale.trackingParams as Record<string, unknown> }),
    ...(sale.createdAt && { created_at: sale.createdAt }),
    ...(sale.updatedAt && { updated_at: sale.updatedAt }),
  }
}

/**
 * Converts array of backend Sales to frontend format
 */
export function adaptSalesFromBackend(rawList: BackendSale[]): Sale[] {
  return rawList.map(adaptSaleFromBackend)
}

