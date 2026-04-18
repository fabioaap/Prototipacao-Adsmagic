import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { Database } from '../../types/database.types.ts'

export type SupabaseDbClient = SupabaseClient<Database>

