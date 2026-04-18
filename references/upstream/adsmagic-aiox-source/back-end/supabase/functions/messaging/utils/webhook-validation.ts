/**
 * Utilitários para validação de assinatura de webhooks
 * 
 * Suporta múltiplos algoritmos de validação (HMAC-SHA256, etc)
 */

/**
 * Valida assinatura de webhook usando HMAC-SHA256
 * 
 * @param rawBody - Body original da requisição (string)
 * @param signature - Assinatura recebida no header
 * @param secret - Secret para validação
 * @returns true se a assinatura for válida
 */
export async function validateHmacSha256(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Importar Web Crypto API do Deno
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(rawBody)
    )
    
    // Converter para hex string
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Comparar assinaturas (usar comparação constante para prevenir timing attacks)
    return constantTimeCompare(signature, expectedSignature)
  } catch (error) {
    console.error('[Webhook Validation] Error validating HMAC-SHA256:', error)
    return false
  }
}

/**
 * Valida assinatura de webhook do WhatsApp Business API
 * 
 * @param rawBody - Body original da requisição (string)
 * @param signature - Assinatura recebida no header (formato: sha256=...)
 * @param secret - App Secret do WhatsApp
 * @returns true se a assinatura for válida
 */
export async function validateWhatsAppBusinessSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // WhatsApp Business API usa formato: sha256=<signature>
    const signatureValue = signature.replace(/^sha256=/, '')
    
    return await validateHmacSha256(rawBody, signatureValue, secret)
  } catch (error) {
    console.error('[Webhook Validation] Error validating WhatsApp Business signature:', error)
    return false
  }
}

/**
 * Comparação de strings em tempo constante para prevenir timing attacks
 * 
 * @param a - Primeira string
 * @param b - Segunda string
 * @returns true se as strings forem iguais
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Valida assinatura básica (comparação direta)
 * 
 * @param rawBody - Body original da requisição (string)
 * @param signature - Assinatura recebida no header
 * @param secret - Secret para validação
 * @returns true se a assinatura for válida
 */
export async function validateBasicSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  return constantTimeCompare(signature, secret)
}

/**
 * Extrai assinatura do header
 * 
 * @param headers - Headers da requisição
 * @param headerName - Nome do header que contém a assinatura
 * @returns Assinatura ou null se não encontrada
 */
export function extractSignatureFromHeader(
  headers: Headers,
  headerName: string
): string | null {
  return headers.get(headerName)
}

