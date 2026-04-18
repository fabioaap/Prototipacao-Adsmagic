/**
 * Settings API Service
 *
 * Gerencia todas as operações relacionadas a configurações.
 * Segue o padrão "Mock First, API Ready" para desenvolvimento.
 *
 * @module services/api/settings
 */

import { apiClient } from './client'
import axios from 'axios'
import type { 
  ProjectSettings, 
  GeneralSettings, 
  CurrencySettings, 
  NotificationSettings 
} from '@/types/models'

// Mock data para desenvolvimento
const MOCK_SETTINGS: ProjectSettings = {
  general: {
    projectId: '2',
    projectName: 'Meu Projeto',
    projectDescription: 'Descrição do projeto',
    attributionModel: 'first_touch',
    createdAt: new Date().toISOString()
  },
  currency: {
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  notifications: {
    enabled: true,
    email: 'admin@empresa.com',
    events: ['newContact', 'newSale', 'integrationError'],
    digestFrequency: 'daily',
    digestTime: '09:00',
    timezone: 'America/Sao_Paulo'
  }
}

// Flag para alternar entre mock e API real
const USE_MOCK = false

export const settingsService = {
  /**
   * Buscar configurações do projeto
   */
  async getSettings(): Promise<ProjectSettings> {
    if (USE_MOCK) {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 300))
      return { ...MOCK_SETTINGS }
    }

    try {
      const response = await apiClient.get<ProjectSettings>('/settings')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        if (import.meta.env.DEV) {
          console.warn('[SettingsService] /settings not available, using fallback settings')
        }
        return { ...MOCK_SETTINGS }
      }

      throw error
    }
  },

  /**
   * Atualizar configurações gerais
   */
  async updateGeneral(settings: GeneralSettings): Promise<GeneralSettings> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      MOCK_SETTINGS.general = { ...MOCK_SETTINGS.general, ...settings }
      return MOCK_SETTINGS.general
    }

    const response = await apiClient.patch<GeneralSettings>('/settings/general', settings)
    return response.data
  },

  /**
   * Atualizar configurações de moeda
   */
  async updateCurrency(settings: CurrencySettings): Promise<CurrencySettings> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      MOCK_SETTINGS.currency = { ...MOCK_SETTINGS.currency, ...settings }
      return MOCK_SETTINGS.currency
    }

    const response = await apiClient.patch<CurrencySettings>('/settings/currency', settings)
    return response.data
  },

  /**
   * Atualizar configurações de notificação
   */
  async updateNotifications(settings: NotificationSettings): Promise<NotificationSettings> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      MOCK_SETTINGS.notifications = { ...MOCK_SETTINGS.notifications, ...settings }
      return MOCK_SETTINGS.notifications
    }

    const response = await apiClient.patch<NotificationSettings>('/settings/notifications', settings)
    return response.data
  },

  /**
   * Testar configurações de notificação
   */
  async testNotification(type: 'email' | 'webhook'): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simula sucesso ou falha
      const success = Math.random() > 0.2 // 80% de chance de sucesso
      
      return {
        success,
        message: success 
          ? `Notificação ${type} enviada com sucesso`
          : `Falha ao enviar notificação ${type}`
      }
    }

    const response = await apiClient.post<{ success: boolean; message: string }>(`/settings/notifications/test/${type}`)
    return response.data
  },

  /**
   * Buscar opções de países
   */
  async getCountries(): Promise<Array<{ code: string; name: string; flag: string }>> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return [
        { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
        { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
        { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
        { code: 'MX', name: 'México', flag: '🇲🇽' },
        { code: 'ES', name: 'Espanha', flag: '🇪🇸' }
      ]
    }

    const response = await apiClient.get<Array<{ code: string; name: string; flag: string }>>('/settings/countries')
    return response.data
  },

  /**
   * Buscar opções de idiomas
   */
  async getLanguages(): Promise<Array<{ code: string; name: string; flag: string }>> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return [
        { code: 'pt', name: 'Português', flag: '🇧🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' }
      ]
    }

    const response = await apiClient.get<Array<{ code: string; name: string; flag: string }>>('/settings/languages')
    return response.data
  },

  /**
   * Buscar opções de moedas
   */
  async getCurrencies(): Promise<Array<{ code: string; name: string; symbol: string }>> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return [
        { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
        { code: 'USD', name: 'Dólar Americano', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
        { code: 'MXN', name: 'Peso Mexicano', symbol: '$' }
      ]
    }

    const response = await apiClient.get<Array<{ code: string; name: string; symbol: string }>>('/settings/currencies')
    return response.data
  },

  /**
   * Buscar opções de fusos horários
   */
  async getTimezones(): Promise<Array<{ value: string; label: string }>> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return [
        { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
        { value: 'America/New_York', label: 'Nova York (UTC-5)' },
        { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
        { value: 'America/Mexico_City', label: 'Cidade do México (UTC-6)' },
        { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC-3)' }
      ]
    }

    const response = await apiClient.get<Array<{ value: string; label: string }>>('/settings/timezones')
    return response.data
  },

  /**
   * Exportar configurações
   */
  async export(): Promise<Blob> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simula export JSON
      const jsonData = JSON.stringify(MOCK_SETTINGS, null, 2)
      return new Blob([jsonData], { type: 'application/json' })
    }

    const response = await apiClient.get('/settings/export', {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Importar configurações
   */
  async import(file: File): Promise<ProjectSettings> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simula import
      return { ...MOCK_SETTINGS }
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ProjectSettings>('/settings/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}
