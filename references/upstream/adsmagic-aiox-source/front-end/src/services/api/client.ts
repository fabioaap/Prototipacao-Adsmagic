/**
 * HTTP Client for API communication
 *
 * This module provides a configured axios instance with:
 * - Automatic authentication token injection
 * - Centralized error handling
 * - Request/response interceptors
 * - TypeScript type safety
 *
 * @module services/api/client
 */

import axios, { type AxiosError } from 'axios'
import type { ApiError } from '@/types'
import { supabase, supabaseEnabled } from './supabaseClient'

/**
 * Base API client instance
 *
 * Configured with:
 * - Base URL from environment or default to localhost
 * - 15 second timeout (Edge Functions may have cold starts)
 * - JSON content type
 * - Automatic authentication headers
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://nitefyufrzytdtxhaocf.supabase.co/functions/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Ensures a valid Supabase session is available
 * 
 * This function checks if a session exists and is valid. If the session is expired
 * but a refresh token is available, it attempts to refresh the session automatically.
 * 
 * When session is lost (SIGNED_OUT), it will wait and retry to restore the session
 * by listening to auth state changes. This is critical for OAuth flows where popup
 * can cause session loss in the main window.
 * 
 * @param options - Options for session restoration
 * @param options.waitForRestore - If true, wait up to 5 seconds for session to be restored (default: false)
 * @returns Promise that resolves to the session if available, or null if no session exists
 * @throws Error if session refresh fails
 * 
 * @example
 * ```ts
 * const session = await ensureSession({ waitForRestore: true })
 * if (session) {
 *   // Session is valid and ready to use
 * }
 * ```
 */
// Cache para evitar múltiplas chamadas ao auth store
let cachedAuthStore: { token: string | null } | null = null
let isHandlingUnauthorized = false
let authFailureBlockUntil = 0
const AUTH_FAILURE_BLOCK_WINDOW_MS = 5000
const SESSION_TIMEOUT_MS = 8000
const SESSION_CACHE_TTL_MS = 10000
const SESSION_RETRY_DELAYS_MS = [300, 700]
const API_VERBOSE_LOGS = import.meta.env.DEV && import.meta.env.VITE_VERBOSE_API_LOGS === 'true'

type SessionLike = { access_token: string; refresh_token?: string }

let cachedSession: {
  token: string
  refreshToken?: string
  expiresAt: number
} | null = null
let inFlightEnsureSessionPromise: Promise<SessionLike | null> | null = null

const PUBLIC_ROUTES_WITHOUT_AUTH = [
  '/auth/',
  '/health',
  '/ping',
]

function isPublicRequest(url: string | undefined): boolean {
  if (!url) return false
  return PUBLIC_ROUTES_WITHOUT_AUTH.some((route) => url.includes(route))
}

function isAuthFailureBlocked(): boolean {
  return Date.now() < authFailureBlockUntil
}

/**
 * Invalida o cache do auth store
 * Útil quando a sessão é perdida (SIGNED_OUT) e precisamos forçar reimport
 */
function invalidateAuthStoreCache(): void {
  cachedAuthStore = null
}

function invalidateSessionCache(): void {
  cachedSession = null
}

/**
 * Reset explícito de estado em memória para troca de usuário.
 * Evita reaproveitar sessão/cache/in-flight da conta anterior.
 */
export function resetSessionStateForUserSwitch(): void {
  invalidateAuthStoreCache()
  invalidateSessionCache()
  inFlightEnsureSessionPromise = null
  authFailureBlockUntil = 0
  isHandlingUnauthorized = false

}

function getCachedSession(): SessionLike | null {
  if (!cachedSession) return null
  if (Date.now() >= cachedSession.expiresAt) {
    cachedSession = null
    return null
  }
  return {
    access_token: cachedSession.token,
    refresh_token: cachedSession.refreshToken,
  }
}

function setSessionCache(session: SessionLike): void {
  cachedSession = {
    token: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
  }
}

