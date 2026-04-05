<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Check,
} from 'lucide-vue-next'
import GoogleAdsLogoIcon from '@/components/icons/GoogleAdsLogoIcon.vue'
import MetaAdsLogoIcon from '@/components/icons/MetaAdsLogoIcon.vue'
import { useFlowCanvas } from '@/composables/useFlowCanvas'
import { useArrowCanvas } from '@/composables/useArrowCanvas'
import { useMagneticStarfield } from '@/composables/useMagneticStarfield'
import { Badge } from '@/components/ui/badge'
import { LiquidGlassEffect, GlassFilter } from '@/components/ui/liquid-glass'

const base = import.meta.env.BASE_URL

const navScrolled = ref(false)
const openFaq = ref<number | null>(null)
const billingCycle = ref<'monthly' | 'annual'>('annual')
const PRICE_MONTHLY = 147
const PRICE_ANNUAL_MO = 118   // R$147 × 0.80 ≈ R$118/mês
const PRICE_ANNUAL_YR = 1_411 // R$118 × 12 = R$1.411/ano
const flowStatsItems = [
  { value: '3x', label: 'mais conversões' },
  { value: '-40%', label: 'custo por lead' },
  { value: '12.4x', label: 'ROAS médio' },
  { value: '5min', label: 'para configurar' },
]
const statsConfig = [
  { target: 3,    prefix: '',  suffix: 'x',   decimals: 0 },
  { target: 40,   prefix: '-', suffix: '%',   decimals: 0 },
  { target: 12.4, prefix: '',  suffix: 'x',   decimals: 1 },
  { target: 5,    prefix: '',  suffix: 'min', decimals: 0 },
]
const animatedStats = ref([0, 0, 0, 0])
const statsAnimated = ref(false)
const arrowCanvasRef = ref<HTMLCanvasElement | null>(null)
const heroCtaRef = ref<HTMLElement | null>(null)
const heroDashRef = ref<HTMLElement | null>(null)
const flowCanvasRef = ref<HTMLCanvasElement | null>(null)
const flowSectionRef = ref<HTMLElement | null>(null)
const flowBentoRef = ref<HTMLElement | null>(null)
const pricingGlassRef = ref<HTMLElement | null>(null)
const statsGlassRef = ref<HTMLElement | null>(null)
const pricingCanvasRef = ref<HTMLCanvasElement | null>(null)
const pricingSectionRef = ref<HTMLElement | null>(null)
useArrowCanvas(arrowCanvasRef, heroCtaRef, { color: 'rgba(255,255,255,0.6)' })
useFlowCanvas(flowCanvasRef)
useMagneticStarfield(pricingCanvasRef, pricingSectionRef, { count: 70, magnetRadius: 360 })

/* ── Liquid Glass (SVG feDisplacementMap approach from archisvaze/liquid-glass) ── */
type LiquidGlassOptions = {
  glassThickness: number
  bezelWidth: number
  ior: number
  scaleRatio: number
  blurAmount: number
  specOpacity: number
  specSaturation: number
  borderRadius: number
  mapScale: number
  maxMapDimension: number
  profileSamples: number
}

const BENTO_LIQUID_GLASS_OPTS: LiquidGlassOptions = {
  glassThickness: 40,
  bezelWidth: 24,
  ior: 2.2,
  scaleRatio: 1.0,
  blurAmount: 4,
  specOpacity: 0.18,
  specSaturation: 2,
  borderRadius: 20,
  mapScale: 0.5,
  maxMapDimension: 420,
  profileSamples: 96,
}

const PRICING_LIQUID_GLASS_OPTS: LiquidGlassOptions = {
  glassThickness: 40,
  bezelWidth: 24,
  ior: 2.2,
  scaleRatio: 1,
  blurAmount: 4,
  specOpacity: 0.18,
  specSaturation: 2,
  borderRadius: 20,
  mapScale: 0.5,
  maxMapDimension: 420,
  profileSamples: 96,
}

const STATS_LIQUID_GLASS_OPTS: LiquidGlassOptions = {
  glassThickness: 40,
  bezelWidth: 24,
  ior: 2.2,
  scaleRatio: 1,
  blurAmount: 4,
  specOpacity: 0.18,
  specSaturation: 2,
  borderRadius: 20,
  mapScale: 0.5,
  maxMapDimension: 420,
  profileSamples: 96,
}

function lgSurfaceFn(x: number) {
  return Math.pow(1 - Math.pow(1 - x, 4), 0.25)
}

function lgCalcRefractionProfile(glassThickness: number, bezelWidth: number, heightFn: (x: number) => number, ior: number, samples: number) {
  const eta = 1 / ior
  function refract(nx: number, ny: number) {
    const dot = ny
    const k = 1 - eta * eta * (1 - dot * dot)
    if (k < 0) return null
    const sq = Math.sqrt(k)
    return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny]
  }
  const profile = new Float64Array(samples)
  for (let i = 0; i < samples; i++) {
    const x = i / samples
    const y = heightFn(x)
    const dx = x < 1 ? 0.0001 : -0.0001
    const y2 = heightFn(x + dx)
    const deriv = (y2 - y) / dx
    const mag = Math.sqrt(deriv * deriv + 1)
    const ref = refract(-deriv / mag, -1 / mag)
    if (!ref) { profile[i] = 0; continue }
    profile[i] = ref[0] * ((y * bezelWidth + glassThickness) / ref[1])
  }
  return profile
}

function lgGetRenderScale(w: number, h: number, opts: LiquidGlassOptions) {
  const { mapScale, maxMapDimension } = opts
  return Math.min(1, mapScale, maxMapDimension / Math.max(w, h))
}

function lgGenerateDisplacementMap(w: number, h: number, radius: number, bezelWidth: number, profile: Float64Array, maxDisp: number) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) { d[i] = 128; d[i + 1] = 128; d[i + 2] = 0; d[i + 3] = 255 }
  const r = radius, rSq = r * r, r1Sq = (r + 1) ** 2
  const rBSq = Math.max(r - bezelWidth, 0) ** 2
  const wB = w - r * 2, hB = h - r * 2, S = profile.length
  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0
      const dSq = x * x + y * y
      if (dSq > r1Sq || dSq < rBSq) continue
      const dist = Math.sqrt(dSq)
      const fromSide = r - dist
      const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq))
      if (op <= 0 || dist === 0) continue
      const cos = x / dist, sin = y / dist
      const bi = Math.min(((fromSide / bezelWidth) * S) | 0, S - 1)
      const disp = profile[bi] || 0
      const dX = (-cos * disp) / maxDisp, dY = (-sin * disp) / maxDisp
      const idx = (y1 * w + x1) * 4
      d[idx] = (128 + dX * 127 * op + 0.5) | 0
      d[idx + 1] = (128 + dY * 127 * op + 0.5) | 0
    }
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL()
}

function lgGenerateSpecularMap(w: number, h: number, radius: number, bezelWidth: number, angle?: number) {
  angle = angle != null ? angle : Math.PI / 3
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(w, h)
  const d = img.data
  d.fill(0)
  const r = radius, rSq = r * r, r1Sq = (r + 1) ** 2
  const rBSq = Math.max(r - bezelWidth, 0) ** 2
  const wB = w - r * 2, hB = h - r * 2
  const sv = [Math.cos(angle), Math.sin(angle)]
  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0
      const dSq = x * x + y * y
      if (dSq > r1Sq || dSq < rBSq) continue
      const dist = Math.sqrt(dSq)
      const fromSide = r - dist
      const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq))
      if (op <= 0 || dist === 0) continue
      const cos = x / dist, sin = -y / dist
      const dot = Math.abs(cos * sv[0] + sin * sv[1])
      const edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) ** 2))
      const coeff = dot * edge
      const col = (255 * coeff) | 0
      const alpha = (col * coeff * op) | 0
      const idx = (y1 * w + x1) * 4
      d[idx] = col; d[idx + 1] = col; d[idx + 2] = col; d[idx + 3] = alpha
    }
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL()
}

function createLiquidGlassController(filterId: string, getTarget: () => HTMLElement | null, optsOrGetter: LiquidGlassOptions | (() => LiquidGlassOptions)) {
  let svgEl: SVGSVGElement | null = null
  let resizeObserver: ResizeObserver | null = null
  let frame: number | null = null
  let signature = ''

  function rebuild() {
    const el = getTarget()
    if (!el) return

    const w = el.offsetWidth
    const h = el.offsetHeight
    if (w < 2 || h < 2) return

    const opts = typeof optsOrGetter === 'function' ? optsOrGetter() : optsOrGetter
    const { glassThickness, bezelWidth, ior, scaleRatio, blurAmount, specOpacity, specSaturation, borderRadius, profileSamples } = opts
    const renderScale = lgGetRenderScale(w, h, opts)
    const mapW = Math.max(2, Math.round(w * renderScale))
    const mapH = Math.max(2, Math.round(h * renderScale))
    const scaledRadius = Math.max(2, Math.round(borderRadius * renderScale))
    const scaledGlassThickness = glassThickness * renderScale
    const scaledBezelBase = bezelWidth * renderScale
    const clampedBezel = Math.min(scaledBezelBase, scaledRadius - 1, Math.min(mapW, mapH) / 2 - 1)
    const nextSignature = [
      w,
      h,
      mapW,
      mapH,
      scaledRadius,
      scaledGlassThickness.toFixed(2),
      clampedBezel.toFixed(2),
      ior.toFixed(3),
      scaleRatio,
      blurAmount,
      specOpacity,
      specSaturation,
      profileSamples,
    ].join(':')
    if (nextSignature === signature) return

    const profile = lgCalcRefractionProfile(scaledGlassThickness, clampedBezel, lgSurfaceFn, ior, profileSamples)
    const maxDisp = Math.max(...Array.from(profile).map(Math.abs)) || 1
    const dispUrl = lgGenerateDisplacementMap(mapW, mapH, scaledRadius, clampedBezel, profile, maxDisp)
    const specUrl = lgGenerateSpecularMap(mapW, mapH, scaledRadius, clampedBezel * 2.5)
    const scale = (maxDisp / renderScale) * scaleRatio

    if (!svgEl) {
      svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svgEl.setAttribute('width', '0')
      svgEl.setAttribute('height', '0')
      svgEl.style.position = 'absolute'
      svgEl.style.overflow = 'hidden'
      svgEl.setAttribute('color-interpolation-filters', 'sRGB')
      document.body.appendChild(svgEl)
    }

    signature = nextSignature
    svgEl.innerHTML = `<defs>
      <filter id="${filterId}" x="0%" y="0%" width="100%" height="100%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurAmount}" result="blurred_source" />
        <feImage href="${dispUrl}" x="0" y="0" width="${w}" height="${h}" result="disp_map" preserveAspectRatio="none" />
        <feDisplacementMap in="blurred_source" in2="disp_map" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="displaced" />
        <feColorMatrix in="displaced" type="saturate" values="${specSaturation}" result="displaced_sat" />
        <feImage href="${specUrl}" x="0" y="0" width="${w}" height="${h}" result="spec_layer" preserveAspectRatio="none" />
        <feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked" />
        <feComponentTransfer in="spec_layer" result="spec_faded"><feFuncA type="linear" slope="${specOpacity}" /></feComponentTransfer>
        <feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat" />
        <feBlend in="spec_faded" in2="with_sat" mode="normal" />
      </filter>
    </defs>`
  }

  function schedule() {
    if (frame !== null) return
    frame = requestAnimationFrame(() => {
      frame = null
      rebuild()
    })
  }

  function observe() {
    const el = getTarget()
    if (!el) return
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(() => schedule())
    resizeObserver.observe(el)
  }

  function destroy() {
    resizeObserver?.disconnect()
    resizeObserver = null
    if (frame !== null) {
      cancelAnimationFrame(frame)
      frame = null
    }
    if (svgEl) {
      svgEl.remove()
      svgEl = null
    }
    signature = ''
  }

  return { schedule, observe, destroy }
}
const bentoGlass = createLiquidGlassController(
  'liquid-glass-bento-filter',
  () => flowBentoRef.value?.querySelector<HTMLElement>('.bento-card') ?? null,
  BENTO_LIQUID_GLASS_OPTS,
)
const pricingGlass = createLiquidGlassController(
  'liquid-glass-pricing-filter',
  () => pricingGlassRef.value,
  PRICING_LIQUID_GLASS_OPTS,
)
const statsGlass = createLiquidGlassController(
  'liquid-glass-stats-filter',
  () => statsGlassRef.value,
  STATS_LIQUID_GLASS_OPTS,
)

/* ── Spotlight Card — pointer tracking for glow ── */
function syncSpotlight(e: PointerEvent) {
  const cards = document.querySelectorAll<HTMLElement>('.feature-stack-card[data-glow]')
  cards.forEach((card) => {
    const inner = card.querySelector<HTMLElement>('.feature-stack-card__inner')
    if (!inner) return
    const rect = inner.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--x', `${x.toFixed(2)}`)
    card.style.setProperty('--y', `${y.toFixed(2)}`)
    card.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2))
  })
}

/* ── Scroll-stacking — scale & dim cards pushed behind ── */
/* ── Nav glass scroll-adaptive background ── */
function onNavScroll() {
  navScrolled.value = window.scrollY > 80
}
/* ── Hero dashboard perspective scroll (Bombon-style) ── */
function onHeroDashScroll() {
  const el = heroDashRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const viewH = window.innerHeight
  // Progress 0→1 as element goes from below viewport to above it
  const raw = 1 - (rect.top / viewH)
  const progress = Math.min(1, Math.max(0, raw))
  // Interpolate from tilted to flat
  const rotateX = 26 * (1 - progress)
  const scale = 0.82 + 0.18 * progress
  const translateY = -80 * (1 - progress)
  el.style.transform = `perspective(1200px) translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(4)}) rotateX(${rotateX.toFixed(2)}deg)`
}

function onStackScroll() {
  const cards = document.querySelectorAll<HTMLElement>('.feature-stack-card')
  const total = cards.length
  if (!total) return
  cards.forEach((card, i) => {
    const inner = card.querySelector<HTMLElement>('.feature-stack-card__inner')
    if (!inner) return
    const rect = card.getBoundingClientRect()
    const stickyTopPx = parseFloat(getComputedStyle(card).top) || (80 + i * 28)
    const isStuck = rect.top <= stickyTopPx + 2
    if (isStuck && i < total - 1) {
      const nextCard = cards[i + 1]
      const nextRect = nextCard.getBoundingClientRect()
      const overlap = Math.max(0, rect.top + rect.height - nextRect.top)
      const ratio = Math.min(1, overlap / rect.height)
      const scale = 1 - ratio * 0.05
      const brightness = 1 - ratio * 0.35
      inner.style.transform = `scale(${scale.toFixed(4)})`
      inner.style.filter = `brightness(${brightness.toFixed(3)})`
    } else {
      inner.style.transform = ''
      inner.style.filter = ''
    }
  })
}

onBeforeUnmount(() => {
  bentoGlass.destroy()
  pricingGlass.destroy()
  statsGlass.destroy()
  document.removeEventListener('pointermove', syncSpotlight)
  window.removeEventListener('scroll', onHeroDashScroll)
  window.removeEventListener('scroll', onNavScroll)
  window.removeEventListener('scroll', onStackScroll)
})

