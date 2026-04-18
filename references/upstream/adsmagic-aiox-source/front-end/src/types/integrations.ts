export type AdvertisingPlatform = 'meta' | 'google' | 'tiktok'

export interface AdMetricsData {
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
}

export interface AdTrackingTemplate {
  platform: AdvertisingPlatform
  title: string
  template: string
  copyEnabled: boolean
}

export type AdMetricsMap = Record<AdvertisingPlatform, AdMetricsData | null>

export type AdMetricsLoadingMap = Record<AdvertisingPlatform, boolean>

export type IntegrationPlatformKey = 'whatsapp' | AdvertisingPlatform

export type IntegrationActionKey =
  | 'connect'
  | 'disconnect'
  | 'reconnect'
  | 'sync'
  | 'view-details'

export interface IntegrationActionPayload {
  platform: IntegrationPlatformKey
  action: IntegrationActionKey
}
