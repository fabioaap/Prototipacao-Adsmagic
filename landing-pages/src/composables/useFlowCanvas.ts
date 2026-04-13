import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  pulse: number
  pulseSpeed: number
}

interface BurstLine {
  angle: number
  length: number
  maxLength: number
  speed: number
  width: number
  color: string
  alpha: number
  delay: number
  started: boolean
}

interface FlowCanvasOptions {
  particleCount?: number
  burstLineCount?: number
  colors?: string[]
  connectionDistance?: number
  speed?: number
}

const DEFAULT_COLORS = [
  'rgba(59, 181, 109, ',   // green
  'rgba(99, 102, 241, ',   // indigo
  'rgba(34, 197, 94, ',    // emerald
  'rgba(129, 140, 248, ',  // indigo-light
  'rgba(16, 185, 129, ',   // teal
]

const BURST_COLORS = [
  'rgba(59, 181, 109, ',   // green
  'rgba(99, 102, 241, ',   // indigo
  'rgba(255, 207, 94, ',   // gold (Stripe accent)
  'rgba(34, 197, 94, ',    // emerald
]

export function useFlowCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: FlowCanvasOptions = {},
) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const {
    particleCount = isMobile ? 40 : 80,
    burstLineCount = isMobile ? 20 : 40,
    colors = DEFAULT_COLORS,
    connectionDistance = 120,
    speed = 0.3,
  } = options

  let ctx: CanvasRenderingContext2D | null = null
  let animationId = 0
  let particles: Particle[] = []
  let burstLines: BurstLine[] = []
  let width = 0
  let height = 0
  let dpr = 1
  let time = 0
  let burstTriggered = false
  let burstStartTime = 0
  let mouseX = -1000
  let mouseY = -1000
  const isActive = ref(false)
  let isVisible = true
  let visibilityObserver: IntersectionObserver | null = null

  // 4 node centers — will map to the 4 flow cards
  let nodePositions: { x: number; y: number }[] = []

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = rect.width
    height = rect.height
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx?.scale(dpr, dpr)

    // Recalculate node positions (4 equally spaced across width)
    const padding = width * 0.12
    const usable = width - padding * 2
    nodePositions = Array.from({ length: 4 }, (_, i) => ({
      x: padding + (usable / 3) * i,
      y: height * 0.5,
    }))
  }

  function createParticles() {
    particles = Array.from({ length: particleCount }, () => {
      const color = colors[Math.floor(Math.random() * colors.length)]
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: Math.random() * 2 + 1,
        color,
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      }
    })
  }

  function createBurstLines() {
    const cx = width / 2
    const cy = height / 2
    const maxR = Math.max(width, height) * 0.6
    burstLines = Array.from({ length: burstLineCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / burstLineCount + (Math.random() - 0.5) * 0.15
      const burstColor = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)]
      return {
        angle,
        length: 0,
        maxLength: maxR * (0.5 + Math.random() * 0.5),
        speed: maxR * (0.008 + Math.random() * 0.004),
        width: Math.random() * 1.5 + 0.5,
        color: burstColor,
        alpha: 0.4 + Math.random() * 0.3,
        delay: Math.random() * 400,
        started: false,
      }
    })
  }

  function drawConnections() {
    if (!ctx) return
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.15
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }
  }

  function drawNodeConnections() {
    if (!ctx || nodePositions.length < 2) return

    // Draw glowing connection lines between the 4 nodes
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const from = nodePositions[i]
      const to = nodePositions[i + 1]

      // Animated dash offset
      const dashOffset = time * 0.5

      // Glow layer
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = 'rgba(59, 181, 109, 0.08)'
      ctx.lineWidth = 12
      ctx.filter = 'blur(8px)'
      ctx.stroke()
      ctx.restore()

      // Main dashed line
      ctx.beginPath()
      ctx.setLineDash([8, 6])
      ctx.lineDashOffset = -dashOffset
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.setLineDash([])

      // Animated energy pulse traveling along the line
      const pulseProgress = ((time * 0.3 + i * 80) % 200) / 200
      const px = from.x + (to.x - from.x) * pulseProgress
      const py = from.y + (to.y - from.y) * pulseProgress

      const gradient = ctx.createRadialGradient(px, py, 0, px, py, 16)
      gradient.addColorStop(0, 'rgba(59, 181, 109, 0.6)')
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)')
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')
      ctx.beginPath()
      ctx.arc(px, py, 16, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Draw node halos
    nodePositions.forEach((node, i) => {
      const pulseAlpha = 0.15 + Math.sin(time * 0.03 + i * 1.2) * 0.08
      const gradient = ctx!.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, 50,
      )
      gradient.addColorStop(0, `rgba(59, 181, 109, ${pulseAlpha})`)
      gradient.addColorStop(0.6, `rgba(99, 102, 241, ${pulseAlpha * 0.3})`)
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')
      ctx!.beginPath()
      ctx!.arc(node.x, node.y, 50, 0, Math.PI * 2)
      ctx!.fillStyle = gradient
      ctx!.fill()
    })
  }

  function drawBurst() {
    if (!ctx || !burstTriggered) return
    const elapsed = time - burstStartTime

    const cx = width / 2
    const cy = height / 2

    burstLines.forEach((line) => {
      if (elapsed < line.delay) return
      if (!line.started) {
        line.started = true
        line.length = 0
      }

      line.length = Math.min(line.length + line.speed, line.maxLength)

      const progress = line.length / line.maxLength
      const fadeAlpha = line.alpha * (1 - progress * 0.7)

      const x1 = cx + Math.cos(line.angle) * 20
      const y1 = cy + Math.sin(line.angle) * 20
      const x2 = cx + Math.cos(line.angle) * line.length
      const y2 = cy + Math.sin(line.angle) * line.length

      // Gradient line
      const grad = ctx!.createLinearGradient(x1, y1, x2, y2)
      grad.addColorStop(0, `${line.color}${fadeAlpha})`)
      grad.addColorStop(0.8, `${line.color}${fadeAlpha * 0.3})`)
      grad.addColorStop(1, `${line.color}0)`)

      ctx!.beginPath()
      ctx!.moveTo(x1, y1)
      ctx!.lineTo(x2, y2)
      ctx!.strokeStyle = grad
      ctx!.lineWidth = line.width
      ctx!.lineCap = 'round'
      ctx!.stroke()
    })

    // Central glow
    const burstProgress = Math.min((elapsed - 0) / 1500, 1)
    if (burstProgress > 0) {
      const glowRadius = 60 + burstProgress * 40
      const glowAlpha = 0.25 * (1 - burstProgress * 0.6)
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius)
      glow.addColorStop(0, `rgba(59, 181, 109, ${glowAlpha})`)
      glow.addColorStop(0.4, `rgba(99, 102, 241, ${glowAlpha * 0.4})`)
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.beginPath()
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
    }
  }

  function drawParticles() {
    if (!ctx) return
    particles.forEach((p) => {
      p.pulse += p.pulseSpeed
      const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.15
      const pulseRadius = p.radius + Math.sin(p.pulse * 1.3) * 0.4

      // Glow
      const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseRadius * 4)
      glow.addColorStop(0, `${p.color}${pulseAlpha * 0.5})`)
      glow.addColorStop(1, `${p.color}0)`)
      ctx!.beginPath()
      ctx!.arc(p.x, p.y, pulseRadius * 4, 0, Math.PI * 2)
      ctx!.fillStyle = glow
      ctx!.fill()

      // Core
      ctx!.beginPath()
      ctx!.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2)
      ctx!.fillStyle = `${p.color}${pulseAlpha})`
      ctx!.fill()
    })
  }

  function updateParticles() {
    particles.forEach((p) => {
      // Mouse repulsion
      const dx = p.x - mouseX
      const dy = p.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150 && dist > 0) {
        const force = (150 - dist) / 150 * 0.8
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
      }

      // Slight attraction to nearest node
      let minDist = Infinity
      let nearest = nodePositions[0]
      nodePositions.forEach((n) => {
        const d = Math.sqrt((p.x - n.x) ** 2 + (p.y - n.y) ** 2)
        if (d < minDist) { minDist = d; nearest = n }
      })
      if (minDist < 200 && nearest) {
        const attractForce = 0.0002
        p.vx += (nearest.x - p.x) * attractForce
        p.vy += (nearest.y - p.y) * attractForce
      }

      // Damping
      p.vx *= 0.995
      p.vy *= 0.995

      p.x += p.vx
      p.y += p.vy

      // Wrap around
      if (p.x < -10) p.x = width + 10
      if (p.x > width + 10) p.x = -10
      if (p.y < -10) p.y = height + 10
      if (p.y > height + 10) p.y = -10
    })
  }

  function render() {
    if (!ctx || !isActive.value) return
    if (!isVisible) {
      // Pause loop; will resume via IntersectionObserver
      return
    }
    time++

    ctx.clearRect(0, 0, width, height)

    updateParticles()
    drawConnections()
    drawNodeConnections()
    drawBurst()
    drawParticles()

    animationId = requestAnimationFrame(render)
  }

  function handleMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top
  }

  function handleMouseLeave() {
    mouseX = -1000
    mouseY = -1000
  }

  function triggerBurst() {
    if (burstTriggered) return
    burstTriggered = true
    burstStartTime = time
    createBurstLines()
  }

  function start() {
    isActive.value = true
    const canvas = canvasRef.value
    if (!canvas) return
    ctx = canvas.getContext('2d')
    if (!ctx) return

    resize()
    createParticles()
    render()

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', resize)

    // Pause/resume loop when canvas leaves/enters viewport
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        const wasVisible = isVisible
        isVisible = entries[0].isIntersecting
        if (isVisible && !wasVisible && isActive.value) {
          animationId = requestAnimationFrame(render)
        }
      },
      { threshold: 0 },
    )
    visibilityObserver.observe(canvas)

    // Trigger burst animation after a small delay
    setTimeout(triggerBurst, 600)
  }

  function stop() {
    isActive.value = false
    cancelAnimationFrame(animationId)
    visibilityObserver?.disconnect()
    visibilityObserver = null
    const canvas = canvasRef.value
    canvas?.removeEventListener('mousemove', handleMouseMove)
    canvas?.removeEventListener('mouseleave', handleMouseLeave)
    window.removeEventListener('resize', resize)
  }

  onBeforeUnmount(stop)

  return { start, stop, isActive }
}
