import type { LinkAccessInsert, Env } from './types'

export async function insertLinkAccess(
  data: LinkAccessInsert,
  env: Env
): Promise<void> {
  const url = `${env.SUPABASE_URL}/rest/v1/link_accesses`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 409) {
        console.log(`[tracking] Duplicate event ignored: ${data.event_id}`)
        return
      }
      const body = await response.text()
      console.error(`[tracking] Insert failed: ${response.status} ${body}`)
    }
  } catch (error) {
    console.error('[tracking] Insert error:', error)
  }
}
