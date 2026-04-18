/**
 * Tipos compartilhados para Ad Insights
 *
 * Define interfaces para metricas de ads de todas as plataformas
 */

// Plataformas suportadas
export type AdPlatform = 'meta' | 'google' | 'tiktok'

// Status de campanha padronizado
export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED'

// Periodo de consulta
export interface DateRange {
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
}

// Metricas base de ads
export interface BaseAdMetrics {
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number // clicks/impressions * 100
  cpc: number // spend/clicks
  cpm: number // spend/impressions * 1000
}

// Metricas de conta
export interface AccountMetrics extends BaseAdMetrics {
  accountId: string
  accountName: string
  platform: AdPlatform
}

// Metricas de campanha
export interface CampaignMetrics extends BaseAdMetrics {
  campaignId: string
  campaignName: string
  status: CampaignStatus
  objective?: string
  // Resultados (Meta Ads actions)
  results?: number
  resultType?: string
  costPerResult?: number
  costPerResultLabel?: string
  // Dados internos (relacionados via tracking_params)
  contacts: number
  sales: number
  revenue: number
  roas: number // revenue / spend
}

// Metricas de adset/grupo de anuncios
export interface AdsetMetrics extends BaseAdMetrics {
  adsetId: string
  adsetName: string
  campaignId: string
  status: CampaignStatus
  // Resultados (Meta Ads actions)
  results?: number
  resultType?: string
  costPerResult?: number
  costPerResultLabel?: string
  // Dados internos
  contacts: number
  sales: number
  revenue: number
  roas: number
}

// Metricas de anuncio
export interface AdMetrics extends BaseAdMetrics {
  adId: string
  adName: string
  adsetId: string
  campaignId: string
  status: CampaignStatus
  creativeId?: string
  thumbnailUrl?: string
  // Resultados (Meta Ads actions)
  results?: number
  resultType?: string
  costPerResult?: number
  costPerResultLabel?: string
  // Dados internos
  contacts: number
  sales: number
  revenue: number
  roas: number
}

// Dados de estagio do funil
export interface FunnelStageData {
  stageId: string
  stageName: string
  count: number
  conversionRate: number
}

// Metrica diaria para graficos
export interface DailyMetric {
  date: string // YYYY-MM-DD
  spend: number
  impressions: number
  clicks: number
  contacts: number
  sales: number
  revenue: number
}

// Performance completa de campanha/adset/ad
export interface AdPerformance extends CampaignMetrics {
  funnelData: FunnelStageData[]
  dailyMetrics: DailyMetric[]
}

// Resposta do endpoint summary
export interface AdInsightsSummary {
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  // Comparacao com periodo anterior
  spendDelta: number
  impressionsDelta: number
  clicksDelta: number
  // Breakdown por plataforma
  byPlatform: {
    platform: AdPlatform
    spend: number
    impressions: number
    clicks: number
  }[]
}

// Credenciais da conta de integracao
export interface IntegrationAccount {
  id: string
  integrationId: string
  externalAccountId: string
  externalAccountName: string
  accessToken: string
  platform: AdPlatform
  pixelId?: string
}

// Resposta da Meta API - Insights
export interface MetaInsightsResponse {
  data: {
    spend: string
    impressions: string
    reach?: string
    clicks?: string
    cpc?: string
    cpm?: string
    ctr?: string
    actions?: {
      action_type: string
      value: string
    }[]
    date_start: string
    date_stop: string
  }[]
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

// Resposta da Meta API - Campaigns
export interface MetaCampaignsResponse {
  data: {
    id: string
    name: string
    status: string
    objective?: string
    daily_budget?: string
    lifetime_budget?: string
    insights?: {
      data: MetaInsightsResponse['data']
    }
  }[]
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

// Resposta da Meta API - Adsets
export interface MetaAdsetsResponse {
  data: {
    id: string
    name: string
    status: string
    campaign_id: string
    daily_budget?: string
    insights?: {
      data: MetaInsightsResponse['data']
    }
  }[]
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

// Resposta da Meta API - Ads
export interface MetaAdsResponse {
  data: {
    id: string
    name: string
    status: string
    adset_id: string
    creative?: {
      id: string
      thumbnail_url?: string
    }
    insights?: {
      data: MetaInsightsResponse['data']
    }
  }[]
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}
