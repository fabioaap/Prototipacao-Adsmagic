import { supabase } from './supabaseClient'
import type { CompanySettings } from '@/types'

// Verifica se está em modo mock para evitar chamadas reais ao Supabase
// O supabaseClient retorna um stub (não null) quando mocks estão ativos,
// então precisamos verificar a variável de ambiente diretamente
const isMockMode = import.meta.env.VITE_USE_MOCK === 'true'

export const settingsService = {
  /**
   * Busca configurações de uma empresa
   */
  async getCompanySettings(companyId: string) {
    if (isMockMode || !supabase) {
      // Modo mock: evitar erro de cliente nulo e retornar configuração vazia
      return {
        id: 'mock-settings',
        company_id: companyId,
        theme: null,
        language: null,
        timezone: null,
        date_format: null,
        time_format: null,
        decimal_separator: null,
        thousands_separator: null,
        notifications_enabled: false,
        notification_email: null,
        digest_frequency: null,
        digest_time: null,
        default_attribution_model: null,
        auto_track_events: false,
        include_company_info: false,
        include_contact_info: false,
        report_timezone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } satisfies CompanySettings
    }

    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Atualiza configurações de uma empresa
   */
  async updateCompanySettings(companyId: string, updates: Partial<CompanySettings>) {
    if (isMockMode || !supabase) {
      // Modo mock: apenas retorna payload combinado
      return {
        id: 'mock-settings',
        company_id: companyId,
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as CompanySettings
    }

    const { data, error } = await supabase
      .from('company_settings')
      .update(updates)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
