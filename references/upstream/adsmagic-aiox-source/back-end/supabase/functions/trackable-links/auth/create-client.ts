import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { errorResponse } from '../utils/response.ts'
import type { SupabaseDbClient } from '../types-db.ts'

type AuthClientResult =
  | { ok: true; client: SupabaseDbClient; userId: string }
  | { ok: false; response: Response }

type PublicClientResult =
  | { ok: true; client: SupabaseDbClient }
  | { ok: false; response: Response }

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

/**
 * Creates authenticated client and validates JWT.
 */
export async function createAuthenticatedClient(req: Request): Promise<AuthClientResult> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return { ok: false, response: errorResponse('Unauthorized: Missing Authorization header', 401) }
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { ok: false, response: errorResponse('Unauthorized: Invalid token format', 401) }
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, response: errorResponse('Server misconfiguration: Missing Supabase env', 500) }
  }

  const client = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    }
  )

  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) {
    return { ok: false, response: errorResponse('Unauthorized: Invalid or expired token', 401) }
  }

  return { ok: true, client, userId: user.id }
}

/**
 * Creates service-role client for public endpoints.
 */
export function createPublicClient(): PublicClientResult {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, response: errorResponse('Server misconfiguration: Missing Supabase service role env', 500) }
  }

  const client = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  )

  return { ok: true, client }
}
