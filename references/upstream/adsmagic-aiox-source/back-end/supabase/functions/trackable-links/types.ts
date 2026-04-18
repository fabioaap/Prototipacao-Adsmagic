/**
 * Tipos TypeScript para Edge Function de Links Rastreáveis
 * 
 * @module trackable-links/types
 */

/** Tipos de link suportados */
export type LinkType = 'whatsapp' | 'landing_page' | 'direct'

/**
 * Representa um link rastreável
 */
export interface TrackableLink {
  id: string
  project_id: string
  name: string
  destination_url: string | null
  tracking_url: string | null
  initial_message: string | null
  origin_id: string | null
  whatsapp_number: string | null
  whatsapp_message_template: string | null
  link_type: LinkType
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  is_active: boolean
  clicks_count: number
  contacts_count: number
  sales_count: number
  revenue: number
  created_at: string
  updated_at: string
}

/**
 * DTO para criação de link
 */
export interface CreateTrackableLinkDTO {
  project_id: string
  name: string
  destination_url?: string | null
  initial_message?: string | null
  origin_id?: string | null
  whatsapp_number?: string | null
  whatsapp_message_template?: string | null
  link_type: LinkType
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
}

/**
 * DTO para atualização de link
 */
export interface UpdateTrackableLinkDTO {
  name?: string
  destination_url?: string | null
  initial_message?: string | null
  origin_id?: string | null
  whatsapp_number?: string | null
  whatsapp_message_template?: string | null
  link_type?: LinkType
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  is_active?: boolean
}

/**
 * Resposta de listagem de links
 */
export interface TrackableLinksListResponse {
  data: TrackableLink[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

/**
 * Representa um acesso a um link
 */
export interface LinkAccess {
  id: string
  event_id: string
  link_id: string
  project_id: string
  access_uuid: string
  contact_id: string | null
  whatsapp_protocol: string | null
  user_agent: string | null
  ip_address: string | null
  city: string | null
  country: string | null
  state: string | null
  device: string | null
  fbclid: string | null
  gclid: string | null
  msclkid: string | null
  gbraid: string | null
  wbraid: string | null
  yclid: string | null
  ttclid: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  campaign_id: string | null
  adgroup_id: string | null
  ad_id: string | null
  referrer: string | null
  landing_page: string | null
  created_at: string
  converted_at: string | null
}

/**
 * DTO para registro de acesso
 */
export interface RegisterAccessDTO {
  event_id: string
  access_uuid: string
  whatsapp_protocol?: string | null
  user_agent?: string | null
  ip_address?: string | null
  city?: string | null
  country?: string | null
  state?: string | null
  device?: string | null
  fbclid?: string | null
  gclid?: string | null
  msclkid?: string | null
  gbraid?: string | null
  wbraid?: string | null
  yclid?: string | null
  ttclid?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  campaign_id?: string | null
  adgroup_id?: string | null
  ad_id?: string | null
  referrer?: string | null
  landing_page?: string | null
}

/**
 * Resposta de geração de link WhatsApp
 */
export interface GenerateWhatsAppResponse {
  protocol: string
  url_tracker: string
  whatsapp_url: string
}

/**
 * Estatísticas do link
 */
export interface LinkStats {
  link_id: string
  clicks_count: number
  contacts_count: number
  sales_count: number
  revenue: number
  conversion_rate: number
  avg_ticket: number
  accesses_by_day: Array<{
    date: string
    count: number
  }>
  accesses_by_device: Array<{
    device: string
    count: number
  }>
  accesses_by_country: Array<{
    country: string
    count: number
  }>
  top_utm_sources: Array<{
    utm_source: string
    count: number
  }>
}
