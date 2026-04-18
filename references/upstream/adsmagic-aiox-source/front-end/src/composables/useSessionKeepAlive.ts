import { useAuthStore } from '@/stores/auth'
import { recordSessionValidation } from '@/services/sessionValidation'

const KEEP_ALIVE_INTERVAL_MS = 10000
const KEEP_ALIVE_BASE_TIMEOUT_MS = 2500
let keepAliveTimer: number | null = null
let isFetchInFlight = false
let isVisibilityListening = false

const isDocumentVisible = (): boolean => {
  return typeof document !== 'undefined' && document.visibilityState === 'visible'
}

const handleVisibilityChange = (): void => {
  if (isDocumentVisible()) {
    void refreshSession()
  }
}

const refreshSession = async (): Promise<void> => {
  if (isFetchInFlight) return
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) return
  if (!isDocumentVisible()) return

  isFetchInFlight = true
  try {
    const { ensureSession } = await import('@/services/api/client')
    const session = await ensureSession({
      waitForRestore: false,
      skipInFlight: true,
      skipRestoreFallback: true,
      baseTimeoutMs: KEEP_ALIVE_BASE_TIMEOUT_MS,
      skipRetries: true,
      throwOnTimeout: true,
      suppressTimeoutWarning: true,
    })

    if (session?.access_token && authStore.user?.id) {
      recordSessionValidation(authStore.user.id)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[SessionKeepAlive] Failed to refresh session:', error)
    }
  } finally {
    isFetchInFlight = false
  }
}

const attachVisibilityListener = (): void => {
  if (typeof document === 'undefined' || isVisibilityListening) return
  document.addEventListener('visibilitychange', handleVisibilityChange)
  isVisibilityListening = true
}

const detachVisibilityListener = (): void => {
  if (typeof document === 'undefined' || !isVisibilityListening) return
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  isVisibilityListening = false
}

const startKeepAlive = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (keepAliveTimer) return

  void refreshSession()
  keepAliveTimer = window.setInterval(() => {
    void refreshSession()
  }, KEEP_ALIVE_INTERVAL_MS)
  attachVisibilityListener()
}

const stopKeepAlive = (): void => {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer)
    keepAliveTimer = null
  }
  detachVisibilityListener()
}

export function useSessionKeepAlive() {
  return {
    start: startKeepAlive,
    stop: stopKeepAlive,
  }
}
