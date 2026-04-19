import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Verificar ambas as flags: VITE_USE_SUPABASE e VITE_USE_MOCK
// Vite sempre retorna strings das variáveis de ambiente, então precisamos comparar com strings
const useMockEnv = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true
const useSupabaseEnv = import.meta.env.VITE_USE_SUPABASE === 'true' || import.meta.env.VITE_USE_SUPABASE === true
// Se mocks estão ativos OU Supabase explicitamente desabilitado, desabilita Supabase
const useSupabase = !useMockEnv && useSupabaseEnv

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Criar cliente supabase; se desabilitado, cria stub local para evitar null no código
const fallbackUrl = 'http://localhost:54321'
const fallbackKey = 'public-anon-key'

let supabaseClient: ReturnType<typeof createClient<Database>>

if (!useSupabase) {
  console.warn('[DEV] Supabase desabilitado (mocks ativos ou VITE_USE_SUPABASE=false) - usando stub local')
  supabaseClient = createClient<Database>(fallbackUrl, fallbackKey)
} else {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

export const supabase = supabaseClient
export const supabaseEnabled = useSupabase
