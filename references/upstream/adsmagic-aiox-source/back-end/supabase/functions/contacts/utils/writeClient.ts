import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Usa service_role quando disponível para writes auxiliares que não dependem de RLS.
 */
export function createWriteClient(supabaseClient: SupabaseDbClient): SupabaseDbClient {
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''

  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey)
  }

  return supabaseClient
}
