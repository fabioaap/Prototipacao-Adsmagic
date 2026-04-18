/**
 * Encryption utilities for tokens
 * Uses pgcrypto extension for encryption
 */

import type { SupabaseDbClient } from '../types-db.ts'

/**
 * Encrypt a token using pgcrypto
 * 
 * @param supabaseClient - Supabase client with service role
 * @param token - Token to encrypt
 * @param key - Encryption key (from env)
 * @returns Encrypted token (base64)
 */
export async function encryptToken(
  supabaseClient: SupabaseDbClient,
  token: string,
  key: string
): Promise<string> {
  const { data, error } = await supabaseClient.rpc('encrypt_token', {
    token_data: token,
    encryption_key: key,
  })

  if (error) {
    console.error('[Encryption] Error encrypting token:', error)
    throw new Error('Failed to encrypt token')
  }

  return data
}

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