async function getSessionWithTimeout(
  timeoutMs = SESSION_TIMEOUT_MS,
  logLabel = 'getSession',
  suppressTimeoutWarning = false
): Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let didTimeout = false

  const timeoutPromise = new Promise<{ data: { session: null }; error: { message: string } }>((resolve) => {
    timeoutId = setTimeout(() => {
      didTimeout = true
      if (import.meta.env.DEV && !suppressTimeoutWarning) {
        console.warn(`[API] ${logLabel}() timeout after ${timeoutMs}ms`)
      }
      resolve({ data: { session: null }, error: { message: 'Timeout' } })
    }, timeoutMs)
  })

  const result = await Promise.race([supabase.auth.getSession(), timeoutPromise]) as Awaited<ReturnType<typeof supabase.auth.getSession>>
  if (!didTimeout && timeoutId) {
    clearTimeout(timeoutId)
  }
  return result
}

/**
 * Aguarda restauração de sessão usando listener onAuthStateChange
 * 
 * Esta função é crítica para fluxos OAuth onde popup pode causar perda temporária
 * de sessão na janela principal. Combina verificação imediata, listener reativo e polling como fallback.
 * 
 * @param timeout - Tempo máximo de espera em milissegundos (padrão: 10 segundos)
 * @returns Promise que resolve quando sessão é restaurada ou null se timeout
 */
function waitForSessionRestore(timeout = 10000): Promise<{ access_token: string; refresh_token?: string } | null> {
  return new Promise(async (resolve) => {

    // 1. VERIFICAR SESSÃO EXISTENTE PRIMEIRO (evitar race condition)
    // Se sessão já existe, retornar imediatamente sem registrar listener
    try {
      const { data: { session }, error: sessionError } = await getSessionWithTimeout(1500, 'waitForSessionRestore initial getSession')

      if (session?.access_token && !sessionError) {
        resolve({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })
        return
      }
    } catch (error) {
    }

    // 2. Se não há sessão, registrar listener e polling como fallback

    let resolved = false
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        unsubscribe()
        stopPolling()
        if (import.meta.env.DEV) {
          console.warn('[API] ⏱️ Session restore timeout after', timeout, 'ms')
        }
        resolve(null)
      }
    }, timeout)

    // Função para resolver apenas uma vez
    const safeResolve = (session: { access_token: string; refresh_token?: string }) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeoutId)
        unsubscribe()
        stopPolling()

        resolve(session)
      }
    }

    // 3. LISTENER REATIVO (onAuthStateChange)
    // Escutar eventos de mudança de auth state
    // onAuthStateChange retorna { data: { subscription } }
    const authStateChangeResult = supabase.auth.onAuthStateChange((event, session) => {

      // Sessão foi restaurada
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.access_token) {
        safeResolve({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })
      }
    })

    // 4. POLLING COMO FALLBACK (se listener não capturar)
    // Verificar sessão periodicamente caso listener não seja acionado
    const pollInterval = 500 // Verificar a cada 500ms
    let pollCount = 0
    const maxPolls = Math.floor(timeout / pollInterval) // Número máximo de polls baseado no timeout
    let pollingCheckInFlight = false

    const pollingInterval = setInterval(async () => {
      if (resolved) {
        return
      }
      if (pollingCheckInFlight) {
        return
      }

      pollCount++
      pollingCheckInFlight = true

      try {
        const { data: { session }, error: sessionError } = await getSessionWithTimeout(1200, 'waitForSessionRestore polling getSession')

        if (session?.access_token && !sessionError) {
          safeResolve({
            access_token: session.access_token,
            refresh_token: session.refresh_token
          })
        } else if (pollCount >= maxPolls) {
          // Parar polling se atingiu limite
          if (import.meta.env.DEV) {
            console.warn('[API] ⏱️ Polling limit reached - stopping')
          }
          stopPolling()
        }
      } catch (error) {
      } finally {
        pollingCheckInFlight = false
      }
    }, pollInterval)

    // Função para limpar subscription
    const unsubscribe = () => {
      const subscription = authStateChangeResult?.data?.subscription
      if (subscription) {
        subscription.unsubscribe()
      }
    }

    // Função para parar polling
    const stopPolling = () => {
      clearInterval(pollingInterval)
    }
  })
}

