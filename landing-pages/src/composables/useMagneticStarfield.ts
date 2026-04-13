import { onMounted, onUnmounted, unref, watch, type Ref } from 'vue'

// Adsmagic star grafismo path — viewport 0 0 137 130
const STAR_PATH_D =
  'M77.9645 120.387C77.9645 108.106 83.0981 96.3291 92.2363 87.6457C101.374 78.9623 113.769 74.084 126.692 74.084C129.277 74.084 131.756 73.1084 133.583 71.3717C135.411 69.635 136.438 67.2796 136.438 64.8235C136.438 62.3675 135.411 60.0121 133.583 58.2754C131.756 56.5387 129.277 55.563 126.692 55.563C113.769 55.563 101.374 50.6848 92.2363 42.0014C83.0981 33.318 77.9645 21.5408 77.9645 9.26057C77.9645 6.80453 76.9377 4.44898 75.1101 2.7123C73.2825 0.975617 70.8037 0 68.219 0C65.6344 0 63.1556 0.975617 61.328 2.7123C59.5004 4.44898 58.4736 6.80453 58.4736 9.26057C58.4736 21.5408 53.3395 33.318 44.2013 42.0014C35.0631 50.6848 22.6693 55.563 9.74597 55.563C7.1613 55.563 4.68203 56.5387 2.85439 58.2754C1.02675 60.0121 0 62.3675 0 64.8235C0 67.2796 1.02675 69.635 2.85439 71.3717C4.68203 73.1084 7.1613 74.084 9.74597 74.084C22.6693 74.084 35.0631 78.9623 44.2013 87.6457C53.3395 96.3291 58.4736 108.106 58.4736 120.387C58.4736 122.843 59.5004 125.198 61.328 126.935C63.1556 128.671 65.6344 129.647 68.219 129.647C70.8037 129.647 73.2825 128.671 75.1101 126.935C76.9377 125.198 77.9645 122.843 77.9645 120.387Z'

const PATH_W = 137
const PATH_H = 130

type BooleanRef = boolean | Ref<boolean>

interface Star {
  bx: number
  by: number
  ox: number
  oy: number
  vx: number
  vy: number
  size: number
  baseAlpha: number
  twinklePhase: number
  twinkleSpeed: number
  r: number
  g: number
  b: number
}

const PALETTES: [number, number, number][] = [
  [59, 181, 109],
  [255, 255, 255],
  [99, 102, 241],
  [255, 255, 255],
  [59, 181, 109],
  [255, 255, 255],
]

export interface MagneticStarfieldOptions {
  count?: number
  reducedCount?: number
  magnetRadius?: number
  stiffness?: number
  damping?: number
  magnetForce?: number
  enabled?: BooleanRef
  reducedEffects?: BooleanRef
}

