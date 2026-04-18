/**
 * Google Ads Integration Composable
 * Gerencia o fluxo OAuth e configuração de contas Google Ads
 */

import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { integrationsService } from '@/services/api/integrations'
import { openOAuthPopup } from './useOAuthPopup'
import { getOAuthRedirectUri } from '@/utils/oauthRedirect'
import type { Account } from '@/types/models'

export interface GoogleIntegrationState {
    integrationId: string | null
    availableAccounts: Account[]
    isConnecting: boolean
    isSelectingAccounts: boolean
    selectedAccountIds: string[]
    error: string | null
}

/**
 * Composable para gerenciar integração com Google Ads
 * Cada instância do componente tem seu próprio estado isolado
 */
export function useGoogleIntegration() {
    const route = useRoute()

    // Estado local do composable (isolado por instância)
    const integrationId = ref<string | null>(null)
    const availableAccounts = ref<Account[]>([])
    const isConnecting = ref(false)
    const isSelectingAccounts = ref(false)
    const selectedAccountIds = ref<string[]>([])
    const error = ref<string | null>(null)

    // Computed: tem integrationId válido?
    const hasIntegrationId = computed(() => {
        const id = integrationId.value
        return id !== null && id !== undefined && id !== ''
    })

    // Computed: tem contas disponíveis?
    const hasAccounts = computed(() => availableAccounts.value.length > 0)

    /**
     * Iniciar fluxo OAuth do Google Ads
     */
    const startOAuth = async () => {
        try {
            isConnecting.value = true
            error.value = null

            // Obter projectId da URL (wizard sempre tem projectId na rota)
            let projectId = route.params.projectId as string

            // Em modo mock durante wizard, usar ID temporário
            const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
            if (!projectId && USE_MOCK) {
                console.log('[useGoogleIntegration] Modo mock sem projectId - usando wizard flow')
                projectId = 'wizard-temp-id'
            } else if (!projectId) {
                throw new Error('Project ID não encontrado na rota')
            }

            // Construir redirectUri
            const locale = (route.params.locale as string) || 'pt'
            const redirectUri = getOAuthRedirectUri(locale)

            console.log('[useGoogleIntegration] Iniciando OAuth com projectId:', projectId)

            // Preservar token
            let preservedToken: string | null = null
            try {
                const { useAuthStore } = await import('@/stores/auth')
                const authStore = useAuthStore()
                preservedToken = authStore.token

                if (!preservedToken) {
                    const { supabase } = await import('@/services/api/supabaseClient')
                    const { data: { session } } = await supabase.auth.getSession()
                    if (session?.access_token) {
                        preservedToken = session.access_token
                        authStore.token = preservedToken
                        localStorage.setItem('adsmagic_auth_token', preservedToken)
                    }
                } else {
                    localStorage.setItem('adsmagic_auth_token', preservedToken)
                }
            } catch (err) {
                if (import.meta.env.DEV) {
                    console.warn('[useGoogleIntegration] ⚠️ Erro ao preservar token:', err)
                }
            }

            // Obter URL de autorização
            const oauthResponse = await integrationsService.startOAuth('google', redirectUri)

            if (!oauthResponse || !oauthResponse.authUrl) {
                const errorMsg = 'Não foi possível obter a URL de autenticação do Google Ads'
                error.value = errorMsg
                throw new Error(errorMsg)
            }

            const { authUrl } = oauthResponse

            // Setar flag OAuth em progresso
            localStorage.setItem('adsmagic_oauth_in_progress', 'true')

            // Salvar redirectUri para enviar no callback (Google precisa para code exchange)
            const savedRedirectUri = redirectUri

            // Abrir popup OAuth
            await openOAuthPopup({
                authUrl,
                redirectUri,
                onSuccess: async (token: string, projectIdFromState?: string | null) => {
                    try {
                        if (import.meta.env.DEV) {
                            console.log('[Google Integration] 🔔 Token recebido do popup')
                        }

                        // Restaurar token preservado
                        if (preservedToken) {
                            try {
                                const { useAuthStore } = await import('@/stores/auth')
                                const authStore = useAuthStore()
                                authStore.token = preservedToken
                                localStorage.setItem('adsmagic_auth_token', preservedToken)
                            } catch (err) {
                                if (import.meta.env.DEV) {
                                    console.warn('[Google Integration] ⚠️ Erro ao restaurar token:', err)
                                }
                            }
                        }

                        // Delay para restauração de sessão
                        await new Promise(resolve => setTimeout(resolve, 1000))

                        // Processar callback (Google precisa do redirectUri para trocar o code)
                        const result = projectIdFromState
                            ? await integrationsService.handleOAuthCallback('google', token, projectIdFromState, savedRedirectUri)
                            : await integrationsService.handleOAuthCallback('google', token, undefined, savedRedirectUri)

                        if (result.success && result.accounts && result.integrationId) {
                            if (import.meta.env.DEV) {
                                console.log('[Google Integration] ✅ Callback processado:', {
                                    integrationId: result.integrationId,
                                    accountsCount: result.accounts.length,
                                })
                            }

                            integrationId.value = result.integrationId
                            availableAccounts.value = result.accounts.map((acc: any) => ({
                                id: acc.id,
                                name: acc.name,
                                accountId: acc.accountId,
                                currency: acc.currency ?? 'BRL',
                                metadata: acc.metadata ?? {},
                                type: 'ad_account' as const,
                                permissions: acc.permissions || [],
                                isManager: acc.isManager ?? false,
                                parentMccId: acc.parentMccId ?? undefined,
                            }))
                        } else {
                            throw new Error('Resposta inválida do callback')
                        }
                    } catch (err) {
                        console.error('[Google Integration] ❌ Erro no callback:', err)
                        error.value = err instanceof Error ? err.message : 'Erro ao processar autenticação'
                        throw err
                    } finally {
                        // Limpar flag OAuth
                        localStorage.removeItem('adsmagic_oauth_in_progress')
                    }
                },
                onError: (err: Error) => {
                    console.error('[Google Integration] ❌ Erro no OAuth:', err)
                    error.value = err.message
                    localStorage.removeItem('adsmagic_oauth_in_progress')
                },
            })
        } catch (err) {
            console.error('[useGoogleIntegration] Erro:', err)
            error.value = err instanceof Error ? err.message : 'Erro desconhecido'
            throw err
        } finally {
            isConnecting.value = false
        }
    }

    /**
     * Finalizar seleção de contas
     */
    const finalizeSelection = async (accountIds: string[]) => {
        try {
            isSelectingAccounts.value = true
            error.value = null

            if (!integrationId.value) {
                throw new Error('Integration ID não encontrado')
            }

            const result = await integrationsService.selectAccounts(
                integrationId.value,
                accountIds
            )

            if (!result.success) {
                throw new Error('Falha ao salvar seleção de contas')
            }

            selectedAccountIds.value = accountIds

            if (import.meta.env.DEV) {
                console.log('[Google Integration] Contas selecionadas:', accountIds)
            }

            return true
        } catch (err) {
            console.error('[Google Integration] Erro ao finalizar seleção:', err)
            error.value = err instanceof Error ? err.message : 'Erro ao salvar seleção'
            throw err
        } finally {
            isSelectingAccounts.value = false
        }
    }

    /**
     * Reset state when modal closes
     */
    const reset = () => {
        integrationId.value = null
        availableAccounts.value = []
        isConnecting.value = false
        isSelectingAccounts.value = false
        selectedAccountIds.value = []
        error.value = null
    }

    return {
        // Estado
        integrationId,
        availableAccounts,
        isConnecting,
        isSelectingAccounts,
        selectedAccountIds,
        error,

        // Computed
        hasIntegrationId,
        hasAccounts,

        // Métodos
        startOAuth,
        finalizeSelection,
        reset,
    }
}
