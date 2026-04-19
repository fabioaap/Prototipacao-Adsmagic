import { beforeEach, describe, expect, it, vi } from 'vitest'
import { openFeaturebaseMessenger } from '@/lib/featurebase'

describe('openFeaturebaseMessenger', () => {
  const featurebaseSpy = vi.fn()

  beforeEach(() => {
    featurebaseSpy.mockReset()
    ;(window as Window & { Featurebase?: typeof featurebaseSpy }).Featurebase = featurebaseSpy
  })

  it('opens the messenger home screen by default', () => {
    openFeaturebaseMessenger()

    expect(featurebaseSpy).toHaveBeenCalledWith('show', 'home')
  })

  it('opens the help screen when requested', () => {
    openFeaturebaseMessenger('help')

    expect(featurebaseSpy).toHaveBeenCalledWith('show', 'help')
  })
})