function animateCounter(index: number, target: number, decimals: number, delay: number) {
  const duration = 1400
  const startTime = performance.now() + delay
  function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4) }
  function step(now: number) {
    if (now < startTime) { requestAnimationFrame(step); return }
    const progress = Math.min((now - startTime) / duration, 1)
    animatedStats.value[index] = parseFloat((easeOutQuart(progress) * target).toFixed(decimals))
    if (progress < 1) requestAnimationFrame(step)
    else animatedStats.value[index] = target
  }
  requestAnimationFrame(step)
}

function startStatsAnimation() {
  if (statsAnimated.value) return
  statsAnimated.value = true
  statsConfig.forEach((cfg, i) => animateCounter(i, cfg.target, cfg.decimals, i * 180))
}

/* ── Scroll-reveal with staggered children ── */
onMounted(() => {
  const targets = document.querySelectorAll('.lp-hero, .lp-section, .lp-cta-band')

  /* Flow section — show immediately, no scroll-fade */
  document.querySelectorAll('.flow-section .reveal-child').forEach((el) => {
    el.classList.add('child-visible')
  })
  document.querySelector('.flow-section')?.classList.add('in-view')
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view')
          const children = e.target.querySelectorAll('.reveal-child')
          children.forEach((child, i) => {
            ;(child as HTMLElement).style.transitionDelay = `${i * 120}ms`
            requestAnimationFrame(() => child.classList.add('child-visible'))
          })
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.04, rootMargin: '0px 0px 40px 0px' },
  )
  targets.forEach((t) => io.observe(t))

  /* Flow section in-view */
  const flowEl = document.querySelector('.flow-section')
  if (flowEl) {
    const flowObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            flowObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    flowObs.observe(flowEl)
  }

  /* ── Liquid Glass – init ── */
  nextTick(() => {
    bentoGlass.schedule()
    bentoGlass.observe()
    pricingGlass.schedule()
    pricingGlass.observe()
    statsGlass.schedule()
    statsGlass.observe()

    /* Spotlight pointer listener */
    document.addEventListener('pointermove', syncSpotlight)

    /* Hero dashboard perspective scroll */
    window.addEventListener('scroll', onHeroDashScroll, { passive: true })
    window.addEventListener('scroll', onNavScroll, { passive: true })
    onHeroDashScroll()
    onNavScroll()

    /* Stacking cards scroll listener */
    window.addEventListener('scroll', onStackScroll, { passive: true })

    /* Stats counter – trigger on first intersection */
    if (statsGlassRef.value) {
      const statsObs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            startStatsAnimation()
            statsObs.disconnect()
          }
        },
        { threshold: 0.5 },
      )
      statsObs.observe(statsGlassRef.value)
    }
  })

})

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index
}

const features = [
  {
    title: 'Rastreia cada clique',
    description:
      'Conecta Meta e Google ao WhatsApp em tempo real. Do clique no anúncio à primeira mensagem, sem perder nenhuma origem.',
    image: base + 'img/features/dashboard.png',
    gradient: 'linear-gradient(145deg, #0a1628 0%, #0d2847 40%, #0f3058 100%)',
  },
  {
    title: 'Salva contatos instantaneamente',
    description:
      'Cada conversa vira lead completo no CRM com histórico e UTMs. Sem copiar, sem colar, sem perder contexto.',
    image: base + 'img/features/contatos.png',
    gradient: 'linear-gradient(145deg, #061a12 0%, #0b2e1f 40%, #0d3826 100%)',
  },
  {
    title: 'Acompanha a jornada completa',
    description:
      'Timeline única do anúncio ao pós-venda. Você vê o que aconteceu em cada etapa e consegue provar para o cliente.',
    image: base + 'img/features/jornada.png',
    gradient: 'linear-gradient(145deg, #0e0d2c 0%, #1a1850 40%, #211e63 100%)',
  },
  {
    title: 'Otimiza anúncios em tempo real',
    description:
      'Envia compras via Meta CAPI e Google Enhanced Conversions. O algoritmo aprende 3× mais rápido com dados reais de receita.',
    image: base + 'img/features/api.png',
    gradient: 'linear-gradient(145deg, #0a1628 0%, #0d2847 40%, #0f3058 100%)',
  },
  {
    title: 'Atualiza o funil sozinho',
    description:
      'Frases-gatilho movem o lead de etapa automaticamente. Zero atualização manual, zero dado perdido.',
    image: base + 'img/features/funil.png',
    gradient: 'linear-gradient(145deg, #061a12 0%, #0b2e1f 40%, #0d3826 100%)',
  },
  {
    title: 'Envia relatório diário no WhatsApp',
    description:
      'Gastos, vendas e KPIs chegam no seu celular toda manhã. Você já sabe os números antes do cliente perguntar.',
    image: base + 'img/features/relatorios.png',
    gradient: 'linear-gradient(145deg, #0e0d2c 0%, #1a1850 40%, #211e63 100%)',
  },
]

// Figma SVG icons — extracted from design file (viewBox 0 0 14 14, stroke currentColor)
const SVG_ICON_GRID = '<svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.25 1.75H2.333C2.011 1.75 1.75 2.011 1.75 2.333V6.417C1.75 6.739 2.011 7 2.333 7H5.25C5.572 7 5.833 6.739 5.833 6.417V2.333C5.833 2.011 5.572 1.75 5.25 1.75Z" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.667 1.75H8.75C8.428 1.75 8.167 2.011 8.167 2.333V4.083C8.167 4.406 8.428 4.667 8.75 4.667H11.667C11.989 4.667 12.25 4.406 12.25 4.083V2.333C12.25 2.011 11.989 1.75 11.667 1.75Z" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.667 7H8.75C8.428 7 8.167 7.261 8.167 7.583V11.667C8.167 11.989 8.428 12.25 8.75 12.25H11.667C11.989 12.25 12.25 11.989 12.25 11.667V7.583C12.25 7.261 11.989 7 11.667 7Z" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.25 9.333H2.333C2.011 9.333 1.75 9.595 1.75 9.917V11.667C1.75 11.989 2.011 12.25 2.333 12.25H5.25C5.572 12.25 5.833 11.989 5.833 11.667V9.917C5.833 9.595 5.572 9.333 5.25 9.333Z" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/></svg>'

const SVG_ICON_PLUG = '<svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12.833V9.917" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.25 4.667V1.167" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.75 4.667V1.167" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 4.667V7.583C10.5 8.202 10.254 8.796 9.817 9.233C9.379 9.671 8.786 9.917 8.167 9.917H5.833C5.214 9.917 4.621 9.671 4.183 9.233C3.746 8.796 3.5 8.202 3.5 7.583V4.667H10.5Z" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/></svg>'

const SVG_ICON_COMPASS = '<svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.473 4.527L8.421 7.683C8.364 7.855 8.267 8.011 8.139 8.139C8.011 8.267 7.855 8.364 7.683 8.421L4.527 9.473L5.579 6.317C5.636 6.145 5.733 5.989 5.861 5.861C5.989 5.733 6.145 5.636 6.317 5.579L9.473 4.527Z" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 12.833C10.222 12.833 12.833 10.222 12.833 7C12.833 3.778 10.222 1.167 7 1.167C3.778 1.167 1.167 3.778 1.167 7C1.167 10.222 3.778 12.833 7 12.833Z" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/></svg>'

const SVG_ICON_CHART = '<svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.75 1.75V11.083C1.75 11.393 1.873 11.69 2.092 11.908C2.311 12.127 2.607 12.25 2.917 12.25H12.25" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 9.917V5.25" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.583 9.917V2.917" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.667 9.917V8.167" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/></svg>'

const SVG_ICON_CHECK_CIRCLE = '<svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12.833C10.222 12.833 12.833 10.222 12.833 7C12.833 3.778 10.222 1.167 7 1.167C3.778 1.167 1.167 3.778 1.167 7C1.167 10.222 3.778 12.833 7 12.833Z" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.667 7L6.125 8.458L9.333 5.25" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/></svg>'

const SVG_ICON_BOLT = '<svg class="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.333 8.167C2.223 8.167 2.115 8.136 2.021 8.077C1.928 8.019 1.853 7.935 1.805 7.835C1.758 7.736 1.739 7.625 1.752 7.515C1.765 7.405 1.809 7.302 1.878 7.216L7.653 1.266C7.697 1.216 7.756 1.182 7.821 1.17C7.886 1.158 7.953 1.168 8.011 1.2C8.07 1.231 8.116 1.281 8.142 1.342C8.168 1.403 8.173 1.47 8.155 1.534L7.035 5.046C7.002 5.134 6.991 5.229 7.003 5.323C7.014 5.417 7.049 5.506 7.103 5.583C7.157 5.661 7.229 5.724 7.312 5.768C7.396 5.811 7.489 5.834 7.583 5.833H11.667C11.777 5.833 11.885 5.864 11.979 5.923C12.072 5.981 12.147 6.065 12.195 6.165C12.243 6.264 12.261 6.375 12.248 6.485C12.235 6.595 12.191 6.698 12.122 6.784L6.347 12.734C6.303 12.784 6.244 12.818 6.179 12.83C6.114 12.842 6.047 12.832 5.989 12.8C5.93 12.769 5.884 12.719 5.858 12.658C5.832 12.598 5.827 12.53 5.845 12.466L6.965 8.954C6.998 8.866 7.009 8.771 6.997 8.677C6.986 8.583 6.951 8.494 6.897 8.417C6.843 8.339 6.771 8.276 6.688 8.232C6.604 8.189 6.511 8.166 6.417 8.167H2.333Z" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/></svg>'

