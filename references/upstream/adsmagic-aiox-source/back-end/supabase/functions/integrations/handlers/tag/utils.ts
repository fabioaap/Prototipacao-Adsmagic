import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { errorResponse } from '../../utils/response.ts'

const VERIFY_TOKEN_QUERY_KEY = 'adsmagic_verify_token'
const VERIFY_ENDPOINT_QUERY_KEY = 'adsmagic_verify_endpoint'
const VERIFY_PROJECT_QUERY_KEY = 'adsmagic_verify_project_id'
const VERIFICATION_EXPIRATION_MS = 15 * 60 * 1000

export function getVerificationExpirationIso(): string {
  return new Date(Date.now() + VERIFICATION_EXPIRATION_MS).toISOString()
}

export function parseHttpUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, '')
}

export function buildVerificationUrl(
  siteUrl: string,
  token: string,
  pingEndpoint: string,
  projectId: string
): string {
  const verificationUrl = new URL(siteUrl)
  verificationUrl.searchParams.set(VERIFY_TOKEN_QUERY_KEY, token)
  verificationUrl.searchParams.set(VERIFY_ENDPOINT_QUERY_KEY, pingEndpoint)
  verificationUrl.searchParams.set(VERIFY_PROJECT_QUERY_KEY, projectId)
  return verificationUrl.toString()
}

export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function createVerificationToken(): string {
  return `${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`
}

export function getProjectIdHeader(req: Request): string | null {
  const projectId = req.headers.get('x-project-id') || req.headers.get('X-Project-ID')
  return projectId?.trim() || null
}

export function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export function getPingEndpointUrl(): string | null {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  if (!supabaseUrl) return null
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/integrations/tag/verification/ping`
}

export async function ensureProjectAccess(
  supabaseClient: ReturnType<typeof createClient>,
  projectId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from('project_users')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[Tag Verification] Error checking project access:', error)
    return false
  }

  return Boolean(data)
}

export function invalidPayloadResponse(message: string): Response {
  return errorResponse(message, 400)
}
