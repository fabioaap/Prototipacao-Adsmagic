/**
 * Supabase REST client using service_role key
 * Direct fetch() — no SDK dependency
 */

interface SupabaseConfig {
  url: string
  serviceRoleKey: string
}

export class SupabaseRestClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(config: SupabaseConfig) {
    this.baseUrl = `${config.url}/rest/v1`
    this.headers = {
      'apikey': config.serviceRoleKey,
      'Authorization': `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    }
  }

  async select(
    table: string,
    query: Record<string, string> = {},
    select = '*'
  ): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams({ select, ...query })
    const response = await fetch(`${this.baseUrl}/${table}?${params}`, {
      method: 'GET',
      headers: this.headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Supabase SELECT ${table} failed (${response.status}): ${error}`)
    }

    return response.json()
  }

  async insert(
    table: string,
    data: Record<string, unknown> | Record<string, unknown>[]
  ): Promise<Record<string, unknown>[]> {
    const response = await fetch(`${this.baseUrl}/${table}`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Prefer': 'return=representation,resolution=merge-duplicates',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Supabase INSERT ${table} failed (${response.status}): ${error}`)
    }

    return response.json()
  }

  async update(
    table: string,
    data: Record<string, unknown>,
    filters: Record<string, string>
  ): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${this.baseUrl}/${table}?${params}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Supabase UPDATE ${table} failed (${response.status}): ${error}`)
    }

    return response.json()
  }

  async delete(
    table: string,
    filters: Record<string, string>
  ): Promise<void> {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${this.baseUrl}/${table}?${params}`, {
      method: 'DELETE',
      headers: this.headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Supabase DELETE ${table} failed (${response.status}): ${error}`)
    }
  }

  async rpc(functionName: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const url = `${this.baseUrl.replace('/rest/v1', '')}/rest/v1/rpc/${functionName}`
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Supabase RPC ${functionName} failed (${response.status}): ${error}`)
    }

    return response.json()
  }
}
