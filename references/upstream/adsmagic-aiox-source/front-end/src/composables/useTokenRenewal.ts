/**
 * Token Renewal Composable
 * Renews an expired OAuth token via a new popup flow, preserving existing account/pixel config
 */

import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { integrationsService } from '@/services/api/integrations'
import { openOAuthPopup } from './useOAuthPopup'
import { ensureSession } from '@/services/api/client'
import { getOAuthRedirectUri } from '@/utils/oauthRedirect'

export function useTokenRenewal() {
  const route = useRoute()

  const isRenewing = ref(false)
  const renewError = ref<string | null>(null)

  /**
   * Start token renewal via OAuth popup
   * Only renews the token — does NOT change account or pixel selection
   */
  const startRenewal = async (integrationId: string): Promise<boolean> => {
    isRenewing.value = true
    renewError.value = null

    try {
      // Ensure active session before opening popup
      const session = await ensureSession()
      if (!session) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      // Preserve JWT token before popup (popup can cause SIGNED_OUT)
      let preservedToken: string | null = null
      try {
        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()
        preservedToken = authStore.token

        if (!preservedToken) {
          const { supabase } = await import('@/services/api/supabaseClient')
          const { data: { session: supabaseSession } } = await supabase.auth.getSession()
          if (supabaseSession?.access_token) {
            preservedToken = supabaseSession.access_token
            authStore.token = preservedToken
            localStorage.setItem('adsmagic_auth_token', preservedToken)
          }
        } else {
          localStorage.setItem('adsmagic_auth_token', preservedToken)
        }
      } catch {
        // Token preservation is best-effort
      }

      // Get OAuth URL
      const locale = (route.params.locale as string) || 'pt'
      const redirectUri = getOAuthRedirectUri(locale)
      const oauthResponse = await integrationsService.startOAuth('meta', redirectUri)

      if (!oauthResponse?.authUrl) {
        throw new Error('Não foi possível obter a URL de autenticação')
      }

      // Open OAuth popup and wait for token
      await openOAuthPopup({
        authUrl: oauthResponse.authUrl,
        redirectUri,
        onSuccess: async (token: string) => {
          // Send the new short-lived token to the backend for exchange + storage
          const result = await integrationsService.renewTokenOAuth(integrationId, token)

          if (!result.success) {
            throw new Error('Falha ao renovar o token')
          }
        },
        onError: (error: Error) => {
          renewError.value = error.message
        },
      })

      isRenewing.value = false
      return true
    } catch (error) {
      renewError.value = error instanceof Error ? error.message : 'Erro ao renovar token'
      isRenewing.value = false
      return false
    }
  }

  return {
    isRenewing,
    renewError,
    startRenewal,
  }
}
