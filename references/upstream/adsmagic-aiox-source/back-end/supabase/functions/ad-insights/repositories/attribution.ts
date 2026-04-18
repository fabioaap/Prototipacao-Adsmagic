/**
 * Repository de atribuicao para Ad Insights.
 *
 * Responsabilidades:
 * - Atribuicao por IDs normalizados em contact_origins (campaign_id/adgroup_id/ad_id)
 * - Contatos em modo eventos (cada registro em contact_origins conta)
 * - Vendas deduplicadas por sale_id por entidade
 */

import type { DateRange } from '../types.ts'
import type { SupabaseDbClient } from '../types-db.ts'

type SupabaseClient = SupabaseDbClient
type AttributionPlatform = 'meta' | 'google' | 'tiktok'
type AttributionLevel = 'campaign' | 'adgroup' | 'ad'

interface SalesAttribution {
  count: number
  revenue: number
}

interface ContactOriginRow {
  contact_id: string | null
  campaign_id: string | null
  adgroup_id: string | null
  ad_id: string | null
}

interface SaleRow {
  id: string
  contact_id: string | null
  value: number | string | null
}

export interface AttributionMetricsMap {
  contactsByEntityId: Record<string, number>
  salesByEntityId: Record<string, SalesAttribution>
}

const CONTACTS_PAGE_SIZE = 1000
const IN_FILTER_CHUNK_SIZE = 300

function normalizeEntityId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toRangeStart(date: string): string {
  return `${date}T00:00:00.000Z`
}

function toRangeEnd(date: string): string {
  return `${date}T23:59:59.999Z`
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (items.length === 0) return []
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
}

function resolveSourceApp(platform: AttributionPlatform): string {
  if (platform === 'meta') return 'facebook'
  if (platform === 'google') return 'google'
  return 'tiktok'
}

function extractLevelId(row: ContactOriginRow, level: AttributionLevel): string | null {
  if (level === 'campaign') return normalizeEntityId(row.campaign_id)
  if (level === 'adgroup') return normalizeEntityId(row.adgroup_id)
  return normalizeEntityId(row.ad_id)
}

async function fetchProjectContactIds(
  supabaseClient: SupabaseClient,
  projectId: string
): Promise<string[]> {
  const contactIds: string[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabaseClient
      .from('contacts')
      .select('id')
      .eq('project_id', projectId)
      .range(from, from + CONTACTS_PAGE_SIZE - 1)

    if (error) {
      console.error('[Attribution] Error fetching project contacts:', error)
      return contactIds
    }

    if (!data || data.length === 0) {
      break
    }

    for (const row of data as Array<{ id: string }>) {
      if (row.id) contactIds.push(row.id)
    }

    if (data.length < CONTACTS_PAGE_SIZE) {
      break
    }

    from += CONTACTS_PAGE_SIZE
  }

  return contactIds
}

async function fetchContactOriginEvents(
  supabaseClient: SupabaseClient,
  contactIds: string[],
  platform: AttributionPlatform,
  dateRange: DateRange
): Promise<ContactOriginRow[]> {
  if (contactIds.length === 0) return []

  const sourceApp = resolveSourceApp(platform)
  const chunks = chunkArray(contactIds, IN_FILTER_CHUNK_SIZE)
  const events: ContactOriginRow[] = []

  for (const chunk of chunks) {
    const { data, error } = await supabaseClient
      .from('contact_origins')
      .select('contact_id, campaign_id, adgroup_id, ad_id')
      .in('contact_id', chunk)
      .eq('source_app', sourceApp)
      .gte('acquired_at', toRangeStart(dateRange.start))
      .lte('acquired_at', toRangeEnd(dateRange.end))

    if (error) {
      console.error('[Attribution] Error fetching contact origins:', error)
      continue
    }

    events.push(...((data || []) as ContactOriginRow[]))
  }

  return events
}

async function fetchCompletedSalesByContacts(
  supabaseClient: SupabaseClient,
  projectId: string,
  contactIds: string[],
  dateRange: DateRange
): Promise<SaleRow[]> {
  if (contactIds.length === 0) return []

  const chunks = chunkArray(contactIds, IN_FILTER_CHUNK_SIZE)
  const sales: SaleRow[] = []

  for (const chunk of chunks) {
    const { data, error } = await supabaseClient
      .from('sales')
      .select('id, contact_id, value')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .in('contact_id', chunk)
      .gte('date', toRangeStart(dateRange.start))
      .lte('date', toRangeEnd(dateRange.end))

    if (error) {
      console.error('[Attribution] Error fetching sales by contacts:', error)
      continue
    }

    sales.push(...((data || []) as SaleRow[]))
  }

  return sales
}

