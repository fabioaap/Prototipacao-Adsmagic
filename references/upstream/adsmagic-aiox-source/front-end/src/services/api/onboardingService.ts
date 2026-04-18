import type { OnboardingData } from '@/types/onboarding'
import type { Json } from '@/types/database'
import { supabase } from './supabaseClient'

export interface OnboardingProgressData {
  id?: string
  user_id: string
  company_id?: string | null
  company_setup: boolean
  first_project_created: boolean
  integrations_connected: boolean
  first_contact_added: boolean
  onboarding_data: Record<string, any>
  is_completed: boolean
  completed_at?: string | null
  created_at?: string
  updated_at?: string
}

export const onboardingApiService = {
  /**
   * Busca progresso de onboarding do usuário
   */
  async getProgress(userId: string) {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return data
  },

  /**
   * Cria registro inicial de progresso
   */
  async createProgress(userId: string, onboardingData: any) {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .insert({
        user_id: userId,
        company_setup: false,
        first_project_created: false,
        integrations_connected: false,
        first_contact_added: false,
        onboarding_data: onboardingData,
        is_completed: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Atualiza progresso de onboarding
   */
  async updateProgress(userId: string, updates: Partial<OnboardingProgressData>) {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Marca onboarding como completo.
   * Usa upsert para garantir que o registro exista (evita 406 quando o trigger
   * ainda não criou a linha em auth.users → onboarding_progress).
   *
   * @param userId - ID do usuário
   * @param onboardingData - Dados do onboarding (OnboardingData ou objeto serializável para JSONB)
   */
  async completeOnboarding(
    userId: string,
    onboardingData: OnboardingData | Record<string, unknown> | null
  ) {
    const payload = {
      user_id: userId,
      onboarding_data: (onboardingData ?? {}) as Json,
      is_completed: true,
      completed_at: new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('onboarding_progress')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Marca uma etapa específica como completa
   */
  async markStepComplete(userId: string, step: keyof Pick<OnboardingProgressData, 'company_setup' | 'first_project_created' | 'integrations_connected' | 'first_contact_added'>) {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .update({
        [step]: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
