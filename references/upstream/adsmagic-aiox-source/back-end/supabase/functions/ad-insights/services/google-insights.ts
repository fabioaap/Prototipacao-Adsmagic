/**
 * Servico de integracao com Google Ads API
 *
 * Busca metricas de ads diretamente da API do Google Ads
 * Usa GAQL (Google Ads Query Language) para consultas
 */

import type {
  AccountMetrics,
  CampaignMetrics,
  AdsetMetrics,
  AdMetrics,
  DateRange,
  CampaignStatus,
} from '../types.ts'

const GOOGLE_ADS_API_VERSION = 'v23'
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`

/**
 * Mapeia status do Google Ads para status padronizado
 */
function mapStatus(googleStatus: string): CampaignStatus {
  const statusMap: Record<string, CampaignStatus> = {
    ENABLED: 'ACTIVE',
    PAUSED: 'PAUSED',
    REMOVED: 'DELETED',
    // Status adicionais
    UNKNOWN: 'PAUSED',
    UNSPECIFIED: 'PAUSED',
  }
  return statusMap[googleStatus] || 'PAUSED'
}

/**
 * Converte micros para valor monetario (Google usa micros: 1000000 = $1)
 */
function microsToValue(micros: string | number): number {
  const value = typeof micros === 'string' ? parseInt(micros, 10) : micros
  return value / 1000000
}

/**
 * Formata data para formato do Google Ads (YYYY-MM-DD)
 */
function formatDate(date: string): string {
  return date // Ja esta no formato correto
}

/**
 * Executa query GAQL no Google Ads API
 */
async function executeGoogleAdsQuery(
  customerId: string,
  accessToken: string,
  query: string,
  developerToken: string
): Promise<unknown[]> {
  const url = `${GOOGLE_ADS_BASE_URL}/customers/${customerId}/googleAds:searchStream`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('[Google Insights] API Error:', errorData)
    throw new Error(
      `Google Ads API Error: ${errorData.error?.message || response.statusText}`
    )
  }

  const data = await response.json()

  // searchStream retorna array de batches
  const results: unknown[] = []
  if (Array.isArray(data)) {
    for (const batch of data) {
      if (batch.results) {
        results.push(...batch.results)
      }
    }
  }

  return results
}

/**
 * Busca metricas agregadas de uma conta Google Ads
 */
export async function getAccountInsights(
  customerId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<AccountMetrics> {
  console.log('[Google Insights] Fetching account insights', {
    customerId,
    dateRange,
  })

  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || ''

  if (!developerToken) {
    console.warn('[Google Insights] Missing GOOGLE_ADS_DEVELOPER_TOKEN')
    return {
      accountId: customerId,
      accountName: `Account ${customerId}`,
      platform: 'google',
      spend: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
    }
  }

  const query = `
    SELECT
      customer.id,
      customer.descriptive_name,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc
    FROM customer
    WHERE segments.date BETWEEN '${formatDate(dateRange.start)}' AND '${formatDate(dateRange.end)}'
  `

  try {
    const results = await executeGoogleAdsQuery(
      customerId,
      accessToken,
      query,
      developerToken
    )

    if (results.length === 0) {
      return {
        accountId: customerId,
        accountName: `Account ${customerId}`,
        platform: 'google',
        spend: 0,
        impressions: 0,
        reach: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
      }
    }

    // Agregar metricas de todos os dias
    let totalSpend = 0
    let totalImpressions = 0
    let totalClicks = 0
    let accountName = `Account ${customerId}`

    for (const row of results as Array<{
      customer?: { id?: string; descriptiveName?: string }
      metrics?: {
        costMicros?: string
        impressions?: string
        clicks?: string
      }
    }>) {
      if (row.customer?.descriptiveName) {
        accountName = row.customer.descriptiveName
      }
      if (row.metrics) {
        totalSpend += microsToValue(row.metrics.costMicros || '0')
        totalImpressions += parseInt(row.metrics.impressions || '0', 10)
        totalClicks += parseInt(row.metrics.clicks || '0', 10)
      }
    }

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0
    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0

    return {
      accountId: customerId,
      accountName,
      platform: 'google',
      spend: totalSpend,
      impressions: totalImpressions,
      reach: 0, // Google Ads nao tem reach como Meta
      clicks: totalClicks,
      ctr,
      cpc,
      cpm,
    }
  } catch (error) {
    console.error('[Google Insights] Error fetching account insights:', error)
    return {
      accountId: customerId,
      accountName: `Account ${customerId}`,
      platform: 'google',
      spend: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
    }
  }
}

/**
 * Busca campanhas com metricas
 */
export async function getCampaignsWithInsights(
  customerId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<Omit<CampaignMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[]> {
  console.log('[Google Insights] Fetching campaigns', {
    customerId,
    dateRange,
  })

  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || ''

  if (!developerToken) {
    console.warn('[Google Insights] Missing GOOGLE_ADS_DEVELOPER_TOKEN')
    return []
  }

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc
    FROM campaign
    WHERE segments.date BETWEEN '${formatDate(dateRange.start)}' AND '${formatDate(dateRange.end)}'
      AND campaign.status IN ('ENABLED', 'PAUSED')
  `

  try {
    const results = await executeGoogleAdsQuery(
      customerId,
      accessToken,
      query,
      developerToken
    )

    // Agrupar por campanha (resultados vem por dia)
    const campaignMap = new Map<
      string,
      {
        id: string
        name: string
        status: CampaignStatus
        objective: string
        spend: number
        impressions: number
        clicks: number
      }
    >()

    for (const row of results as Array<{
      campaign?: {
        id?: string
        name?: string
        status?: string
        advertisingChannelType?: string
      }
      metrics?: {
        costMicros?: string
        impressions?: string
        clicks?: string
      }
    }>) {
      const campaignId = row.campaign?.id || ''
      const existing = campaignMap.get(campaignId)

      if (existing) {
        existing.spend += microsToValue(row.metrics?.costMicros || '0')
        existing.impressions += parseInt(row.metrics?.impressions || '0', 10)
        existing.clicks += parseInt(row.metrics?.clicks || '0', 10)
      } else {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: row.campaign?.name || '',
          status: mapStatus(row.campaign?.status || ''),
          objective: row.campaign?.advertisingChannelType || '',
          spend: microsToValue(row.metrics?.costMicros || '0'),
          impressions: parseInt(row.metrics?.impressions || '0', 10),
          clicks: parseInt(row.metrics?.clicks || '0', 10),
        })
      }
    }

    // Converter para array com metricas derivadas
    return Array.from(campaignMap.values()).map((campaign) => {
      const ctr =
        campaign.impressions > 0
          ? (campaign.clicks / campaign.impressions) * 100
          : 0
      const cpc = campaign.clicks > 0 ? campaign.spend / campaign.clicks : 0
      const cpm =
        campaign.impressions > 0
          ? (campaign.spend / campaign.impressions) * 1000
          : 0

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        spend: campaign.spend,
        impressions: campaign.impressions,
        reach: 0,
        clicks: campaign.clicks,
        ctr,
        cpc,
        cpm,
      }
    })
  } catch (error) {
    console.error('[Google Insights] Error fetching campaigns:', error)
    return []
  }
}

