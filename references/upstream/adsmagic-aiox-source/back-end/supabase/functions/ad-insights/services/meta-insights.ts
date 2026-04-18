/**
 * Servico de integracao com Meta Marketing API
 *
 * Busca metricas de ads diretamente da API do Meta (Facebook/Instagram Ads)
 */

import type {
  AccountMetrics,
  CampaignMetrics,
  AdsetMetrics,
  AdMetrics,
  DateRange,
  MetaInsightsResponse,
  MetaCampaignsResponse,
  MetaAdsetsResponse,
  MetaAdsResponse,
  CampaignStatus,
} from '../types.ts'

const META_API_VERSION = 'v18.0'
const META_API_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

// Campos de insights que queremos buscar
const INSIGHTS_FIELDS = [
  'spend',
  'impressions',
  'reach',
  'clicks',
  'cpc',
  'cpm',
  'ctr',
  'actions',
].join(',')

// Prioridade de action_types para determinar o "resultado" principal
const RESULT_ACTION_PRIORITY = [
  'lead',
  'onsite_conversion.lead_grouped',
  'offsite_conversion.fb_pixel_lead',
  'onsite_conversion.messaging_conversation_started_7d',
  'messaging_conversation_started_7d',
  'offsite_conversion.fb_pixel_purchase',
  'omni_purchase',
  'landing_page_view',
  'link_click',
  'page_engagement',
  'post_engagement',
  'video_view',
]

// Labels para cada action_type
const ACTION_TYPE_LABELS: Record<string, { resultLabel: string; costLabel: string }> = {
  'lead': { resultLabel: 'Leads', costLabel: 'Por lead' },
  'onsite_conversion.lead_grouped': { resultLabel: 'Leads', costLabel: 'Por lead' },
  'offsite_conversion.fb_pixel_lead': { resultLabel: 'Leads', costLabel: 'Por lead' },
  'onsite_conversion.messaging_conversation_started_7d': { resultLabel: 'Conversas por mensagem', costLabel: 'Por conversa por mensagem' },
  'messaging_conversation_started_7d': { resultLabel: 'Conversas por mensagem', costLabel: 'Por conversa por mensagem' },
  'offsite_conversion.fb_pixel_purchase': { resultLabel: 'Compras', costLabel: 'Por compra' },
  'omni_purchase': { resultLabel: 'Compras', costLabel: 'Por compra' },
  'landing_page_view': { resultLabel: 'Visualizações da página', costLabel: 'Por visualização da página' },
  'link_click': { resultLabel: 'Cliques no link', costLabel: 'Por clique no link' },
  'page_engagement': { resultLabel: 'Engajamento', costLabel: 'Por engajamento' },
  'post_engagement': { resultLabel: 'Engajamento com publicação', costLabel: 'Por engajamento' },
  'video_view': { resultLabel: 'Visualizações de vídeo', costLabel: 'Por visualização de vídeo' },
}

// Campos de campanha
const CAMPAIGN_FIELDS = ['id', 'name', 'status', 'objective', 'daily_budget'].join(',')

// Campos de adset
const ADSET_FIELDS = ['id', 'name', 'status', 'campaign_id', 'daily_budget'].join(',')

// Campos de ad
const AD_FIELDS = ['id', 'name', 'status', 'adset_id', 'creative{id,thumbnail_url}'].join(',')

/**
 * Mapeia status do Meta para status padronizado
 */
function mapStatus(metaStatus: string): CampaignStatus {
  const statusMap: Record<string, CampaignStatus> = {
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    DELETED: 'DELETED',
    ARCHIVED: 'ARCHIVED',
    // Status adicionais do Meta
    PENDING_REVIEW: 'PAUSED',
    DISAPPROVED: 'PAUSED',
    PREAPPROVED: 'PAUSED',
    PENDING_BILLING_INFO: 'PAUSED',
    CAMPAIGN_PAUSED: 'PAUSED',
    ADSET_PAUSED: 'PAUSED',
  }
  return statusMap[metaStatus] || 'PAUSED'
}

interface ParsedInsights extends Omit<AccountMetrics, 'accountId' | 'accountName' | 'platform'> {
  actions?: { action_type: string; value: string }[]
}

/**
 * Parseia metricas do response da Meta API
 */
