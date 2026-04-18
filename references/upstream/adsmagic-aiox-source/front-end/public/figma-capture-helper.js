(function () {
  const HASH_FLAG = 'figmacapture'
  const DELAY_KEY = 'figmadelay'
  const SELECTOR_KEY = 'figmaselector'
  const SCRIPT_ID = 'figma-capture-script'
  const SCRIPT_SRC = 'https://mcp.figma.com/mcp/html-to-design/capture.js'

  function getHashParams() {
    const rawHash = window.location.hash.replace(/^#/, '')
    return new URLSearchParams(rawHash)
  }

  function setHashParams(params) {
    const nextHash = params.toString()
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ''}`
    window.location.assign(nextUrl)
  }

  function ensureCaptureScript() {
    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById(SCRIPT_ID)
      if (existingScript) {
        if (window.figma) {
          resolve(window.figma)
          return
        }

        existingScript.addEventListener('load', () => resolve(window.figma), { once: true })
        existingScript.addEventListener('error', reject, { once: true })
        return
      }

      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = SCRIPT_SRC
      script.async = true
      script.onload = () => resolve(window.figma)
      script.onerror = reject
      document.body.appendChild(script)
    })
  }

  function startCapture(options) {
    const params = getHashParams()
    params.set(HASH_FLAG, '1')
    params.set(DELAY_KEY, String(options.delay ?? 1000))

    if (options.selector) {
      params.set(SELECTOR_KEY, options.selector)
    } else {
      params.delete(SELECTOR_KEY)
    }

    setHashParams(params)
  }

  function clearCaptureHash() {
    const params = getHashParams()
    params.delete(HASH_FLAG)
    params.delete(DELAY_KEY)
    params.delete(SELECTOR_KEY)
    setHashParams(params)
  }

  async function bootstrapFromHash() {
    const params = getHashParams()
    if (!params.has(HASH_FLAG)) {
      return
    }

    try {
      await ensureCaptureScript()
    } catch (error) {
      console.error('[Figma Capture] Nao foi possivel carregar o script de captura.', error)
    }
  }

  window.adsmagicFigmaCapture = {
    start: startCapture,
    stop: clearCaptureHash,
    copyCurrentPage(delay) {
      startCapture({
        selector: 'div.page-shell.section-stack-md',
        delay: delay ?? 1000,
      })
    },
    copyHeaderAndFilters(delay) {
      startCapture({
        selector: 'div.page-shell.section-stack-md > div.flex.flex-col.gap-4',
        delay: delay ?? 1000,
      })
    },
    copyEventsTable(delay) {
      startCapture({
        selector: 'div.page-shell.section-stack-md table',
        delay: delay ?? 1000,
      })
    },
  }

  bootstrapFromHash()
})()