const activationFeatures: { label: string; svg: string; color: string; bg: string }[] = [
  { label: 'Criação do workspace para a sua operação em poucos minutos', svg: SVG_ICON_GRID,    color: '#3BB56D', bg: 'rgba(59,181,109,0.12)' },
  { label: 'Conexão inicial com Meta Ads, Google Ads e WhatsApp',        svg: SVG_ICON_PLUG,    color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { label: 'Onboarding guiado para mapear fontes, eventos e leitura de vendas', svg: SVG_ICON_COMPASS, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { label: 'Primeiro dashboard com leads, receita atribuída e ROI',      svg: SVG_ICON_CHART,   color: '#3BB56D', bg: 'rgba(59,181,109,0.12)' },
  { label: 'Entrada self-serve para ativar a operação no seu ritmo',     svg: SVG_ICON_BOLT,         color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { label: 'Validação do rastreamento antes do primeiro relatório',       svg: SVG_ICON_CHECK_CIRCLE, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
]

const activationSignals = [
  'Sem cartão de crédito',
  'Setup guiado em 5 minutos',
  'Acesso imediato ao workspace',
]

const firstSessionOutcomes = [
  'Cria o workspace com a estrutura inicial da operação.',
  'Conecta mídia e WhatsApp sem depender de configuração manual longa.',
  'Sai com a primeira leitura de leads, vendas e ROI atribuídos.',
]

const faqs = [
  {
    question: 'É possível usar o Adsmagic apenas para monitorar, sem integrar com WhatsApp?',
    answer:
      'Sim, você pode utilizar o Adsmagic para monitorar suas campanhas. Porém, a integração com WhatsApp é o que permite rastrear a origem dos leads até a venda final.',
  },
  {
    question: 'O Adsmagic funciona com qualquer plataforma de anúncios?',
    answer:
      'Atualmente o Adsmagic funciona com Meta Ads (Facebook e Instagram) e Google Ads, as duas principais plataformas de tráfego pago do mercado.',
  },
  {
    question: 'Como o Adsmagic rastreia as conversas no WhatsApp?',
    answer:
      'Utilizamos parâmetros UTM e links rastreados que conectam o clique na campanha ao contato no WhatsApp, permitindo saber exatamente qual campanha gerou cada conversa.',
  },
  {
    question: 'Preciso alterar meu fluxo de atendimento no WhatsApp para usar o Adsmagic?',
    answer:
      'Não. O Adsmagic se integra ao seu fluxo atual sem necessidade de mudanças no atendimento. A configuração é simples e não interfere na operação.',
  },
  {
    question: 'O Adsmagic substitui meu CRM?',
    answer:
      'Não. O Adsmagic complementa seu CRM conectando dados de campanha ao funil de vendas, dando visibilidade da origem do lead até a conversão.',
  },
  {
    question: 'Os dados coletados pelo Adsmagic são seguros?',
    answer:
      'Sim. Todos os dados são armazenados com criptografia e seguindo as melhores práticas de segurança. Você mantém total controle sobre suas informações.',
  },
  {
    question: 'Quais métricas posso acompanhar no dashboard?',
    answer:
      'Você acompanha leads por campanha, custo por lead qualificado, taxa de conversão por etapa do funil, vendas atribuídas e ROI real de cada campanha.',
  },
  {
    question: 'O Adsmagic oferece suporte técnico?',
    answer:
      'Sim. Oferecemos suporte dedicado por chat e e-mail para ajudar na configuração e no dia a dia da plataforma.',
  },
  {
    question: 'Quanto tempo leva para configurar o Adsmagic?',
    answer:
      'A configuração inicial leva menos de 5 minutos. Você conecta suas fontes de anúncio e o WhatsApp pelo painel guiado, sem precisar de dev ou código.',
  },
  {
    question: 'Como o Adsmagic ajuda a reduzir o Custo por Aquisição (CPA)?',
    answer:
      'Ao devolver dados reais de venda para o Meta Ads e Google Ads via CAPI e Enhanced Conversions, os algoritmos passam a otimizar por receita, não por lead. O CPA cai progressivamente conforme mais dados de venda entram no sistema.',
  },
]

const dashboardSrc = base + 'img/landing/hero/hero-dashboard.png'
const showDashboardFallback = ref(false)

function onDashboardError(event: Event) {
  const target = event.target as HTMLImageElement | null
  if (target) {
    target.style.display = 'none'
  }
  showDashboardFallback.value = true
}

// ── Brand grafismo constants ──
const starPath =
  'M77.9645 120.387C77.9645 108.106 83.0981 96.3291 92.2363 87.6457C101.374 78.9623 113.769 74.084 126.692 74.084C129.277 74.084 131.756 73.1084 133.583 71.3717C135.411 69.635 136.438 67.2796 136.438 64.8235C136.438 62.3675 135.411 60.0121 133.583 58.2754C131.756 56.5387 129.277 55.563 126.692 55.563C113.769 55.563 101.374 50.6848 92.2363 42.0014C83.0981 33.318 77.9645 21.5408 77.9645 9.26057C77.9645 6.80453 76.9377 4.44898 75.1101 2.7123C73.2825 0.975617 70.8037 0 68.219 0C65.6344 0 63.1556 0.975617 61.328 2.7123C59.5004 4.44898 58.4736 6.80453 58.4736 9.26057C58.4736 21.5408 53.3395 33.318 44.2013 42.0014C35.0631 50.6848 22.6693 55.563 9.74597 55.563C7.1613 55.563 4.68203 56.5387 2.85439 58.2754C1.02675 60.0121 0 62.3675 0 64.8235C0 67.2796 1.02675 69.635 2.85439 71.3717C4.68203 73.1084 7.1613 74.084 9.74597 74.084C22.6693 74.084 35.0631 78.9623 44.2013 87.6457C53.3395 96.3291 58.4736 108.106 58.4736 120.387C58.4736 122.843 59.5004 125.198 61.328 126.935C63.1556 128.671 65.6344 129.647 68.219 129.647C70.8037 129.647 73.2825 128.671 75.1101 126.935C76.9377 125.198 77.9645 122.843 77.9645 120.387Z'
const starVB = '0 0 137 130'
</script>

<template>
  <div class="lp-root">
    <!-- SVG filter used by liquid-glass components -->
    <GlassFilter />

    <!-- Nav — liquid glass bar -->
    <div class="lp-nav-wrap">
      <LiquidGlassEffect tag="div" :class="['lp-nav-glass-bar', { 'nav-scrolled': navScrolled }]">
        <nav class="lp-nav-inner" aria-label="Navegacao da landing page">
          <a href="/lp/agencias" class="flex items-center" aria-label="Ir para o topo da landing page Adsmagic para Agencias">
            <img src="/logo-wordmark-white.svg" alt="Adsmagic" class="h-7" />
          </a>
          <div class="nav-right-group">
            <div class="nav-links-inline" aria-label="Secoes da landing page">
              <a href="#como-funciona" class="nav-anchor">Como funciona</a>
              <a href="#cadastro" class="nav-anchor">Cadastro</a>
            </div>
            <span class="nav-separator"></span>
            <div class="nav-actions">
              <a href="/" class="nav-pill">Acessar App</a>
              <a href="/cadastro" class="nav-pill nav-pill--cta">Testar agora</a>
            </div>
          </div>
        </nav>
      </LiquidGlassEffect>
    </div>

    <!-- HERO -->
    <section class="lp-hero lp-hero--dark" :style="{ backgroundImage: `url('${base}img/landing/hero/hero-bg.png')` }">
      <div class="lp-container hero-shell">
        <div class="hero-content hero-content--centered">
          <div class="hero-copy reveal-child">
            <span class="hero-chip">Para gestoras de tráfego que vendem pelo WhatsApp</span>
            <h1 class="hero-title hero-title--white">
              Seu cliente fecha no WhatsApp.<br />
              <span class="hero-accent">Sua campanha precisa saber disso.</span>
            </h1>
            <p class="hero-subtitle hero-subtitle--light">
              O Adsmagic conecta o clique no anúncio à venda no WhatsApp
              e devolve esses dados para Meta e Google otimizarem por receita, não por lead.
            </p>
          </div>

          <div class="hero-actions hero-actions--centered reveal-child">
            <a ref="heroCtaRef" href="/cadastro" class="hero-cta hero-cta--glow group">
              <span>Ver meu primeiro dado de receita</span>
              <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#como-funciona" class="hero-cta-ghost group">
              <span>Ver como funciona</span>
              <ChevronDown class="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>

          <p class="hero-trust-line reveal-child">
            <span class="hero-trust-dot" aria-hidden="true"></span>
            Usado por gestores de tráfego e agências que renovam contratos com dados de receita, não de lead
          </p>
        </div>

        <div ref="heroDashRef" class="hero-dashboard reveal-child">
          <div class="hero-dashboard-frame hero-dashboard-frame--figma">
            <img
              :src="dashboardSrc"
              alt="Dashboard Adsmagic — Visão geral"
              class="hero-dashboard-img"
              loading="eager"
              @error="onDashboardError"
            />
            <div v-if="showDashboardFallback" class="hero-dashboard-placeholder">
              <BarChart3 class="h-12 w-12 text-slate-300" />
              <span class="text-sm text-slate-500">Dashboard preview</span>
            </div>
          </div>
        </div>

        <div class="hero-social-proof reveal-child">
          <p class="hero-social-label">Apoiado por</p>
          <div class="hero-social-logos hero-social-logos--figma">
            <div class="hero-social-logo-wrap hero-social-logo-wrap--wide">
              <img :src="base + 'img/landing/hero/logo-abstartups.png'" alt="Abstartups" class="hero-social-logo hero-social-logo--image" />
            </div>
            <span class="hero-social-divider hero-social-divider--tall" aria-hidden="true"></span>
            <div class="hero-social-logo-wrap hero-social-logo-wrap--wide">
              <img :src="base + 'img/landing/hero/logo-sebrae.png'" alt="Sebrae for Startups" class="hero-social-logo hero-social-logo--image" />
            </div>
            <span class="hero-social-divider hero-social-divider--tall" aria-hidden="true"></span>
            <div class="hero-social-logo-wrap hero-social-logo-wrap--google">
              <img :src="base + 'img/landing/hero/logo-google.png'" alt="Google for Startups" class="hero-social-logo hero-social-logo--image hero-social-logo--google" />
            </div>
          </div>
        </div>
      </div>
      <!-- Bottom fade: blends hero bg-image into solid #010543  -->
      <div class="hero-section-fade" aria-hidden="true"></div>
    </section>

    <!-- Section bridge: smooth gradient from hero into flow-section -->
    <div class="section-bridge" aria-hidden="true"></div>

    <!-- Do Clique ao ROI — WebGL Animated Flow (Stripe-inspired) -->
    <section id="como-funciona" class="flow-section" ref="flowSectionRef">
      <!-- WebGL Canvas Background -->
      <canvas ref="flowCanvasRef" class="flow-canvas" aria-hidden="true"></canvas>

      <!-- Radial glow overlays -->
      <div class="flow-glow flow-glow--left" aria-hidden="true"></div>
      <div class="flow-glow flow-glow--right" aria-hidden="true"></div>
      <div class="flow-glow flow-glow--center" aria-hidden="true"></div>

      <!-- ── Brand Grafismos ── -->
      <div class="grafismo-flow" aria-hidden="true">
        <!-- Diagonal bars — top-left cluster -->
        <svg class="grafismo-flow-bars grafismo-flow-bars--tl" viewBox="0 0 260 500" fill="none">
          <rect x="60" y="0" width="30" height="260" rx="15" transform="rotate(135 75 130)" fill="url(#flowBar1)" fill-opacity="0.18" />
          <rect x="120" y="40" width="22" height="200" rx="11" transform="rotate(135 131 140)" fill="url(#flowBar2)" fill-opacity="0.14" />
          <rect x="170" y="80" width="16" height="160" rx="8" transform="rotate(135 178 160)" fill="url(#flowBar3)" fill-opacity="0.10" />
          <defs>
            <linearGradient id="flowBar1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1E3A8A" /><stop offset="1" stop-color="#2563EB" /></linearGradient>
            <linearGradient id="flowBar2" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#059669" /><stop offset="1" stop-color="#3BB56D" /></linearGradient>
            <linearGradient id="flowBar3" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#6366f1" /><stop offset="1" stop-color="#818cf8" /></linearGradient>
          </defs>
        </svg>

        <!-- Diagonal bars — bottom-right cluster -->
        <svg class="grafismo-flow-bars grafismo-flow-bars--br" viewBox="0 0 240 460" fill="none">
          <rect x="40" y="20" width="26" height="230" rx="13" transform="rotate(135 53 135)" fill="url(#flowBarR1)" fill-opacity="0.20" />
          <rect x="100" y="60" width="20" height="190" rx="10" transform="rotate(135 110 155)" fill="url(#flowBarR2)" fill-opacity="0.14" />
          <rect x="150" y="100" width="14" height="140" rx="7" transform="rotate(135 157 170)" fill="url(#flowBarR3)" fill-opacity="0.09" />
          <defs>
            <linearGradient id="flowBarR1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#059669" /><stop offset="1" stop-color="#3BB56D" /></linearGradient>
            <linearGradient id="flowBarR2" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1E3A8A" /><stop offset="1" stop-color="#6366f1" /></linearGradient>
            <linearGradient id="flowBarR3" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3BB56D" /><stop offset="1" stop-color="#2563EB" /></linearGradient>
          </defs>
        </svg>

        <!-- Single accent bar — center-left -->
        <svg class="grafismo-flow-bars grafismo-flow-bars--cl" viewBox="0 0 80 200" fill="none">
          <rect x="20" y="10" width="14" height="130" rx="7" transform="rotate(135 27 75)" fill="url(#flowBarCL)" fill-opacity="0.07" />
          <defs>
            <linearGradient id="flowBarCL" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3BB56D" /><stop offset="1" stop-color="#059669" /></linearGradient>
          </defs>
        </svg>

        <!-- Stars — brand 4-pointed star -->
        <svg class="grafismo-flow-star grafismo-flow-star--1" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#3BB56D" fill-opacity="0.12" />
        </svg>
        <svg class="grafismo-flow-star grafismo-flow-star--2" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#6366f1" fill-opacity="0.08" />
        </svg>
        <svg class="grafismo-flow-star grafismo-flow-star--3" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#ffffff" fill-opacity="0.05" />
        </svg>
        <svg class="grafismo-flow-star grafismo-flow-star--4" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#3BB56D" fill-opacity="0.09" />
        </svg>

        <!-- Floating micro-dots -->
        <span class="grafismo-flow-dot grafismo-flow-dot--1"></span>
        <span class="grafismo-flow-dot grafismo-flow-dot--2"></span>
        <span class="grafismo-flow-dot grafismo-flow-dot--3"></span>
        <span class="grafismo-flow-dot grafismo-flow-dot--4"></span>
        <span class="grafismo-flow-dot grafismo-flow-dot--5"></span>
        <span class="grafismo-flow-dot grafismo-flow-dot--6"></span>

        <!-- Extra glow spots aligned with bars -->
        <div class="grafismo-flow-glow grafismo-flow-glow--tl"></div>
        <div class="grafismo-flow-glow grafismo-flow-glow--br"></div>
      </div>

      <div class="lp-container relative z-10">
        <!-- Header -->
        <div class="text-center mb-20">
          <span class="flow-eyebrow reveal-child">Como funciona</span>
          <h2 class="flow-heading reveal-child">
            De gestora de leads para gestora de receita
          </h2>
          <p class="flow-subheading reveal-child">
            Assine cada venda gerada pelas suas campanhas, com dados que o cliente não consegue contestar.<br class="hidden sm:inline" />
            Quatro passos para transformar cada fechamento no WhatsApp em argumento de renovação.
          </p>
        </div>

        <!-- Bento Grid — 4 Steps -->
        <div ref="flowBentoRef" class="flow-bento">

          <!-- Step 1: Origem do clique -->
          <div class="bento-card bento-card--origins reveal-child">
            <div class="bento-card-backdrop" aria-hidden="true"></div>
            <svg class="bento-card-shell" viewBox="0 0 285 519" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 20C0 8.95431 8.95431 0 20 0H265C276.046 0 285 8.95431 285 20V499C285 510.046 276.046 519 265 519H20C8.9543 519 0 510.046 0 499V20Z" fill="white" fill-opacity="0.05" />
            </svg>
            <div class="bento-card-inner">
              <div class="bento-step-badge">01</div>
              <h3 class="bento-title">Origem do<br />clique</h3>
              <p class="bento-desc">Rastreamos cada clique de Meta Ads, Google, TikTok, Instagram e mais</p>
              <div class="origins-visual-v2">
                <!-- Gmail -->
                <div class="origin-orb"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="#EA4335" d="M20 4H4L12 10.5 20 4z"/><path fill="#4285F4" d="M22 6v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6l10 7.5L22 6z"/></svg></div>
                <!-- Globe -->
                <div class="origin-orb"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#818cf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg></div>
                <!-- Facebook -->
                <div class="origin-orb"><svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
                <!-- TikTok -->
                <div class="origin-orb"><svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.31 0 .6.04.88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.38-6.22V9.4a8.16 8.16 0 0 0 3.84.96V7.06c-.56-.12-1.1-.24-1.59-.37z"/></svg></div>
                <!-- Google -->
                <div class="origin-orb"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg></div>
                <!-- Instagram -->
                <div class="origin-orb"><svg viewBox="0 0 24 24" width="18" height="18"><defs><linearGradient id="igF2" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#FCAF45"/><stop offset="50%" stop-color="#F77737"/><stop offset="100%" stop-color="#833AB4"/></linearGradient></defs><path fill="url(#igF2)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></div>
              </div>
            </div>
            <!-- Decorative glow -->
            <div class="bento-card-glow bento-card-glow--green" aria-hidden="true"></div>
          </div>

          <!-- Step 2: WhatsApp -->
          <div class="bento-card bento-card--whatsapp reveal-child">
            <div class="bento-card-backdrop" aria-hidden="true"></div>
            <svg class="bento-card-shell" viewBox="0 0 285 519" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 20C0 8.95431 8.95431 0 20 0H265C276.046 0 285 8.95431 285 20V499C285 510.046 276.046 519 265 519H20C8.9543 519 0 510.046 0 499V20Z" fill="white" fill-opacity="0.05" />
            </svg>
            <div class="bento-card-inner">
              <div class="bento-step-badge">02</div>
              <h3 class="bento-title">Conversa no<br />WhatsApp</h3>
              <p class="bento-desc">Detecta automaticamente quando a venda acontece na conversa</p>
              <div class="wa-mockup-v2">
                <div class="wa-mock-header">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  <span>WhatsApp Business</span>
                </div>
                <div class="wa-mock-body">
                  <div class="wa-msg wa-msg--in">Vi o anúncio e quero saber mais</div>
                  <div class="wa-msg wa-msg--out">Claro! Vou enviar as informações 🚀</div>
                  <div class="wa-msg wa-msg--in">Fechado! Como pago?</div>
                  <div class="wa-msg wa-msg--out wa-msg--sale">
                    <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"/></svg>
                    Venda detectada!
                  </div>
                </div>
              </div>
            </div>
            <div class="bento-card-glow bento-card-glow--emerald" aria-hidden="true"></div>
          </div>

          <!-- Step 3: Dashboard -->
          <div class="bento-card bento-card--dashboard reveal-child">
            <div class="bento-card-backdrop" aria-hidden="true"></div>
            <svg class="bento-card-shell" viewBox="0 0 285 519" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 20C0 8.95431 8.95431 0 20 0H265C276.046 0 285 8.95431 285 20V499C285 510.046 276.046 519 265 519H20C8.9543 519 0 510.046 0 499V20Z" fill="white" fill-opacity="0.05" />
            </svg>
            <div class="bento-card-inner">
              <div class="bento-step-badge">03</div>
              <h3 class="bento-title">Detecção da<br />venda</h3>
              <p class="bento-desc">Identifica automaticamente cada venda e atribui à campanha correta</p>
              <div class="dash-mockup-v2">
                <div class="dash-mock-header">
                  <img src="/logo-wordmark-white.svg" alt="Adsmagic" class="h-4 w-auto shrink-0" />
                  <span>Dashboard</span>
                </div>
                <div class="dash-mock-body">
                  <div class="dash-mock-metrics">
                    <div class="dash-mock-metric">
                      <span class="dash-mock-val">R$ 7.450</span>
                      <span class="dash-mock-lbl">Faturamento</span>
                    </div>
                    <div class="dash-mock-metric">
                      <span class="dash-mock-val dash-mock-val--accent">48</span>
                      <span class="dash-mock-lbl">Leads</span>
                    </div>
                    <div class="dash-mock-metric">
                      <span class="dash-mock-val dash-mock-val--gold">12.4x</span>
                      <span class="dash-mock-lbl">ROAS</span>
                    </div>
                  </div>
                  <div class="dash-mock-chart">
                    <div class="dash-mock-bar" style="--h:40%"></div>
                    <div class="dash-mock-bar" style="--h:65%"></div>
                    <div class="dash-mock-bar" style="--h:50%"></div>
                    <div class="dash-mock-bar" style="--h:80%"></div>
                    <div class="dash-mock-bar" style="--h:60%"></div>
                    <div class="dash-mock-bar" style="--h:90%"></div>
                    <div class="dash-mock-bar" style="--h:72%"></div>
                    <div class="dash-mock-bar" style="--h:85%"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bento-card-glow bento-card-glow--indigo" aria-hidden="true"></div>
          </div>

          <!-- Step 4: Otimização -->
          <div class="bento-card bento-card--optimize reveal-child">
            <div class="bento-card-backdrop" aria-hidden="true"></div>
            <svg class="bento-card-shell" viewBox="0 0 285 519" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 20C0 8.95431 8.95431 0 20 0H265C276.046 0 285 8.95431 285 20V499C285 510.046 276.046 519 265 519H20C8.9543 519 0 510.046 0 499V20Z" fill="white" fill-opacity="0.05" />
            </svg>
            <div class="bento-card-inner">
              <div class="bento-step-badge">04</div>
              <h3 class="bento-title">Otimização da<br />campanha</h3>
              <p class="bento-desc">Transforma a venda em sinal qualificado para Meta e Google otimizarem melhor</p>
              <div class="optimize-visual-v2">
                <div class="optimize-logos">
                  <div class="optimize-logo-ring optimize-logo-ring--meta">
                    <MetaAdsLogoIcon :size="36" />
                    <span>Meta Ads</span>
                  </div>
                  <div class="optimize-logo-ring optimize-logo-ring--google">
                    <GoogleAdsLogoIcon :size="32" />
                    <span>Google Ads</span>
                  </div>
                </div>
                <div class="optimize-status">
                  <div class="optimize-pulse" aria-hidden="true"></div>
                  <span>Evento certo, no estagio certo</span>
                </div>
              </div>
            </div>
            <div class="bento-card-glow bento-card-glow--gold" aria-hidden="true"></div>
          </div>

        </div>

        <!-- Stats Row (SVG/CSS Liquid Glass — same technique as bento cards) -->
        <div ref="statsGlassRef" class="stats-card reveal-child">
          <div class="stats-card-backdrop" aria-hidden="true"></div>
          <svg class="stats-card-shell" viewBox="0 0 1100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0 20C0 8.95431 8.95431 0 20 0H1080C1091.05 0 1100 8.95431 1100 20V80C1100 91.0457 1091.05 100 1080 100H20C8.95431 100 0 91.0457 0 80V20Z"
              fill="white" fill-opacity="0.05"
            />
          </svg>
          <div class="stats-card-inner">
            <template v-for="(item, index) in flowStatsItems" :key="`${item.value}-${item.label}`">
              <div class="stats-card__item">
                <span class="stats-card__value">{{ statsConfig[index].prefix }}{{ animatedStats[index].toFixed(statsConfig[index].decimals) }}{{ statsConfig[index].suffix }}</span>
                <span class="stats-card__label">{{ item.label }}</span>
              </div>
              <div v-if="index < flowStatsItems.length - 1" class="stats-card__divider" aria-hidden="true"></div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Carousel -->
    <section class="lp-section lp-section--alt">
      <!-- Brand grafismo — features decorations -->
      <div class="grafismo-features" aria-hidden="true">
        <svg class="grafismo-star grafismo-star--feat-1" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#3BB56D" fill-opacity="0.05" />
        </svg>
        <svg class="grafismo-bars grafismo-bars--feat" viewBox="0 0 160 280" fill="none">
          <rect x="30" y="0" width="22" height="150" rx="11" transform="rotate(35 30 0)" fill="url(#featBar1)" fill-opacity="0.04" />
          <rect x="70" y="30" width="16" height="120" rx="8" transform="rotate(35 70 30)" fill="url(#featBar2)" fill-opacity="0.03" />
          <defs>
            <linearGradient id="featBar1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#059669" /><stop offset="1" stop-color="#3BB56D" /></linearGradient>
            <linearGradient id="featBar2" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1E3A8A" /><stop offset="1" stop-color="#6366f1" /></linearGradient>
          </defs>
        </svg>
      </div>
      <div class="lp-container">
        <div class="text-center">
          <span class="features-eyebrow">Plataforma completa</span>
          <h2 class="section-heading">O que o Adsmagic faz por você</h2>
          <p class="section-subtitle">
            Do clique ao cliente final: acompanhe cada passo<br class="hidden sm:inline" /> em um único lugar.
          </p>
        </div>

        <!-- Features Stack — Scroll Stacking Cards à la Framer -->
        <div class="features-stack">
          <div
            v-for="(feature, i) in features"
            :key="i"
            class="feature-stack-card"
            data-glow
            :style="{ '--i': i, '--base': `${140 + i * 20}` }"
          >
            <div class="feature-stack-card__glow" data-glow></div>
            <div class="feature-stack-card__inner">
              <div class="feature-stack-card__visual" :style="{ background: feature.gradient }">
                <!-- Brand grafismos -->
                <div class="feat-grafismo" aria-hidden="true">
                  <svg class="feat-grafismo__star" :viewBox="starVB" fill="none">
                    <path :d="starPath" fill="currentColor" />
                  </svg>
                  <svg class="feat-grafismo__bars" viewBox="0 0 120 200" fill="none">
                    <rect x="20" y="0" width="16" height="120" rx="8" transform="rotate(35 20 0)" fill="currentColor" opacity="0.6" />
                    <rect x="50" y="20" width="12" height="90" rx="6" transform="rotate(35 50 20)" fill="currentColor" opacity="0.4" />
                  </svg>
                </div>
                <div class="feat-browser-bar" aria-hidden="true">
                  <span class="feat-browser-dot feat-browser-dot--red" />
                  <span class="feat-browser-dot feat-browser-dot--yellow" />
                  <span class="feat-browser-dot feat-browser-dot--green" />
                </div>
                <img
                  :src="feature.image"
                  :alt="feature.title"
                  class="feature-stack-card__img"
                  loading="lazy"
                />
              </div>
              <div class="feature-stack-card__content">
                <span class="feature-stack-card__step">{{ String(i + 1).padStart(2, '0') }}</span>
                <h3 class="feature-stack-card__title">{{ feature.title }}</h3>
                <p class="feature-stack-card__desc">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Band -->
    <section class="lp-cta-band">
      <!-- Brand grafismo — diagonal bars + stars -->
      <div class="grafismo-cta-band" aria-hidden="true">
        <svg class="grafismo-bars grafismo-bars--cta-left" viewBox="0 0 240 400" fill="none">
          <rect x="50" y="0" width="32" height="220" rx="16" transform="rotate(35 50 0)" fill="url(#ctaBar1)" fill-opacity="0.10" />
          <rect x="100" y="30" width="24" height="180" rx="12" transform="rotate(35 100 30)" fill="url(#ctaBar2)" fill-opacity="0.08" />
          <rect x="20" y="80" width="20" height="160" rx="10" transform="rotate(35 20 80)" fill="url(#ctaBar3)" fill-opacity="0.06" />
          <defs>
            <linearGradient id="ctaBar1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3BB56D" /><stop offset="1" stop-color="#059669" /></linearGradient>
            <linearGradient id="ctaBar2" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2563EB" /><stop offset="1" stop-color="#6366f1" /></linearGradient>
            <linearGradient id="ctaBar3" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3BB56D" /><stop offset="1" stop-color="#2563EB" /></linearGradient>
          </defs>
        </svg>
        <svg class="grafismo-bars grafismo-bars--cta-right" viewBox="0 0 200 360" fill="none">
          <rect x="40" y="10" width="28" height="200" rx="14" transform="rotate(35 40 10)" fill="url(#ctaBarR1)" fill-opacity="0.08" />
          <rect x="90" y="50" width="22" height="170" rx="11" transform="rotate(35 90 50)" fill="url(#ctaBarR2)" fill-opacity="0.06" />
          <defs>
            <linearGradient id="ctaBarR1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#059669" /><stop offset="1" stop-color="#3BB56D" /></linearGradient>
            <linearGradient id="ctaBarR2" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1E3A8A" /><stop offset="1" stop-color="#6366f1" /></linearGradient>
          </defs>
        </svg>
        <svg class="grafismo-star grafismo-star--cta-1" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#3BB56D" fill-opacity="0.10" />
        </svg>
        <svg class="grafismo-star grafismo-star--cta-2" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#ffffff" fill-opacity="0.04" />
        </svg>
      </div>
      <!-- Floating platform icons -->
      <div class="band-icons" aria-hidden="true">
        <!-- Google -->
        <div class="floating-icon floating-icon--1">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        <!-- Meta / Facebook -->
        <div class="floating-icon floating-icon--2">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
        <!-- WhatsApp -->
        <div class="floating-icon floating-icon--3">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
        </div>
        <!-- Instagram -->
        <div class="floating-icon floating-icon--4">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <defs><linearGradient id="ig2" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#FCAF45"/><stop offset="30%" stop-color="#F77737"/><stop offset="60%" stop-color="#C13584"/><stop offset="100%" stop-color="#833AB4"/></linearGradient></defs>
            <path fill="url(#ig2)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
          </svg>
        </div>
        <!-- TikTok -->
        <div class="floating-icon floating-icon--5">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.38-6.22V9.4a8.16 8.16 0 0 0 3.84.96V7.06a4.85 4.85 0 0 1-1.59-.37z"/>
          </svg>
        </div>
      </div>
      <!-- Glow -->
      <div class="band-glow" aria-hidden="true" />
      <div class="lp-container relative z-10 text-center">
        <h2 class="cta-band-heading">
          Cada venda não rastreada é uma renovação que você pode perder
        </h2>
        <p class="cta-band-relief">Você fecha isso em 30 minutos.</p>
        <p class="cta-band-sub">
          Cada venda vira dado. Cada dado vira argumento. Cada argumento vira renovação.<br class="hidden sm:inline" />
          Conecte Meta, Google e WhatsApp. Sem dev, sem código.
        </p>
        <a href="#cadastro" class="cta-band-btn group">
          <span>Provar receita nos próximos 30 minutos</span>
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
      <div class="cta-band-section-fade" aria-hidden="true"></div>
    </section>

    <div class="pricing-section-bridge" aria-hidden="true"></div>

    <!-- Cadastro -->
    <section id="cadastro" class="lp-section lp-section--pricing-stars" ref="pricingSectionRef">
      <!-- Magnetic starfield canvas -->
      <canvas ref="pricingCanvasRef" class="pricing-stars-canvas" aria-hidden="true"></canvas>

      <!-- Brand grafismo — pricing accent -->
      <div class="grafismo-pricing" aria-hidden="true">
        <svg class="grafismo-star grafismo-star--pricing" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#3BB56D" fill-opacity="0.05" />
        </svg>
      </div>
      <div class="lp-container">
        <div class="text-center">
          <h2 class="section-heading">Sua operação começa a provar receita ainda hoje</h2>
          <p class="section-subtitle">
            Crie sua conta, conecte suas fontes e veja o primeiro dado de venda rastreado antes de terminar o dia.
          </p>
          <p class="roi-anchor-line">Uma venda média de R$&nbsp;400 já cobre 2 meses de Adsmagic.</p>
        </div>
        <div ref="pricingGlassRef" class="pricing-card mx-auto mt-12">
          <div class="pricing-card-backdrop" aria-hidden="true"></div>
          <svg class="pricing-card-shell" viewBox="0 0 980 470" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0 20C0 8.95431 8.95431 0 20 0H960C971.046 0 980 8.95431 980 20V450C980 461.046 971.046 470 960 470H20C8.95431 470 0 461.046 0 450V20Z"
            />
          </svg>
          <div class="pricing-card-layout">
            <div class="pricing-card-main">
              <!-- Billing toggle -->
              <div class="pricing-billing-toggle">
                <button
                  type="button"
                  class="pricing-toggle-btn"
                  :class="{ 'is-active': billingCycle === 'monthly' }"
                  :aria-pressed="billingCycle === 'monthly' ? 'true' : 'false'"
                  @click="billingCycle = 'monthly'"
                >
                  Mensal
                </button>
                <button
                  type="button"
                  class="pricing-toggle-btn"
                  :class="{ 'is-active': billingCycle === 'annual' }"
                  :aria-pressed="billingCycle === 'annual' ? 'true' : 'false'"
                  @click="billingCycle = 'annual'"
                >
                  Anual
                  <span class="pricing-save-badge">–20%</span>
                </button>
              </div>

              <!-- Price display -->
              <div class="pricing-amount pricing-amount--diagnostic" aria-live="polite">
                <Transition name="price-swap" mode="out-in">
                  <div :key="billingCycle" class="pricing-price-row">
                    <span class="pricing-currency">R$</span>
                    <span class="pricing-value">{{ billingCycle === 'monthly' ? PRICE_MONTHLY : PRICE_ANNUAL_MO }}</span>
                    <span class="pricing-period">/mês</span>
                  </div>
                </Transition>
                <Transition name="price-swap" mode="out-in">
                  <div :key="billingCycle + '_sub'" class="pricing-billing-info">
                    <span v-if="billingCycle === 'monthly'" class="pricing-phase-badge">
                      Preço de lançamento
                    </span>
                    <span v-else class="pricing-annual-detail">
                      R$ {{ PRICE_ANNUAL_YR.toLocaleString('pt-BR') }}/ano · economize R$ {{ (PRICE_MONTHLY * 12 - PRICE_ANNUAL_YR).toLocaleString('pt-BR') }}
                    </span>
                  </div>
                </Transition>
              </div>

              <div class="pricing-signal-list" role="list" aria-label="Condicoes de entrada">
                <Badge
                  v-for="signal in activationSignals"
                  :key="signal"
                  variant="outline"
                  role="listitem"
                  class="pricing-signal-tag"
                >{{ signal }}</Badge>
              </div>

              <a href="/cadastro" class="pricing-cta group">
                <span>Começar: ver receita hoje</span>
                <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <p class="pricing-scarcity-note">Preço de lançamento. Pode subir a qualquer momento.</p>
            </div>

            <div class="pricing-card-details">
              <div class="pricing-features-block">
                <span class="pricing-features-label">O que entra na ativação</span>
                <ul class="pricing-features">
                  <li v-for="feat in activationFeatures" :key="feat.label" class="pricing-feature">
                    <span class="pricing-feature-icon" :style="{ background: feat.bg, color: feat.color, borderColor: feat.color }" v-html="feat.svg"></span>
                    <span>{{ feat.label }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonial -->
    <section class="lp-section lp-section--alt">
      <!-- Brand grafismo — testimonial decorations -->
      <div class="grafismo-testimonial" aria-hidden="true">
        <svg class="grafismo-star grafismo-star--testimonial-1" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#010543" fill-opacity="0.07" />
        </svg>
        <svg class="grafismo-star grafismo-star--testimonial-2" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#3BB56D" fill-opacity="0.13" />
        </svg>
        <svg class="grafismo-dots grafismo-dots--testimonial" viewBox="0 0 130 130" fill="none">
          <g fill="#010543" fill-opacity="0.12">
            <circle cx="5" cy="5" r="3"/><circle cx="35" cy="5" r="3"/><circle cx="65" cy="5" r="3"/><circle cx="95" cy="5" r="3"/><circle cx="125" cy="5" r="3"/>
            <circle cx="5" cy="35" r="3"/><circle cx="35" cy="35" r="3"/><circle cx="65" cy="35" r="3"/><circle cx="95" cy="35" r="3"/><circle cx="125" cy="35" r="3"/>
            <circle cx="5" cy="65" r="3"/><circle cx="35" cy="65" r="3"/><circle cx="65" cy="65" r="3"/><circle cx="95" cy="65" r="3"/><circle cx="125" cy="65" r="3"/>
            <circle cx="5" cy="95" r="3"/><circle cx="35" cy="95" r="3"/><circle cx="65" cy="95" r="3"/><circle cx="95" cy="95" r="3"/><circle cx="125" cy="95" r="3"/>
            <circle cx="5" cy="125" r="3"/><circle cx="35" cy="125" r="3"/><circle cx="65" cy="125" r="3"/><circle cx="95" cy="125" r="3"/><circle cx="125" cy="125" r="3"/>
          </g>
        </svg>
      </div>
      <div class="lp-container flex justify-center">
        <div class="testimonial-card">
          <svg class="testimonial-quote-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M6 18h6l-4 8H4l4-8H6a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H6Zm16 0h6l-4 8h-4l4-8h-2a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-4Z" fill="#3BB56D" fill-opacity="0.12" />
          </svg>
          <p class="testimonial-quote">
            &ldquo;Antes do Adsmagic eu perdia cerca de 2h por semana cruzando planilhas
            e ainda ficava no escuro sobre a origem das vendas. Hoje deixo o dashboard aberto
            o dia inteiro: em segundos sei qual canal trouxe cada pedido e realoco o orçamento
            na hora certa. Ganhei confiança nos números, parei de desperdiçar verba e consigo
            crescer novos canais com segurança.&rdquo;
          </p>
          <div class="testimonial-author">
            <img class="testimonial-avatar" src="https://framerusercontent.com/images/Ka0pcKlmIVsF7XAkTw9rqdRhEag.png" alt="Gabriel Queiroz" loading="lazy" />
            <div>
              <p class="testimonial-name">Gabriel Queiroz</p>
              <p class="testimonial-role">Fundador da Melhor Limpeza</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="lp-section">
      <!-- Brand grafismo — FAQ decorations -->
      <div class="grafismo-faq" aria-hidden="true">
        <svg class="grafismo-bars grafismo-bars--faq-left" viewBox="0 0 160 280" fill="none">
          <rect x="30" y="0" width="22" height="150" rx="11" transform="rotate(35 30 0)" fill="url(#faqBar1)" fill-opacity="0.1" />
          <rect x="70" y="30" width="16" height="120" rx="8" transform="rotate(35 70 30)" fill="url(#faqBar2)" fill-opacity="0.07" />
          <defs>
            <linearGradient id="faqBar1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#010543" /><stop offset="1" stop-color="#3BB56D" /></linearGradient>
            <linearGradient id="faqBar2" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3BB56D" /><stop offset="1" stop-color="#010543" /></linearGradient>
          </defs>
        </svg>
        <svg class="grafismo-star grafismo-star--faq-1" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#010543" fill-opacity="0.07" />
        </svg>
        <svg class="grafismo-star grafismo-star--faq-2" :viewBox="starVB" fill="none">
          <path :d="starPath" fill="#3BB56D" fill-opacity="0.14" />
        </svg>
      </div>
      <div class="lp-container">
        <div class="text-center mb-10">
          <p class="section-eyebrow">FAQ</p>
          <h2 class="section-heading">Perguntas frequentes</h2>
          <p class="section-subtitle">Tudo o que você precisa saber antes de começar.</p>
        </div>
        <div class="mx-auto max-w-2xl">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="faq-item"
            :class="{ 'faq-item--open': openFaq === index }"
          >
            <button
              type="button"
              class="faq-trigger"
              :id="'faq-btn-' + index"
              :aria-expanded="openFaq === index"
              :aria-controls="'faq-panel-' + index"
              @click="toggleFaq(index)"
            >
              <span>{{ faq.question }}</span>
              <ChevronDown class="faq-chevron h-5 w-5 shrink-0" />
            </button>
            <div :id="'faq-panel-' + index" class="faq-answer" role="region" :aria-labelledby="'faq-btn-' + index">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="lp-footer">
      <div class="lp-container flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <img src="/logo-wordmark.svg" alt="Adsmagic" class="h-6 opacity-70" />
        <span class="text-sm text-[#637083]">© {{ new Date().getFullYear() }} Adsmagic. Todos os direitos reservados.</span>
      </div>
    </footer>

    <canvas ref="arrowCanvasRef" class="arrow-canvas" aria-hidden="true"></canvas>
  </div>
</template>

<style scoped>
/* ═══════════════════ FONTS ═══════════════════ */
@import url('https://api.fontshare.com/v2/css?f[]=neue-montreal@300,400,500,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap');

/* ═══════════════════ FOUNDATIONS ═══════════════════ */

.lp-root {
  min-height: 100vh;
  background-color: #ffffff;
  color: #010543;
  font-family: 'Neue Montreal', 'DM Sans', system-ui, -apple-system, sans-serif;
}

.lp-container {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 1120px;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

@media (min-width: 640px) {
  .lp-container {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

/* ═══════════════════ SCROLL REVEAL ═══════════════════ */

.lp-hero,
.lp-section,
.lp-cta-band,
.flow-section {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.lp-hero.in-view,
.lp-section.in-view,
.lp-cta-band.in-view,
.flow-section.in-view {
  opacity: 1;
  transform: translateY(0);
}

/* ── Staggered children ── */
.reveal-child {
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-child.child-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ═══════════════════ SMOOTH SCROLL ═══════════════════ */
.lp-root {
  scroll-behavior: smooth;
}

/* ═══════════════════ NAV ═══════════════════ */

.lp-nav-wrap {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  justify-content: center;
  padding: 0.75rem 1rem 0;
  pointer-events: none;
}

.lp-nav-glass-bar {
  border-radius: 1rem;
  pointer-events: auto;
  max-width: 56rem;
  width: 100%;
  background: rgba(8, 18, 88, 0.22);
}

/* Override liquid-glass container for thin-glass nav (specificity bump) */
.lp-nav-glass-bar.lp-nav-glass-bar {
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 6px 6px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(0, 0, 0, 0.08);
  transition: all 0.7s cubic-bezier(0.175, 0.885, 0.32, 2.2);
}

/* Make glass content wrapper fill full bar width */
.lp-nav-glass-bar :deep(.liquid-glass__content) {
  width: 100%;
}

/* Restore glass layers — closer to original reference with soft SVG filter */
.lp-nav-glass-bar :deep(.liquid-glass__overlay) {
  background: rgba(180, 200, 255, 0.08);
}
.lp-nav-glass-bar :deep(.liquid-glass__backdrop) {
  backdrop-filter: blur(6px) saturate(1.2);
  filter: url(#glass-distortion-soft);
}
.lp-nav-glass-bar :deep(.liquid-glass__specular) {
  box-shadow:
    inset 2px 2px 1px 0 rgba(255, 255, 255, 0.30),
    inset -1px -1px 1px 1px rgba(255, 255, 255, 0.20);
}

/* ── Scrolled state — Apple-style material: high blur + brightness reduction + opaque tint ── */
.lp-nav-glass-bar.nav-scrolled {
  background: rgba(6, 14, 72, 0.82);
}
.lp-nav-glass-bar.nav-scrolled :deep(.liquid-glass__overlay) {
  background: rgba(120, 140, 255, 0.04);
}
.lp-nav-glass-bar.nav-scrolled :deep(.liquid-glass__backdrop) {
  backdrop-filter: blur(20px) saturate(1.8) brightness(0.7);
}

.lp-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.75rem;
  gap: 2rem;
  width: 100%;
}

.nav-right-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  justify-content: flex-end;
}

.nav-links-inline {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-separator {
  width: 1px;
  height: 1rem;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-anchor {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.68);
  transition: color 0.2s ease;
}

.nav-anchor:hover {
  color: #ffffff;
}

/* ── Pill buttons inside glass bar ── */

.nav-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 1rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.625rem;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-decoration: none;
}

.nav-pill:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.nav-pill--cta {
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, rgba(59, 181, 109, 0.50), rgba(59, 181, 109, 0.30));
  border-color: rgba(59, 181, 109, 0.3);
}

.nav-pill--cta:hover {
  background: linear-gradient(135deg, rgba(59, 181, 109, 0.65), rgba(59, 181, 109, 0.45));
  border-color: rgba(59, 181, 109, 0.45);
}

@media (max-width: 479px) {
  .lp-nav-wrap { padding: 0.5rem 0.5rem 0; }
  .lp-nav-inner { padding: 0.5rem 0.75rem; }
  .lp-nav-inner img { height: 1.5rem; }
  .nav-links-inline { display: none; }
  .nav-pill:not(.nav-pill--cta) { display: none; }
  .nav-pill--cta { padding: 0.3125rem 0.75rem; font-size: 0.75rem; }
}

/* ═══════════════════ HERO ═══════════════════ */

.lp-hero {
  position: relative;
  padding: 5rem 0 4rem;
  overflow: hidden;
}

.lp-hero--dark {
  position: relative;
  z-index: 2;
  background-color: #010543;
  /* background-image set via inline :style binding to respect BASE_URL */
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  padding: 8.5rem 0 4.5rem;
  margin-top: -4rem;
  isolation: isolate;
}

.hero-section-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 240px;
  background: linear-gradient(to bottom, transparent, #010543);
  pointer-events: none;
  z-index: 1;
}

/* Bridge between hero and flow-section — removes the hard-cut */
.section-bridge {
  background: linear-gradient(to bottom, #010543 0%, #010d2e 100%);
  height: 120px;
  margin-top: 0;
  position: relative;
  z-index: 0;
}

#como-funciona,
#cadastro {
  scroll-margin-top: 6.5rem;
}

.hero-shell {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3.5rem;
}

@media (min-width: 640px) {
  .lp-hero {
    padding: 6rem 0 5rem;
  }
  .lp-hero--dark {
    padding: 8rem 0 4.5rem;
  }
}

/* ── Subtle grain overlay ── */
.hero-grain {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0.018;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}

.hero-content {
  max-width: 760px;
}

.arrow-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.hero-content--centered {
  width: min(100%, 820px);
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  align-items: center;
}

/* ── Chip eyebrow ── */
.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #3bb56d;
  border: 1px solid rgba(59, 181, 109, 0.25);
  border-radius: 999px;
  background: rgba(59, 181, 109, 0.08);
  backdrop-filter: blur(8px);
}

.hero-eyebrow {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #3bb56d;
}

.hero-title {
  margin-top: 0;
  font-family: 'Neue Montreal', sans-serif;
  font-size: clamp(1.75rem, 3.8vw, 2.875rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: #010543;
}

.hero-title--white {
  color: #ffffff;
}

.hero-accent {
  color: #3bb56d;
  font-style: normal;
  display: block;
  margin-top: 0.1em;
}

@media (min-width: 640px) {
  .hero-title {
    font-size: clamp(2rem, 3.8vw, 2.875rem);
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 2.875rem;
    line-height: 1.08;
  }
}

.hero-subtitle {
  margin-top: 0;
  font-family: 'DM Sans', sans-serif;
  font-size: 1.25rem;
  line-height: 1.55;
  color: #637083;
  max-width: 38rem;
  letter-spacing: -0.01em;
}

.hero-subtitle--light {
  color: rgba(228, 231, 236, 0.78);
  max-width: 38rem;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  margin-top: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.hero-actions--centered {
  justify-content: center;
  padding-top: 2rem;
}

/* ── Ghost secondary CTA ── */
.hero-cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 1.25rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-cta-ghost:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.06);
}

/* ── Sub-CTA trust line ── */
.hero-trust-line {
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 40rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  line-height: 1.45;
  color: rgba(228, 231, 236, 0.55);
  letter-spacing: 0.01em;
}

.hero-trust-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3bb56d;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(59, 181, 109, 0.5);
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #3bb56d;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: none;
  position: relative;
}

.hero-cta--glow {
  min-height: 48px;
  box-shadow:
    0 0 0 0 rgba(59, 181, 109, 0),
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 0 20px rgba(59, 181, 109, 0.15);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-cta::before {
  display: none;
}

.hero-cta:hover {
  background-color: #33a060;
  transform: translateY(-2px);
  box-shadow:
    0 0 0 0 rgba(59, 181, 109, 0),
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 32px rgba(59, 181, 109, 0.3);
}

.hero-cta:hover::before {
  display: none;
}

/* ── Dashboard mockup ── */
.hero-dashboard {
  margin-top: 2rem;
  position: relative;
  width: min(100%, 1044px);
  will-change: transform;
  transform-origin: center top;
  transform: perspective(1200px) translateY(-80px) scale(0.82) rotateX(26deg);
  transition: opacity 0.4s ease;
}

.hero-dashboard-frame {
  position: relative;
  max-width: none;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    0 718px 201px 0 rgba(0, 0, 0, 0),
    0 460px 184px 0 rgba(0, 0, 0, 0.01),
    0 259px 155px 0 rgba(0, 0, 0, 0.05),
    0 115px 115px 0 rgba(0, 0, 0, 0.09),
    0 29px 63px 0 rgba(0, 0, 0, 0.1);
  background: #ffffff;
}

.hero-dashboard-frame--figma {
  width: 100%;
}

.hero-dashboard-img {
  width: 100%;
  height: auto;
  display: block;
}

.hero-dashboard-img + .hero-dashboard-placeholder {
  display: none;
}

.hero-dashboard-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 24rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* ── Social Proof (inside hero dark) ── */
.hero-social-proof {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.875rem;
  padding: 0;
  background: none;
}

.hero-social-proof::before {
  display: none;
}

.hero-social-label {
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  text-transform: none;
  letter-spacing: 0.01em;
}

.hero-mechanism-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.875rem;
}

.hero-mechanism-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.625rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.3;
  backdrop-filter: blur(10px);
}

.hero-social-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.hero-social-logo {
  display: block;
  width: 100%;
  height: auto;
  opacity: 0.88;
  filter: brightness(0) invert(1);
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.hero-social-logo:hover {
  opacity: 1;
  filter: brightness(0) invert(1) drop-shadow(0 0 16px rgba(255, 255, 255, 0.18));
}

.hero-social-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.hero-social-logo-wrap--wide {
  width: min(19.5rem, 28vw);
}

.hero-social-logo-wrap--google {
  width: min(19.5625rem, 28vw);
  min-height: 6.5625rem;
  padding: 0.625rem;
}

.hero-social-logo--image {
  object-fit: contain;
}

.hero-social-logo--google {
  width: 100%;
  max-width: 15.6875rem;
}

.hero-social-divider {
  width: 1px;
  height: 4.5rem;
  background: rgba(255, 255, 255, 0.25);
}

.hero-social-divider--tall {
  align-self: center;
}

@media (max-width: 1023px) {
  .lp-hero--dark {
    padding: 7.25rem 0 4rem;
    background-position: 62% center;
  }

  .nav-links-inline {
    display: none;
  }

  .hero-shell {
    gap: 3.5rem;
  }

  .hero-social-logos--figma {
    gap: 1rem;
  }

  .hero-mechanism-list {
    gap: 0.75rem;
  }

  .hero-social-logo-wrap--wide,
  .hero-social-logo-wrap--google {
    width: min(15rem, 42vw);
  }
}

@media (max-width: 767px) {
  .lp-hero--dark {
    padding: 6rem 0 3.5rem;
    background-position: 60% center;
  }

  .hero-shell {
    gap: 2.5rem;
  }

  .hero-title {
    font-size: 2.5rem;
    line-height: 1.1;
  }

  .hero-copy {
    gap: 1.25rem;
  }

  .hero-subtitle {
    font-size: 1.0625rem;
    line-height: 1.6;
  }

  .hero-actions--centered {
    padding-top: 1.25rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .hero-cta,
  .hero-cta-ghost {
    width: min(100%, 22rem);
    justify-content: center;
  }

  .hero-trust-line {
    font-size: 0.8125rem;
    line-height: 1.45;
  }

  .hero-dashboard-frame {
    border-radius: 8px;
  }

  .hero-social-proof {
    gap: 1.5rem;
  }

  .hero-mechanism-list {
    flex-direction: column;
    align-items: stretch;
    width: min(100%, 24rem);
  }

  .hero-mechanism-pill {
    width: 100%;
  }

  .hero-social-logo-wrap--wide,
  .hero-social-logo-wrap--google {
    width: min(18rem, 72vw);
  }

  .hero-social-divider {
    width: min(12rem, 30vw);
    height: 1px;
  }

  .cta-band-btn {
    width: min(100%, 22rem);
    justify-content: center;
  }

  .pricing-card {
    max-width: 100%;
    padding: 2rem 1.25rem;
    border-radius: 1.25rem;
  }

  .pricing-billing-toggle {
    display: flex;
    width: 100%;
  }

  .pricing-toggle-btn {
    flex: 1 1 0;
    justify-content: center;
    padding-left: 0.875rem;
    padding-right: 0.875rem;
  }

  .pricing-value {
    font-size: 3rem;
  }

  .pricing-feature {
    align-items: flex-start;
  }

  .pricing-feature-icon {
    margin-top: 0.125rem;
  }
}

@media (max-width: 479px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-social-logos--figma {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.75rem;
  }
  .hero-social-logo-wrap--wide,
  .hero-social-logo-wrap--google {
    width: auto;
  }
  .hero-social-logo--image {
    max-height: 1.75rem;
    width: auto;
  }
  .hero-social-logo--google {
    max-height: 2rem;
  }
  .hero-social-divider {
    width: 1px;
    height: 1.5rem;
    flex-shrink: 0;
  }

  .pricing-card {
    padding: 1.625rem 1rem;
  }

  .pricing-signal-list {
    gap: 0.375rem;
    margin-bottom: 1rem;
  }

  .pricing-signal-tag {
    width: 100%;
    font-size: 0.72rem;
  }

  .pricing-value {
    font-size: 2.6rem;
  }

  .pricing-outcomes {
    padding: 0.875rem;
  }

  .pricing-outcomes-list {
    gap: 0.45rem;
    font-size: 0.8125rem;
  }

  .pricing-feature {
    font-size: 0.875rem;
  }

  .cta-band-btn,
  .pricing-cta {
    width: 100%;
  }
}

/* ═══════════════════ SECTIONS ═══════════════════ */

.lp-section {
  position: relative;
  padding: 5rem 0;
}

@media (min-width: 640px) {
  .lp-section {
    padding: 6rem 0;
  }
}

.lp-section--alt {
  background-color: #fafafa;
}

.section-heading {
  font-size: 1.75rem;
  font-weight: 700;
  color: #010543;
  line-height: 1.2;
}

@media (min-width: 640px) {
  .section-heading {
    font-size: 2.25rem;
  }
}

.section-subtitle {
  margin-top: 1rem;
  font-size: 1.0625rem;
  color: #637083;
  line-height: 1.7;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.roi-anchor-line {
  margin-top: 0.75rem;
  font-size: 0.9375rem;
  color: #3BB56D;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.section-eyebrow {
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #3bb56d;
  margin-bottom: 0.5rem;
}

/* ═══════════════════ WEBGL FLOW SECTION (Stripe-Inspired) ═══════════════════ */

.flow-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #010d2e 0%, #020833 60%, #0a1628 100%);
  padding: 7rem 0 5rem;
}

.flow-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, #010d2e, transparent);
  pointer-events: none;
  z-index: 2;
}

/* ── Canvas ── */
.flow-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.flow-section:hover .flow-canvas {
  pointer-events: auto;
}

/* ── Radial glows ── */
.flow-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.flow-glow--left {
  width: 500px;
  height: 500px;
  top: -10%;
  left: -8%;
  background: radial-gradient(ellipse, rgba(59, 181, 109, 0.12) 0%, transparent 70%);
  filter: blur(40px);
}

.flow-glow--right {
  width: 400px;
  height: 400px;
  bottom: -5%;
  right: -5%;
  background: radial-gradient(ellipse, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  filter: blur(40px);
}

.flow-glow--center {
  width: 600px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse, rgba(255, 207, 94, 0.04) 0%, transparent 70%);
  filter: blur(30px);
}

/* ═══════════════════ FLOW GRAFISMOS ═══════════════════ */

.grafismo-flow {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

/* ── Diagonal bars ── */
.grafismo-flow-bars {
  position: absolute;
}

.grafismo-flow-bars--tl {
  width: 320px;
  height: 600px;
  top: -40px;
  left: -20px;
  animation: grafismoFloat 18s ease-in-out infinite;
}

.grafismo-flow-bars--br {
  width: 300px;
  height: 560px;
  bottom: -60px;
  right: -10px;
  animation: grafismoFloat 22s ease-in-out infinite reverse;
}

.grafismo-flow-bars--cl {
  width: 80px;
  height: 200px;
  top: 45%;
  left: 3%;
  animation: grafismoFloat 15s ease-in-out infinite 3s;
}

@keyframes grafismoFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(0.5deg); }
  50% { transform: translateY(4px) rotate(-0.3deg); }
  75% { transform: translateY(-4px) rotate(0.2deg); }
}

/* ── Stars ── */
.grafismo-flow-star {
  position: absolute;
}

.grafismo-flow-star--1 {
  width: 130px;
  height: 124px;
  top: 5%;
  right: 5%;
  animation: starTwinkle 6s ease-in-out infinite;
}

.grafismo-flow-star--2 {
  width: 80px;
  height: 76px;
  bottom: 12%;
  left: 6%;
  animation: starTwinkle 8s ease-in-out infinite 2s;
}

.grafismo-flow-star--3 {
  width: 50px;
  height: 48px;
  top: 50%;
  right: 10%;
  animation: starTwinkle 7s ease-in-out infinite 4s;
}

.grafismo-flow-star--4 {
  width: 36px;
  height: 34px;
  top: 22%;
  left: 16%;
  animation: starTwinkle 5s ease-in-out infinite 1s;
}

@keyframes starTwinkle {
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  30% { opacity: 0.5; transform: scale(0.85) rotate(8deg); }
  60% { opacity: 0.8; transform: scale(1.1) rotate(-4deg); }
}

/* ── Micro dots ── */
.grafismo-flow-dot {
  position: absolute;
  border-radius: 50%;
  animation: dotDrift 12s ease-in-out infinite;
}

.grafismo-flow-dot--1 {
  width: 5px; height: 5px;
  background: rgba(59, 181, 109, 0.5);
  box-shadow: 0 0 8px rgba(59, 181, 109, 0.3);
  top: 12%; left: 25%;
  animation-delay: 0s;
}

.grafismo-flow-dot--2 {
  width: 4px; height: 4px;
  background: rgba(99, 102, 241, 0.45);
  box-shadow: 0 0 6px rgba(99, 102, 241, 0.25);
  top: 30%; right: 20%;
  animation-delay: 2s;
}

.grafismo-flow-dot--3 {
  width: 6px; height: 6px;
  background: rgba(59, 181, 109, 0.4);
  box-shadow: 0 0 10px rgba(59, 181, 109, 0.2);
  bottom: 25%; left: 35%;
  animation-delay: 4s;
}

.grafismo-flow-dot--4 {
  width: 4px; height: 4px;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.1);
  top: 65%; right: 30%;
  animation-delay: 1s;
}

.grafismo-flow-dot--5 {
  width: 5px; height: 5px;
  background: rgba(99, 102, 241, 0.35);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.15);
  bottom: 10%; right: 15%;
  animation-delay: 5s;
}

.grafismo-flow-dot--6 {
  width: 4px; height: 4px;
  background: rgba(59, 181, 109, 0.35);
  box-shadow: 0 0 6px rgba(59, 181, 109, 0.15);
  top: 18%; right: 40%;
  animation-delay: 3s;
}

@keyframes dotDrift {
  0%, 100% { transform: translate(0, 0); opacity: 0.6; }
  25% { transform: translate(6px, -10px); opacity: 1; }
  50% { transform: translate(-4px, 5px); opacity: 0.4; }
  75% { transform: translate(8px, 3px); opacity: 0.8; }
}

/* ── Glow spots aligned with bars ── */
.grafismo-flow-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(50px);
}

.grafismo-flow-glow--tl {
  width: 300px;
  height: 300px;
  top: -5%;
  left: -3%;
  background: radial-gradient(ellipse, rgba(30, 58, 138, 0.12) 0%, transparent 70%);
  animation: glowPulse 10s ease-in-out infinite;
}

.grafismo-flow-glow--br {
  width: 350px;
  height: 350px;
  bottom: -8%;
  right: -4%;
  background: radial-gradient(ellipse, rgba(59, 181, 109, 0.1) 0%, transparent 70%);
  animation: glowPulse 12s ease-in-out infinite 3s;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* ── Responsive: hide smaller grafismos on mobile ── */
@media (max-width: 767px) {
  .grafismo-flow-bars--cl,
  .grafismo-flow-star--3,
  .grafismo-flow-star--4,
  .grafismo-flow-dot--4,
  .grafismo-flow-dot--5,
  .grafismo-flow-dot--6 {
    display: none;
  }
  .grafismo-flow-bars--tl { width: 180px; }
  .grafismo-flow-bars--br { width: 160px; }
  .grafismo-flow-star--1 { width: 70px; height: 66px; }
}

/* ── Headings ── */
.flow-eyebrow {
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #3bb56d;
  margin-bottom: 1rem;
}

.flow-heading {
  font-size: 2.5rem;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

@media (min-width: 640px) {
  .flow-heading { font-size: 2.75rem; }
}

.flow-subheading {
  margin-top: 1.25rem;
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 300;
}

/* ═══════════════════ BENTO GRID ═══════════════════ */

.flow-bento {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 3.5rem;
}

@media (min-width: 768px) {
  .flow-bento {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .flow-bento {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
}

/* ── Bento Card ── */
.bento-card {
  --glass-shadow: rgba(99, 102, 241, 0.16);
  position: relative;
  border-radius: 20px;
  background: transparent;
  border: none;
  isolation: isolate;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(1, 5, 67, 0.18);
  transition:
    transform 0.5s cubic-bezier(0.25, 1, 0.5, 1),
    border-color 0.35s ease,
    box-shadow 0.45s ease,
    background-color 0.35s ease;
}

.bento-card-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  -webkit-backdrop-filter: url(#liquid-glass-bento-filter);
  backdrop-filter: url(#liquid-glass-bento-filter);
  pointer-events: none;
}

.bento-card-shell {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bento-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.018) 0%,
    rgba(255, 255, 255, 0.008) 30%,
    transparent 100%
  );
  pointer-events: none;
}

.bento-card::after {
  content: '';
  position: absolute;
  inset: -1px;
  z-index: 3;
  border-radius: 21px;
  padding: 1.5px;
  background: conic-gradient(
    from var(--angle, 0deg),
    transparent 0%,
    rgba(255, 255, 255, 0.04) 10%,
    rgba(59, 181, 109, 0.45) 20%,
    rgba(255, 255, 255, 0.55) 30%,
    rgba(59, 181, 109, 0.30) 40%,
    transparent 50%,
    transparent 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.bento-card:hover {
  transform: translateY(-8px);
  background: rgba(7, 18, 58, 0.24);
  box-shadow:
    0 26px 54px rgba(0, 0, 0, 0.30),
    0 0 32px var(--glass-shadow);
}

.bento-card:hover::after {
  opacity: 1;
  animation: glass-border-spin 6s linear infinite;
}

.bento-card-inner {
  position: relative;
  z-index: 4;
  padding: 1.5rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.bento-card--origins {
  --glass-accent: rgba(59, 181, 109, 0.46);
  --glass-accent-soft: rgba(59, 181, 109, 0.22);
  --glass-shadow: rgba(59, 181, 109, 0.18);
}

.bento-card--whatsapp {
  --glass-accent: rgba(37, 211, 102, 0.5);
  --glass-accent-soft: rgba(37, 211, 102, 0.22);
  --glass-shadow: rgba(37, 211, 102, 0.18);
}

.bento-card--dashboard {
  --glass-accent: rgba(129, 140, 248, 0.48);
  --glass-accent-soft: rgba(129, 140, 248, 0.2);
  --glass-shadow: rgba(99, 102, 241, 0.18);
}

.bento-card--optimize {
  --glass-accent: rgba(255, 207, 94, 0.52);
  --glass-accent-soft: rgba(255, 207, 94, 0.2);
  --glass-shadow: rgba(255, 207, 94, 0.16);
}

/* ── Card Glow ── */
.bento-card-glow {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  bottom: -60px;
  right: -60px;
  filter: blur(60px);
  opacity: 0;
  transition: opacity 0.5s;
  z-index: 0;
}

.bento-card:hover .bento-card-glow { opacity: 1; }

.bento-card-glow--green { background: rgba(59, 181, 109, 0.2); }
.bento-card-glow--emerald { background: rgba(34, 197, 94, 0.2); }
.bento-card-glow--indigo { background: rgba(99, 102, 241, 0.2); }
.bento-card-glow--gold { background: rgba(255, 207, 94, 0.15); }

/* ── Step Badge ── */
.bento-step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(59, 181, 109, 0.12);
  color: #3bb56d;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.bento-title {
  margin-top: 0.5rem;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}

.bento-desc {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.65);
  flex-shrink: 0;
  margin-bottom: 0.75rem;
}

/* ═══════════════════ V2 MOCKUPS ═══════════════════ */

/* ── Origins V2 (Step 1) ── */
.origins-visual-v2 {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  justify-content: center;
  align-items: center;
  align-content: center;
  padding: 0.5rem 0;
  flex: 1;
  min-height: 0;
}

.origin-orb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.origin-orb:hover {
  transform: scale(1.18) translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(59, 181, 109, 0.3);
  box-shadow: 0 8px 24px rgba(59, 181, 109, 0.15);
}

/* ── WhatsApp V2 (Step 2) ── */
.wa-mockup-v2 {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.wa-mock-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(37, 211, 102, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.6875rem;
  font-weight: 600;
  color: #25D366;
}

.wa-mock-body {
  padding: 0.5rem 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.wa-msg {
  max-width: 88%;
  padding: 0.375rem 0.625rem;
  border-radius: 10px;
  font-size: 0.625rem;
  line-height: 1.45;
}

.wa-msg--in {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  align-self: flex-start;
  border-bottom-left-radius: 2px;
}

.wa-msg--out {
  background: rgba(37, 211, 102, 0.12);
  color: rgba(255, 255, 255, 0.75);
  align-self: flex-end;
  border-bottom-right-radius: 2px;
}

.wa-msg--sale {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(59, 181, 109, 0.2);
  color: #3bb56d;
  font-weight: 600;
  border: 1px solid rgba(59, 181, 109, 0.3);
  animation: salePulse 2s ease-in-out infinite;
}

@keyframes salePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 181, 109, 0.2); }
  50% { box-shadow: 0 0 16px 4px rgba(59, 181, 109, 0.12); }
}

/* ── Dashboard V2 (Step 3) ── */
.dash-mockup-v2 {
  flex: 0 0 auto;
  margin-top: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.dash-mock-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: rgba(99, 102, 241, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.dash-mock-body {
  padding: 0.75rem;
}

.dash-mock-metrics {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.dash-mock-metric {
  flex: 1;
  text-align: center;
  padding: 0.5rem 0.25rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.dash-mock-val {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.dash-mock-val--accent { color: #3bb56d; }
.dash-mock-val--gold { color: #ffcf5e; }

.dash-mock-lbl {
  display: block;
  font-size: 0.5625rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.125rem;
}

.dash-mock-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 56px;
  padding: 0.375rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.dash-mock-bar {
  flex: 1;
  height: 0;
  background: linear-gradient(180deg, #3bb56d 0%, rgba(59, 181, 109, 0.4) 100%);
  border-radius: 3px 3px 0 0;
  transition: height 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.flow-section.in-view .dash-mock-bar {
  height: var(--h, 50%);
}

.dash-mock-bar:nth-child(1) { transition-delay: 0.6s; }
.dash-mock-bar:nth-child(2) { transition-delay: 0.7s; }
.dash-mock-bar:nth-child(3) { transition-delay: 0.8s; }
.dash-mock-bar:nth-child(4) { transition-delay: 0.9s; }
.dash-mock-bar:nth-child(5) { transition-delay: 1.0s; }
.dash-mock-bar:nth-child(6) { transition-delay: 1.1s; }
.dash-mock-bar:nth-child(7) { transition-delay: 1.2s; }
.dash-mock-bar:nth-child(8) { transition-delay: 1.3s; }

/* ── Optimize V2 (Step 4) ── */
.optimize-visual-v2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  flex: 1;
  min-height: 0;
}

.optimize-logos {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.optimize-logo-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.75rem 0.625rem;
  width: calc(50% - 0.5rem);
  min-height: 7.75rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s;
}

.optimize-logo-ring span {
  font-size: 0.6875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.optimize-logo-ring:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.05);
}

@keyframes optimizeFlowPulse {
  0%, 100% { opacity: 0.72; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(1px); }
}

.optimize-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.optimize-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3bb56d;
  animation: statusPulse 1.5s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 181, 109, 0.5); }
  50% { box-shadow: 0 0 0 6px rgba(59, 181, 109, 0); }
}

/* ═══════════════════ STATS ROW ═══════════════════ */

.flow-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 4rem;
  padding: 2rem;
  border-radius: 20px;
  flex-wrap: wrap;
  position: relative;
  isolation: isolate;
}

@media (min-width: 768px) {
  .flow-stats { gap: 3rem; flex-wrap: nowrap; }
}

/* Liquid glass layers */
.flow-stats-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  -webkit-backdrop-filter: url(#liquid-glass-stats-filter);
  backdrop-filter: url(#liquid-glass-stats-filter);
  pointer-events: none;
}

.flow-stats-shell {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.flow-stats-shell rect {
  fill: rgb(255 255 255 / var(--lp-stats-glass-light));
  fill-opacity: 1;
}

.flow-stats::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / calc(var(--lp-stats-glass-light) * 0.36)) 0%,
    rgb(255 255 255 / calc(var(--lp-stats-glass-light) * 0.16)) 30%,
    transparent 100%
  );
  pointer-events: none;
}

.flow-stats::after {
  content: '';
  position: absolute;
  inset: -1px;
  z-index: 3;
  border-radius: 17px;
  padding: 1.5px;
  background: conic-gradient(
    from var(--angle, 0deg),
    transparent 0%,
    rgb(255 255 255 / calc(var(--lp-stats-glass-light) * 0.8)) 10%,
    rgb(59 181 109 / calc(var(--lp-stats-glass-light) * 9)) 20%,
    rgb(255 255 255 / calc(var(--lp-stats-glass-light) * 11)) 30%,
    rgb(59 181 109 / calc(var(--lp-stats-glass-light) * 6)) 40%,
    transparent 50%,
    transparent 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  animation: glass-border-spin 6s linear infinite;
}

/* Content above glass layers */
.flow-stats > .flow-stat,
.flow-stats > .flow-stat-divider {
  position: relative;
  z-index: 4;
}

.flow-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.flow-stat-val {
  font-size: 2rem;
  font-weight: 300;
  color: #ffffff;
  letter-spacing: -0.04em;
  line-height: 1;
}

@media (min-width: 640px) {
  .flow-stat-val { font-size: 2.5rem; }
}

.flow-stat-lbl {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 400;
}

.flow-stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  display: none;
}

@media (min-width: 768px) {
  .flow-stat-divider { display: block; }
}

/* ═══════════════════ FEATURES CAROUSEL ═══════════════════ */

.features-eyebrow {
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3bb56d;
  margin-bottom: 0.75rem;
}

/* ─── Features Stack — Scroll Stacking Cards ─── */
.features-stack {
  --spotlight-size: 400px;
  --spread: 120;
  --border-size: 1px;
  --stack-gap: 28px;
  --stack-top: 5rem;
  margin-top: 3rem;
}

.feature-stack-card {
  --x: -999;
  --y: -999;
  --xp: 0.5;
  --base: 140;
  --radius: 24;
  --hue: calc(var(--base) + (var(--xp) * var(--spread, 120)));
  position: sticky;
  top: calc(var(--stack-top) + var(--i) * var(--stack-gap));
  z-index: calc(var(--i, 0) + 1);
  margin-bottom: 2rem;
  transform-origin: center top;
}

.feature-stack-card:last-child {
  margin-bottom: 0;
}

.feature-stack-card__inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  border-radius: calc(var(--radius) * 1px);
  background:
    radial-gradient(
      var(--spotlight-size) at calc(var(--x) * 1px) calc(var(--y) * 1px),
      hsl(var(--hue) 100% 70% / 0.06),
      transparent
    ),
    linear-gradient(160deg, #080e2e 0%, #050d2c 50%, #030824 100%);
  border: var(--border-size) solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.35),
    0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  will-change: transform, filter;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), filter 0.5s ease, box-shadow 0.35s ease;
}

@media (min-width: 768px) {
  .feature-stack-card__inner {
    grid-template-columns: 1.2fr 1fr;
    gap: 2.5rem;
    padding: 2.5rem;
  }
}

/* Border glow — mask-composite spotlight */
.feature-stack-card__inner::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: calc(var(--radius) * 1px);
  pointer-events: none;
  z-index: 4;
  background:
    radial-gradient(
      var(--spotlight-size) at calc(var(--x) * 1px) calc(var(--y) * 1px),
      hsl(var(--hue) 100% 70% / 0.45),
      transparent
    );
  mask:
    linear-gradient(#fff, #fff) content-box,
    linear-gradient(#fff, #fff);
  -webkit-mask:
    linear-gradient(#fff, #fff) content-box,
    linear-gradient(#fff, #fff);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  padding: var(--border-size);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-stack-card:hover .feature-stack-card__inner::before {
  opacity: 1;
}

.feature-stack-card:hover .feature-stack-card__inner {
  box-shadow:
    0 20px 56px hsl(var(--hue) 100% 50% / 0.10),
    0 8px 24px rgba(0, 0, 0, 0.25),
    0 0 0 1px hsl(var(--hue) 100% 70% / 0.12);
}

/* Outer blur glow */
.feature-stack-card__glow {
  position: absolute;
  inset: -20px;
  border-radius: calc(var(--radius) * 1px);
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(
      var(--spotlight-size) at calc(var(--x) * 1px) calc(var(--y) * 1px),
      hsl(var(--hue) 100% 60% / 0.12),
      transparent
    );
  filter: blur(24px);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-stack-card:hover .feature-stack-card__glow {
  opacity: 1;
}

/* Visual / screenshot side */
.feature-stack-card__visual {
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 220px;
  position: relative;
  z-index: 3;
}

.feature-stack-card__img {
  width: 100%;
  flex: 1 1 auto;
  object-fit: contain;
  object-position: center center;
  padding: clamp(0.375rem, 1vw, 0.75rem);
  border-radius: 0 0 12px 12px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.06), transparent 58%),
    rgba(5, 13, 44, 0.15);
  display: block;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.feature-stack-card:hover .feature-stack-card__img {
  transform: scale(1.02);
}

/* ── Feature card grafismos ── */
.feat-grafismo {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.feat-grafismo__star {
  position: absolute;
  bottom: -8%;
  right: -4%;
  width: 72px;
  height: 68px;
  color: rgba(59, 181, 109, 0.06);
  animation: grafismoFloat2 14s ease-in-out infinite;
}

.feat-grafismo__bars {
  position: absolute;
  top: -6%;
  left: -3%;
  width: 80px;
  height: 130px;
  color: rgba(99, 102, 241, 0.05);
  animation: grafismoFloat1 18s ease-in-out 2s infinite;
}

.feature-stack-card:hover .feat-grafismo__star {
  color: rgba(59, 181, 109, 0.10);
}

.feature-stack-card:hover .feat-grafismo__bars {
  color: rgba(99, 102, 241, 0.09);
}

/* Alternate position on even cards */
.feature-stack-card:nth-child(even) .feat-grafismo__star {
  right: auto;
  left: -4%;
  bottom: auto;
  top: -6%;
}

.feature-stack-card:nth-child(even) .feat-grafismo__bars {
  left: auto;
  right: -3%;
  top: auto;
  bottom: -8%;
}

/* Content side */
.feature-stack-card__content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 0.5rem;
}

@media (min-width: 768px) {
  .feature-stack-card__content {
    padding: 1rem 0;
  }
}

.feature-stack-card__step {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: hsl(var(--hue) 80% 65%);
  margin-bottom: 0.75rem;
}

.feature-stack-card__title {
  font-size: clamp(1.35rem, 2.8vw, 1.85rem);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 1rem;
}

.feature-stack-card__desc {
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.5);
  max-width: 38ch;
}

/* ─── Browser chrome bar ─── */
.feat-browser-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px 8px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.25);
}
.feat-browser-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.feat-browser-dot--red    { background: #FF5F57; }
.feat-browser-dot--yellow { background: #FEBC2E; }
.feat-browser-dot--green  { background: #28C840; }

/* ═══════════════════ CTA BAND ═══════════════════ */

.lp-cta-band {
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #010d2e 0%, #010543 35%, #020833 70%, #0a1628 100%);
  padding: 4rem 0;
}

@media (min-width: 640px) {
  .lp-cta-band {
    padding: 5rem 0;
  }
}

/* Ambient glow */
.band-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 700px;
  height: 500px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(59, 181, 109, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

/* ── Floating icons container ── */
.band-icons {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Google – left */
.floating-icon--1 {
  width: 56px;
  height: 56px;
  top: 30%;
  left: 6%;
  animation: float1 8s ease-in-out infinite;
}

/* Meta – bottom left */
.floating-icon--2 {
  width: 48px;
  height: 48px;
  bottom: 15%;
  left: 12%;
  animation: float2 9s ease-in-out 1s infinite;
}

/* WhatsApp – right */
.floating-icon--3 {
  width: 56px;
  height: 56px;
  top: 35%;
  right: 6%;
  animation: float3 7s ease-in-out 0.5s infinite;
}

/* Instagram – top center */
.floating-icon--4 {
  width: 44px;
  height: 44px;
  top: 10%;
  left: 25%;
  filter: blur(1px);
  opacity: 0.6;
  animation: float4 10s ease-in-out 2s infinite;
}

/* TikTok – top right */
.floating-icon--5 {
  width: 40px;
  height: 40px;
  top: 12%;
  right: 15%;
  filter: blur(1px);
  opacity: 0.5;
  animation: float1 11s ease-in-out 3s infinite;
}

@keyframes float1 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(3deg); }
}

@keyframes float2 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-10px) translateX(5px); }
  66% { transform: translateY(6px) translateX(-3px); }
}

@keyframes float3 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(-2deg); }
}

@keyframes float4 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.04); }
}