export async function ensureSession(options?: {
  waitForRestore?: boolean
  skipInFlight?: boolean
  skipRestoreFallback?: boolean
  baseTimeoutMs?: number
  skipRetries?: boolean
  throwOnTimeout?: boolean
  suppressTimeoutWarning?: boolean
}): Promise<{ access_token: string; refresh_token?: string } | null> {
  const {
    waitForRestore = false,
    skipInFlight = false,
    skipRestoreFallback = false,
    baseTimeoutMs = SESSION_TIMEOUT_MS,
    skipRetries = false,
    throwOnTimeout = false,
    suppressTimeoutWarning = false,
  } = options || {}

  const resolveSession = async (): Promise<SessionLike | null> => {
    try {
    if (!waitForRestore) {
      const cached = getCachedSession()
      if (cached) {
        return cached
      }
    }

    // Em fluxo de restauração (OAuth/pós-popup), permitimos fallback em token preservado.
    // No fluxo normal (waitForRestore=false), a sessão deve ser validada via Supabase.
    if (waitForRestore) {
      try {
        // Usar cache se disponível, senão importar
        let authStore = cachedAuthStore
        if (!authStore) {
          const { useAuthStore } = await import('@/stores/auth')
          authStore = useAuthStore()
          cachedAuthStore = authStore
        }

        if (authStore.token) {
          if (supabaseEnabled && authStore.token.startsWith('mock-')) {
            console.warn('[API] Ignorando token mock armazenado porque Supabase está habilitado')
            authStore.token = null
            localStorage.removeItem('adsmagic_auth_token')
            localStorage.removeItem('adsmagic_user_data')
          } else {
            return {
              access_token: authStore.token,
              refresh_token: undefined
            }
          }
        }
      } catch (authStoreError) {
      }

      const savedToken = localStorage.getItem('adsmagic_auth_token')
      if (savedToken) {
        if (supabaseEnabled && savedToken.startsWith('mock-')) {
          console.warn('[API] Ignorando token mock do localStorage porque Supabase está habilitado')
          localStorage.removeItem('adsmagic_auth_token')
          localStorage.removeItem('adsmagic_user_data')
        } else {
          return { access_token: savedToken, refresh_token: undefined }
        }
      }
    }

    // Validar sessão ativa via Supabase (com timeout/retry)
    if (API_VERBOSE_LOGS) {
    }

    const sessionResult = await getSessionWithTimeout(baseTimeoutMs, 'getSession', suppressTimeoutWarning)
    let { data: { session }, error: sessionError } = sessionResult
    const sessionTimedOut = sessionError?.message === 'Timeout'

    if (sessionTimedOut && !waitForRestore && throwOnTimeout) {
      throw new Error('SESSION_TIMEOUT')
    }

    // Em carregamento inicial pós-refresh, getSession() pode atrasar.
    // Faz retry curto antes de assumir ausência de sessão.
    if (!session?.access_token && !waitForRestore && !skipRetries) {
      for (let i = 0; i < SESSION_RETRY_DELAYS_MS.length; i++) {
        const delay = SESSION_RETRY_DELAYS_MS[i]
        await new Promise((resolve) => setTimeout(resolve, delay))
        const retryResult = await getSessionWithTimeout(
          baseTimeoutMs,
          `getSession retry #${i + 1}`,
          suppressTimeoutWarning
        )
        session = retryResult.data.session
        sessionError = retryResult.error
        if (session?.access_token && !sessionError) {
          break
        }
      }
    }

    // Se waitForRestore está ativado e não há sessão, aguardar restauração
    // Para OAuth callbacks: verificar getSession() novamente antes de aguardar listener
    // Isso evita race condition onde sessão pode ter sido restaurada entre verificações
    if (waitForRestore && !session?.access_token) {

      // Invalidar cache para garantir dados atualizados após SIGNED_OUT
      invalidateAuthStoreCache()

      // Tentar getSession() uma vez mais antes de aguardar (pode ter sido restaurada)
      try {
          const { data: { session: retrySession }, error: retryError } = await getSessionWithTimeout(1000, 'retry getSession')

        if (retrySession?.access_token && !retryError) {
          return {
            access_token: retrySession.access_token,
            refresh_token: retrySession.refresh_token
          }
        }
      } catch (retryError) {
      }

      // Se ainda não há sessão, aguardar restauração usando listener + polling

      const restoredSession = await waitForSessionRestore(10000) // 10 segundos timeout

      if (restoredSession) {
        // Sessão foi restaurada via listener

        // Verificar auth store novamente (pode ter sido atualizado pelo listener)
        try {
          // Forçar reimport do auth store (cache foi invalidado)
          const { useAuthStore } = await import('@/stores/auth')
          const freshAuthStore = useAuthStore()
          cachedAuthStore = freshAuthStore

          if (freshAuthStore.token) {
            return {
              access_token: freshAuthStore.token,
              refresh_token: undefined
            }
          }
        } catch (error) {
        }

        // Se auth store não tem token ainda, usar sessão do listener
        return restoredSession
      } else {
        // Timeout - tentar getSession() uma última vez

        try {
          const finalSessionResult = await getSessionWithTimeout(1000, 'final getSession')

          if (finalSessionResult.data?.session?.access_token) {
            session = finalSessionResult.data.session
            sessionError = finalSessionResult.error
          }
        } catch (error) {
        }
      }
    }

    // If we got a valid session, use it
    if (session?.access_token && !sessionError) {
      const activeSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token
      }
      setSessionCache(activeSession)
      return activeSession
    }

    // Se sessão expirou mas há refresh_token, tentar refresh automático
    if (session?.refresh_token && !session?.access_token) {

      try {
        // Tentar refresh com retry e backoff exponencial
        let lastError: Error | null = null
        const maxRetries = 2
        const baseDelay = 500 // 500ms base delay

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

            if (refreshError) {
              lastError = refreshError
              if (import.meta.env.DEV) {
                console.warn(`[API] Refresh attempt ${attempt + 1} failed:`, refreshError.message)
              }

              // Se não é o último attempt, aguardar antes de tentar novamente
              if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt) // Backoff exponencial: 500ms, 1000ms
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
              }
            } else if (refreshData?.session?.access_token) {
              const refreshedSession = {
                access_token: refreshData.session.access_token,
                refresh_token: refreshData.session.refresh_token
              }
              setSessionCache(refreshedSession)
              return refreshedSession
            }
          } catch (refreshException) {
            lastError = refreshException instanceof Error ? refreshException : new Error('Unknown refresh error')
            if (import.meta.env.DEV) {
              console.warn(`[API] Refresh attempt ${attempt + 1} exception:`, lastError.message)
            }

            // Se não é o último attempt, aguardar antes de tentar novamente
            if (attempt < maxRetries) {
              const delay = baseDelay * Math.pow(2, attempt)
              await new Promise(resolve => setTimeout(resolve, delay))
              continue
            }
          }
        }

        // Se chegou aqui, todos os retries falharam
        if (import.meta.env.DEV) {
          console.error('[API] ❌ All refresh attempts failed:', lastError?.message)
        }
      } catch (refreshError) {
      }
    }

    // No session available and no refresh token (or refresh failed)
    // Em rotas protegidas pós-F5, fazemos um fallback final com listener.
    if (!waitForRestore && !skipRestoreFallback) {
      const restored = await waitForSessionRestore(5000)
      if (restored?.access_token) {
        setSessionCache(restored)
        return restored
      }
    }

      return null
    } catch (error) {
      if (error instanceof Error && error.message === 'SESSION_TIMEOUT' && throwOnTimeout) {
        throw error
      }
      return null
    }
  }

  if (!waitForRestore && !skipInFlight) {
    if (inFlightEnsureSessionPromise) {
      return await inFlightEnsureSessionPromise
    }

    inFlightEnsureSessionPromise = resolveSession()
    try {
      return await inFlightEnsureSessionPromise
    } finally {
      inFlightEnsureSessionPromise = null
    }
  }

  return await resolveSession()
}

