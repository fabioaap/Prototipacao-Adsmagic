/**
 * Get Pixels Handler
 * Lists available pixels for a Meta integration
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { GetPixelsResponse } from '../../types.ts'
import { successResponse, errorResponse } from '../../utils/response.ts'
import { SupabaseIntegrationRepository } from '../../repositories/IntegrationRepository.ts'
import { SupabaseIntegrationAccountRepository } from '../../repositories/IntegrationAccountRepository.ts'
import { fetchMetaPixels } from '../../services/platform/meta/pixels.ts'
import type { SupabaseDbClient } from '../../types-db.ts'
import type { Database } from '../../../../types/database.types.ts'

/**
 * Handle get pixels request
 * Returns list of available pixels for the integration's primary account
 */
export async function handleGetPixels(
  req: Request,
  supabaseClient: SupabaseDbClient,
  integrationId: string
): Promise<Response> {
  try {
    console.log('[Get Pixels] Processing for integration:', integrationId)

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('[Get Pixels] Auth error:', authError)
      return errorResponse('Unauthorized', 401)
    }

    // Create service role client
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return errorResponse('Server configuration error', 500)
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    // Get integration (contains project_id)
    const integrationRepo = new SupabaseIntegrationRepository()
    const integration = await integrationRepo.findById(integrationId, supabaseAdmin)

    if (!integration) {
      return errorResponse('Integration not found', 404)
    }

    // Get project ID from header (preferred) or from integration (fallback)
    const projectIdFromHeader = req.headers.get('X-Project-ID')
    const projectId = projectIdFromHeader || integration.project_id

    console.log('[Get Pixels] Project ID:', {
      fromHeader: projectIdFromHeader || 'missing',
      fromIntegration: integration.project_id,
      using: projectId
    })

    // Verify integration belongs to project (if header was provided)
    if (projectIdFromHeader && integration.project_id !== projectIdFromHeader) {
      return errorResponse('Integration does not belong to this project', 403)
    }

    // Get account ID from query parameter (optional)
    const url = new URL(req.url)
    const accountIdFromQuery = url.searchParams.get('accountId')

    // Get accounts from database
    const accountRepo = new SupabaseIntegrationAccountRepository()
    const accounts = await accountRepo.findByIntegration(integrationId, supabaseAdmin)

    let targetAccountId: string
    let decryptedToken: string

    if (accountIdFromQuery) {
      // If accountId provided, try to find account in database first
      const targetAccount = accounts.find(
        acc => acc.external_account_id === accountIdFromQuery || acc.id === accountIdFromQuery
      )
      
      if (targetAccount) {
        // Account found in database - use it
        targetAccountId = targetAccount.external_account_id
        console.log('[Get Pixels] Using account from database:', targetAccountId)
        
        // Get decrypted token from account
        const token = await accountRepo.getDecryptedToken(integrationId, supabaseAdmin)
        if (!token) {
          return errorResponse('Token not found or could not be decrypted', 400)
        }
        decryptedToken = token
      } else {
        // Account not found in database - use token from integration config
        // This allows fetching pixels before accounts are saved (during account selection)
        console.log('[Get Pixels] Account not in database, using integration token. AccountId:', accountIdFromQuery)
        
        const platformConfig = integration.platform_config as any
        const encryptedToken = platformConfig?.encrypted_token
        
        if (!encryptedToken) {
          console.error('[Get Pixels] No encrypted token found in integration config')
          return errorResponse('Token not found in integration config', 400)
        }
        
        console.log('[Get Pixels] Decrypting token from integration config...')
        // Decrypt token from integration config
        const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production'
        
        try {
          const { data: decrypted, error: decryptError } = await supabaseAdmin.rpc('decrypt_token', {
            encrypted_data: encryptedToken,
            encryption_key: encryptionKey,
          })
          
          if (decryptError) {
            console.error('[Get Pixels] RPC decrypt_token error:', {
              error: decryptError,
              message: decryptError.message,
              details: decryptError.details,
              hint: decryptError.hint,
            })
            return errorResponse(`Failed to decrypt token: ${decryptError.message}`, 500)
          }
          
          if (!decrypted) {
            console.error('[Get Pixels] Decrypt returned null/undefined')
            return errorResponse('Failed to decrypt token: no data returned', 500)
          }
          
          decryptedToken = decrypted
          targetAccountId = accountIdFromQuery // Use accountId from query directly
          console.log('[Get Pixels] Token decrypted successfully. Fetching pixels for account:', targetAccountId)
        } catch (rpcError) {
          console.error('[Get Pixels] Exception calling decrypt_token RPC:', rpcError)
          return errorResponse(
            `Failed to decrypt token: ${rpcError instanceof Error ? rpcError.message : 'Unknown error'}`,
            500
          )
        }
      }
    } else {
      // If no accountId provided, use primary account or first account from database
      if (accounts.length === 0) {
        return errorResponse('No accounts found for this integration', 400)
      }
      
      const targetAccount = accounts.find(acc => acc.is_primary) || accounts[0]
      targetAccountId = targetAccount.external_account_id
      console.log('[Get Pixels] Using primary/first account from database:', targetAccountId)
      
      // Get decrypted token from account
      const token = await accountRepo.getDecryptedToken(integrationId, supabaseAdmin)
      if (!token) {
        return errorResponse('Token not found or could not be decrypted', 400)
      }
      decryptedToken = token
    }

    // Fetch pixels from Meta
    // Ensure accountId has 'act_' prefix if not already present
    const normalizedAccountId = targetAccountId.startsWith('act_') 
      ? targetAccountId 
      : `act_${targetAccountId}`
    
    console.log('[Get Pixels] Fetching pixels from Meta API for account:', {
      original: targetAccountId,
      normalized: normalizedAccountId,
    })
    
    let pixels: any[]
    try {
      pixels = await fetchMetaPixels(
        decryptedToken,
        normalizedAccountId
      )
    } catch (metaError) {
      console.error('[Get Pixels] Error fetching pixels from Meta API:', {
        error: metaError,
        message: metaError instanceof Error ? metaError.message : 'Unknown error',
        accountId: normalizedAccountId,
      })
      throw new Error(`Failed to fetch pixels from Meta: ${metaError instanceof Error ? metaError.message : 'Unknown error'}`)
    }

    console.log('[Get Pixels] Success:', { 
      count: pixels.length, 
      accountId: targetAccountId,
      source: accountIdFromQuery && !accounts.find(acc => acc.external_account_id === accountIdFromQuery) 
        ? 'integration_token' 
        : 'database_account'
    })

    const response: GetPixelsResponse = {
      pixels,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[Get Pixels] Error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get pixels',
      500
    )
  }
}

