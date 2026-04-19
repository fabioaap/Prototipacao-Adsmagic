/**
 * Serviço de onboarding
 * Mock implementation preparado para integração futura com Supabase
 */

import type { 
  OnboardingData, 
  OnboardingStatus 
} from '@/types/onboarding'
import { 
  onboardingDataSchema, 
  onboardingStatusSchema 
} from '@/types/onboarding'

// ============================================================================
// CONSTANTES
// ============================================================================

const STORAGE_KEYS = {
  ONBOARDING_DATA: 'adsmagic_onboarding_data',
  ONBOARDING_STATUS: 'adsmagic_onboarding_status',
} as const

// Simula delay de rede
const NETWORK_DELAY = 300

// ============================================================================
// INTERFACE DO SERVIÇO
// ============================================================================

/**
 * Interface do serviço de onboarding
 * Facilita troca entre mock e implementação real
 */
export interface OnboardingService {
  /**
   * Verifica se o onboarding foi completado
   */
  getOnboardingStatus(): Promise<OnboardingStatus>

  /**
   * Salva dados do onboarding
   */
  saveOnboardingData(data: OnboardingData): Promise<void>

  /**
   * Marca onboarding como completado
   */
  markOnboardingCompleted(): Promise<void>

  /**
   * Reseta status de onboarding (para testes)
   */
  resetOnboardingStatus(): Promise<void>
}

// ============================================================================
// IMPLEMENTAÇÃO MOCK
// ============================================================================

/**
 * Implementação mock do serviço de onboarding
 * Salva dados no localStorage e simula chamadas assíncronas
 */
class MockOnboardingService implements OnboardingService {
  /**
   * Simula delay de rede
   */
  private async simulateNetworkDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, NETWORK_DELAY))
  }

  /**
   * Verifica se o onboarding foi completado
   */
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    await this.simulateNetworkDelay()

    try {
      const savedStatus = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATUS)
      
      if (savedStatus) {
        const parsed = JSON.parse(savedStatus)
        
        // Converte strings de data para Date objects
        if (parsed.completedAt) {
          parsed.completedAt = new Date(parsed.completedAt)
        }
        if (parsed.data?.completedAt) {
          parsed.data.completedAt = new Date(parsed.data.completedAt)
        }

        // Valida com schema Zod
        const validated = onboardingStatusSchema.parse(parsed)
        return validated
      }

      // Status padrão para novos usuários
      return {
        isCompleted: false,
      }
    } catch (error) {
      console.error('Erro ao carregar status de onboarding:', error)
      
      // Em caso de erro, retorna status padrão
      return {
        isCompleted: false,
      }
    }
  }

  /**
   * Salva dados do onboarding
   */
  async saveOnboardingData(data: OnboardingData): Promise<void> {
    await this.simulateNetworkDelay()

    try {
      // Valida dados com schema Zod
      const validatedData = onboardingDataSchema.parse(data)

      // Salva dados no localStorage
      localStorage.setItem(
        STORAGE_KEYS.ONBOARDING_DATA, 
        JSON.stringify(validatedData)
      )

    } catch (error) {
      console.error('Erro ao salvar dados de onboarding:', error)
      throw new Error('Erro ao salvar dados de onboarding')
    }
  }

  /**
   * Marca onboarding como completado
   */
  async markOnboardingCompleted(): Promise<void> {
    await this.simulateNetworkDelay()

    try {
      // Carrega dados salvos
      const savedData = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA)
      let onboardingData: OnboardingData | undefined

      if (savedData) {
        const parsed = JSON.parse(savedData)
        onboardingData = onboardingDataSchema.parse(parsed)
      }

      // Cria status completado
      const status: OnboardingStatus = {
        isCompleted: true,
        completedAt: new Date(),
        data: onboardingData,
      }

      // Valida com schema
      const validatedStatus = onboardingStatusSchema.parse(status)

      // Salva status
      localStorage.setItem(
        STORAGE_KEYS.ONBOARDING_STATUS, 
        JSON.stringify(validatedStatus)
      )

    } catch (error) {
      console.error('Erro ao marcar onboarding como completado:', error)
      throw new Error('Erro ao marcar onboarding como completado')
    }
  }

  /**
   * Reseta status de onboarding (útil para testes)
   */
  async resetOnboardingStatus(): Promise<void> {
    await this.simulateNetworkDelay()

    try {
      // Remove dados salvos
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DATA)
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STATUS)

    } catch (error) {
      console.error('Erro ao resetar status de onboarding:', error)
      throw new Error('Erro ao resetar status de onboarding')
    }
  }
}

// ============================================================================
// IMPLEMENTAÇÃO FUTURA PARA SUPABASE
// ============================================================================

/**
 * Implementação futura para Supabase
 * TODO: Implementar quando backend estiver pronto
 */
// class SupabaseOnboardingService implements OnboardingService {
//   // TODO: Implementar cliente Supabase
//   // private supabase: SupabaseClient

//   async getOnboardingStatus(): Promise<OnboardingStatus> {
//     // TODO: Implementar chamada real ao Supabase
//     throw new Error('Implementação Supabase não disponível ainda')
//   }

//   async saveOnboardingData(_data: OnboardingData): Promise<void> {
//     // TODO: Implementar chamada real ao Supabase
//     throw new Error('Implementação Supabase não disponível ainda')
//   }

//   async markOnboardingCompleted(): Promise<void> {
//     // TODO: Implementar chamada real ao Supabase
//     throw new Error('Implementação Supabase não disponível ainda')
//   }

//   async resetOnboardingStatus(): Promise<void> {
//     // TODO: Implementar chamada real ao Supabase
//     throw new Error('Implementação Supabase não disponível ainda')
//   }
// }

// ============================================================================
// FACTORY E EXPORTS
// ============================================================================

/**
 * Factory para criar instância do serviço
 * Permite trocar entre mock e implementação real facilmente
 */
export function createOnboardingService(): OnboardingService {
  // TODO: Trocar para SupabaseOnboardingService quando backend estiver pronto
  // const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true'
  // return useSupabase ? new SupabaseOnboardingService() : new MockOnboardingService()
  
  return new MockOnboardingService()
}

/**
 * Instância padrão do serviço
 */
export const onboardingService = createOnboardingService()

// Adiciona métodos utilitários à instância
Object.assign(onboardingService, {
  loadLocalOnboardingData,
  clearLocalOnboardingData,
})

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Verifica se dados de onboarding estão salvos localmente
 */
export function hasLocalOnboardingData(): boolean {
  return !!localStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA)
}

/**
 * Carrega dados de onboarding do localStorage
 */
export function loadLocalOnboardingData(): OnboardingData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA)
    if (saved) {
      const parsed = JSON.parse(saved)
      return onboardingDataSchema.parse(parsed)
    }
  } catch (error) {
    console.error('Erro ao carregar dados locais de onboarding:', error)
  }
  return null
}

/**
 * Limpa dados de onboarding do localStorage
 */
export function clearLocalOnboardingData(): void {
  localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DATA)
  localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STATUS)
}
