import { defineStore } from 'pinia'
import { ref } from 'vue'

const MIN_NAVIGATION_FEEDBACK_MS = 200
type TimeoutHandle = ReturnType<typeof globalThis.setTimeout>

export const useNavigationStore = defineStore('navigation', () => {
  const isNavigating = ref(false)
  const pendingToPath = ref<string | null>(null)
  const startedAt = ref<number | null>(null)
  let finishTimer: TimeoutHandle | null = null

  const clearFinishTimer = () => {
    if (finishTimer !== null) {
      globalThis.clearTimeout(finishTimer)
      finishTimer = null
    }
  }

  const startNavigation = (toPath: string) => {
    clearFinishTimer()
    pendingToPath.value = toPath
    startedAt.value = Date.now()
    isNavigating.value = true
  }

  const finishNavigation = () => {
    const started = startedAt.value
    if (!started) {
      isNavigating.value = false
      pendingToPath.value = null
      startedAt.value = null
      return
    }

    const elapsedMs = Date.now() - started
    const remainingMs = Math.max(0, MIN_NAVIGATION_FEEDBACK_MS - elapsedMs)

    clearFinishTimer()
    finishTimer = globalThis.setTimeout(() => {
      isNavigating.value = false
      pendingToPath.value = null
      startedAt.value = null
      finishTimer = null
    }, remainingMs)
  }

  return {
    isNavigating,
    pendingToPath,
    startedAt,
    startNavigation,
    finishNavigation,
  }
})
