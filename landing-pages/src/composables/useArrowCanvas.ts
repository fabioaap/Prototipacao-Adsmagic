import { onMounted, onBeforeUnmount, unref, watch, type Ref } from 'vue'

type BooleanRef = boolean | Ref<boolean>

interface ArrowCanvasOptions {
  color?: string
  enabled?: BooleanRef
}

/**
 * Draws a dashed curved arrow from the mouse cursor to a target element.
 * The canvas redraws only on interaction/resize instead of running a full-time RAF loop.
 */
export function useArrowCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  targetRef: Ref<HTMLElement | null>,
  options: ArrowCanvasOptions = {},
) {
  let frameId = 0
  let isVisible = true
  let visibilityObserver: IntersectionObserver | null = null
  const mouse = { x: null as number | null, y: null as number | null }

  const strokeColor = options.color ?? 'rgba(255,255,255,0.6)'

  function isEnabled() {
    return options.enabled === undefined ? true : unref(options.enabled)
  }

  function parseRgb(color: string) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    return match ? { r: +match[1], g: +match[2], b: +match[3] } : null
  }

  function clearCanvas() {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  function draw(ctx: CanvasRenderingContext2D, target: HTMLElement) {
    if (mouse.x === null || mouse.y === null) return

    const rect = target.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    const angle = Math.atan2(cy - mouse.y, cx - mouse.x)
    const x1 = cx - Math.cos(angle) * (rect.width / 2 + 12)
    const y1 = cy - Math.sin(angle) * (rect.height / 2 + 12)

    const midX = (mouse.x + x1) / 2
    const midY = (mouse.y + y1) / 2
    const dist = Math.hypot(x1 - mouse.x, y1 - mouse.y)
    const offset = Math.min(200, dist * 0.5)
    const t = Math.max(-1, Math.min(1, (mouse.y - y1) / 200))
    const controlX = midX
    const controlY = midY + offset * t

    const opacity = Math.min(1, (dist - Math.max(rect.width, rect.height) / 2) / 500)
    if (opacity <= 0) return

    const parsed = parseRgb(strokeColor)
    const rgba = parsed
      ? `rgba(${parsed.r},${parsed.g},${parsed.b},${opacity})`
      : strokeColor.replace(/[\d.]+\)$/, `${opacity})`)

    ctx.strokeStyle = rgba
    ctx.lineWidth = 2

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(mouse.x, mouse.y)
    ctx.quadraticCurveTo(controlX, controlY, x1, y1)
    ctx.setLineDash([10, 5])
    ctx.stroke()
    ctx.restore()

    const headAngle = Math.atan2(y1 - controlY, x1 - controlX)
    const headLen = 13
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(
      x1 - headLen * Math.cos(headAngle - Math.PI / 6),
      y1 - headLen * Math.sin(headAngle - Math.PI / 6),
    )
    ctx.moveTo(x1, y1)
    ctx.lineTo(
      x1 - headLen * Math.cos(headAngle + Math.PI / 6),
      y1 - headLen * Math.sin(headAngle + Math.PI / 6),
    )
    ctx.stroke()
  }

  function drawFrame() {
    frameId = 0
    const canvas = canvasRef.value
    const target = targetRef.value
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!target || !isVisible || !isEnabled()) return
    draw(ctx, target)
  }

  function scheduleDraw() {
    if (frameId) return
    frameId = requestAnimationFrame(drawFrame)
  }

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    scheduleDraw()
  }

  function onMouseMove(event: MouseEvent) {
    if (!isEnabled()) return
    mouse.x = event.clientX
    mouse.y = event.clientY
    scheduleDraw()
  }

  function onMouseLeave() {
    mouse.x = null
    mouse.y = null
    scheduleDraw()
  }

  onMounted(() => {
    const canvas = canvasRef.value
    const target = targetRef.value
    if (!canvas || !target) return

    resize()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)

    visibilityObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting
        if (!isVisible) {
          clearCanvas()
          return
        }
        scheduleDraw()
      },
      { threshold: 0 },
    )
    visibilityObserver.observe(target)

    watch(
      () => isEnabled(),
      (enabled) => {
        if (!enabled) {
          mouse.x = null
          mouse.y = null
          if (frameId) cancelAnimationFrame(frameId)
          frameId = 0
          clearCanvas()
          return
        }
        scheduleDraw()
      },
      { immediate: true },
    )
  })

  onBeforeUnmount(() => {
    if (frameId) cancelAnimationFrame(frameId)
    visibilityObserver?.disconnect()
    visibilityObserver = null
    window.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseleave', onMouseLeave)
    window.removeEventListener('resize', resize)
  })
}
