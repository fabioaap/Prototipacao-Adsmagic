import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SignJWT } from 'https://esm.sh/jose@5.9.6'
import { corsHeaders } from './utils/cors.ts'
import { successResponse, errorResponse } from './utils/response.ts'

const FEATUREBASE_ORG_URL = 'https://adsmagic.featurebase.app'
const FEATUREBASE_JWT_ENDPOINT = `${FEATUREBASE_ORG_URL}/api/v1/auth/access/jwt`
const DEFAULT_RETURN_TO = `${FEATUREBASE_ORG_URL}/`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return errorResponse('Method Not Allowed', 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || !user.email) {
      return errorResponse('Unauthorized', 401)
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    const fullName =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
      (user.user_metadata?.full_name as string | undefined) ||
      user.email.split('@')[0]

    const secret = Deno.env.get('FEATUREBASE_JWT_SECRET')
    if (!secret) {
      return errorResponse('FEATUREBASE_JWT_SECRET não configurado', 500)
    }

    const payload: Record<string, unknown> = {
      userId: user.id,
      email: user.email,
      name: fullName,
    }

    if (profile?.avatar_url) {
      payload.profilePicture = profile.avatar_url
    }

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(new TextEncoder().encode(secret))

    const url =
      `${FEATUREBASE_JWT_ENDPOINT}` +
      `?jwt=${encodeURIComponent(jwt)}` +
      `&return_to=${encodeURIComponent(DEFAULT_RETURN_TO)}`

    return successResponse({ url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return errorResponse(message, 500)
  }
})
