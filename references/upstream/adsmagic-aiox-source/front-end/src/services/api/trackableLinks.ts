/**
 * Trackable Links API Service
 *
 * Serviço dedicado aos endpoints da Edge Function `trackable-links`.
 * Mantém conversão de contrato backend/frontend em um único ponto.
 *
 * @module services/api/trackableLinks
 */

import { apiClient, getApiErrorMessage } from './client'
import { supabaseEnabled } from './supabaseClient'
import { adaptLinkFromBackend, type BackendLink } from '@/services/adapters/linkAdapter'
import type { Link, Result } from '@/types'

export interface CreateTrackableLinkInput {
  name: string
  initialMessage?: string
  whatsappNumber: string
}

export interface UpdateTrackableLinkInput {
  name?: string
  initialMessage?: string
  whatsappNumber?: string
  isActive?: boolean
}

interface BackendTrackableLinksListResponse {
  data: BackendLink[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

interface BackendLinkStatsResponse {
  link_id: string
  clicks_count: number
  contacts_count: number
  sales_count: number
  revenue: number
  conversion_rate: number
  avg_ticket: number
  accesses_by_day: Array<{ date: string; count: number }>
  accesses_by_device: Array<{ device: string; count: number }>
  accesses_by_country: Array<{ country: string; count: number }>
  top_utm_sources: Array<{ utm_source: string; count: number }>
}

export interface TrackableLinkStats {
  linkId: string
  clicksCount: number
  contactsCount: number
  salesCount: number
  revenue: number
  conversionRate: number
  avgTicket: number
  accessesByDay: Array<{ date: string; count: number }>
  accessesByDevice: Array<{ device: string; count: number }>
  accessesByCountry: Array<{ country: string; count: number }>
  topUtmSources: Array<{ utmSource: string; count: number }>
}

function mapBackendStats(row: BackendLinkStatsResponse): TrackableLinkStats {
  return {
    linkId: row.link_id,
    clicksCount: row.clicks_count,
    contactsCount: row.contacts_count,
    salesCount: row.sales_count,
    revenue: row.revenue,
    conversionRate: row.conversion_rate,
    avgTicket: row.avg_ticket,
    accessesByDay: row.accesses_by_day ?? [],
    accessesByDevice: row.accesses_by_device ?? [],
    accessesByCountry: row.accesses_by_country ?? [],
    topUtmSources: (row.top_utm_sources ?? []).map((item) => ({
      utmSource: item.utm_source,
      count: item.count
    }))
  }
}

function mapCreatePayload(projectId: string, input: CreateTrackableLinkInput): Record<string, unknown> {
  const normalizedInitialMessage = input.initialMessage?.trim()

  return {
    project_id: projectId,
    name: input.name,
    initial_message: normalizedInitialMessage ? normalizedInitialMessage : null,
    whatsapp_number: input.whatsappNumber,
    link_type: 'whatsapp',
    destination_url: null
  }
}

function mapUpdatePayload(input: UpdateTrackableLinkInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (input.name !== undefined) payload.name = input.name
  if (input.initialMessage !== undefined) {
    const normalizedInitialMessage = input.initialMessage.trim()
    payload.initial_message = normalizedInitialMessage ? normalizedInitialMessage : null
  }
  if (input.whatsappNumber !== undefined) payload.whatsapp_number = input.whatsappNumber
  if (input.isActive !== undefined) payload.is_active = input.isActive

  return payload
}

export async function getTrackableLinks(projectId: string): Promise<Result<Link[], Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: true, value: [] }
    }

    const response = await apiClient.get<BackendTrackableLinksListResponse>('/trackable-links', {
      params: {
        project_id: projectId,
        limit: 100,
        offset: 0
      }
    })

    const links = (response.data?.data ?? []).map(adaptLinkFromBackend)
    return { ok: true, value: links }
  } catch (error) {
    return { ok: false, error: new Error(getApiErrorMessage(error)) }
  }
}

export async function createTrackableLink(
  projectId: string,
  input: CreateTrackableLinkInput
): Promise<Result<Link, Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: false, error: new Error('Supabase desabilitado para criar links') }
    }

    const response = await apiClient.post<BackendLink>(
      '/trackable-links',
      mapCreatePayload(projectId, input)
    )

    return { ok: true, value: adaptLinkFromBackend(response.data) }
  } catch (error) {
    return { ok: false, error: new Error(getApiErrorMessage(error)) }
  }
}

export async function updateTrackableLink(
  linkId: string,
  input: UpdateTrackableLinkInput
): Promise<Result<Link, Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: false, error: new Error('Supabase desabilitado para atualizar links') }
    }

    const response = await apiClient.patch<BackendLink>(
      `/trackable-links/${linkId}`,
      mapUpdatePayload(input)
    )

    return { ok: true, value: adaptLinkFromBackend(response.data) }
  } catch (error) {
    return { ok: false, error: new Error(getApiErrorMessage(error)) }
  }
}

export async function deleteTrackableLink(linkId: string): Promise<Result<void, Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: false, error: new Error('Supabase desabilitado para deletar links') }
    }

    await apiClient.delete(`/trackable-links/${linkId}`)
    return { ok: true, value: undefined }
  } catch (error) {
    return { ok: false, error: new Error(getApiErrorMessage(error)) }
  }
}

export async function getTrackableLinkStats(linkId: string): Promise<Result<TrackableLinkStats, Error>> {
  try {
    if (!supabaseEnabled) {
      return { ok: false, error: new Error('Supabase desabilitado para carregar estatísticas') }
    }

    const response = await apiClient.get<BackendLinkStatsResponse>(`/trackable-links/${linkId}/stats`)
    return { ok: true, value: mapBackendStats(response.data) }
  } catch (error) {
    return { ok: false, error: new Error(getApiErrorMessage(error)) }
  }
}