function parseInsights(data: MetaInsightsResponse['data'][0] | undefined): ParsedInsights {
  if (!data) {
    return {
      spend: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
    }
  }

  const spend = parseFloat(data.spend || '0')
  const impressions = parseInt(data.impressions || '0', 10)
  const reach = parseInt(data.reach || '0', 10)
  const clicks = parseInt(data.clicks || '0', 10)

  return {
    spend,
    impressions,
    reach,
    clicks,
    ctr: parseFloat(data.ctr || '0'),
    cpc: parseFloat(data.cpc || '0'),
    cpm: parseFloat(data.cpm || '0'),
    actions: data.actions,
  }
}

/**
 * Extrai o resultado principal a partir do array de actions da Meta API
 */
function extractPrimaryResult(
  actions: { action_type: string; value: string }[] | undefined,
  spend: number
): { results: number; resultType: string; costPerResult: number; costPerResultLabel: string } {
  if (!actions || actions.length === 0) {
    return { results: 0, resultType: '', costPerResult: 0, costPerResultLabel: '' }
  }

  // Tentar encontrar ação por prioridade
  for (const actionType of RESULT_ACTION_PRIORITY) {
    const action = actions.find((a) => a.action_type === actionType)
    if (action) {
      const count = parseInt(action.value, 10)
      const labels = ACTION_TYPE_LABELS[actionType] ?? {
        resultLabel: actionType,
        costLabel: `Por ${actionType}`,
      }
      return {
        results: count,
        resultType: labels.resultLabel,
        costPerResult: count > 0 ? spend / count : 0,
        costPerResultLabel: labels.costLabel,
      }
    }
  }

  // Fallback: primeira ação com valor > 0
  const firstAction = actions.find((a) => parseInt(a.value, 10) > 0)
  if (firstAction) {
    const count = parseInt(firstAction.value, 10)
    return {
      results: count,
      resultType: firstAction.action_type,
      costPerResult: count > 0 ? spend / count : 0,
      costPerResultLabel: `Por ${firstAction.action_type}`,
    }
  }

  return { results: 0, resultType: '', costPerResult: 0, costPerResultLabel: '' }
}

/**
 * Busca metricas agregadas de uma conta de ads
 */
