/**
 * Security Utils
 *
 * Utilitários para segurança do frontend:
 * - Sanitização de HTML (prevenção XSS)
 * - Escape de HTML
 * - Sanitização de inputs
 * - Validação de URLs
 *
 * @module utils/security
 */

import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify'

/**
 * Configuração padrão do DOMPurify
 */
const DEFAULT_PURIFY_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: true
}

/**
 * Sanitiza HTML usando DOMPurify
 *
 * Remove tags e atributos perigosos que podem causar XSS.
 * Útil para renderizar HTML fornecido pelo usuário.
 *
 * @param dirty - HTML potencialmente perigoso
 * @param config - Configuração customizada (opcional)
 * @returns HTML sanitizado e seguro
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script><p>Hello</p>'
 * const safe = sanitizeHtml(userInput)
 * // Resultado: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(dirty: string, config?: DOMPurifyConfig): string {
  const finalConfig = config || DEFAULT_PURIFY_CONFIG
  const sanitized = DOMPurify.sanitize(dirty, finalConfig)
  return typeof sanitized === 'string' ? sanitized : String(sanitized)
}

/**
 * Escapa caracteres especiais HTML
 *
 * Converte caracteres especiais em entidades HTML para prevenir XSS.
 * Use quando quiser exibir HTML como texto puro.
 *
 * @param unsafe - String com caracteres potencialmente perigosos
 * @returns String com caracteres escapados
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>'
 * const escaped = escapeHtml(userInput)
 * // Resultado: '&lt;script&gt;alert("XSS")&lt;/script&gt;'
 * ```
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sanitiza input de texto simples
 *
 * Remove caracteres de controle e normaliza espaços.
 * Use para inputs de formulários onde HTML não é permitido.
 *
 * @param input - String de input
 * @param maxLength - Comprimento máximo (opcional)
 * @returns String sanitizada
 *
 * @example
 * ```typescript
 * const userInput = '  Hello\n\nWorld\t\t  '
 * const sanitized = sanitizeInput(userInput, 50)
 * // Resultado: 'Hello World'
 * ```
 */