/**
 * Request interceptor
 *
 * Automatically adds authentication token and project context to all requests.
 * - Token is obtained from active Supabase session using ensureSession()
 * - Project ID is read from localStorage
 */
apiClient.interceptors.request.use(
  async (config) => {
    // **MOCK MODE: Interceptar requisições quando mocks estão habilitados**
    const useMock = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true

    if (useMock) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300))

      // Determinar mock data baseado na URL
      const url = config.url || ''
      let mockData: any = null

      if (url.includes('/projects') && config.method === 'get') {
        if (url.match(/\/projects\/[^/]+$/)) {
          // GET /projects/:id - retornar projeto individual
          const projectId = url.split('/').pop()
          mockData = {
            id: projectId,
            name: 'Projeto Demo',
            company_id: 'mock-company-001',
            status: 'active',
            whatsapp_status: 'connected',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias atrás
            updated_at: new Date().toISOString(),
            metrics: {
              investment: 5000,
              contacts: 120,
              sales: 15,
              revenue: 22500,
              conversionRate: 12.5,
              averageTicket: 1500,
              roi: 350
            }
          }
        } else {
          // GET /projects - retornar lista com 1 projeto de exemplo
          mockData = [
            {
              id: 'mock-project-001',
              name: 'Projeto Demo',
              company_id: 'mock-company-001',
              status: 'active',
              whatsapp_status: 'connected',
              created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              metrics: {
                investment: 5000,
                contacts: 120,
                sales: 15,
                revenue: 22500,
                conversionRate: 12.5,
                averageTicket: 1500,
                roi: 350
              }
            }
          ]
        }
      } else if (url.includes('/projects') && config.method === 'patch') {
        // PATCH /projects/:id - retornar projeto atualizado
        const projectId = url.split('/').pop()
        const updates = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {}
        mockData = {
          id: projectId,
          name: updates.name || 'Projeto Demo',
          company_id: 'mock-company-001',
          status: updates.status || 'active',
          whatsapp_status: 'connected',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          metrics: {
            investment: 5000,
            contacts: 120,
            sales: 15,
            revenue: 22500,
            conversionRate: 12.5,
            averageTicket: 1500,
            roi: 350
          }
        }
      } else if (url.includes('/projects') && config.method === 'post') {
        // POST /projects - criar novo projeto (duplicar ou novo)
        const projectData = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {}
        const newProjectId = `mock-project-${Date.now()}`
        mockData = {
          id: newProjectId,
          name: projectData.name || 'Projeto Duplicado',
          company_id: 'mock-company-001',
          status: 'draft',
          whatsapp_status: 'disconnected',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metrics: {
            investment: 0,
            contacts: 0,
            sales: 0,
            revenue: 0,
            conversionRate: 0,
            averageTicket: 0,
            roi: 0
          }
        }
      } else if (url.includes('/companies')) {
        // GET /companies - retornar 1 empresa de exemplo
        mockData = [
          {
            id: 'mock-company-001',
            name: 'Empresa Demo',
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias atrás
            updated_at: new Date().toISOString()
          }
        ]
      } else if (url.includes('/settings/general') || url.includes('/settings')) {
        // GET /settings/general - retornar settings com meta de receita
        mockData = {
          projectId: 'mock-project-001',
          projectName: 'Projeto Demo',
          projectDescription: 'Projeto de demonstração do sistema',
          attributionModel: 'first_touch',
          revenueGoal: 50000, // Meta de R$ 50.000,00 por mês
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      // Retornar promise rejeitado com resposta especial que será capturada no response interceptor
      // Isso evita o axios tentar fazer request HTTP real
      return Promise.reject({
        config: config,
        isAxiosError: false,
        toJSON: () => ({}),
        name: 'MockResponse',
        message: 'Mock response - skip HTTP',
        response: {
          data: mockData,
          status: 200,
          statusText: 'OK (Mock)',
          headers: {},
          config: config
        }
      })
    }

    // Log TODAS as requisições para debug (apenas DEV)
    if (API_VERBOSE_LOGS) {
    }

    try {
      // Verificar se é rota OAuth callback - essas rotas precisam aguardar restauração de sessão
      // porque popup OAuth pode causar perda de sessão na janela principal
      const isOAuthCallback = config.url?.includes('/oauth/') && config.url?.includes('/callback')
      const requestIsPublic = isPublicRequest(config.url)

      // Evita tempestade de requisições protegidas após 401 até a navegação para login estabilizar.
      if (!requestIsPublic && !isOAuthCallback && isAuthFailureBlocked()) {
        return Promise.reject(new axios.CanceledError('Blocked protected request during auth recovery'))
      }

      // Log inicial do estado (apenas DEV) - SEMPRE logar se for OAuth callback
      if (API_VERBOSE_LOGS) {
        if (isOAuthCallback) {
        } else {
        }
      }

      // Fast path para rotas protegidas não-OAuth: evita bloquear bootstrap em getSession lento.
      // A validação forte de sessão já ocorre no router guard.
      let session: SessionLike | null = null
      if (!isOAuthCallback && !requestIsPublic) {
        const cached = getCachedSession()
        if (cached?.access_token) {
          session = cached
        } else {
          try {
            let authStore = cachedAuthStore
            if (!authStore) {
              const { useAuthStore } = await import('@/stores/auth')
              authStore = useAuthStore()
              cachedAuthStore = authStore
            }

            const token = authStore.token || localStorage.getItem('adsmagic_auth_token')
            if (token && !(supabaseEnabled && token.startsWith('mock-'))) {
              session = { access_token: token, refresh_token: undefined }
            }
          } catch {
            // noop, cai no caminho padrão
          }
        }
      }

      // Fallback padrão: validar via ensureSession (com refresh/restore quando aplicável)
      if (!session?.access_token) {
        session = await ensureSession({
          waitForRestore: isOAuthCallback,
          skipRestoreFallback: !isOAuthCallback,
          baseTimeoutMs: isOAuthCallback ? SESSION_TIMEOUT_MS : 2500,
          skipRetries: !isOAuthCallback,
        })
      }

      // Log estado após ensureSession (apenas DEV)
      if (import.meta.env.DEV && isOAuthCallback) {
      }

      // Se é OAuth callback e não há sessão, tentar waitForSessionRestore diretamente
      // Isso garante que aguardamos a restauração antes de fazer a requisição
      if (isOAuthCallback && !session?.access_token) {

        // Invalidar cache e aguardar restauração
        invalidateAuthStoreCache()

        // Tentar múltiplas estratégias para restaurar sessão:
        // 1. Aguardar restauração via listener (até 5s)
        session = await waitForSessionRestore(5000)

        // 2. Se ainda não há sessão, tentar getSession() com retry
        if (!session?.access_token) {

          // Tentar getSession() até 3 vezes com delay crescente
          for (let attempt = 0; attempt < 3; attempt++) {
            const delay = 500 * (attempt + 1) // 500ms, 1000ms, 1500ms
            await new Promise(resolve => setTimeout(resolve, delay))

            try {
              const { data: { session: retrySession }, error: retryError } = await getSessionWithTimeout(SESSION_TIMEOUT_MS, 'oauth retry getSession')

              if (retrySession?.access_token && !retryError) {
                session = {
                  access_token: retrySession.access_token,
                  refresh_token: retrySession.refresh_token
                }
                setSessionCache(session)
                break
              }
            } catch (error) {
              if (import.meta.env.DEV) {
                console.warn(`[API] getSession() retry attempt ${attempt + 1} failed:`, error)
              }
            }
          }
        }

        // 3. Se ainda não há sessão, tentar verificar auth store (pode ter sido atualizado)
        if (!session?.access_token) {
          try {
            const { useAuthStore } = await import('@/stores/auth')
            const authStore = useAuthStore()
            if (authStore.token) {
              session = {
                access_token: authStore.token,
                refresh_token: undefined
              }
            }
          } catch (error) {
          }
        }

        // 4. Última tentativa: verificar localStorage diretamente (fallback final)
        if (isOAuthCallback && !session?.access_token) {
          const savedToken = localStorage.getItem('adsmagic_auth_token')
          if (savedToken) {
            session = { access_token: savedToken, refresh_token: undefined }
            if (import.meta.env.DEV) {
            }
          }
        }

        // Log estado após todas as tentativas (apenas DEV)
        if (import.meta.env.DEV) {
        }

        if (session?.access_token) {
        } else {
          // Log crítico de erro (sempre aparece)
          console.error('[API] CRITICAL: Session not restored after all attempts - request will fail with 401')
          if (import.meta.env.DEV) {
            console.error('[API] ❌ CRITICAL: Session not restored after all attempts - request will fail with 401')
          }
        }
      }

      // Adicionar token ao header se disponível
      if (session?.access_token) {
        authFailureBlockUntil = 0
        setSessionCache(session)
        config.headers.Authorization = `Bearer ${session.access_token}`

        // Verificar explicitamente se o header foi adicionado
        // Type assertion para Authorization header (sempre string quando definido)
        const authHeader = config.headers.Authorization as string | undefined
        const authHeaderAdded = typeof authHeader === 'string' && !!authHeader

        // Log crítico (sempre aparece em produção)
        if (authHeaderAdded) {
          // Log específico para OAuth callbacks, log genérico para outras requisições
          if (isOAuthCallback) {
          } else {
            // Log genérico apenas em modo verbose para outras requisições (evita spam)
            if (API_VERBOSE_LOGS) {
            }
          }
          if (API_VERBOSE_LOGS) {
          }
        } else {
          // Log de erro crítico apenas para OAuth callbacks (sempre aparece)
          if (isOAuthCallback) {
            console.error('[API] CRITICAL: Failed to add Authorization header for OAuth callback!')
          }
          if (import.meta.env.DEV) {
            console.error('[API] ❌ CRITICAL: Failed to add Authorization header!', {
              url: config.url,
              hasSession: !!session,
              hasToken: !!session?.access_token,
              isOAuthCallback
            })
          }
        }
      } else {
        // Para endpoints protegidos, não enviar requisições sem sessão.
        if (!requestIsPublic && !isOAuthCallback) {
          return Promise.reject(new axios.CanceledError('No active session for protected request'))
        }

        // Log warning only in dev to avoid exposing session state in production
        if (import.meta.env.DEV) {
          console.warn('[API] ⚠️ No active session - request may fail on backend', {
            url: config.url,
            isOAuthCallback,
            sessionState: {
              hasSession: !!session,
              hasToken: !!session?.access_token
            }
          })
        }
      }

    } catch (error) {
      // Log error without exposing sensitive information
      if (import.meta.env.DEV) {
        console.error('[API] ❌ Failed to ensure session:', error instanceof Error ? error.message : 'Unknown error', {
          url: config.url,
          errorType: error instanceof Error ? error.constructor.name : typeof error
        })
      }
      // Continuar sem token - backend retornará 401
    }

    // Add project context for multi-tenant support
    try {
      // Get current project from localStorage (set by projects store)
      const currentProjectId = localStorage.getItem('current_project_id')

      if (currentProjectId) {
        config.headers['X-Project-ID'] = currentProjectId

        // Debug log for development
        if (API_VERBOSE_LOGS) {
        }
      } else {
        // Apenas avisar em rotas que realmente precisam de project_id
        // Rotas públicas (auth, health check, companies, projects) não precisam no início
        const url = config.url || ''
        const publicRoutes = [
          '/auth/',
          '/health',
          '/ping',
          '/companies',  // Não precisa project_id para listar empresas
          '/projects'   // Não precisa project_id para listar projetos
        ]
        const needsProject = !publicRoutes.some(route => url.includes(route))
        
        if (needsProject && import.meta.env.DEV) {
          console.warn('[API] No current project set - request may fail on backend:', url)
        }
      }
    } catch (error) {
      // Store not available (e.g., during SSR or before app initialization)
    }

    return config
  },
  (error) => {
    // Request setup failed
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * Rotas que não devem redirecionar para login em 401
 * Essas rotas tratam seus próprios erros de autenticação
 */
const ROUTES_EXCLUDED_FROM_401_REDIRECT = [
  '/integrations/oauth/',
  '/auth/',
  '/integrations/',
]

/**
 * Verifica se a URL da requisição está na whitelist de exclusão
 */
function shouldExcludeFrom401Redirect(url: string | undefined): boolean {
  if (!url) return false

  return ROUTES_EXCLUDED_FROM_401_REDIRECT.some(excludedRoute =>
    url.includes(excludedRoute)
  )
}

/**
 * Redireciona para página de login preservando locale
 * Usa router Vue em vez de window.location para manter contexto correto
 * 
 * @param locale - Locale a ser usado na rota de login
 */
async function redirectToLogin(locale: string): Promise<void> {
  try {
    // Import dinâmico do router para evitar dependência circular
    const router = await import('@/router').then(m => m.default)

    // Usar router.push() em vez de window.location.href para preservar contexto Vue
    await router.push({
      name: 'login',
      params: { locale },
      replace: true
    })
  } catch (error) {
    // Fallback para window.location se router não estiver disponível
    console.warn('[API] Erro ao usar router.push(), usando fallback window.location:', error)
    window.location.href = `/${locale}/login`
  }
}

/**
 * Response interceptor
 *
 * Handles common error scenarios:
 * - 401: Unauthorized -> redirect to login (exceto rotas OAuth que tratam seus próprios erros)
 * - 403: Forbidden -> show error
 * - 404: Not found -> show error
 * - 500: Server error -> show error
 * - Network errors -> show error
 */
apiClient.interceptors.response.use(
  (response) => {
    // Successful response, just return it
    authFailureBlockUntil = 0
    return response
  },
  async (error: any) => {
    // **MOCK MODE: Capturar mock responses e retornar como sucesso**
    if (error.name === 'MockResponse' && error.response) {
      // Retornar a resposta mock como sucesso (não reject)
      return Promise.resolve(error.response)
    }

    const requestUrl = error.config?.url || ''

    // Log error for debugging
    console.error('[API Response Error]', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: requestUrl,
      isOAuthRoute: shouldExcludeFrom401Redirect(requestUrl)
    })

    // Handle specific HTTP status codes
    if (error.response?.status === 401) {
      // Unauthorized: Clear token and redirect to login
      // EXCETO para rotas OAuth que devem tratar o erro localmente
      const isExcludedRoute = shouldExcludeFrom401Redirect(requestUrl)

      // Apenas redirecionar se não for rota excluída
      if (!isExcludedRoute) {
        authFailureBlockUntil = Date.now() + AUTH_FAILURE_BLOCK_WINDOW_MS

        // Evita múltiplos clear/redirect concorrentes quando várias requisições retornam 401 juntas.
        if (isHandlingUnauthorized) {
          return Promise.reject(error)
        }
        isHandlingUnauthorized = true

        try {
          localStorage.removeItem('adsmagic_auth_token')
          localStorage.removeItem('adsmagic_user_data')
          invalidateAuthStoreCache()
          invalidateSessionCache()
          try {
            const { useAuthStore } = await import('@/stores/auth')
            const authStore = useAuthStore()
            authStore.clearAuthData()
          } catch (authStoreError) {
          }

          // Only redirect if not already on login page
          const currentPath = window.location.pathname

          // Extrair locale da URL atual ou usar detectUserLocale como fallback
          // Importar detectUserLocale dinamicamente para evitar dependência circular
          let locale: string
          const urlLocale = currentPath.split('/')[1]
          if (urlLocale && ['pt', 'en', 'es'].includes(urlLocale)) {
            locale = urlLocale
          } else {
            // Fallback: importar detectUserLocale do locale guard
            const { detectUserLocale } = await import('@/router/guards/locale')
            locale = detectUserLocale()
          }

          const isLoginRoute = /^\/(pt|en|es)\/login(?:\/|$)/.test(currentPath)
          if (!isLoginRoute) {
            await redirectToLogin(locale)
          }
        } finally {
          isHandlingUnauthorized = false
        }
      } else {
      }
    }

    if (error.response?.status === 403) {
      // Forbidden: User doesn't have permission
      console.warn('[API] Forbidden: User lacks permission for this action')
    }

    if (error.response?.status === 404) {
      // Not found: Resource doesn't exist
      console.warn('[API] Not found: Resource not found')
    }

    if (error.response?.status === 500) {
      // Server error
      console.error('[API] Server error: Internal server error')
    }

    // Network error (no response received)
    if (!error.response) {
      console.error('[API] Network error: No response received from server')
    }

    // Reject with the error for handling in specific services
    return Promise.reject(error)
  }
)

/**
 * Helper function to extract error message from API error
 *
 * @param error - Axios error object
 * @returns User-friendly error message
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>

    // Return API error message if available
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message
    }

    // Return generic message based on status code
    if (axiosError.response?.status === 404) {
      return 'Recurso não encontrado'
    }

    if (axiosError.response?.status === 403) {
      return 'Você não tem permissão para esta ação'
    }

    if (axiosError.response?.status === 401) {
      return 'Sessão expirada. Faça login novamente'
    }

    if (axiosError.response?.status === 500) {
      return 'Erro no servidor. Tente novamente mais tarde'
    }

    // Network error
    if (!axiosError.response) {
      return 'Erro de conexão. Verifique sua internet'
    }

    // Return axios error message
    return axiosError.message
  }

  // Unknown error type
  if (error instanceof Error) {
    return error.message
  }

  // Fallback
  return 'Erro desconhecido'
}
