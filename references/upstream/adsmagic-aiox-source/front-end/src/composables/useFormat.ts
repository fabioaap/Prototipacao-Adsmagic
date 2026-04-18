import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Locale } from '@/stores/language'

/**
 * Mapeamento de locale para currency
 */
const CURRENCY_MAP: Record<Locale, string> = {
  pt: 'BRL',
  en: 'USD',
  es: 'EUR',
}

/**
 * Composable para formatação de números, datas e moedas
 * de acordo com o locale atual do i18n
 */
export function useFormat() {
  const { locale } = useI18n()

  /**
   * Currency para o locale atual
   */
  const currency = computed(() => CURRENCY_MAP[locale.value as Locale] || 'USD')

  /**
   * Formata valor monetário de acordo com o locale
   * @param value - Valor numérico
   * @returns String formatada (ex: "R$ 1.000,00" ou "$1,000.00")
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: currency.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  /**
   * Formata número de acordo com o locale
   * @param value - Valor numérico
   * @returns String formatada (ex: "1.000" ou "1,000")
   */
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(locale.value).format(value)
  }

  /**
   * Formata data de acordo com o locale
   * @param date - Data a ser formatada
   * @param options - Opções de formatação (opcional)
   * @returns String formatada (ex: "01/10/2025" ou "10/01/2025")
   */
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options,
    }

    return new Intl.DateTimeFormat(locale.value, defaultOptions).format(dateObj)
  }

  /**
   * Formata porcentagem
   * @param value - Valor numérico (ex: 15.5 para 15.5%)
   * @param decimals - Número de casas decimais (padrão: 2)
   * @returns String formatada (ex: "15,50%" ou "15.50%")
   */
  const formatPercentage = (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`
  }

  /**
   * Formata data e hora de acordo com o locale
   * @param date - Data a ser formatada
   * @returns String formatada (ex: "01/10/2025, 14:30" ou "10/01/2025, 2:30 PM")
   */
  const formatDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  }

  /**
   * Formata apenas a hora de acordo com o locale
   * @param date - Data a ser formatada
   * @returns String formatada (ex: "14:30" ou "2:30 PM")
   */
  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat(locale.value, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  }

  /**
   * Formata data de forma relativa (ex: "há 2 dias", "2 days ago")
   * @param date - Data a ser comparada com agora
   * @returns String formatada
   */
  const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

    const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second')
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
    }
  }

  return {
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercentage,
    formatDateTime,
    formatTime,
    formatRelativeTime,
    currency,
    locale,
  }
}