export function sanitizeInput(input: string, maxLength?: number): string {
  // Remove caracteres de controle (exceto espaços e line breaks)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Normaliza espaços em branco
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  // Limita comprimento se especificado
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Valida se uma URL é segura
 *
 * Verifica se a URL usa protocolo seguro e não contém caracteres perigosos.
 * Útil para validar links fornecidos por usuários.
 *
 * @param url - URL a validar
 * @param allowedProtocols - Protocolos permitidos (padrão: http, https)
 * @returns True se URL é segura
 *
 * @example
 * ```typescript
 * isSafeUrl('https://example.com') // true
 * isSafeUrl('javascript:alert("XSS")') // false
 * isSafeUrl('http://example.com') // true
 * isSafeUrl('ftp://example.com', ['http', 'https']) // false
 * ```
 */
export function isSafeUrl(url: string, allowedProtocols: string[] = ['http', 'https']): boolean {
  try {
    const parsed = new URL(url)

    // Verifica protocolo
    const protocol = parsed.protocol.replace(':', '')
    if (!allowedProtocols.includes(protocol)) {
      return false
    }

    // Verifica se não contém javascript:, data:, ou outros protocolos perigosos
    const dangerous = ['javascript', 'data', 'vbscript', 'file']
    if (dangerous.some((d) => url.toLowerCase().includes(`${d}:`))) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Sanitiza URL removendo parâmetros perigosos
 *
 * Remove parâmetros de query que podem ser usados para XSS.
 *
 * @param url - URL a sanitizar
 * @param dangerousParams - Parâmetros perigosos a remover
 * @returns URL sanitizada
 *
 * @example
 * ```typescript
 * const url = 'https://example.com?name=John&redirect=javascript:alert(1)'
 * const safe = sanitizeUrl(url, ['redirect'])
 * // Resultado: 'https://example.com?name=John'
 * ```
 */
export function sanitizeUrl(url: string, dangerousParams: string[] = ['redirect', 'return', 'callback']): string {
  try {
    const parsed = new URL(url)

    // Remove parâmetros perigosos
    dangerousParams.forEach((param) => {
      parsed.searchParams.delete(param)
    })

    return parsed.toString()
  } catch {
    return ''
  }
}

/**
 * Gera token CSRF seguro
 *
 * Cria um token aleatório para proteção contra CSRF.
 * Use em formulários que fazem modificações no servidor.
 *
 * @param length - Tamanho do token (padrão: 32)
 * @returns Token CSRF
 *
 * @example
 * ```typescript
 * const token = generateCsrfToken()
 * // Resultado: '7f8a9b2c...' (32 caracteres hex)
 * ```
 */
export function generateCsrfToken(length: number = 32): string {
  const array = new Uint8Array(length / 2)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Cria rate limiter simples baseado em localStorage
 *
 * Limita número de ações por período de tempo.
 * Use para prevenir spam e abuso.
 *
 * @param key - Chave única para a ação
 * @param maxAttempts - Número máximo de tentativas
 * @param windowMs - Janela de tempo em milissegundos
 * @returns Função que verifica se ação é permitida
 *
 * @example
 * ```typescript
 * const canSubmit = createRateLimiter('form-submit', 5, 60000)
 *
 * if (canSubmit()) {
 *   // Submeter formulário
 * } else {
 *   // Mostrar erro: "Muitas tentativas, aguarde 1 minuto"
 * }
 * ```
 */
export function createRateLimiter(
  key: string,
  maxAttempts: number,
  windowMs: number
): () => boolean {
  const storageKey = `rate_limit_${key}`

  return (): boolean => {
    try {
      const now = Date.now()
      const stored = localStorage.getItem(storageKey)

      if (!stored) {
        // Primeira tentativa
        const data = {
          attempts: 1,
          resetAt: now + windowMs
        }
        localStorage.setItem(storageKey, JSON.stringify(data))
        return true
      }

      const data = JSON.parse(stored)

      // Verifica se janela expirou
      if (now > data.resetAt) {
        // Reset
        const newData = {
          attempts: 1,
          resetAt: now + windowMs
        }
        localStorage.setItem(storageKey, JSON.stringify(newData))
        return true
      }

      // Incrementa tentativas
      if (data.attempts < maxAttempts) {
        data.attempts++
        localStorage.setItem(storageKey, JSON.stringify(data))
        return true
      }

      // Excedeu limite
      return false
    } catch {
      // Em caso de erro, permite (fail open para não bloquear usuário)
      return true
    }
  }
}

/**
 * Valida e sanitiza número de telefone
 *
 * Remove caracteres não numéricos e valida formato.
 *
 * @param phone - Telefone a sanitizar
 * @param minDigits - Mínimo de dígitos (padrão: 8)
 * @param maxDigits - Máximo de dígitos (padrão: 15)
 * @returns Telefone sanitizado ou null se inválido
 *
 * @example
 * ```typescript
 * sanitizePhone('(11) 98765-4321') // '11987654321'
 * sanitizePhone('+55 11 98765-4321') // '5511987654321'
 * sanitizePhone('123') // null (muito curto)
 * ```
 */
export function sanitizePhone(
  phone: string,
  minDigits: number = 8,
  maxDigits: number = 15
): string | null {
  // Remove todos os caracteres não numéricos
  const digits = phone.replace(/\D/g, '')

  // Valida comprimento
  if (digits.length < minDigits || digits.length > maxDigits) {
    return null
  }

  return digits
}

/**
 * Valida e sanitiza email
 *
 * Remove espaços e valida formato básico.
 *
 * @param email - Email a sanitizar
 * @returns Email sanitizado ou null se inválido
 *
 * @example
 * ```typescript
 * sanitizeEmail('  user@example.com  ') // 'user@example.com'
 * sanitizeEmail('invalid-email') // null
 * ```
 */
export function sanitizeEmail(email: string): string | null {
  // Remove espaços
  const sanitized = email.trim().toLowerCase()

  // Validação básica de formato
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    return null
  }

  return sanitized
}

/**
 * Remove scripts inline de HTML
 *
 * Remove tags <script> e event handlers inline.
 * Adicional ao DOMPurify para casos específicos.
 *
 * @param html - HTML a limpar
 * @returns HTML sem scripts
 *
 * @example
 * ```typescript
 * const dirty = '<div onclick="alert(1)">Click</div><script>alert(2)</script>'
 * const clean = removeInlineScripts(dirty)
 * // Resultado: '<div>Click</div>'
 * ```
 */
export function removeInlineScripts(html: string): string {
  // Remove tags <script>
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers inline (onclick, onload, etc)
  clean = clean.replace(/\s+on\w+="[^"]*"/gi, '')
  clean = clean.replace(/\s+on\w+='[^']*'/gi, '')

  return clean
}
