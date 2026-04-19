import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNavigationStore } from '../navigation'

describe('useNavigationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts navigation feedback immediately', () => {
    const navigationStore = useNavigationStore()

    navigationStore.startNavigation('/pt/projects/1/dashboard-v2')

    expect(navigationStore.isNavigating).toBe(true)
    expect(navigationStore.pendingToPath).toBe('/pt/projects/1/dashboard-v2')
    expect(navigationStore.startedAt).toBe(Date.now())
  })

  it('keeps feedback visible for the minimum duration', () => {
    const navigationStore = useNavigationStore()

    navigationStore.startNavigation('/pt/projects')
    navigationStore.finishNavigation()

    expect(navigationStore.isNavigating).toBe(true)

    vi.advanceTimersByTime(199)
    expect(navigationStore.isNavigating).toBe(true)

    vi.advanceTimersByTime(1)
    expect(navigationStore.isNavigating).toBe(false)
    expect(navigationStore.pendingToPath).toBeNull()
    expect(navigationStore.startedAt).toBeNull()
  })
})
