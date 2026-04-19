import { supabase } from './supabaseClient'

export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1)
    if (error) throw error
    return true
  } catch (error) {
    console.error('❌ Erro na conexão:', error)
    return false
  }
}