function buildMetricsByLevel(
  events: ContactOriginRow[],
  sales: SaleRow[],
  level: AttributionLevel
): AttributionMetricsMap {
  const contactsByEntityId: Record<string, number> = {}
  const salesByEntityId: Record<string, SalesAttribution> = {}
  const saleIdsByEntity = new Map<string, Set<string>>()
  const entityIdsByContact = new Map<string, Set<string>>()

  for (const event of events) {
    const contactId = normalizeEntityId(event.contact_id)
    const entityId = extractLevelId(event, level)
    if (!contactId || !entityId) continue

    contactsByEntityId[entityId] = (contactsByEntityId[entityId] ?? 0) + 1

    if (!entityIdsByContact.has(contactId)) {
      entityIdsByContact.set(contactId, new Set<string>())
    }
    entityIdsByContact.get(contactId)?.add(entityId)
  }

  for (const sale of sales) {
    if (!sale.id || !sale.contact_id) continue
    const contactId = normalizeEntityId(sale.contact_id)
    if (!contactId) continue

    const entityIds = entityIdsByContact.get(contactId)
    if (!entityIds || entityIds.size === 0) continue

    const saleValue = Number(sale.value ?? 0)

    for (const entityId of entityIds) {
      if (!saleIdsByEntity.has(entityId)) {
        saleIdsByEntity.set(entityId, new Set<string>())
      }

      const saleSet = saleIdsByEntity.get(entityId)!
      if (saleSet.has(sale.id)) continue

      saleSet.add(sale.id)
      const current = salesByEntityId[entityId] ?? { count: 0, revenue: 0 }
      salesByEntityId[entityId] = {
        count: current.count + 1,
        revenue: current.revenue + saleValue,
      }
    }
  }

  return { contactsByEntityId, salesByEntityId }
}

/**
 * Retorna mapas de atribuicao por nivel de entidade.
 *
 * Contatos: modo eventos (todos os registros de contact_origins).
 * Vendas: deduplicadas por sale_id para cada entidade.
 */
export async function getAttributionMetricsByLevel(
  supabaseClient: SupabaseClient,
  projectId: string,
  platform: AttributionPlatform,
  dateRange: DateRange,
  level: AttributionLevel
): Promise<AttributionMetricsMap> {
  const contactIds = await fetchProjectContactIds(supabaseClient, projectId)
  if (contactIds.length === 0) {
    return { contactsByEntityId: {}, salesByEntityId: {} }
  }

  const events = await fetchContactOriginEvents(
    supabaseClient,
    contactIds,
    platform,
    dateRange
  )

  if (events.length === 0) {
    return { contactsByEntityId: {}, salesByEntityId: {} }
  }

  const eventContactIds = Array.from(
    new Set(
      events
        .map((event) => normalizeEntityId(event.contact_id))
        .filter((value): value is string => value !== null)
    )
  )

  const sales = await fetchCompletedSalesByContacts(
    supabaseClient,
    projectId,
    eventContactIds,
    dateRange
  )

  return buildMetricsByLevel(events, sales, level)
}

export async function getCampaignAttributionMetrics(
  supabaseClient: SupabaseClient,
  projectId: string,
  platform: AttributionPlatform,
  dateRange: DateRange
): Promise<AttributionMetricsMap> {
  return getAttributionMetricsByLevel(
    supabaseClient,
    projectId,
    platform,
    dateRange,
    'campaign'
  )
}

export async function getAdgroupAttributionMetrics(
  supabaseClient: SupabaseClient,
  projectId: string,
  platform: AttributionPlatform,
  dateRange: DateRange
): Promise<AttributionMetricsMap> {
  return getAttributionMetricsByLevel(
    supabaseClient,
    projectId,
    platform,
    dateRange,
    'adgroup'
  )
}

export async function getAdAttributionMetrics(
  supabaseClient: SupabaseClient,
  projectId: string,
  platform: AttributionPlatform,
  dateRange: DateRange
): Promise<AttributionMetricsMap> {
  return getAttributionMetricsByLevel(
    supabaseClient,
    projectId,
    platform,
    dateRange,
    'ad'
  )
}

/**
 * Legacy helper para summary de plataforma (mantido para compatibilidade).
 */
export async function getSalesByPlatform(
  supabaseClient: SupabaseClient,
  projectId: string,
  platform: AttributionPlatform,
  dateRange: DateRange
): Promise<SalesAttribution> {
  console.log('[Attribution] Getting sales by platform', {
    projectId,
    platform,
    dateRange,
  })

  const utmSources: Record<string, string[]> = {
    meta: ['facebook', 'fb', 'instagram', 'ig', 'meta'],
    google: ['google', 'adwords', 'googleads'],
    tiktok: ['tiktok', 'tt'],
  }

  const sources = utmSources[platform] || []
  const clickIdField: Record<string, string> = {
    meta: 'fbclid',
    google: 'gclid',
    tiktok: 'ttclid',
  }
  const clickId = clickIdField[platform]

  const { data, error } = await supabaseClient
    .from('sales')
    .select('id, value')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .gte('date', toRangeStart(dateRange.start))
    .lte('date', toRangeEnd(dateRange.end))
    .or(
      `tracking_params->>'${clickId}'.neq.,` +
        sources.map((source) => `tracking_params->>'utm_source'.ilike.%${source}%`).join(',')
    )

  if (error) {
    console.error('[Attribution] Error fetching sales by platform:', error)
    return { count: 0, revenue: 0 }
  }

  const count = data?.length || 0
  const revenue = data?.reduce((sum, sale) => sum + Number(sale.value || 0), 0) || 0

  return { count, revenue }
}
