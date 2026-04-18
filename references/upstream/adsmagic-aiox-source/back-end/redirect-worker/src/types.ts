export interface Env {
  LINK_CACHE: KVNamespace
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ALLOWED_HOST?: string
}

export interface CachedLinkData {
  id: string
  project_id: string
  destination_url: string | null
  link_type: 'whatsapp' | 'landing_page' | 'direct'
  whatsapp_number: string | null
  whatsapp_message_template: string | null
  initial_message: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  origin_id: string | null
  is_active: boolean
}

export interface TrackingParams {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  campaign_id: string | null
  adgroup_id: string | null
  ad_id: string | null
  fbclid: string | null
  gclid: string | null
  msclkid: string | null
  gbraid: string | null
  wbraid: string | null
  yclid: string | null
  ttclid: string | null
  referrer: string | null
  landing_url: string | null
}

export interface GeoData {
  ip_address: string | null
  country: string | null
  city: string | null
  state: string | null
}

export interface LinkAccessInsert {
  event_id: string
  link_id: string
  project_id: string
  access_uuid: string
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
}
