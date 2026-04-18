/**
 * Encapsula o estado de validação de sessão compartilhado entre guardas.
 */
export const SESSION_VALIDATION_TTL_MS = 15000

let lastSessionValidationAt = 0
let lastSessionValidationUserId: string | null = null

/**
 * Indica se precisamos revalidar a sessão para o usuário informado.
 */
export function shouldValidateSession(userId: string | null): boolean {
  if (!userId) return true
  if (!lastSessionValidationUserId) return true
  if (lastSessionValidationUserId !== userId) return true
  return Date.now() - lastSessionValidationAt >= SESSION_VALIDATION_TTL_MS
}

/**
 * Registra que a sessão do usuário foi validada com sucesso agora.
 */
export function recordSessionValidation(userId: string | null): void {
  if (!userId) {
    resetSessionValidation()
    return
  }

  lastSessionValidationUserId = userId
  lastSessionValidationAt = Date.now()
}

/**
 * Zera o cache de validação (ex: logout ou timeout).
 */
export function resetSessionValidation(): void {
  lastSessionValidationAt = 0
  lastSessionValidationUserId = null
}
