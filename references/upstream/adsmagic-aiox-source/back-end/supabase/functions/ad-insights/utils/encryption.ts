/**
 * Encryption utilities for tokens
 * Uses pgcrypto extension for decryption
 */

import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Decrypt a token using pgcrypto
 *
 * @param supabaseClient - Supabase client with service role
 * @param encryptedToken - Encrypted token (base64)
 * @param key - Encryption key (from env)
 * @returns Decrypted token
 */
export async function decryptToken(
  supabaseClient: SupabaseDbClient,
  encryptedToken: string,
  key: string
): Promise<string> {
  const { data, error } = await supabaseClient.rpc('decrypt_token', {
    encrypted_data: encryptedToken,
    encryption_key: key,
  })

  if (error) {
    console.error('[Encryption] Error decrypting token:', error)
    throw new Error('Failed to decrypt token')
  }

  return data
}
