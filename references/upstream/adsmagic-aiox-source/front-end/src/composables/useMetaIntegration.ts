/**
 * Composable para integração Meta no ProjectWizard
 * Gerencia o fluxo completo: OAuth → Seleção de Contas → Seleção/Criação de Pixel
 */

import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios, { type AxiosError } from 'axios'
import { integrationsService } from '@/services/api/integrations'
import { openOAuthPopup } from './useOAuthPopup'
import { getApiErrorMessage, ensureSession } from '@/services/api/client'
import { getOAuthRedirectUri } from '@/utils/oauthRedirect'

export interface MetaAccount {
  id: string
  name: string
  accountId: string
  currency?: string
  metadata: Record<string, unknown>
}

export interface MetaPixel {
  id: string
  name: string
  isCreated?: boolean
}

export function useMetaIntegration() {
  const route = useRoute()

  // Estado - sempre inicializar como vazio
  const isConnecting = ref(false)
  const isSelectingAccounts = ref(false)
  const isCreatingPixel = ref(false)
  const error = ref<string | null>(null)
  const integrationId = ref<string | null>(null)
  const availableAccounts = ref<MetaAccount[]>([])
  const availablePixels = ref<MetaPixel[]>([])
  const selectedAccountIds = ref<string[]>([])
  const selectedPixelId = ref<string | null>(null)

  // Debug: log quando estado muda
  if (import.meta.env.DEV) {
    watch([integrationId, availableAccounts], ([newId, newAccounts]) => {
      console.log('[useMetaIntegration] State changed:', {
        integrationId: newId,
        accountsCount: newAccounts.length,
      })
    })
  }

  // Computed
  const hasAccounts = computed(() => availableAccounts.value.length > 0)
  const hasPixels = computed(() => availablePixels.value.length > 0)
  const canProceed = computed(() => {
    return selectedAccountIds.value.length > 0 && selectedPixelId.value !== null
  })

  /**
   * Inicia fluxo OAuth
   */
  const startOAuth = async (): Promise<void> => {
    isConnecting.value = true
    error.value = null
    // 0a. Garantir sessão ativa antes de iniciar fluxo (necessário para testes e fluxo real)
    const initialSession = await ensureSession()
    if (!initialSession) {
      // Tentar mais uma vez após pequeno atraso
      await new Promise(resolve => setTimeout(resolve, 300))
      const retrySession = await ensureSession()
      if (!retrySession) {
        error.value = 'Sessão expirada'
        throw new Error('Sessão expirada')
      }
    }


    try {
      // 0. Validar que projectId está disponível antes de iniciar OAuth
      // Isso é necessário para que o backend possa associar a integração ao projeto
      // O projectId será incluído no state parameter para garantir disponibilidade mesmo se sessão for perdida
      let projectId = route.query.projectId as string

      if (projectId) {
        localStorage.setItem('current_project_id', projectId)
        console.log('[useMetaIntegration] ProjectId obtido da query e definido no localStorage:', projectId)
      } else {
        // Tentar obter do localStorage (caso já tenha sido setado anteriormente)
        projectId = localStorage.getItem('current_project_id') || ''
        if (projectId) {
          console.log('[useMetaIntegration] ProjectId obtido do localStorage:', projectId)
        }
      }

      // Validação explícita: lançar erro claro se não houver projectId
      // EXCETO em modo mock durante wizard (onde projeto ainda não existe)
      const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
      if (!projectId && !USE_MOCK) {
        const errorMessage = 'ID do projeto não encontrado. Por favor, acesse a página através do assistente de projetos.'
        console.error('[useMetaIntegration]', errorMessage)
        error.value = errorMessage
        throw new Error(errorMessage)
      }

      if (!projectId && USE_MOCK) {
        console.log('[useMetaIntegration] Modo mock sem projectId - usando wizard flow')
        projectId = 'wizard-temp-id' // ID temporário para wizard
      }

      // 1. Obter locale atual da rota ou usar 'pt' como padrão
      const locale = (route.params.locale as string) || 'pt'
      const redirectUri = getOAuthRedirectUri(locale)

      console.log('[useMetaIntegration] Iniciando OAuth com projectId:', projectId)

      // 2. PRESERVAR TOKEN ANTES DE ABRIR POPUP
      // Isso é crítico porque o popup pode causar SIGNED_OUT na janela principal
      // e precisamos garantir que o token esteja disponível mesmo durante SIGNED_OUT
      let preservedToken: string | null = null
      try {
        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()
        preservedToken = authStore.token

        // Se auth store não tem token, tentar obter do Supabase
        if (!preservedToken) {
          const { supabase } = await import('@/services/api/supabaseClient')
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            preservedToken = session.access_token
            // Salvar no auth store e localStorage para uso posterior
            authStore.token = preservedToken
            localStorage.setItem('adsmagic_auth_token', preservedToken)
            if (import.meta.env.DEV) {
              console.log('[useMetaIntegration] ✅ Token preservado do Supabase antes de abrir popup')
            }
          }
        } else {
          // Garantir que token do auth store também está no localStorage
          localStorage.setItem('adsmagic_auth_token', preservedToken)
          if (import.meta.env.DEV) {
            console.log('[useMetaIntegration] ✅ Token preservado do auth store antes de abrir popup')
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[useMetaIntegration] ⚠️ Erro ao preservar token:', error)
        }
      }

      // 3. Obter URL de autorização (enviando redirectUri para o backend)
      // O backend incluirá o projectId no state parameter automaticamente (via header X-Project-ID)
      const oauthResponse = await integrationsService.startOAuth('meta', redirectUri)

      // Validar resposta antes de continuar
      if (!oauthResponse || !oauthResponse.authUrl) {
        const errorMsg = 'Não foi possível obter a URL de autenticação do Meta Ads'
        error.value = errorMsg
        if (import.meta.env.DEV) {
          console.error('[Meta Integration] ❌ Resposta inválida do startOAuth:', oauthResponse)
        }
        throw new Error(errorMsg)
      }

      const { authUrl } = oauthResponse

      // 4. Setar flag OAuth em progresso ANTES de abrir popup
      // Isso previne que auth store limpe dados durante SIGNED_OUT temporário
      localStorage.setItem('adsmagic_oauth_in_progress', 'true')
      if (import.meta.env.DEV) {
        console.log('[Meta Integration] ✅ Flag OAuth setada - dados serão preservados durante SIGNED_OUT')
      }

      // 5. Abrir popup OAuth
      await openOAuthPopup({
        authUrl,
        redirectUri,
        onSuccess: async (token: string, projectIdFromState?: string | null) => {
          try {
            if (import.meta.env.DEV) {
              console.log('[Meta Integration] 🔔 Token recebido do popup:', {
                hasToken: !!token,
                hasProjectIdFromState: !!projectIdFromState,
                tokenLength: token?.length || 0,
                timestamp: new Date().toISOString()
              })
            }

            // RESTAURAR TOKEN PRESERVADO SE NECESSÁRIO
            // Se o token foi preservado antes do popup, garantir que ele esteja no auth store
            if (preservedToken) {
              try {
                const { useAuthStore } = await import('@/stores/auth')
                const authStore = useAuthStore()
                // Sempre garantir que o token preservado esteja no auth store
                // Mesmo que já exista, garantir que seja o token correto
                authStore.token = preservedToken
                // Também garantir que está no localStorage
                localStorage.setItem('adsmagic_auth_token', preservedToken)
                if (import.meta.env.DEV) {
                  console.log('[Meta Integration] ✅ Token preservado garantido no auth store e localStorage após popup', {
                    hasToken: !!authStore.token,
                    tokenLength: preservedToken.length
                  })
                }
              } catch (error) {
                if (import.meta.env.DEV) {
                  console.warn('[Meta Integration] ⚠️ Erro ao restaurar token:', error)
                }
              }
            } else {
              if (import.meta.env.DEV) {
                console.warn('[Meta Integration] ⚠️ Nenhum token preservado antes do popup')
              }
            }

            // DELAY: Aguardar 1s para dar tempo do Supabase restaurar sessão automaticamente
            // Isso é crítico porque popup OAuth pode causar SIGNED_OUT na janela principal
            // e a sessão precisa ser restaurada antes de fazer a requisição
            if (import.meta.env.DEV) {
              console.log('[Meta Integration] ⏳ Aguardando 1s para restauração de sessão...')
            }
            await new Promise(resolve => setTimeout(resolve, 1000))

            if (import.meta.env.DEV) {
              console.log('[Meta Integration] ✅ Delay concluído, processando callback...')
            }

            // Processar callback (obter contas)
            // O interceptor do apiClient gerencia a sessão automaticamente (com refresh se necessário)
            // Usar projectId do state parameter se disponível (fallback para casos de sessão perdida)
            // Capturar erros específicos do axios antes que cheguem ao interceptor
            try {
              if (import.meta.env.DEV) {
                console.log('[Meta Integration] 📡 Chamando handleOAuthCallback...')
              }

              const result = projectIdFromState
                ? await integrationsService.handleOAuthCallback('meta', token, projectIdFromState)
                : await integrationsService.handleOAuthCallback('meta', token)

              if (result.success && result.accounts && result.integrationId) {
                if (import.meta.env.DEV) {
                  console.log('[Meta Integration] ✅ Callback processado com sucesso:', {
                    integrationId: result.integrationId,
                    accountsCount: result.accounts.length,
                    timestamp: new Date().toISOString()
                  })
                }

                integrationId.value = result.integrationId

                availableAccounts.value = result.accounts.map((acc: any) => ({
                  id: acc.id,
                  name: acc.name,
                  accountId: acc.accountId,
                  currency: acc.currency ?? 'USD',
                  metadata: acc.metadata ?? {},
                }))

                // Forçar verificação e atualização de sessão após OAuth callback bem-sucedido
                // Isso garante que sessão seja restaurada imediatamente
                try {
                  const { supabase } = await import('@/services/api/supabaseClient')
                  const { data: { session } } = await supabase.auth.getSession()

                  if (session?.access_token) {
                    const { useAuthStore } = await import('@/stores/auth')
                    const authStore = useAuthStore()
                    authStore.token = session.access_token
                    localStorage.setItem('adsmagic_auth_token', session.access_token)

                    if (import.meta.env.DEV) {
                      console.log('[Meta Integration] ✅ Sessão restaurada e atualizada após OAuth callback')
                    }
                  }
                } catch (sessionError) {
                  if (import.meta.env.DEV) {
                    console.warn('[Meta Integration] ⚠️ Erro ao verificar sessão após callback:', sessionError)
                  }
                }

                // Limpar flag OAuth após callback bem-sucedido
                localStorage.removeItem('adsmagic_oauth_in_progress')
                if (import.meta.env.DEV) {
                  console.log('[Meta Integration] ✅ Flag OAuth removida - fluxo concluído')
                }

                // Não carregar pixels automaticamente - aguardar usuário escolher conta
              } else {
                const errorMessage = result.error || 'Falha na autenticação'
                console.error('[Meta Integration] Callback retornou erro:', errorMessage)
                error.value = errorMessage
                throw new Error(errorMessage)
              }
            } catch (apiError) {
              // Tratar erros específicos do axios (401, 403, etc.)
              if (axios.isAxiosError(apiError)) {
                const axiosError = apiError as AxiosError
                const status = axiosError.response?.status
                const errorMessage = getApiErrorMessage(apiError)

                console.error('[Meta Integration] Erro na API ao processar callback:', {
                  status,
                  message: errorMessage,
                  url: axiosError.config?.url
                })

                // Se erro 401, tentar recarregar sessão e fazer retry
                // O interceptor do apiClient já tenta restaurar a sessão automaticamente,
                // mas podemos fazer um retry manual se necessário
                if (status === 401) {
                  if (import.meta.env.DEV) {
                    console.log('[Meta Integration] ⚠️ Erro 401 detectado, iniciando retry logic...', {
                      url: axiosError.config?.url,
                      timestamp: new Date().toISOString()
                    })
                  }

                  try {
                    // Aguardar um pouco para dar tempo da sessão ser restaurada
                    // O interceptor já tentou restaurar, mas pode precisar de mais tempo
                    if (import.meta.env.DEV) {
                      console.log('[Meta Integration] ⏳ Aguardando 2s para restauração de sessão...')
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000))

                    // Tentar garantir sessão novamente com waitForRestore
                    if (import.meta.env.DEV) {
                      console.log('[Meta Integration] 🔍 Verificando sessão com ensureSession({ waitForRestore: true })...')
                    }
                    const retrySession = await ensureSession({ waitForRestore: true })

                    if (retrySession) {
                      if (import.meta.env.DEV) {
                        console.log('[Meta Integration] ✅ Sessão restaurada, tentando callback novamente...', {
                          hasToken: !!retrySession.access_token,
                          tokenLength: retrySession.access_token?.length || 0
                        })
                      }

                      // Retry do callback com sessão restaurada
                      // Usar projectId do state parameter se disponível
                      try {
                        if (import.meta.env.DEV) {
                          console.log('[Meta Integration] 📡 Retry: Chamando handleOAuthCallback novamente...')
                        }
                        const retryResult = projectIdFromState
                          ? await integrationsService.handleOAuthCallback('meta', token, projectIdFromState)
                          : await integrationsService.handleOAuthCallback('meta', token)

                        if (retryResult.success && retryResult.accounts && retryResult.integrationId) {
                          if (import.meta.env.DEV) {
                            console.log('[Meta Integration] ✅ Retry bem-sucedido após restaurar sessão:', {
                              integrationId: retryResult.integrationId,
                              accountsCount: retryResult.accounts.length,
                              timestamp: new Date().toISOString()
                            })
                          }

                          integrationId.value = retryResult.integrationId

                          availableAccounts.value = retryResult.accounts.map((acc: any) => ({
                            id: acc.id,
                            name: acc.name,
                            accountId: acc.accountId,
                            currency: acc.currency ?? 'USD',
                            metadata: acc.metadata ?? {},
                          }))

                          // Forçar verificação e atualização de sessão após retry bem-sucedido
                          try {
                            const { supabase } = await import('@/services/api/supabaseClient')
                            const { data: { session } } = await supabase.auth.getSession()

                            if (session?.access_token) {
                              const { useAuthStore } = await import('@/stores/auth')
                              const authStore = useAuthStore()
                              authStore.token = session.access_token
                              localStorage.setItem('adsmagic_auth_token', session.access_token)

                              if (import.meta.env.DEV) {
                                console.log('[Meta Integration] ✅ Sessão restaurada e atualizada após retry')
                              }
                            }
                          } catch (sessionError) {
                            if (import.meta.env.DEV) {
                              console.warn('[Meta Integration] ⚠️ Erro ao verificar sessão após retry:', sessionError)
                            }
                          }

                          // Limpar flag OAuth após retry bem-sucedido
                          localStorage.removeItem('adsmagic_oauth_in_progress')
                          if (import.meta.env.DEV) {
                            console.log('[Meta Integration] ✅ Flag OAuth removida após retry bem-sucedido')
                          }

                          // Não carregar pixels automaticamente - aguardar usuário escolher conta

                          // Sucesso no retry, não lançar erro
                          return
                        }
                      } catch (retryError) {
                        if (import.meta.env.DEV) {
                          console.error('[Meta Integration] ❌ Retry falhou:', {
                            error: retryError instanceof Error ? retryError.message : String(retryError),
                            timestamp: new Date().toISOString()
                          })
                        }
                        // Continuar para mostrar erro ao usuário
                      }
                    } else {
                      if (import.meta.env.DEV) {
                        console.warn('[Meta Integration] ⚠️ Sessão não foi restaurada após aguardar 2s + waitForRestore')
                      }
                    }
                  } catch (sessionError) {
                    if (import.meta.env.DEV) {
                      console.error('[Meta Integration] ❌ Erro ao tentar restaurar sessão:', {
                        error: sessionError instanceof Error ? sessionError.message : String(sessionError),
                        timestamp: new Date().toISOString()
                      })
                    }
                  }

                  // Se chegou aqui, retry falhou ou sessão não foi restaurada
                  error.value = 'Sessão expirada durante autenticação. Por favor, faça login novamente e tente conectar novamente.'
                } else if (status === 403) {
                  error.value = 'Você não tem permissão para conectar esta conta do Meta.'
                } else if (status === 400) {
                  error.value = errorMessage || 'Dados inválidos. Verifique as informações fornecidas.'
                } else if (status === 404) {
                  error.value = 'Endpoint não encontrado. Tente novamente mais tarde.'
                } else if (status === 500) {
                  error.value = 'Erro no servidor. Tente novamente mais tarde.'
                } else {
                  error.value = errorMessage || 'Erro ao processar autenticação do Meta.'
                }
              } else {
                // Erro não-Axios (ex: erro de validação do serviço)
                const errorMessage = apiError instanceof Error ? apiError.message : 'Erro desconhecido'
                console.error('[Meta Integration] Erro não-Axios ao processar callback:', errorMessage)
                error.value = errorMessage
              }

              // Re-lançar o erro para que o popup saiba que falhou
              throw apiError instanceof Error ? apiError : new Error(error.value)
            }
          } catch (err) {
            if (import.meta.env.DEV) {
              console.error('[Meta Integration] ❌ Erro ao processar callback:', {
                error: err instanceof Error ? err.message : String(err),
                timestamp: new Date().toISOString()
              })
            }

            // Garantir que o erro está definido
            if (!error.value) {
              error.value = err instanceof Error ? err.message : 'Erro ao processar autenticação'
            }

            // Re-lançar para que o openOAuthPopup saiba que falhou
            throw err
          } finally {
            // Limpar flag OAuth em caso de erro também
            localStorage.removeItem('adsmagic_oauth_in_progress')
            if (import.meta.env.DEV) {
              console.log('[Meta Integration] ✅ Flag OAuth removida após erro')
            }
          }
        },
        onError: (err: Error) => {
          // Limpar flag OAuth em caso de erro
          localStorage.removeItem('adsmagic_oauth_in_progress')

          if (import.meta.env.DEV) {
            console.error('[Meta Integration] ❌ Erro no OAuth popup:', {
              error: err.message,
              timestamp: new Date().toISOString()
            })
          }

          // Definir mensagem de erro amigável
          if (!error.value) {
            if (err.message.includes('cancelou')) {
              error.value = 'Autenticação cancelada pelo usuário.'
            } else if (err.message.includes('Timeout')) {
              error.value = 'Tempo de autenticação esgotado. Tente novamente.'
            } else if (err.message.includes('Popup foi fechado')) {
              error.value = 'A janela de autenticação foi fechada. Tente novamente.'
            } else {
              error.value = err.message || 'Erro na autenticação do Meta.'
            }
          }
        },
        timeout: 5 * 60 * 1000, // 5 minutos
      })
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[Meta Integration] ❌ Erro ao iniciar OAuth:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString()
        })
      }
      error.value = err instanceof Error ? err.message : 'Erro ao iniciar autenticação'
      throw err
    } finally {
      isConnecting.value = false
    }
  }

  /**
   * Carrega pixels disponíveis para a integração
   * @param accountId - ID da conta (opcional). Se fornecido, busca pixels dessa conta específica
   */
  const loadPixels = async (accountId?: string): Promise<void> => {
    if (!integrationId.value) {
      throw new Error('Integration ID não encontrado')
    }

    // Log de debug para rastrear chamadas não autorizadas
    if (import.meta.env.DEV) {
      const stackTrace = new Error().stack
      console.log('[Meta Integration] loadPixels chamado:', {
        accountId,
        integrationId: integrationId.value,
        stackTrace: stackTrace?.split('\n').slice(0, 5).join('\n')
      })
    }

    // Garantir que isCreatingPixel está false (não deve ser setado durante loadPixels)
    if (isCreatingPixel.value) {
      console.warn('[Meta Integration] isCreatingPixel estava true durante loadPixels, resetando...')
      isCreatingPixel.value = false
    }

    try {
      const pixels = await integrationsService.getPixels(integrationId.value, accountId)
      availablePixels.value = pixels
    } catch (err) {
      console.error('[Meta Integration] Erro ao carregar pixels:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao carregar pixels'
      throw err
    }
  }

  /**
   * Cria um novo pixel
   * @param name - Nome do pixel
   * @param accountId - ID da conta (opcional). Se não fornecido, usa primeira conta de selectedAccountIds ou availableAccounts
   */
  const createPixel = async (name: string, accountId?: string): Promise<MetaPixel> => {
    if (!integrationId.value) {
      throw new Error('Integration ID não encontrado')
    }

    // Se accountId não fornecido, usar primeira conta selecionada ou primeira conta disponível
    let targetAccountId = accountId
    if (!targetAccountId) {
      if (selectedAccountIds.value.length > 0) {
        // Buscar accountId da primeira conta selecionada
        const firstSelectedAccount = availableAccounts.value.find(
          acc => selectedAccountIds.value.includes(acc.id) || selectedAccountIds.value.includes(acc.accountId)
        )
        targetAccountId = firstSelectedAccount?.accountId
      }

      // Se ainda não encontrou, usar primeira conta disponível
      if (!targetAccountId && availableAccounts.value.length > 0) {
        const firstAccount = availableAccounts.value[0]
        if (firstAccount) {
          targetAccountId = firstAccount.accountId
        }
      }

      if (!targetAccountId) {
        throw new Error('Nenhuma conta disponível para criar pixel')
      }
    }

    isCreatingPixel.value = true
    error.value = null

    try {
      const result = await integrationsService.createPixel(integrationId.value, name, targetAccountId)

      if (result.success && result.pixel) {
        availablePixels.value.push(result.pixel)
        selectedPixelId.value = result.pixel.id
        return result.pixel
      } else {
        throw new Error('Falha ao criar pixel')
      }
    } catch (err) {
      console.error('[Meta Integration] Erro ao criar pixel:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao criar pixel'
      throw err
    } finally {
      isCreatingPixel.value = false
    }
  }

  /**
   * Finaliza seleção de contas e pixel
   */
  const finalizeSelection = async (
    accountIds: string[],
    pixelId?: string,
    createPixel?: { name: string }
  ): Promise<void> => {
    if (!integrationId.value) {
      throw new Error('Integration ID não encontrado')
    }

    isSelectingAccounts.value = true
    error.value = null

    try {
      const result = await integrationsService.selectAccounts(
        integrationId.value,
        accountIds,
        pixelId,
        createPixel
      )

      if (!result.success) {
        throw new Error('Falha ao salvar seleção')
      }

      selectedAccountIds.value = accountIds
      if (pixelId) {
        selectedPixelId.value = pixelId
      }
    } catch (err) {
      console.error('[Meta Integration] Erro ao finalizar seleção:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao salvar seleção'
      throw err
    } finally {
      isSelectingAccounts.value = false
    }
  }

  /**
   * Carrega integração existente e contas salvas
   * 
   * ✅ Conformidade:
   * - SRP: Apenas carrega estado
   * - Type-safe
   * - Error handling não bloqueante
   */
  const loadExistingIntegration = async (projectId: string): Promise<void> => {
    try {
      // ✅ Buscar integração existente
      const integrations = await integrationsService.getIntegrations(projectId)
      const metaIntegration = integrations.find(i => i.platform === 'meta')

      if (metaIntegration && metaIntegration.id) {
        integrationId.value = metaIntegration.id

        // ✅ Buscar contas salvas
        const accountsData = await integrationsService.getIntegrationAccounts(metaIntegration.id)

        if (accountsData.accounts.length > 0) {
          // ✅ Popular estado com dados salvos
          availableAccounts.value = accountsData.accounts.map(acc => ({
            id: acc.id,
            name: acc.account_name,
            accountId: acc.external_account_id,
            currency: 'USD', // TODO: Buscar do metadata se necessário
            metadata: {},
          }))

          selectedAccountIds.value = accountsData.accounts
            .filter(acc => acc.status === 'active')
            .map(acc => acc.external_account_id)

          // ✅ Carregar pixels das contas salvas
          let pixelIdFound = false
          for (const account of accountsData.accounts) {
            if (account.pixel_id) {
              selectedPixelId.value = account.pixel_id
              pixelIdFound = true
              break // Por enquanto, assumir primeiro pixel
            }
          }

          // ✅ Se há conta selecionada mas ainda não carregou pixels, carregar da primeira conta
          if (selectedAccountIds.value.length > 0 && !pixelIdFound) {
            const firstAccountId = selectedAccountIds.value[0]
            try {
              // Carregar pixels da primeira conta
              await loadPixels(firstAccountId)
              if (import.meta.env.DEV) {
                console.log('[Meta Integration] Pixels carregados da primeira conta salva')
              }
            } catch (error) {
              if (import.meta.env.DEV) {
                console.warn('[Meta Integration] Erro ao carregar pixels da conta salva:', error)
              }
              // Não bloquear - pixels podem ser carregados depois
            }
          }
        }
      }
    } catch (error) {
      console.error('[Meta Integration] Error loading existing integration:', error)
      // ✅ Não bloquear fluxo - apenas log
    }
  }

  /**
   * Limpa estado
   */
  const reset = (): void => {
    console.log('[useMetaIntegration] Resetting state')
    isConnecting.value = false
    isSelectingAccounts.value = false
    isCreatingPixel.value = false // Garantir que está limpo
    error.value = null
    integrationId.value = null
    availableAccounts.value = []
    availablePixels.value = []
    selectedAccountIds.value = []
    selectedPixelId.value = null

    if (import.meta.env.DEV) {
      console.log('[useMetaIntegration] State reset complete:', {
        integrationId: integrationId.value,
        accountsCount: availableAccounts.value.length,
      })
    }
  }

  return {
    // Estado
    isConnecting,
    isSelectingAccounts,
    isCreatingPixel,
    error,
    integrationId,
    availableAccounts,
    availablePixels,
    selectedAccountIds,
    selectedPixelId,

    // Computed
    hasAccounts,
    hasPixels,
    canProceed,

    // Métodos
    startOAuth,
    loadPixels,
    createPixel,
    finalizeSelection,
    loadExistingIntegration,
    reset,
  }
}

