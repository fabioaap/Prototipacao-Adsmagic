import { onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * Draws a dashed curved arrow from the mouse cursor to a target element.
 * Adapted from the React DynamicHero canvas arrow effect.
 */
export function useArrowCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  targetRef: Ref<HTMLElement | null>,
  options: { color?: string } = {}
) {
  let animId = 0
  const mouse = { x: null as number | null, y: null as number | null }

  /* ── resolve stroke colour ── */
  const strokeColor = options.color ?? 'rgba(255,255,255,0.6)'

  function parseRgb(c: string) {
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    return m ? { r: +m[1], g: +m[2], b: +m[3] } : null
  }

  /* ── draw one frame ── */
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

    /* resolve colour with dynamic opacity */
    const parsed = parseRgb(strokeColor)
    const rgba = parsed
      ? `rgba(${parsed.r},${parsed.g},${parsed.b},${opacity})`
      : strokeColor.replace(/[\d.]+\)$/, `${opacity})`)

    ctx.strokeStyle = rgba
    ctx.lineWidth = 2

    /* curve */
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(mouse.x, mouse.y)
    ctx.quadraticCurveTo(controlX, controlY, x1, y1)
    ctx.setLineDash([10, 5])
    ctx.stroke()
    ctx.restore()

    /* arrowhead */
    const headAngle = Math.atan2(y1 - controlY, x1 - controlX)
    const headLen = 13
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(
      x1 - headLen * Math.cos(headAngle - Math.PI / 6),
      y1 - headLen * Math.sin(headAngle - Math.PI / 6)
    )
    ctx.moveTo(x1, y1)
    ctx.lineTo(
      x1 - headLen * Math.cos(headAngle + Math.PI / 6),
      y1 - headLen * Math.sin(headAngle + Math.PI / 6)
    )
    ctx.stroke()
  }

  /* ── lifecycle ── */
  function onMouseMove(e: MouseEvent) {
    mouse.x = e.clientX
    mouse.y = e.clientY
  }

  function onMouseLeave() {
    mouse.x = null
    mouse.y = null
  }

  onMounted(() => {
    const canvas = canvasRef.value
    const target = targetRef.value
    if (!canvas || !target) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)

    function loop() {
      if (!canvas || !ctx || !target) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // Only draw while the target element is visible in the viewport
      const targetRect = target.getBoundingClientRect()
      if (targetRect.bottom > 0 && targetRect.top < canvas.height) {
        draw(ctx, target)
      }
      animId = requestAnimationFrame(loop)
    }
    loop()
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseleave', onMouseLeave)
    window.removeEventListener('resize', () => {})
  })
}