.cta-band-heading {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

@media (min-width: 640px) {
  .cta-band-heading {
    font-size: 2.25rem;
  }
}

.cta-band-relief {
  margin-top: 1.25rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #3BB56D;
  letter-spacing: -0.01em;
}

.cta-band-sub {
  margin-top: 0.75rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.cta-band-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #3bb56d;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(59, 181, 109, 0.25);
}

.cta-band-btn:hover {
  background-color: #33a060;
  transform: translateY(-1px);
}

.cta-band-section-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to bottom, transparent, #010543);
  pointer-events: none;
  z-index: 1;
}

.pricing-section-bridge {
  height: 60px;
  margin-top: 0;
  background: linear-gradient(to bottom, #010543 0%, #080d3a 100%);
  position: relative;
  z-index: 0;
}

/* ═══════════════════ PRICING ═══════════════════ */

/* Section with starfield */
.lp-section--pricing-stars {
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #080d3a 0%, #060b36 60%, #030c2e 100%);
  padding-top: 5rem;
  opacity: 1;
  transform: none;
  transition: none;
}

@media (min-width: 640px) {
  .lp-section--pricing-stars {
    padding-top: 6rem;
  }
}

.lp-section--pricing-stars::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, #080d3a, transparent);
  pointer-events: none;
  z-index: 1;
}

