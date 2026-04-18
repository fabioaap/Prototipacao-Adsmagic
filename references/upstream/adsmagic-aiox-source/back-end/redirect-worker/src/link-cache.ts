import type { CachedLinkData, Env } from './types'

const KV_TTL_SECONDS = 300
const NEGATIVE_CACHE_TTL_SECONDS = 60
const KV_PREFIX = 'link:'

const LINK_COLUMNS = [
  'id', 'project_id', 'destination_url', 'link_type',
  'whatsapp_number', 'whatsapp_message_template', 'initial_message',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'origin_id', 'is_active',
].join(',')

export async function resolveLink(
  linkId: string,
  env: Env
): Promise<CachedLinkData | null> {
  const cacheKey = `${KV_PREFIX}${linkId}`

  const cached = await env.LINK_CACHE.get<CachedLinkData>(cacheKey, 'json')
  if (cached) {
    if (!cached.is_active) return null
    return cached
  }

  const link = await fetchLinkFromSupabase(linkId, env)

  if (!link) {
    await env.LINK_CACHE.put(
      cacheKey,
      JSON.stringify({ id: linkId, is_active: false }),
      { expirationTtl: NEGATIVE_CACHE_TTL_SECONDS }
    ).catch(() => {})
    return null
  }

  await env.LINK_CACHE.put(cacheKey, JSON.stringify(link), {
    expirationTtl: KV_TTL_SECONDS,
  }).catch(() => {})

  return link
}

async function fetchLinkFromSupabase(
  linkId: string,
  env: Env
): Promise<CachedLinkData | null> {
  const url = `${env.SUPABASE_URL}/rest/v1/trackable_links?id=eq.${linkId}&is_active=eq.true&select=${LINK_COLUMNS}`

  const response = await fetch(url, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Accept': 'application/vnd.pgrst.object+json',
    },
  })

  if (!response.ok) {
    if (response.status === 406) return null
    console.error(`[link-cache] Supabase REST error: ${response.status}`)
    return null
  }

  return response.json()
}
