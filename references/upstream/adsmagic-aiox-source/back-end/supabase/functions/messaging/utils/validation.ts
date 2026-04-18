/**
 * Utilitários de validação reutilizáveis
 * 
 * Centraliza validações comuns para evitar duplicação
 * Segue DRY (Don't Repeat Yourself)
 */

/**
 * Valida formato UUID v4
 * 
 * @param uuid - String a ser validada
 * @returns true se for UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Lista de brokers suportados
 */
export const SUPPORTED_BROKERS = ['uazapi', 'gupshup', 'official_whatsapp', 'evolution'] as const

export type SupportedBroker = typeof SUPPORTED_BROKERS[number]

/**
 * Valida se broker type é suportado
 * 
 * @param brokerType - Tipo do broker a ser validado
 * @returns true se for broker suportado
 */
export function isValidBrokerType(brokerType: string): brokerType is SupportedBroker {
  return SUPPORTED_BROKERS.includes(brokerType as SupportedBroker)
}

/**
 * Valida se string é JSON válido
 * 
 * @param str - String a ser validada
 * @returns true se for JSON válido
 */
export function isValidJSON(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false
  }
  
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Valida status de conta
 * 
 * @param status - Status a ser validado
 * @returns true se status for válido
 */
export function isValidAccountStatus(status: string): boolean {
  const validStatuses = ['active', 'inactive', 'pending', 'error'] as const
  return validStatuses.includes(status as typeof validStatuses[number])
}

/**
 * Valida se conta está ativa
 * 
 * @param status - Status da conta
 * @returns true se conta estiver ativa
 */
export function isAccountActive(status: string): boolean {
  return status === 'active'
}

/**
 * Resultado de validação
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  field?: string
}

/**
 * Valida múltiplos campos
 */
export interface FieldValidation {
  field: string
  value: unknown
  validator: (value: unknown) => boolean
  errorMessage: string
}

/**
 * Valida múltiplos campos e retorna primeiro erro encontrado
 * 
 * @param validations - Array de validações
 * @returns Resultado da validação
 */
export function validateFields(validations: FieldValidation[]): ValidationResult {
  for (const validation of validations) {
    if (!validation.validator(validation.value)) {
      return {
        valid: false,
        error: validation.errorMessage,
        field: validation.field,
      }
    }
  }
  
  return { valid: true }
}
