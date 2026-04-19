/**
 * Contact origin types — ported from Deno Edge Function
 */

export interface ClickIds {
  gclid?: string
  wbraid?: string
  gbraid?: string
  fbclid?: string
  ctwaClid?: string
  ttclid?: string
  [key: string]: string | undefined
}

export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

export interface CampaignIds {
  campaign_id?: string
  campaign_name?: string
  adgroup_id?: string
  adgroup_name?: string
  creative_id?: string
  keyword?: string
  matchtype?: string
  placement?: string
  adset_id?: string
  adset_name?: string
  ad_id?: string
  ad_name?: string
  target_id?: string
  [key: string]: string | undefined
}

export interface OriginMetadata {
  source_type?: 'ad' | 'organic' | 'referral' | 'direct' | 'other'
  source_app?: 'google' | 'facebook' | 'instagram' | 'tiktok' | 'other'
  source_id?: string
  source_url?: string
  device?: 'mobile' | 'desktop' | 'tablet'
  network?: string
  first_interaction_at?: string
  last_interaction_at?: string
}

export interface StandardizedSourceData {
  clickIds?: ClickIds
  utm?: UtmParams
  campaign?: CampaignIds
  metadata?: OriginMetadata
}

export interface ContactOrigin {
  id: string
  contact_id: string
  origin_id: string
  link_access_id?: string | null
  acquired_at: string
  created_at: string
  observations?: string | null
  attribution_source?: string | null
  attribution_priority?: number | null
  campaign_id?: string | null
  ad_id?: string | null
  adgroup_id?: string | null
  source_app?: string | null
  source_data?: StandardizedSourceData | null
}

export interface ProcessContactOriginParams {
  normalizedMessage: import('./messaging.js').NormalizedMessage
  projectId: string
  skipOriginPersistence?: boolean
}

export interface ProcessContactOriginResult {
  contactId: string
  created: boolean
  originId?: string
  sourceData?: StandardizedSourceData
}
