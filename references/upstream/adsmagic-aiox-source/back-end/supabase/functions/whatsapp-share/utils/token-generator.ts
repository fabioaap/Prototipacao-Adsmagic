/**
 * Gerador de tokens criptograficamente seguros para compartilhamento de QR Code
 *
 * Usa crypto.getRandomValues() para gerar tokens com 256 bits de entropia.
 *
 * @module utils/token-generator
 */

/**
 * Gera token hex de 64 caracteres (32 bytes = 256 bits de entropia)
 */
export function generateShareToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