export function useMagneticStarfield(
  canvasRef: Ref<HTMLCanvasElement | null>,
  sectionRef: Ref<HTMLElement | null>,
  options: MagneticStarfieldOptions = {},
) {
  const {
    count = 80,
    reducedCount = Math.max(18, Math.round(count * 0.5)),
    magnetRadius = 380,
    stiffness = 0.06,
    damping = 0.72,
    magnetForce = 0.4,
    enabled = true,
    reducedEffects = false,
  } = options

  let stars: Star[] = []
  let starPath2D: Path2D | null = null
  let rafId: number | null = null
  let resizeFrame: number | null = null
  let visibilityObserver: IntersectionObserver | null = null
  let mouseX: number | null = null
  let mouseY: number | null = null
  let isSectionVisible = false
  let lastFrameTime = 0

  function isEnabled() {
    return unref(enabled)
  }

  function isReduced() {
    return unref(reducedEffects)
  }

  function shouldAnimate() {
    return isEnabled() && isSectionVisible
  }

  function buildPath() {
    starPath2D = new Path2D(STAR_PATH_D)
  }

  function getStarCount() {
    return isReduced() ? reducedCount : count
  }

  function clearCanvas() {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  function initStars(width: number, height: number) {
    const starCount = getStarCount()
    const minSize = isReduced() ? 6 : 7
    const maxSize = isReduced() ? 15 : 18

    stars = Array.from({ length: starCount }, () => {
      const [r, g, b] = PALETTES[Math.floor(Math.random() * PALETTES.length)]
      return {
        bx: Math.random(),
        by: Math.random(),
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        size: minSize + Math.random() * (maxSize - minSize),
        baseAlpha: 0.18 + Math.random() * 0.38,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.004 + Math.random() * 0.008,
        r,
        g,
        b,
      }
    })
  }

  function resize() {
    const canvas = canvasRef.value
    const section = sectionRef.value
    if (!canvas || !section) return
    canvas.width = section.offsetWidth
    canvas.height = section.offsetHeight
    initStars(canvas.width || 800, canvas.height || 600)
  }

  function scheduleResize() {
    if (resizeFrame !== null) return
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null
      resize()
      if (shouldAnimate()) {
        startLoop()
      } else {
        clearCanvas()
      }
    })
  }

  function loop(now: number) {
    if (!shouldAnimate()) {
      rafId = null
      return
    }

    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !starPath2D) {
      rafId = null
      return
    }

    const frameInterval = isReduced() ? 50 : 33
    if (now - lastFrameTime < frameInterval) {
      rafId = requestAnimationFrame(loop)
      return
    }
    lastFrameTime = now

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    for (const star of stars) {
      const baseX = star.bx * width
      const baseY = star.by * height

      if (!isReduced() && mouseX !== null && mouseY !== null) {
        const dx = mouseX - (baseX + star.ox)
        const dy = mouseY - (baseY + star.oy)
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < magnetRadius) {
          const factor = 1 - dist / magnetRadius
          star.vx += dx * factor * stiffness * magnetForce
          star.vy += dy * factor * stiffness * magnetForce
        }
      }

      star.vx += -star.ox * stiffness * 2.2
      star.vy += -star.oy * stiffness * 2.2
      star.vx *= damping
      star.vy *= damping
      star.ox += star.vx
      star.oy += star.vy

      star.twinklePhase += star.twinkleSpeed
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(star.twinklePhase))
      const alpha = star.baseAlpha * twinkle

      const x = baseX + star.ox
      const y = baseY + star.oy
      const scale = star.size / Math.max(PATH_W, PATH_H)

      ctx.save()
      ctx.translate(x, y)
      ctx.scale(scale, scale)
      ctx.translate(-PATH_W / 2, -PATH_H / 2)
      ctx.globalAlpha = alpha
      ctx.fillStyle = `rgb(${star.r},${star.g},${star.b})`
      ctx.fill(starPath2D)
      ctx.restore()
    }

    rafId = requestAnimationFrame(loop)
  }

  function startLoop() {
    if (rafId !== null || !shouldAnimate()) return
    lastFrameTime = 0
    rafId = requestAnimationFrame(loop)
  }

  function stopLoop({ clear = false } = {}) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (clear) {
      clearCanvas()
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (isReduced()) return
    const section = sectionRef.value
    if (!section) return
    const rect = section.getBoundingClientRect()
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top
  }

  function onMouseLeave() {
    mouseX = null
    mouseY = null
  }

  onMounted(() => {
    buildPath()
    resize()
    window.addEventListener('resize', scheduleResize)

    const section = sectionRef.value
    if (section) {
      section.addEventListener('mousemove', onMouseMove)
      section.addEventListener('mouseleave', onMouseLeave)
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isSectionVisible = !!entry?.isIntersecting
          if (shouldAnimate()) {
            startLoop()
            return
          }
          stopLoop()
        },
        { threshold: 0.05, rootMargin: '160px 0px' },
      )
      visibilityObserver.observe(section)
    } else {
      isSectionVisible = true
      startLoop()
    }

    watch(
      [() => isEnabled(), () => isReduced()],
      ([enabledNow, reducedNow], previousValue) => {
        const previousReduced = previousValue?.[1]
        if (previousReduced !== undefined && reducedNow !== previousReduced) {
          mouseX = null
          mouseY = null
          resize()
        }

        if (enabledNow && shouldAnimate()) {
          startLoop()
          return
        }

        stopLoop()
      },
      { immediate: true },
    )
  })

  onUnmounted(() => {
    stopLoop()
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame)
    visibilityObserver?.disconnect()
    window.removeEventListener('resize', scheduleResize)
    const section = sectionRef.value
    if (section) {
      section.removeEventListener('mousemove', onMouseMove)
      section.removeEventListener('mouseleave', onMouseLeave)
    }
  })
}
