/**
 * Store de autenticação e gerenciamento de usuário
 * Gerencia estado de login e status de onboarding
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, supabaseEnabled } from '@/services/api/supabaseClient'
import type {
  User,
  LoginCredentials,
  AuthResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse
} from '@/types'
import type { OnboardingStatus } from '@/types/onboarding'
import { resetSessionValidation } from '@/services/sessionValidation'
import { analytics } from '@/services/analytics'

// ============================================================================
// CONSTANTES
// ============================================================================

const STORAGE_KEYS = {
  AUTH_TOKEN: 'adsmagic_auth_token',
  USER_DATA: 'adsmagic_user_data',
  ONBOARDING_STATUS: 'adsmagic_onboarding_status',
} as const
const ONBOARDING_STATUS_CACHE_TTL_MS = 10000
const AUTH_REQUEST_TIMEOUT_MS = 8000
const BOOTSTRAP_TIMEOUT_MS = 10000

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`[Auth] Timeout while waiting for ${label} (${timeoutMs}ms)`))
    }, timeoutMs)

    Promise.resolve(promise)
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

// ============================================================================
// STORE DEFINITION
export const useAuthStore = defineStore('auth', () => {
  let onboardingStatusInFlightPromise: Promise<OnboardingStatus> | null = null
  let bootstrapInFlightPromise: Promise<'onboarding' | 'projects'> | null = null
  let lastOnboardingCheckAt = 0
  let lastOnboardingCheckUserId: string | null = null

  // ============================================================================
  // ESTADO REATIVO
  // ============================================================================

  /**
   * Token de autenticação
   */
  const token = ref<string | null>(null)

  /**
   * Dados do usuário autenticado
   */
  const user = ref<User | null>(null)

  /**
   * Status do onboarding do usuário
   */
  const onboardingStatus = ref<OnboardingStatus>({
    isCompleted: false,
  })

  /**
   * Estado de carregamento durante operações assíncronas
   */
  const isLoading = ref(false)

  /**
   * Mensagem de erro da última operação
   */
  const error = ref<string | null>(null)

  // ============================================================================
  // GETTERS COMPUTADOS
  // ============================================================================

  /**
   * Verifica se o usuário está autenticado
   */
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value)
  })

  /**
   * Verifica se o onboarding foi completado
   */
  const onboardingCompleted = computed(() => {
    return onboardingStatus.value.isCompleted
  })

  /**
   * Retorna os dados completos do usuário (incluindo status de onboarding)
   */
  const userProfile = computed(() => {
    if (!user.value) return null

    return {
      ...user.value,
      onboarding: onboardingStatus.value,
    }
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Inicializa o store a partir do localStorage
   * Deve ser chamado no main.ts ou App.vue
   */
  const initialize = () => {
    try {
      // Recupera token do localStorage
      const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (savedToken) {
        // Evitar reaproveitar token mock quando Supabase está ligado
        if (supabaseEnabled && savedToken.startsWith('mock-')) {
          console.warn('[Auth] Token mock detectado com Supabase habilitado. Limpando dados locais.')
          clearAuthData()
        } else {
          token.value = savedToken
          const savedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA)
          if (savedUser) {
            user.value = JSON.parse(savedUser)
          }
        }
      }

      // Recupera status de onboarding
      const savedOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATUS)
      if (savedOnboarding) {
        const parsed = JSON.parse(savedOnboarding)
        // Converte string de data para Date se existir
        if (parsed.completedAt) {
          parsed.completedAt = new Date(parsed.completedAt)
        }
        if (parsed.data?.completedAt) {
          parsed.data.completedAt = new Date(parsed.data.completedAt)
        }
        onboardingStatus.value = parsed
      }
    } catch (error) {
      console.error('Erro ao inicializar auth store:', error)
      // Se houver erro, limpa dados corrompidos
      clearAuthData()
    }
  }

  /**
   * Realiza login do usuário
   */
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    isLoading.value = true
    error.value = null

    try {
      await prepareForUserSwitch()

      // Modo mock - simular login bem-sucedido quando Supabase está desligado
      if (!supabaseEnabled) {
        console.warn('[Auth] Mock mode - simulating login')

        const mockUser: User = {
          id: 'mock-user-id',
          email: credentials.email,
          name: 'Usuário Mock',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const mockToken = 'mock-jwt-token'

        token.value = mockToken
        user.value = mockUser

        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken)
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser))
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(onboardingStatus.value))

        return {
          user: mockUser,
          token: mockToken
        }
      }

      // Login real com Supabase
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        'signInWithPassword'
      )

      if (authError) throw authError
      if (!authData.user) throw new Error('No user data returned')

      const { resetSessionStateForUserSwitch } = await import('@/services/api/client')
      resetSessionStateForUserSwitch()

      // Carregar perfil do usuário
      let { data: profile, error: profileError } = await withTimeout(
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle(),
        AUTH_REQUEST_TIMEOUT_MS,
        'load user profile'
      )

      if (profileError) {
        console.warn('[Auth] Profile not found, will create on first access')
      }

      // Se perfil não existe, criar agora (primeiro login após confirmação)
      if (!profile && !profileError) {

        const { error: createProfileError } = await withTimeout(
          supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              first_name: authData.user.user_metadata?.first_name || authData.user.email?.split('@')[0] || 'Usuário',
              last_name: authData.user.user_metadata?.last_name || '',
              phone: authData.user.user_metadata?.phone || null,
              preferred_language: authData.user.user_metadata?.preferred_language || 'pt',
              timezone: authData.user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
            }),
          AUTH_REQUEST_TIMEOUT_MS,
          'create user profile'
        )

        if (createProfileError) {
          console.error('[Auth] ERRO CRÍTICO ao criar perfil:', createProfileError)
          console.error('[Auth] Código:', createProfileError.code)
          console.error('[Auth] Detalhes:', createProfileError.details)
          console.error('[Auth] Hint:', createProfileError.hint)
          console.error('[Auth] Message:', createProfileError.message)
          // Não bloqueia login, mas loga erro
        } else {
          // Recarregar perfil criado
          const { data: newProfile } = await withTimeout(
            supabase
              .from('user_profiles')
              .select('*')
              .eq('id', authData.user.id)
              .maybeSingle(),
            AUTH_REQUEST_TIMEOUT_MS,
            'reload created profile'
          )

          profile = newProfile
        }
      }

      // Atualizar last_login_at
      if (profile) {
        void supabase
          .from('user_profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', authData.user.id)
      }

      // Montar objeto User
      const userEmail = authData.user.email || ''
      const userData: User = {
        id: authData.user.id,
        email: userEmail,
        name: profile ? `${profile.first_name} ${profile.last_name}` : userEmail.split('@')[0] || 'Usuário',
        profile: profile ? {
          ...profile,
          preferred_language: (profile.preferred_language as 'pt' | 'en' | 'es') || 'pt'
        } : undefined,
        createdAt: new Date(authData.user.created_at),
        updatedAt: new Date()
      }

      // Identificar usuário no analytics
      analytics.identify(userData.id, { email: userData.email, name: userData.name })

      // Atualizar estado
      token.value = authData.session?.access_token || null
      user.value = userData

      // Salvar no localStorage
      if (authData.session) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authData.session.access_token)
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
      }

      // Verificar status de onboarding (não bloqueia login se falhar)
      try {
        await withTimeout(
          checkOnboardingStatus(),
          AUTH_REQUEST_TIMEOUT_MS,
          'check onboarding status'
        )
      } catch (err) {
        console.warn('[Auth] Erro ao verificar onboarding no login, será criado posteriormente:', err)
        // Define status padrão para permitir login
        onboardingStatus.value = { isCompleted: false }
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify({ isCompleted: false }))
      }

      return {
        user: userData,
        token: authData.session?.access_token || ''
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no login'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega dados essenciais após login e resolve destino inicial.
   */
  const bootstrapAfterLogin = async (): Promise<'onboarding' | 'projects'> => {
    if (!isAuthenticated.value || !user.value) {
      throw new Error('Usuário não autenticado')
    }

    if (bootstrapInFlightPromise) {
      return await bootstrapInFlightPromise
    }

    bootstrapInFlightPromise = (async (): Promise<'onboarding' | 'projects'> => {
      try {
        await checkOnboardingStatus()
      } catch (bootstrapError) {
        console.warn('[Auth] Erro ao carregar onboarding no bootstrap:', bootstrapError)
        onboardingStatus.value = { isCompleted: false }
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify({ isCompleted: false }))
      }

      if (!supabaseEnabled) {
        return 'projects'
      }

      const { useCompaniesStore } = await import('./companies')
      const companiesStore = useCompaniesStore()
      try {
        await withTimeout(
          companiesStore.fetchCompanies({ force: true, reason: 'bootstrap' }),
          BOOTSTRAP_TIMEOUT_MS,
          'fetch companies (bootstrap)'
        )
      } catch (firstCompaniesFetchError) {
        console.warn('[Auth] Companies fetch failed on bootstrap, retrying once...', firstCompaniesFetchError)
        await withTimeout(
          companiesStore.fetchCompanies({ force: true, reason: 'bootstrap' }),
          BOOTSTRAP_TIMEOUT_MS,
          'fetch companies (bootstrap retry)'
        )
      }

      if (companiesStore.hasCompanies && !onboardingStatus.value.isCompleted) {
        void markOnboardingCompleted().catch((error) => {
          console.warn('[Auth] Failed to sync onboarding status during bootstrap:', error)
        })
      }

      return companiesStore.hasCompanies ? 'projects' : 'onboarding'
    })()

    try {
      return await bootstrapInFlightPromise
    } finally {
      bootstrapInFlightPromise = null
    }
  }

  /**
   * Realiza logout do usuário
   */
  const logout = async () => {
    try {
      if (supabaseEnabled) {
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      await prepareForUserSwitch()
    }
  }

  /**
   * Verifica o status de onboarding do usuário
   */
  const checkOnboardingStatus = async (): Promise<OnboardingStatus> => {
    if (!isAuthenticated.value || !user.value) {
      throw new Error('Usuário não autenticado')
    }

    const userId = user.value.id
    const canUseOnboardingCache =
      lastOnboardingCheckUserId === userId &&
      Date.now() - lastOnboardingCheckAt < ONBOARDING_STATUS_CACHE_TTL_MS

    if (canUseOnboardingCache) {
      return onboardingStatus.value
    }

    if (onboardingStatusInFlightPromise) {
      return await onboardingStatusInFlightPromise
    }

    // Modo mock - retornar onboarding não completo
    if (!supabaseEnabled) {
      const status: OnboardingStatus = {
        isCompleted: false
      }
      onboardingStatus.value = status
      lastOnboardingCheckAt = Date.now()
      lastOnboardingCheckUserId = userId
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(status))
      return status
    }

    onboardingStatusInFlightPromise = (async (): Promise<OnboardingStatus> => {
      try {

        const { data, error: fetchError } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        // Se não existe, criar registro inicial
        if (!data && !fetchError) {

          const { error: createError } = await supabase
            .from('onboarding_progress')
            .insert({
              user_id: userId,
              company_setup: false,
              first_project_created: false,
              integrations_connected: false,
              first_contact_added: false,
              onboarding_data: {},
              is_completed: false
            })
            .select()
            .single()

          if (createError) {
            console.error('[Auth] ERRO ao criar onboarding_progress:', createError)
            throw createError
          }

          const status: OnboardingStatus = {
            isCompleted: false
          }

          onboardingStatus.value = status
          lastOnboardingCheckAt = Date.now()
          lastOnboardingCheckUserId = userId
          localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(status))
          return status
        }

        if (fetchError) throw fetchError

        const status: OnboardingStatus = {
          isCompleted: data?.is_completed || false,
          completedAt: data?.completed_at ? new Date(data.completed_at) : undefined
        }

        onboardingStatus.value = status
        lastOnboardingCheckAt = Date.now()
        lastOnboardingCheckUserId = userId
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(status))

        return status
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar onboarding'
        error.value = errorMessage
        throw new Error(errorMessage)
      }
    })()

    try {
      return await onboardingStatusInFlightPromise
    } finally {
      onboardingStatusInFlightPromise = null
    }
  }

  /**
   * Marca onboarding como completado
   */
  const markOnboardingCompleted = async (): Promise<void> => {
    if (!isAuthenticated.value || !user.value) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Modo mock: se Supabase estiver desabilitado, apenas atualiza localmente
      if (!supabaseEnabled) {
        const updatedStatus: OnboardingStatus = {
          isCompleted: true,
          completedAt: new Date()
        }

        onboardingStatus.value = updatedStatus
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(updatedStatus))
        return
      }

      // Upsert para garantir que o registro exista (evita 406 quando o trigger
      // ainda não criou a linha em auth.users → onboarding_progress).
      const { error: upsertError } = await supabase
        .from('onboarding_progress')
        .upsert(
          {
            user_id: user.value.id,
            is_completed: true,
            completed_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )

      if (upsertError) throw upsertError

      const updatedStatus: OnboardingStatus = {
        isCompleted: true,
        completedAt: new Date()
      }

      onboardingStatus.value = updatedStatus
      lastOnboardingCheckAt = Date.now()
      lastOnboardingCheckUserId = user.value.id
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(updatedStatus))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao marcar onboarding'
      error.value = errorMessage
      throw new Error(errorMessage)
    }
  }

  /**
   * Limpa todos os dados de autenticação
   */
  const clearAuthData = () => {
    resetSessionValidation()
    analytics.reset()
    token.value = null
    user.value = null
    onboardingStatus.value = { isCompleted: false }
    error.value = null
    onboardingStatusInFlightPromise = null
    lastOnboardingCheckAt = 0
    lastOnboardingCheckUserId = null

    // Remove do localStorage
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STATUS)
    localStorage.removeItem('current_company_id')
    localStorage.removeItem('adsmagic_oauth_in_progress')
  }

  /**
   * Prepara aplicação para troca de usuário limpando estado local e caches em memória.
   */
  const prepareForUserSwitch = async (): Promise<void> => {
    clearAuthData()
    onboardingStatusInFlightPromise = null
    bootstrapInFlightPromise = null
    lastOnboardingCheckAt = 0
    lastOnboardingCheckUserId = null

    try {
      const { resetSessionStateForUserSwitch } = await import('@/services/api/client')
      resetSessionStateForUserSwitch()
    } catch (sessionResetError) {
      console.warn('[Auth] Failed to reset API session cache for user switch:', sessionResetError)
    }

    try {
      const { useCompaniesStore } = await import('./companies')
      const companiesStore = useCompaniesStore()
      companiesStore.resetForUserSwitch()
    } catch (companiesResetError) {
      console.warn('[Auth] Failed to reset companies store for user switch:', companiesResetError)
    }
  }

  /**
   * Limpa mensagens de erro
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Envia código OTP para reset de senha
   */
  const sendPasswordResetOtp = async (email: string): Promise<ForgotPasswordResponse> => {
    isLoading.value = true
    error.value = null

    // Modo mock
    if (!supabaseEnabled) {
      console.warn('[Auth] Mock mode - simulating password reset')
      return {
        message: 'Email de redefinição enviado (mock)',
        email,
        expiresIn: 3600
      }
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError

      return {
        message: 'Email de redefinição enviado com sucesso',
        email,
        expiresIn: 3600 // 1 hora
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar email'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * NOTA: Supabase usa reset via email link, não OTP
   * A função verifyPasswordResetOtp foi removida
   * O fluxo é: user recebe email -> clica no link -> página de reset
   */

  /**
   * Reseta a senha do usuário
   */
  const resetPassword = async (newPassword: string): Promise<ResetPasswordResponse> => {
    isLoading.value = true
    error.value = null

    // Modo mock
    if (!supabaseEnabled) {
      console.warn('[Auth] Mock mode - simulating password update')
      return {
        message: 'Senha redefinida com sucesso (mock)',
        success: true
      }
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      return {
        message: 'Senha redefinida com sucesso',
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao redefinir senha'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // LISTENER DE SESSÃO SUPABASE
  // ============================================================================

  // Listener de mudanças na sessão do Supabase (apenas se Supabase estiver habilitado)
  if (supabaseEnabled) {
    supabase.auth.onAuthStateChange((event, session) => {

      if (event === 'SIGNED_IN' && session) {
        // Atualizar token imediatamente (síncrono) para não bloquear signInWithPassword
        token.value = session.access_token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token)

        // Carregar perfil e onboarding de forma não-bloqueante
        // A função login() já faz este trabalho; aqui é fallback para
        // restauração de sessão automática e OAuth callbacks.
        void (async () => {
          try {
            const previousUserId = user.value?.id ?? null
            if (previousUserId && previousUserId !== session.user.id) {
              try {
                const { useCompaniesStore } = await import('./companies')
                useCompaniesStore().resetForUserSwitch()
              } catch (companiesResetError) {
                console.warn('[Auth] Failed to reset companies on SIGNED_IN user switch:', companiesResetError)
              }
            }

            // Carregar perfil
            let { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle()

            // Se perfil não existe, criar no primeiro SIGNED_IN
            if (!profile) {
              const { error: createProfileError } = await supabase
                .from('user_profiles')
                .insert({
                  id: session.user.id,
                  first_name: session.user.user_metadata?.first_name || session.user.email?.split('@')[0] || 'Usuário',
                  last_name: session.user.user_metadata?.last_name || '',
                  phone: session.user.user_metadata?.phone || null,
                  preferred_language: session.user.user_metadata?.preferred_language || 'pt',
                  timezone: session.user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
                })

              if (createProfileError) {
                console.error('[Auth] Erro ao criar perfil no SIGNED_IN:', createProfileError)
              } else {
                const { data: newProfile } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .maybeSingle()

                profile = newProfile
              }
            }

            const sessionEmail = session.user.email || ''
            const userData: User = {
              id: session.user.id,
              email: sessionEmail,
              name: profile ? `${profile.first_name} ${profile.last_name}` : sessionEmail.split('@')[0] || 'Usuário',
              profile: profile ? {
                ...profile,
                preferred_language: (profile.preferred_language as 'pt' | 'en' | 'es') || 'pt'
              } : undefined,
              createdAt: new Date(session.user.created_at),
              updatedAt: new Date()
            }

            user.value = userData

            // Tentar verificar onboarding, mas não falhar se houver erro
            try {
              await checkOnboardingStatus()
            } catch (err) {
              console.warn('[Auth] Erro ao verificar onboarding, será criado posteriormente:', err)
              onboardingStatus.value = { isCompleted: false }
            }
          } catch (listenerError) {
            console.warn('[Auth] Erro no listener SIGNED_IN (não-bloqueante):', listenerError)
          }
        })()

      } else if (event === 'SIGNED_OUT') {
        // IMPORTANTE: Não limpar token imediatamente durante SIGNED_OUT
        // Isso é crítico para fluxos OAuth onde popup pode causar SIGNED_OUT temporário
        // O token será preservado e usado pelo interceptor mesmo durante SIGNED_OUT
        // Se há token no localStorage, preservá-lo (pode ser necessário para OAuth callback)
        const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        const oauthInProgress = localStorage.getItem('adsmagic_oauth_in_progress') === 'true'

        if (savedToken && token.value) {
          // Preservar token durante SIGNED_OUT temporário (comum em OAuth)

          // Se OAuth está em progresso, NÃO limpar dados (aguardar callback)
          // Isso previne limpeza prematura durante fluxo OAuth ativo
          if (oauthInProgress) {
            // Não fazer setTimeout, apenas preservar token
            // A flag será limpa após OAuth callback bem-sucedido
            return
          }

          // Se não é OAuth, usar timeout aumentado (15s) como fallback
          // Timeout aumentado dá mais tempo para Supabase restaurar sessão automaticamente
          setTimeout(() => {
            // Verificar se sessão foi restaurada após 15 segundos
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (!session && token.value === savedToken) {
                // Se ainda não há sessão e token não mudou, então realmente limpar
                clearAuthData()
              } else if (session) {
                // Sessão foi restaurada, atualizar token
                token.value = session.access_token
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token)
              }
            })
          }, 15000) // Aumentado de 5s para 15s para dar mais tempo à restauração
        } else {
          // Não há token preservado, limpar normalmente
          clearAuthData()
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        token.value = session.access_token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token)
      }
    })
  } // Fim do if (supabase)

  // ============================================================================
  // RETORNO DA STORE
  // ============================================================================

  return {
    // Estado
    token,
    user,
    onboardingStatus,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    onboardingCompleted,
    userProfile,

    // Actions
    initialize,
    login,
    bootstrapAfterLogin,
    logout,
    checkOnboardingStatus,
    markOnboardingCompleted,
    clearAuthData,
    prepareForUserSwitch,
    clearError,
    sendPasswordResetOtp,
    resetPassword,
  }
})