.lp-cta-band,
.lp-cta-band.in-view,
.lp-section--pricing-stars,
.lp-section--pricing-stars.in-view {
  opacity: 1;
  transform: none;
  transition: none;
}

.lp-section--pricing-stars .section-heading {
  color: #ffffff;
}

.lp-section--pricing-stars .section-subtitle {
  color: rgba(255, 255, 255, 0.65);
}

.pricing-stars-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.lp-section--pricing-stars .grafismo-pricing,
.lp-section--pricing-stars .lp-container {
  position: relative;
  z-index: 2;
}

/* ── Stats Card — SVG/CSS Liquid Glass (same 4-layer technique as bento cards) ── */
.stats-card {
  margin-top: 4rem;
  border-radius: 20px;
  position: relative;
  background: transparent;
  border: none;
  isolation: isolate;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(1, 5, 67, 0.18);
}

.stats-card-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  -webkit-backdrop-filter: url(#liquid-glass-stats-filter);
  backdrop-filter: url(#liquid-glass-stats-filter);
  pointer-events: none;
}

.stats-card-shell {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.stats-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.018) 0%,
    rgba(255, 255, 255, 0.008) 30%,
    transparent 100%
  );
  pointer-events: none;
}

.stats-card::after {
  content: '';
  position: absolute;
  inset: -1px;
  z-index: 3;
  border-radius: 21px;
  padding: 1.5px;
  background: conic-gradient(
    from var(--angle, 0deg),
    transparent 0%,
    rgba(255, 255, 255, 0.04) 10%,
    rgba(59, 181, 109, 0.45) 20%,
    rgba(255, 255, 255, 0.55) 30%,
    rgba(59, 181, 109, 0.30) 40%,
    transparent 50%,
    transparent 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  animation: glass-border-spin 6s linear infinite;
}

.stats-card-inner {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .stats-card-inner {
    gap: 3rem;
    flex-wrap: nowrap;
  }
}

.stats-card__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stats-card__value {
  font-size: 2rem;
  font-weight: 300;
  color: #ffffff;
  letter-spacing: -0.04em;
  line-height: 1;
}

@media (min-width: 640px) {
  .stats-card__value {
    font-size: 2.5rem;
  }
}

.stats-card__label {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 400;
}

.stats-card__divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.12);
  display: none;
}