export async function getAccountInsights(
  accountId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<AccountMetrics> {
  console.log('[Meta Insights] Fetching account insights', {
    accountId,
    dateRange,
  })

  const url = new URL(`${META_API_BASE_URL}/act_${accountId}/insights`)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('fields', INSIGHTS_FIELDS)
  url.searchParams.set('time_range', JSON.stringify({
    since: dateRange.start,
    until: dateRange.end,
  }))
  url.searchParams.set('level', 'account')

  const response = await fetch(url.toString())
  const data = await response.json() as MetaInsightsResponse | { error: { message: string } }

  if ('error' in data) {
    console.error('[Meta Insights] API Error:', data.error)
    throw new Error(`Meta API Error: ${data.error.message}`)
  }

  const insights = parseInsights(data.data?.[0])

  // Buscar nome da conta
  const accountUrl = new URL(`${META_API_BASE_URL}/act_${accountId}`)
  accountUrl.searchParams.set('access_token', accessToken)
  accountUrl.searchParams.set('fields', 'name')

  const accountResponse = await fetch(accountUrl.toString())
  const accountData = await accountResponse.json() as { name?: string; error?: { message: string } }

  return {
    ...insights,
    accountId,
    accountName: accountData.name || `Account ${accountId}`,
    platform: 'meta',
  }
}

/**
 * Busca campanhas com metricas
 */
export async function getCampaignsWithInsights(
  accountId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<Omit<CampaignMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[]> {
  console.log('[Meta Insights] Fetching campaigns', {
    accountId,
    dateRange,
  })

  const url = new URL(`${META_API_BASE_URL}/act_${accountId}/campaigns`)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('fields', `${CAMPAIGN_FIELDS},insights.time_range(${JSON.stringify({
    since: dateRange.start,
    until: dateRange.end,
  })}).fields(${INSIGHTS_FIELDS})`)
  url.searchParams.set('limit', '100')
  // Buscar apenas campanhas ativas ou pausadas (nao arquivadas/deletadas)
  url.searchParams.set('filtering', JSON.stringify([
    { field: 'effective_status', operator: 'IN', value: ['ACTIVE', 'PAUSED'] },
  ]))

  const response = await fetch(url.toString())
  const data = await response.json() as MetaCampaignsResponse | { error: { message: string } }

  if ('error' in data) {
    console.error('[Meta Insights] API Error:', data.error)
    throw new Error(`Meta API Error: ${data.error.message}`)
  }

  return data.data.map((campaign) => {
    const insights = parseInsights(campaign.insights?.data?.[0])
    const resultData = extractPrimaryResult(insights.actions, insights.spend)

    return {
      ...insights,
      actions: undefined,
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: mapStatus(campaign.status),
      objective: campaign.objective,
      ...resultData,
    }
  })
}

/**
 * Busca adsets de uma campanha com metricas
 */
export async function getAdsetsWithInsights(
  campaignId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<Omit<AdsetMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[]> {
  console.log('[Meta Insights] Fetching adsets', {
    campaignId,
    dateRange,
  })

  const url = new URL(`${META_API_BASE_URL}/${campaignId}/adsets`)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('fields', `${ADSET_FIELDS},insights.time_range(${JSON.stringify({
    since: dateRange.start,
    until: dateRange.end,
  })}).fields(${INSIGHTS_FIELDS})`)
  url.searchParams.set('limit', '100')

  const response = await fetch(url.toString())
  const data = await response.json() as MetaAdsetsResponse | { error: { message: string } }

  if ('error' in data) {
    console.error('[Meta Insights] API Error:', data.error)
    throw new Error(`Meta API Error: ${data.error.message}`)
  }

  return data.data.map((adset) => {
    const insights = parseInsights(adset.insights?.data?.[0])
    const resultData = extractPrimaryResult(insights.actions, insights.spend)

    return {
      ...insights,
      actions: undefined,
      adsetId: adset.id,
      adsetName: adset.name,
      campaignId: adset.campaign_id,
      status: mapStatus(adset.status),
      ...resultData,
    }
  })
}

/**
 * Busca anuncios de um adset com metricas
 */
export async function getAdsWithInsights(
  adsetId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<Omit<AdMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[]> {
  console.log('[Meta Insights] Fetching ads', {
    adsetId,
    dateRange,
  })

  const url = new URL(`${META_API_BASE_URL}/${adsetId}/ads`)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('fields', `${AD_FIELDS},insights.time_range(${JSON.stringify({
    since: dateRange.start,
    until: dateRange.end,
  })}).fields(${INSIGHTS_FIELDS})`)
  url.searchParams.set('limit', '100')

  const response = await fetch(url.toString())
  const data = await response.json() as MetaAdsResponse | { error: { message: string } }

  if ('error' in data) {
    console.error('[Meta Insights] API Error:', data.error)
    throw new Error(`Meta API Error: ${data.error.message}`)
  }

  return data.data.map((ad) => {
    const insights = parseInsights(ad.insights?.data?.[0])
    const resultData = extractPrimaryResult(insights.actions, insights.spend)

    return {
      ...insights,
      actions: undefined,
      adId: ad.id,
      adName: ad.name,
      adsetId: ad.adset_id,
      campaignId: '', // Sera preenchido pelo handler
      status: mapStatus(ad.status),
      creativeId: ad.creative?.id,
      thumbnailUrl: ad.creative?.thumbnail_url,
      ...resultData,
    }
  })
}

/**
 * Busca metricas diarias de uma campanha (para graficos)
 */
export async function getCampaignDailyInsights(
  campaignId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<{
  date: string
  spend: number
  impressions: number
  clicks: number
}[]> {
  console.log('[Meta Insights] Fetching daily insights', {
    campaignId,
    dateRange,
  })

  const url = new URL(`${META_API_BASE_URL}/${campaignId}/insights`)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('fields', 'spend,impressions,clicks')
  url.searchParams.set('time_range', JSON.stringify({
    since: dateRange.start,
    until: dateRange.end,
  }))
  url.searchParams.set('time_increment', '1') // Dados diarios
  url.searchParams.set('limit', '100')

  const response = await fetch(url.toString())
  const data = await response.json() as MetaInsightsResponse | { error: { message: string } }

  if ('error' in data) {
    console.error('[Meta Insights] API Error:', data.error)
    throw new Error(`Meta API Error: ${data.error.message}`)
  }

  return data.data.map((day) => ({
    date: day.date_start,
    spend: parseFloat(day.spend || '0'),
    impressions: parseInt(day.impressions || '0', 10),
    clicks: parseInt(day.clicks || '0', 10),
  }))
}