/**
 * Busca grupos de anuncios (ad groups) de uma campanha
 */
export async function getAdGroupsWithInsights(
  customerId: string,
  campaignId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<Omit<AdsetMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[]> {
  console.log('[Google Insights] Fetching ad groups', {
    customerId,
    campaignId,
    dateRange,
  })

  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || ''

  if (!developerToken) {
    return []
  }

  const query = `
    SELECT
      ad_group.id,
      ad_group.name,
      ad_group.status,
      ad_group.campaign,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks
    FROM ad_group
    WHERE segments.date BETWEEN '${formatDate(dateRange.start)}' AND '${formatDate(dateRange.end)}'
      AND campaign.id = ${campaignId}
      AND ad_group.status IN ('ENABLED', 'PAUSED')
  `

  try {
    const results = await executeGoogleAdsQuery(
      customerId,
      accessToken,
      query,
      developerToken
    )

    // Agrupar por ad group
    const adGroupMap = new Map<
      string,
      {
        id: string
        name: string
        status: CampaignStatus
        campaignId: string
        spend: number
        impressions: number
        clicks: number
      }
    >()

    for (const row of results as Array<{
      adGroup?: {
        id?: string
        name?: string
        status?: string
        campaign?: string
      }
      metrics?: {
        costMicros?: string
        impressions?: string
        clicks?: string
      }
    }>) {
      const adGroupId = row.adGroup?.id || ''
      const existing = adGroupMap.get(adGroupId)

      if (existing) {
        existing.spend += microsToValue(row.metrics?.costMicros || '0')
        existing.impressions += parseInt(row.metrics?.impressions || '0', 10)
        existing.clicks += parseInt(row.metrics?.clicks || '0', 10)
      } else {
        adGroupMap.set(adGroupId, {
          id: adGroupId,
          name: row.adGroup?.name || '',
          status: mapStatus(row.adGroup?.status || ''),
          campaignId: row.adGroup?.campaign?.replace('customers/', '').split('/')[2] || campaignId,
          spend: microsToValue(row.metrics?.costMicros || '0'),
          impressions: parseInt(row.metrics?.impressions || '0', 10),
          clicks: parseInt(row.metrics?.clicks || '0', 10),
        })
      }
    }

    return Array.from(adGroupMap.values()).map((adGroup) => {
      const ctr =
        adGroup.impressions > 0
          ? (adGroup.clicks / adGroup.impressions) * 100
          : 0
      const cpc = adGroup.clicks > 0 ? adGroup.spend / adGroup.clicks : 0
      const cpm =
        adGroup.impressions > 0
          ? (adGroup.spend / adGroup.impressions) * 1000
          : 0

      return {
        adsetId: adGroup.id,
        adsetName: adGroup.name,
        campaignId: adGroup.campaignId,
        status: adGroup.status,
        spend: adGroup.spend,
        impressions: adGroup.impressions,
        reach: 0,
        clicks: adGroup.clicks,
        ctr,
        cpc,
        cpm,
      }
    })
  } catch (error) {
    console.error('[Google Insights] Error fetching ad groups:', error)
    return []
  }
}

/**
 * Busca anuncios de um ad group
 */
export async function getAdsWithInsights(
  customerId: string,
  adGroupId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<Omit<AdMetrics, 'contacts' | 'sales' | 'revenue' | 'roas'>[]> {
  console.log('[Google Insights] Fetching ads', {
    customerId,
    adGroupId,
    dateRange,
  })

  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || ''

  if (!developerToken) {
    return []
  }

  const query = `
    SELECT
      ad_group_ad.ad.id,
      ad_group_ad.ad.name,
      ad_group_ad.status,
      ad_group_ad.ad_group,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks
    FROM ad_group_ad
    WHERE segments.date BETWEEN '${formatDate(dateRange.start)}' AND '${formatDate(dateRange.end)}'
      AND ad_group.id = ${adGroupId}
      AND ad_group_ad.status IN ('ENABLED', 'PAUSED')
  `

  try {
    const results = await executeGoogleAdsQuery(
      customerId,
      accessToken,
      query,
      developerToken
    )

    // Agrupar por ad
    const adMap = new Map<
      string,
      {
        id: string
        name: string
        status: CampaignStatus
        adsetId: string
        spend: number
        impressions: number
        clicks: number
      }
    >()

    for (const row of results as Array<{
      adGroupAd?: {
        ad?: { id?: string; name?: string }
        status?: string
        adGroup?: string
      }
      metrics?: {
        costMicros?: string
        impressions?: string
        clicks?: string
      }
    }>) {
      const adId = row.adGroupAd?.ad?.id || ''
      const existing = adMap.get(adId)

      if (existing) {
        existing.spend += microsToValue(row.metrics?.costMicros || '0')
        existing.impressions += parseInt(row.metrics?.impressions || '0', 10)
        existing.clicks += parseInt(row.metrics?.clicks || '0', 10)
      } else {
        adMap.set(adId, {
          id: adId,
          name: row.adGroupAd?.ad?.name || `Ad ${adId}`,
          status: mapStatus(row.adGroupAd?.status || ''),
          adsetId: adGroupId,
          spend: microsToValue(row.metrics?.costMicros || '0'),
          impressions: parseInt(row.metrics?.impressions || '0', 10),
          clicks: parseInt(row.metrics?.clicks || '0', 10),
        })
      }
    }

    return Array.from(adMap.values()).map((ad) => {
      const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
      const cpc = ad.clicks > 0 ? ad.spend / ad.clicks : 0
      const cpm = ad.impressions > 0 ? (ad.spend / ad.impressions) * 1000 : 0

      return {
        adId: ad.id,
        adName: ad.name,
        adsetId: ad.adsetId,
        campaignId: '', // Sera preenchido pelo handler
        status: ad.status,
        spend: ad.spend,
        impressions: ad.impressions,
        reach: 0,
        clicks: ad.clicks,
        ctr,
        cpc,
        cpm,
      }
    })
  } catch (error) {
    console.error('[Google Insights] Error fetching ads:', error)
    return []
  }
}

/**
 * Busca metricas diarias de uma campanha (para graficos)
 */
export async function getCampaignDailyInsights(
  customerId: string,
  campaignId: string,
  accessToken: string,
  dateRange: DateRange
): Promise<{
  date: string
  spend: number
  impressions: number
  clicks: number
}[]> {
  console.log('[Google Insights] Fetching daily insights', {
    customerId,
    campaignId,
    dateRange,
  })

  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || ''

  if (!developerToken) {
    return []
  }

  const query = `
    SELECT
      segments.date,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks
    FROM campaign
    WHERE segments.date BETWEEN '${formatDate(dateRange.start)}' AND '${formatDate(dateRange.end)}'
      AND campaign.id = ${campaignId}
    ORDER BY segments.date
  `

  try {
    const results = await executeGoogleAdsQuery(
      customerId,
      accessToken,
      query,
      developerToken
    )

    return (
      results as Array<{
        segments?: { date?: string }
        metrics?: {
          costMicros?: string
          impressions?: string
          clicks?: string
        }
      }>
    ).map((row) => ({
      date: row.segments?.date || '',
      spend: microsToValue(row.metrics?.costMicros || '0'),
      impressions: parseInt(row.metrics?.impressions || '0', 10),
      clicks: parseInt(row.metrics?.clicks || '0', 10),
    }))
  } catch (error) {
    console.error('[Google Insights] Error fetching daily insights:', error)
    return []
  }
}