@media (min-width: 768px) {
  .stats-card__divider {
    display: block;
  }
}

/* ── Pricing Card — SVG/CSS Liquid Glass ── */
.pricing-card {
  max-width: 980px;
  border-radius: 20px;
  text-align: center;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: transparent;
  border: none;
  box-shadow: 0 10px 30px rgba(1, 5, 67, 0.18);
}

/* Liquid glass backdrop layer — SVG feDisplacementMap refraction */
.pricing-card-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  -webkit-backdrop-filter: url(#liquid-glass-pricing-filter);
  backdrop-filter: url(#liquid-glass-pricing-filter);
  pointer-events: none;
}

.pricing-card-shell {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.pricing-card-shell path {
  fill: white;
  fill-opacity: 0.05;
}

/* Liquid glass subtle gradient overlay */
.pricing-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.018) 0%,
    rgba(255, 255, 255, 0.008) 30%,
    transparent 100%
  );
  pointer-events: none;
}

/* Animated conic-gradient border — rotating light sweep */
.pricing-card::after {
  content: '';
  position: absolute;
  inset: -1px;
  z-index: 3;
  border-radius: 21px;
  padding: 1.5px;
  background: conic-gradient(
    from var(--angle, 0deg),
    transparent 0%,
    rgba(255, 255, 255, 0.04) 10%,
    rgba(59, 181, 109, 0.45) 20%,
    rgba(255, 255, 255, 0.55) 30%,
    rgba(59, 181, 109, 0.30) 40%,
    transparent 50%,
    transparent 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  animation: glass-border-spin 6s linear infinite;
  z-index: 3;
}

.pricing-card-layout {
  position: relative;
  z-index: 4;
  padding: 1.6rem;
  display: grid;
  gap: 1.25rem;
}

.pricing-card-main,
.pricing-card-details {
  position: relative;
}

.pricing-card-main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pricing-card-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.pricing-signal-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.pricing-signal-tag {
  color: rgba(255, 255, 255, 0.72);
  border-color: rgba(255, 255, 255, 0.16);
  border-width: 0.8px;
  background: rgba(255, 255, 255, 0.07);
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
}

.pricing-scarcity-note {
  margin-top: 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.01em;
  text-align: center;
}

/* Billing toggle */
.pricing-billing-toggle {
  display: inline-flex;
  gap: 0;
  padding: 4.8px;
  background: rgba(255, 255, 255, 0.08);
  border: 0.8px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  margin-bottom: 1.5rem;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.pricing-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.45);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.pricing-toggle-btn.is-active {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
}

.pricing-save-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: 999px;
  background-color: #3BB56D;
  color: #ffffff;
  letter-spacing: 0.02em;
  transition: opacity 0.2s;
}

