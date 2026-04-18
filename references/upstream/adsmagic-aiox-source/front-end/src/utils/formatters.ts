/**
 * Format Utilities
 * 
 * Funções auxiliares para formatação de dados (datas, números, moedas, etc).
 * Todas as funções lidam com valores undefined/null de forma segura.
 * 
 * @module utils/formatters
 */

/**
 * Formata uma data de forma segura
 * 
 * Aceita string ISO, objeto Date ou undefined e retorna string formatada.
 * Se a data for inválida, retorna fallback.
 * 
 * @param date - Data a ser formatada (string ISO, Date ou undefined)
 * @param options - Opções de formatação do Intl.DateTimeFormat
 * @param fallback - Valor a retornar se data for inválida (padrão: '-')
 * @returns String formatada ou fallback
 * 
 * @example
 * ```ts
 * formatSafeDate('2024-11-22') // '22/11/2024'
 * formatSafeDate(new Date())   // '22/11/2024'
 * formatSafeDate(undefined)    // '-'
 * formatSafeDate('invalid')    // '-'
 * ```
 */
export function formatSafeDate(
  date: string | Date | undefined | null,
  options?: Intl.DateTimeFormatOptions,
  fallback = '-'
): string {
  if (!date) return fallback

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return fallback
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options
    }

    return dateObj.toLocaleDateString('pt-BR', defaultOptions)
  } catch (error) {
    console.warn('[formatSafeDate] Erro ao formatar data:', date, error)
    return fallback
  }
}

/**
 * Formata uma data e hora de forma segura
 * 
 * @param date - Data a ser formatada
 * @param fallback - Valor a retornar se data for inválida (padrão: '-')
 * @returns String formatada ou fallback
 * 
 * @example
 * ```ts
 * formatSafeDateTime('2024-11-22T14:30:00') // '22/11/2024 às 14:30'
 * ```
 */
export function formatSafeDateTime(
  date: string | Date | undefined | null,
  fallback = '-'
): string {
  if (!date) return fallback

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return fallback
    }

    const datePart = dateObj.toLocaleDateString('pt-BR')
    const timePart = dateObj.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    return `${datePart} às ${timePart}`
  } catch (error) {
    console.warn('[formatSafeDateTime] Erro ao formatar data/hora:', date, error)
    return fallback
  }
}

/**
 * Formata data relativa (há X dias, há X horas, etc)
 * 
 * @param date - Data a ser formatada
 * @param fallback - Valor a retornar se data for inválida
 * @returns String formatada ou fallback
 * 
 * @example
 * ```ts
 * formatRelativeDate(new Date()) // 'agora'
 * formatRelativeDate(new Date(Date.now() - 60000)) // 'há 1 minuto'
 * ```
 */
export function formatRelativeDate(
  date: string | Date | undefined | null,
  fallback = '-'
): string {
  if (!date) return fallback

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return fallback
    }

    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'agora'
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`
    if (diffHours < 24) return `há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
    if (diffDays < 7) return `há ${diffDays} dia${diffDays !== 1 ? 's' : ''}`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `há ${weeks} semana${weeks !== 1 ? 's' : ''}`
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `há ${months} ${months !== 1 ? 'meses' : 'mês'}`
    }
    
    const years = Math.floor(diffDays / 365)
    return `há ${years} ano${years !== 1 ? 's' : ''}`
  } catch (error) {
    console.warn('[formatRelativeDate] Erro ao formatar data relativa:', date, error)
    return fallback
  }
}

/**
 * Formata um número de forma segura
 * 
 * @param value - Número a ser formatado
 * @param options - Opções de formatação do Intl.NumberFormat
 * @param fallback - Valor a retornar se número for inválido (padrão: '0')
 * @returns String formatada ou fallback
 * 
 * @example
 * ```ts
 * formatSafeNumber(1234.56) // '1.234,56'
 * formatSafeNumber(undefined) // '0'
 * ```
 */
export function formatSafeNumber(
  value: number | undefined | null,
  options?: Intl.NumberFormatOptions,
  fallback = '0'
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return fallback
  }

  try {
    const defaultOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    }

    return value.toLocaleString('pt-BR', defaultOptions)
  } catch (error) {
    console.warn('[formatSafeNumber] Erro ao formatar número:', value, error)
    return fallback
  }
}

/**
 * Formata um valor monetário de forma segura
 * 
 * @param value - Valor a ser formatado
 * @param currency - Código da moeda (ISO 4217: BRL, USD, EUR, etc)
 * @param fallback - Valor a retornar se inválido
 * @returns String formatada ou fallback
 * 
 * @example
 * ```ts
 * formatSafeCurrency(1234.56, 'BRL') // 'R$ 1.234,56'
 * formatSafeCurrency(1234.56, 'USD') // 'US$ 1.234,56'
 * formatSafeCurrency(undefined, 'BRL') // 'R$ 0,00'
 * ```
 */
export function formatSafeCurrency(
  value: number | undefined | null,
  currency = 'BRL',
  fallback?: string
): string {
  // Se fallback não for fornecido, formata 0 na moeda especificada
  if (value === undefined || value === null || isNaN(value)) {
    if (fallback !== undefined) return fallback
    value = 0
  }

  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  } catch (error) {
    console.warn('[formatSafeCurrency] Erro ao formatar moeda:', value, currency, error)
    // Fallback manual se Intl falhar
    const symbol = getCurrencySymbol(currency)
    return `${symbol} ${formatSafeNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

/**
 * Retorna o símbolo de uma moeda
 * 
 * @param currency - Código da moeda
 * @returns Símbolo da moeda
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    BRL: 'R$',
    USD: 'US$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'Fr',
    CNY: '¥',
  }
  return symbols[currency] || currency
}

/**
 * Formata uma porcentagem de forma segura
 * 
 * @param value - Valor a ser formatado (0-100)
 * @param decimals - Número de casas decimais (padrão: 1)
 * @param fallback - Valor a retornar se inválido (padrão: '0%')
 * @returns String formatada ou fallback
 * 
 * @example
 * ```ts
 * formatSafePercentage(45.67) // '45,7%'
 * formatSafePercentage(45.67, 2) // '45,67%'
 * formatSafePercentage(undefined) // '0%'
 * ```
 */
export function formatSafePercentage(
  value: number | undefined | null,
  decimals = 1,
  fallback = '0%'
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return fallback
  }

  try {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + '%'
  } catch (error) {
    console.warn('[formatSafePercentage] Erro ao formatar porcentagem:', value, error)
    return fallback
  }
}

/**
 * Formata um telefone brasileiro
 * 
 * @param phone - Número de telefone
 * @param countryCode - Código do país (padrão: '+55')
 * @returns Telefone formatado
 * 
 * @example
 * ```ts
 * formatPhone('11987654321') // '(11) 98765-4321'
 * formatPhone('1133334444') // '(11) 3333-4444'
 * ```
 */
export function formatPhone(phone: string | undefined | null, _countryCode = '+55'): string {
  if (!phone) return '-'

  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '')

  // Celular (11 dígitos)
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }

  // Fixo (10 dígitos)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }

  // Retorna original se não se encaixa nos padrões
  return phone
}

/**
 * Trunca um texto e adiciona reticências
 * 
 * @param text - Texto a ser truncado
 * @param maxLength - Comprimento máximo
 * @param ellipsis - String para reticências (padrão: '...')
 * @returns Texto truncado
 * 
 * @example
 * ```ts
 * truncateText('Lorem ipsum dolor sit amet', 10) // 'Lorem ip...'
 * ```
 */
export function truncateText(
  text: string | undefined | null,
  maxLength: number,
  ellipsis = '...'
): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

