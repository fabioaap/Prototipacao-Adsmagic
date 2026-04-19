import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAdTrackingTemplates } from '../useAdTrackingTemplates'

const toastMock = vi.fn()

vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}))

describe('useAdTrackingTemplates', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn(),
      },
      configurable: true,
    })
  })

  it('returns default templates', () => {
    const { adTrackingTemplates } = useAdTrackingTemplates()
    const [googleTemplate, metaTemplate, tiktokTemplate] = adTrackingTemplates

    expect(adTrackingTemplates).toHaveLength(3)
    expect(googleTemplate?.platform).toBe('google')
    expect(metaTemplate?.platform).toBe('meta')
    expect(tiktokTemplate?.platform).toBe('tiktok')
  })

  it('copies template and shows success toast', async () => {
    const { copyAdTrackingTemplate } = useAdTrackingTemplates()
    const writeTextMock = vi.mocked(navigator.clipboard.writeText)
    writeTextMock.mockResolvedValue(undefined)

    const result = await copyAdTrackingTemplate('utm_source=google', 'Google Ads')

    expect(result).toBe(true)
    expect(writeTextMock).toHaveBeenCalledWith('utm_source=google')
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Copiado!' })
    )
  })

  it('handles clipboard failure and shows destructive toast', async () => {
    const { copyAdTrackingTemplate } = useAdTrackingTemplates()
    const writeTextMock = vi.mocked(navigator.clipboard.writeText)
    writeTextMock.mockRejectedValue(new Error('clipboard error'))

    const result = await copyAdTrackingTemplate('utm_source=meta', 'Meta Ads')

    expect(result).toBe(false)
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro',
        variant: 'destructive',
      })
    )
  })
})