.pricing-toggle-btn:not(.is-active) .pricing-save-badge {
  background-color: rgba(59, 181, 109, 0.18);
  color: #3BB56D;
}

.pricing-amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.pricing-amount--diagnostic {
  margin-top: 0.25rem;
}

.pricing-billing-info {
  min-height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
}

.pricing-annual-detail {
  font-size: 13px;
  font-weight: 500;
  color: #3BB56D;
  letter-spacing: 0.13px;
  line-height: 19.5px;
}

/* Price swap transition */
.price-swap-enter-active,
.price-swap-leave-active {
  transition: opacity 0.15s ease, transform 0.18s ease;
}
.price-swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.price-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.pricing-diagnostic-title {
  font-size: 2.125rem;
  font-weight: 700;
  line-height: 1.1;
  color: #010543;
}

.pricing-currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.pricing-value {
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.pricing-period {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.45);
}

.pricing-price-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.pricing-phase-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #3BB56D;
  letter-spacing: 0.03em;
}

.pricing-note {
  max-width: 30ch;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #637083;
}

.pricing-outcomes-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.65);
}

.pricing-outcomes {
  margin-top: 0;
  padding: 1rem;
  border-radius: 14px;
  background: rgba(99, 102, 241, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(8px);
  text-align: left;
}

.pricing-features-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20.8px 18.4px 18.4px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 0.8px solid rgba(255, 255, 255, 0.10);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.pricing-features-label {
  display: inline-flex;
  margin-bottom: 14px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: rgba(255, 255, 255, 0.90);
  line-height: 18px;
}

.pricing-outcomes-label {
  display: inline-flex;
  margin-bottom: 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #3bb56d;
}

.pricing-outcomes-list {
  margin: 0;
  padding-left: 1rem;
  display: grid;
  gap: 0.5rem;
  color: #334155;
  font-size: 0.875rem;
  line-height: 1.5;
}

.pricing-features {
  margin-top: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  text-align: left;
  list-style: none;
  padding: 0;
}

.pricing-feature {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  line-height: 22.5px;
  color: rgba(255, 255, 255, 0.72);
}

.pricing-feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 16px;
  border: 0.8px solid;
}

