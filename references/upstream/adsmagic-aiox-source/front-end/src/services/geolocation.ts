/**
 * Serviço de geolocalização para detecção de país por IP
 * Implementa fallbacks e tratamento de erros robusto
 */

import type { Country } from '@/types/country'
import { findCountryByCode, DEFAULT_COUNTRY, COUNTRIES } from '@/types/country'

/**
 * Interface para resposta de APIs de geolocalização
 */
interface GeolocationResponse {
  country_code: string
  country_name: string
  ip: string
  [key: string]: any
}

/**
 * Interface para configuração do serviço
 */
interface GeolocationConfig {
  /** Timeout em milissegundos para requisições */
  timeout: number
  /** Número máximo de tentativas */
  maxRetries: number
  /** Delay entre tentativas em milissegundos */
  retryDelay: number
}

/**
 * Configuração padrão do serviço
 */
const DEFAULT_CONFIG: GeolocationConfig = {
  timeout: 5000,
  maxRetries: 3,
  retryDelay: 1000
}

/**
 * Resultado da detecção de país
 */
export interface GeolocationResult {
  /** País detectado */
  country: Country
  /** Se a detecção foi bem-sucedida */
  success: boolean
  /** Fonte da detecção */
  source: 'ip-api' | 'ipapi' | 'fallback'
  /** IP detectado (se disponível) */
  ip?: string
  /** Erro ocorrido (se houver) */
  error?: string
}

/**
 * Classe principal do serviço de geolocalização
 * Implementa múltiplas APIs como fallback
 */
export class GeolocationService {
  private config: GeolocationConfig

  constructor(config: Partial<GeolocationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Detecta país por IP usando múltiplas APIs
   * @returns Promise com resultado da detecção
   */
  async detectCountry(): Promise<GeolocationResult> {
    const apis = [
      () => this.detectWithIpApi(),
      () => this.detectWithIpapi()
    ]

    for (const api of apis) {
      try {
        const result = await this.withRetry(api)
        if (result.success) {
          return result
        }
      } catch (error) {
        console.warn('Geolocation API failed:', error)
      }
    }

    // Fallback para país padrão
    const fallbackCountry = DEFAULT_COUNTRY ?? findCountryByCode('BR') ?? COUNTRIES[0]
    if (!fallbackCountry) {
      throw new Error('Não foi possível determinar país padrão')
    }
    return {
      country: fallbackCountry,
      success: false,
      source: 'fallback',
      error: 'Todas as APIs de geolocalização falharam'
    }
  }

  /**
   * Detecta país usando ip-api.com
   */
  private async detectWithIpApi(): Promise<GeolocationResult> {
    const response = await this.fetchWithTimeout(
      'http://ip-api.com/json/?fields=countryCode,country,query',
      this.config.timeout
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data: GeolocationResponse = await response.json()
    
    if (!data.country_code) {
      throw new Error('Country code not found in response')
    }

    const country = findCountryByCode(data.country_code)
    
    if (!country) {
      throw new Error(`Unknown country code: ${data.country_code}`)
    }

    return {
      country,
      success: true,
      source: 'ip-api',
      ip: data.query
    }
  }

  /**
   * Detecta país usando ipapi.co
   */
  private async detectWithIpapi(): Promise<GeolocationResult> {
    const response = await this.fetchWithTimeout(
      'https://ipapi.co/json/',
      this.config.timeout
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data: GeolocationResponse = await response.json()
    
    if (!data.country_code) {
      throw new Error('Country code not found in response')
    }

    const country = findCountryByCode(data.country_code)
    
    if (!country) {
      throw new Error(`Unknown country code: ${data.country_code}`)
    }

    return {
      country,
      success: true,
      source: 'ipapi',
      ip: data.ip
    }
  }

  /**
   * Executa função com retry automático
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        await this.delay(this.config.retryDelay)
        return this.withRetry(fn, attempt + 1)
      }
      throw error
    }
  }

  /**
   * Fetch com timeout
   */
  private async fetchWithTimeout(
    url: string,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AdsMagic-Frontend/1.0'
        }
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Detecta país de forma síncrona usando fallback
   * Útil para casos onde async não é possível
   */
  detectCountrySync(): GeolocationResult {
    // Tenta usar timezone como fallback
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const countryCode = this.timezoneToCountryCode(timezone)
      
      if (countryCode) {
        const country = findCountryByCode(countryCode)
        if (country) {
          return {
            country,
            success: true,
            source: 'fallback'
          }
        }
      }
    } catch (error) {
      console.warn('Timezone detection failed:', error)
    }

    // Fallback final
    const fallbackCountry = DEFAULT_COUNTRY ?? findCountryByCode('BR') ?? COUNTRIES[0]
    if (!fallbackCountry) {
      throw new Error('Não foi possível determinar país padrão')
    }
    return {
      country: fallbackCountry,
      success: false,
      source: 'fallback',
      error: 'Could not detect country'
    }
  }

  /**
   * Converte timezone para código de país (aproximação)
   */
  private timezoneToCountryCode(timezone: string): string | null {
    const timezoneMap: Record<string, string> = {
      'America/Sao_Paulo': 'BR',
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Madrid': 'ES',
      'Europe/Rome': 'IT',
      'Europe/Lisbon': 'PT',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Asia/Kolkata': 'IN',
      'Australia/Sydney': 'AU'
    }

    return timezoneMap[timezone] || null
  }
}

/**
 * Instância padrão do serviço
 */
export const geolocationService = new GeolocationService()

/**
 * Hook para usar geolocalização em componentes Vue
 */
export function useGeolocation() {
  const detectCountry = async (): Promise<GeolocationResult> => {
    return geolocationService.detectCountry()
  }

  const detectCountrySync = (): GeolocationResult => {
    return geolocationService.detectCountrySync()
  }

  return {
    detectCountry,
    detectCountrySync
  }
}

/**
 * Função utilitária para detecção rápida
 */
export async function detectUserCountry(): Promise<Country> {
  try {
    const result = await geolocationService.detectCountry()
    return result.country
  } catch (error) {
    console.warn('Country detection failed, using default:', error)
    const fallback = DEFAULT_COUNTRY ?? findCountryByCode('BR') ?? COUNTRIES[0]
    if (!fallback) {
      throw new Error('Não foi possível determinar país padrão')
    }
    return fallback
  }
}
