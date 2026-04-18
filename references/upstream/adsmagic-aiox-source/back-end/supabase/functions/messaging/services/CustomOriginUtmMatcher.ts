import type { SupabaseDbClient } from '../types-db.ts'

export type UtmSourceMatchMode = 'exact' | 'contains'

interface OriginUtmMatchRuleRow {
  id: string
  utm_source_match_mode: UtmSourceMatchMode | null
  utm_source_match_value: string | null
  created_at: string
}

export interface MatchedOriginByUtmSource {
  originId: string
  mode: UtmSourceMatchMode
  value: string
}

export function normalizeUtmSourceValue(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 ? normalized : null
}

function parseCreatedAt(value: string): number {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER
}

export function resolveBestOriginUtmSourceMatch(
  rules: OriginUtmMatchRuleRow[],
  utmSourceRaw: string | null | undefined
): MatchedOriginByUtmSource | null {
  const utmSource = normalizeUtmSourceValue(utmSourceRaw)
  if (!utmSource) return null

  const exactMatches: OriginUtmMatchRuleRow[] = []
  const containsMatches: OriginUtmMatchRuleRow[] = []

  for (const rule of rules) {
    const mode = rule.utm_source_match_mode
    const value = normalizeUtmSourceValue(rule.utm_source_match_value)
    if (!mode || !value) continue

    if (mode === 'exact') {
      if (utmSource === value) exactMatches.push({ ...rule, utm_source_match_value: value })
      continue
    }

    if (mode === 'contains' && utmSource.includes(value)) {
      containsMatches.push({ ...rule, utm_source_match_value: value })
    }
  }

  if (exactMatches.length > 0) {
    exactMatches.sort((a, b) => parseCreatedAt(a.created_at) - parseCreatedAt(b.created_at))
    const winner = exactMatches[0]
    return winner
      ? {
          originId: winner.id,
          mode: 'exact',
          value: winner.utm_source_match_value!,
        }
      : null
  }

  if (containsMatches.length > 0) {
    containsMatches.sort((a, b) => {
      const aValueLength = (a.utm_source_match_value || '').length
      const bValueLength = (b.utm_source_match_value || '').length
      if (aValueLength !== bValueLength) return bValueLength - aValueLength
      return parseCreatedAt(a.created_at) - parseCreatedAt(b.created_at)
    })

    const winner = containsMatches[0]
    return winner
      ? {
          originId: winner.id,
          mode: 'contains',
          value: winner.utm_source_match_value!,
        }
      : null
  }

  return null
}

export async function findCustomOriginByUtmSourceMatch(params: {
  supabaseClient: SupabaseDbClient
  projectId: string
  utmSource: string | null | undefined
}): Promise<MatchedOriginByUtmSource | null> {
  const { supabaseClient, projectId, utmSource } = params
  const normalizedSource = normalizeUtmSourceValue(utmSource)
  if (!normalizedSource) return null

  const { data, error } = await supabaseClient
    .from('origins')
    .select('id, utm_source_match_mode, utm_source_match_value, created_at')
    .eq('project_id', projectId)
    .eq('type', 'custom')
    .eq('is_active', true)
    .not('utm_source_match_value', 'is', null)

  if (error || !data || data.length === 0) return null
  return resolveBestOriginUtmSourceMatch(data as OriginUtmMatchRuleRow[], normalizedSource)
}