.pricing-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 320px;
  height: 52px;
  margin-top: 1.5rem;
  padding: 0 24px;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background-color: #3bb56d;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    0 0 0 1px rgba(59, 181, 109, 0.5) inset,
    0 4px 20px rgba(59, 181, 109, 0.35);
}

.pricing-cta:hover {
  background-color: #33a060;
  box-shadow:
    0 0 0 1px rgba(59, 181, 109, 0.6) inset,
    0 6px 28px rgba(59, 181, 109, 0.45);
  transform: translateY(-2px);
}

@media (min-width: 960px) {
  .pricing-card {
    padding: 24.8px;
  }

  .pricing-card-layout {
    grid-template-columns: minmax(320px, 0.95fr) minmax(0, 1.05fr);
    align-items: stretch;
    gap: 1.5rem;
  }

  .pricing-card-main {
    justify-content: center;
    min-height: 100%;
    padding: 1rem 0.5rem;
  }

  .pricing-card-details {
    grid-template-rows: auto 1fr;
  }

  .pricing-features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 1rem;
  }

  .pricing-feature {
    align-items: flex-start;
  }
}

/* ═══════════════════ TESTIMONIAL ═══════════════════ */

.testimonial-card {
  max-width: 600px;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  border: 1px solid #e6e6e6;
  background-color: #ffffff;
  text-align: left;
  position: relative;
}

.testimonial-quote-icon {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1rem;
}

.testimonial-quote {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #414e62;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.testimonial-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.testimonial-name {
  font-size: 1rem;
  font-weight: 600;
  color: #010543;
}

.testimonial-role {
  font-size: 0.875rem;
  color: #637083;
}

/* ═══════════════════ CTA FINAL ═══════════════════ */

.cta-final-section {
  background-color: #fafafa;
}

/* ═══════════════════ FAQ ═══════════════════ */

.faq-item {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #e6e6e6;
  background-color: #ffffff;
  transition: all 0.2s;
}

.faq-item + .faq-item {
  margin-top: 0.75rem;
}

.faq-item--open {
  border-color: #3bb56d;
  box-shadow: 0 2px 8px rgba(59, 181, 109, 0.08);
}

.faq-trigger {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #010543;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.faq-trigger:hover {
  color: #3bb56d;
}

.faq-chevron {
  flex-shrink: 0;
  color: #637083;
  transition: transform 0.2s;
}

.faq-item--open .faq-chevron {
  transform: rotate(180deg);
  color: #3bb56d;
}

.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: all 0.2s;
}

.faq-item--open .faq-answer {
  grid-template-rows: 1fr;
}

.faq-answer > p {
  overflow: hidden;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  line-height: 1.7;
  color: #637083;
}

.faq-item--open .faq-answer > p {
  padding-bottom: 1rem;
}

/* ═══════════════════ FOOTER ═══════════════════ */

.lp-footer {
  border-top: 1px solid #e6e6e6;
  padding: 2rem 0;
  background-color: #ffffff;
}

/* ═══════════════════ FOCUS VISIBLE ═══════════════════ */

.hero-cta:focus-visible,
.hero-cta-ghost:focus-visible,
.nav-cta:focus-visible,
.nav-link-outline:focus-visible,
.nav-anchor:focus-visible,
.cta-band-btn:focus-visible,
.pricing-cta:focus-visible,
.pricing-toggle-btn:focus-visible,
.faq-trigger:focus-visible {
  outline: 2px solid #3bb56d;
  outline-offset: 2px;
}

/* ═══════════════════ BRAND GRAFISMOS ═══════════════════ */

/* ── Shared grafismo foundations ── */
.grafismo-hero,
.grafismo-cta-band,
.grafismo-cta-final,
.grafismo-features,
.grafismo-pricing {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

/* ── Star marks — shared base ── */
.grafismo-star {
  position: absolute;
  will-change: transform;
}

/* ── Diagonal bars — shared base ── */
.grafismo-bars {
  position: absolute;
  will-change: transform;
}

/* ─── Hero grafismos ─── */
.grafismo-star--hero-1 {
  width: 120px;
  height: 114px;
  top: 8%;
  right: 6%;
  animation: grafismoFloat1 14s ease-in-out infinite;
}

.grafismo-star--hero-2 {
  width: 64px;
  height: 60px;
  top: 55%;
  right: 12%;
  animation: grafismoFloat2 11s ease-in-out 3s infinite;
}

.grafismo-bars--hero {
  width: 200px;
  height: 320px;
  bottom: -5%;
  right: 2%;
  animation: grafismoFloat3 16s ease-in-out 1s infinite;
}

@media (max-width: 768px) {
  .grafismo-star--hero-1 { width: 80px; height: 76px; right: 2%; }
  .grafismo-star--hero-2 { width: 40px; height: 38px; right: 5%; }
  .grafismo-bars--hero { width: 140px; height: 220px; right: -2%; }
}

/* ─── Features grafismos ─── */
.grafismo-star--feat-1 {
  width: 80px;
  height: 76px;
  top: 5%;
  left: 3%;
  animation: grafismoFloat2 13s ease-in-out 2s infinite;
}

.grafismo-bars--feat {
  width: 160px;
  height: 280px;
  bottom: -8%;
  right: 1%;
  animation: grafismoFloat1 18s ease-in-out infinite;
}

@media (max-width: 768px) {
  .grafismo-star--feat-1 { width: 50px; height: 48px; }
  .grafismo-bars--feat { width: 100px; height: 180px; }
}

/* ─── CTA Band grafismos ─── */
.grafismo-cta-band {
  z-index: 1;
}

.grafismo-bars--cta-left {
  width: 240px;
  height: 400px;
  top: -15%;
  left: -3%;
  animation: grafismoFloat3 15s ease-in-out infinite;
}

.grafismo-bars--cta-right {
  width: 200px;
  height: 360px;
  bottom: -10%;
  right: -2%;
  animation: grafismoFloat1 17s ease-in-out 2s infinite;
}

.grafismo-star--cta-1 {
  width: 96px;
  height: 91px;
  top: 12%;
  right: 18%;
  animation: grafismoFloat2 12s ease-in-out 1s infinite;
}

.grafismo-star--cta-2 {
  width: 56px;
  height: 53px;
  bottom: 18%;
  left: 15%;
  animation: grafismoFloat1 10s ease-in-out 4s infinite;
}

@media (max-width: 768px) {
  .grafismo-bars--cta-left { width: 160px; height: 280px; left: -8%; }
  .grafismo-bars--cta-right { width: 140px; height: 240px; right: -6%; }
  .grafismo-star--cta-1 { width: 60px; height: 57px; right: 8%; }
  .grafismo-star--cta-2 { width: 36px; height: 34px; left: 6%; }
}

/* ─── Pricing grafismo ─── */
.grafismo-star--pricing {
  width: 72px;
  height: 68px;
  top: 10%;
  right: 8%;
  animation: grafismoFloat2 14s ease-in-out 2s infinite;
}

@media (max-width: 768px) {
  .grafismo-star--pricing { width: 48px; height: 46px; right: 3%; }
}

/* ─── CTA Final grafismos ─── */
.grafismo-cta-final {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.grafismo-star--final-1 {
  width: 96px;
  height: 91px;
  top: 15%;
  left: 5%;
  animation: grafismoFloat1 13s ease-in-out infinite;
}

.grafismo-star--final-2 {
  width: 48px;
  height: 46px;
  bottom: 20%;
  right: 8%;
  animation: grafismoFloat2 11s ease-in-out 3s infinite;
}

.grafismo-bars--final {
  width: 180px;
  height: 300px;
  top: -10%;
  right: 2%;
  animation: grafismoFloat3 16s ease-in-out 1s infinite;
}

@media (max-width: 768px) {
  .grafismo-star--final-1 { width: 60px; height: 57px; left: 2%; }
  .grafismo-star--final-2 { width: 32px; height: 30px; right: 3%; }
  .grafismo-bars--final { width: 120px; height: 200px; }
}

/* ─── Grafismo float animations ─── */
@keyframes grafismoFloat1 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-12px) rotate(2deg); }
  66% { transform: translateY(8px) rotate(-1deg); }
}

@keyframes grafismoFloat2 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.05); }
}

@keyframes grafismoFloat3 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  40% { transform: translate(6px, -8px) rotate(1.5deg); }
  80% { transform: translate(-4px, 5px) rotate(-1deg); }
}

/* ── Sections need relative positioning for grafismos ── */
.cta-final-section {
  position: relative;
  overflow: hidden;
}

/* ─── Testimonial grafismos ─── */
.grafismo-testimonial {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.grafismo-star--testimonial-1 {
  width: 150px;
  height: 143px;
  top: -30px;
  right: 5%;
  animation: grafismoFloat1 15s ease-in-out infinite;
}

.grafismo-star--testimonial-2 {
  width: 64px;
  height: 61px;
  bottom: 12%;
  right: 8%;
  animation: grafismoFloat2 11s ease-in-out 4s infinite;
}

.grafismo-dots {
  position: absolute;
}

.grafismo-dots--testimonial {
  bottom: 10%;
  left: 3%;
  width: 130px;
  height: 130px;
  animation: grafismoFloat3 18s ease-in-out 2s infinite;
}

@media (max-width: 768px) {
  .grafismo-star--testimonial-1 { width: 100px; height: 95px; right: 1%; }
  .grafismo-star--testimonial-2 { display: none; }
  .grafismo-dots--testimonial { display: none; }
}

/* ─── FAQ grafismos ─── */
.grafismo-faq {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.grafismo-bars--faq-left {
  width: 200px;
  height: 340px;
  top: -20px;
  left: -20px;
  animation: grafismoFloat3 17s ease-in-out infinite;
}

.grafismo-star--faq-1 {
  width: 130px;
  height: 124px;
  bottom: 5%;
  right: 4%;
  animation: grafismoFloat1 14s ease-in-out 1s infinite;
}

.grafismo-star--faq-2 {
  width: 56px;
  height: 53px;
  top: 8%;
  right: 12%;
  animation: grafismoFloat2 11s ease-in-out 3s infinite;
}

@media (max-width: 768px) {
  .grafismo-bars--faq-left { width: 130px; height: 220px; left: -30px; }
  .grafismo-star--faq-1 { width: 85px; height: 81px; right: 1%; }
  .grafismo-star--faq-2 { display: none; }
}
</style>

<!-- Global style for CSS Houdini @property (does not work inside scoped) -->
<style>
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes glass-border-spin {
  to {
    --angle: 360deg;
  }
}
</style>
