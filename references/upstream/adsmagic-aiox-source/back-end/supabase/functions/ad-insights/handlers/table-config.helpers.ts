import type { AdPlatform } from '../types.ts'

export const ALLOWED_COLUMN_IDS = [
  'name',
  'spend',
  'impressions',
  'clicks',
  'ctr',
  'contacts',
  'sales',
  'results',
  'costPerResult',
  'cpc',
  'cpm',
  'revenue',
  'roas',
] as const

const ALLOWED_COLUMN_ID_SET = new Set<string>(ALLOWED_COLUMN_IDS)

// Defaults para Google/TikTok (sem results/costPerResult — requer conversion tracking)
const DEFAULT_COLUMNS: string[] = ['name', 'spend', 'impressions', 'clicks', 'ctr', 'contacts', 'sales']

// Defaults para Meta (inclui results/costPerResult — sempre disponível via actions)
const META_DEFAULT_COLUMNS: string[] = ['name', 'spend', 'results', 'costPerResult', 'impressions', 'clicks', 'ctr', 'contacts', 'sales']

function getDefaultColumnsForPlatform(platform: AdPlatform): string[] {
  if (platform === 'meta') return [...META_DEFAULT_COLUMNS]
  return [...DEFAULT_COLUMNS]
}

export const MAX_SELECTED_COLUMNS = 20

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const unique = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (!trimmed) continue
    unique.add(trimmed)
  }

  return Array.from(unique)
}

export function sanitizeColumnIds(ids: string[]): string[] {
  const out: string[] = []
  for (const id of ids) {
    // Accept standard column IDs and custom metric IDs (prefixed with custom:)
    if (!ALLOWED_COLUMN_ID_SET.has(id) && !id.startsWith('custom:')) continue
    if (!out.includes(id)) out.push(id)
  }
  return out
}

export function mergeOrder(selectedColumnIds: string[], requestedOrder: string[]): string[] {
  const order = requestedOrder.filter((id) => selectedColumnIds.includes(id))
  for (const columnId of selectedColumnIds) {
    if (!order.includes(columnId)) {
      order.push(columnId)
    }
  }
  return order
}

export function resolvePlatform(value: string | null): AdPlatform | null {
  if (!value) return null
  return ['meta', 'google', 'tiktok'].includes(value)
    ? (value as AdPlatform)
    : null
}

export function resolveTableColumns(
  platform: AdPlatform,
  selectedColumnIdsRaw: unknown,
  columnOrderRaw: unknown
): {
  selectedColumnIds: string[]
  columnOrder: string[]
} {
  const defaultSelectedColumnIds = getDefaultColumnsForPlatform(platform)
  const selectedColumnIds = sanitizeColumnIds(
    normalizeStringArray(selectedColumnIdsRaw)
  )
  const resolvedSelectedColumnIds = selectedColumnIds.length > 0
    ? selectedColumnIds
    : defaultSelectedColumnIds
  const columnOrder = sanitizeColumnIds(
    normalizeStringArray(columnOrderRaw)
  )
  const resolvedColumnOrder = mergeOrder(
    resolvedSelectedColumnIds,
    columnOrder.length > 0 ? columnOrder : resolvedSelectedColumnIds
  )

  return {
    selectedColumnIds: resolvedSelectedColumnIds,
    columnOrder: resolvedColumnOrder,
  }
}
