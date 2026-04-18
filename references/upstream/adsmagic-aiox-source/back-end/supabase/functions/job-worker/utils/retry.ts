/**
 * Retry utilities com exponential backoff
 */

/**
 * Calcula o tempo de espera para próxima tentativa usando exponential backoff
 * @param retryCount - Número da tentativa atual (0-based)
 * @param baseDelayMs - Delay base em ms (default: 1000ms = 1s)
 * @param maxDelayMs - Delay máximo em ms (default: 300000ms = 5min)
 * @returns Tempo de espera em ms
 */
export function calculateBackoff(
  retryCount: number,
  baseDelayMs = 1000,
  maxDelayMs = 300000
): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 300s (max)
  const delay = Math.min(baseDelayMs * Math.pow(2, retryCount), maxDelayMs)

  // Add jitter (±10%) para evitar thundering herd
  const jitter = delay * 0.1 * (Math.random() * 2 - 1)

  return Math.round(delay + jitter)
}

/**
 * Calcula timestamp para próxima tentativa
 */
export function calculateRetryAfter(retryCount: number): Date {
  const delayMs = calculateBackoff(retryCount)
  return new Date(Date.now() + delayMs)
}
