<script setup lang="ts">
/**
 * AdSvgCreative.vue
 *
 * Anúncio Meta text-only em SVG (1:1 ou 9:16) com hierarquia editorial
 * inspirada no criativo Staage + background oficial do brand system
 * (mesmo cover usado na wiki) + grafismos de marca do próprio AdSlide.
 *
 * Camadas de render (bottom → top):
 *   0  Base gradients do cover da wiki
 *   1  Hero grafismo oficial do brand system
 *   2  Radial glows (slide.glows)
 *   3  Diagonal brand bars (slide.bars)
 *   4  Logo wordmark (topo centro)
 *   5  Kicker small-caps verde
 *   6  Headline L1/L2 HUGE com emphasis verde
 *   7  Body subtitle (primaryTextShort, wrap, inline emphasis verde)
 *   8  Description italic secundária
 *   9  CTA pill (rounded rect + texto dark)
 *   10 Footer microcopy
 *   11 Sparkle (se showStar)
 */
import { computed, ref } from 'vue'
import type { AdSlide } from '@/data/ads-top5'
import {
  SVG_FORMATS,
  SVG_LAYOUT,
  SVG_TYPOGRAPHY,
  SVG_COLORS,
  SVG_ANIMATION,
  LOGO_WORDMARK_PATHS,
  type SvgAdFormat,
} from '@/data/ads-top5-svg-tokens'

const props = withDefaults(defineProps<{
  slide: AdSlide
  format?: SvgAdFormat
  animated?: boolean
}>(), {
  format: 'square',
  animated: false,
})

// ─── Derived layout ───

const fmt = computed(() => SVG_FORMATS[props.format])
const lay = computed(() => SVG_LAYOUT[props.format])
const typo = SVG_TYPOGRAPHY
const colors = SVG_COLORS
const anim = SVG_ANIMATION

type SvgTextTone = 'primary' | 'accent' | 'muted' | 'dim'

function resolveTextTone(tone: SvgTextTone | undefined) {
  switch (tone) {
    case 'primary':
      return colors.textPrimary
    case 'accent':
      return colors.textAccent
    case 'dim':
      return colors.textDim
    case 'muted':
    default:
      return colors.textMuted
  }
}

const slideLayout = computed(() => ({
  ...lay.value,
  ...(props.slide.svgOverrides?.layout?.[props.format] ?? {}),
}))

const slideTypography = computed(() => props.slide.svgOverrides?.typography ?? {})
const bodyColor = computed(() => resolveTextTone(props.slide.svgOverrides?.colors?.body))
const descColor = computed(() => resolveTextTone(props.slide.svgOverrides?.colors?.desc))
const bodyEmphasisOnly = computed(() => props.slide.svgOverrides?.bodyEmphasisOnly !== false)
const ctaLabel = computed(() => {
  const suffix = props.slide.svgOverrides?.ctaSuffix?.trim()
  return suffix ? `${props.slide.ctaButton} ${suffix}` : props.slide.ctaButton
})

const BRAND_SYSTEM_ART_WIDTH = 1052
const BRAND_SYSTEM_ART_HEIGHT = 768

const brandArtTransform = computed(
  () => `scale(${fmt.value.width / BRAND_SYSTEM_ART_WIDTH} ${fmt.value.height / BRAND_SYSTEM_ART_HEIGHT})`,
)

const headlineAvailableWidth = computed(() => fmt.value.width - slideLayout.value.marginX * 2 - 40)

const bodySize = computed(() =>
  props.format === 'story'
    ? (slideTypography.value.bodySizeStory ?? typo.body.sizeStory)
    : (slideTypography.value.bodySizeSquare ?? typo.body.sizeSquare),
)
const descSize = computed(() =>
  props.format === 'story'
    ? (slideTypography.value.descSizeStory ?? typo.desc.sizeStory)
    : (slideTypography.value.descSizeSquare ?? typo.desc.sizeSquare),
)
const ctaSize = computed(() =>
  props.format === 'story' ? typo.cta.sizeStory : typo.cta.sizeSquare,
)
const footerSize = computed(() =>
  props.format === 'story' ? typo.footer.sizeStory : typo.footer.sizeSquare,
)

const cx = computed(() => fmt.value.width / 2)

// ─── Text helpers ───

type TextPart = { text: string; isEmphasis: boolean }

function estimateGlyphWidth(char: string): number {
  if (char === ' ') return 0.28
  if (/[.,;:!?]/.test(char)) return 0.24
  if (/[0-9]/.test(char)) return 0.56
  if ('mwMWQOÓÔÕÇç'.includes(char)) return 0.88
  if ('ilIjtfrÍí!|'.includes(char)) return 0.34

  const upper = char.toLocaleUpperCase('pt-BR')
  const lower = char.toLocaleLowerCase('pt-BR')

  if (upper !== lower) {
    return char === upper ? 0.68 : 0.52
  }

  return 0.52
}

function estimateLineWidth(line: string, fontSize: number, letterSpacing: number): number {
  if (!line) return 0
  const glyphs = [...line].reduce((acc, char) => acc + estimateGlyphWidth(char), 0)
  return glyphs * fontSize + Math.max(0, line.length - 1) * letterSpacing
}

function splitEmphasis(line: string, word: string): TextPart[] {
  if (!word || !line) return [{ text: line, isEmphasis: false }]
  const idx = line.toLowerCase().indexOf(word.toLowerCase())
  if (idx === -1) return [{ text: line, isEmphasis: false }]
  const out: TextPart[] = []
  if (idx > 0) out.push({ text: line.slice(0, idx), isEmphasis: false })
  out.push({ text: line.slice(idx, idx + word.length), isEmphasis: true })
  if (idx + word.length < line.length)
    out.push({ text: line.slice(idx + word.length), isEmphasis: false })
  return out
}

/**
 * Word-wrap baseado em largura estimada da linha.
 * Mantém a composição mais estável entre 1:1 e 9:16.
 */
function wrapTextByWidth(text: string, maxWidth: number, fontSize: number, letterSpacing: number): string[] {
  if (!text) return []
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const lines: string[] = []
  let current = ''

  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w
    if (!current || estimateLineWidth(candidate, fontSize, letterSpacing) <= maxWidth) {
      current = candidate
      continue
    }

    lines.push(current)
    current = w
  }

  if (current) lines.push(current)
  return lines
}

function balanceWrappedLines(lines: string[], maxWidth: number, fontSize: number, letterSpacing: number): string[] {
  const balanced = [...lines]

  for (let index = balanced.length - 2; index >= 0; index -= 1) {
    let currentWords = balanced[index].split(/\s+/).filter(Boolean)
    let nextWords = balanced[index + 1].split(/\s+/).filter(Boolean)

    while (currentWords.length > 2) {
      const currentLine = currentWords.join(' ')
      const nextLine = nextWords.join(' ')
      const currentWidth = estimateLineWidth(currentLine, fontSize, letterSpacing)
      const nextWidth = estimateLineWidth(nextLine, fontSize, letterSpacing)

      const movedWord = currentWords[currentWords.length - 1]
      const candidateCurrentWords = currentWords.slice(0, -1)
      const candidateNextWords = [movedWord, ...nextWords]
      const candidateCurrentLine = candidateCurrentWords.join(' ')
      const candidateNextLine = candidateNextWords.join(' ')
      const candidateCurrentWidth = estimateLineWidth(candidateCurrentLine, fontSize, letterSpacing)
      const candidateNextWidth = estimateLineWidth(candidateNextLine, fontSize, letterSpacing)

      const currentDelta = Math.abs(currentWidth - nextWidth)
      const candidateDelta = Math.abs(candidateCurrentWidth - candidateNextWidth)
      const nextLineTooShort = nextWidth < maxWidth * 0.42
      const safeToMove = candidateCurrentWidth <= maxWidth && candidateNextWidth <= maxWidth
      const improvesBalance = candidateDelta + fontSize * 0.18 < currentDelta

      if (!safeToMove || (!nextLineTooShort && !improvesBalance)) break

      currentWords = candidateCurrentWords
      nextWords = candidateNextWords
    }

    balanced[index] = currentWords.join(' ')
    balanced[index + 1] = nextWords.join(' ')
  }

  return balanced
}

function clampWrappedLines(lines: string[], maxWidth: number, fontSize: number, letterSpacing: number, maxLines: number): string[] {
  if (lines.length <= maxLines) return lines

  const clamped = lines.slice(0, maxLines)
  let lastLine = `${clamped[maxLines - 1]} ${lines.slice(maxLines).join(' ')}`.trim()

  while (lastLine.length > 1 && estimateLineWidth(`${lastLine}…`, fontSize, letterSpacing) > maxWidth) {
    lastLine = lastLine.replace(/\s+\S+\s*$/, '').trim()
  }

  clamped[maxLines - 1] = `${lastLine}…`
  return clamped
}

function wrapBalancedText(
  text: string,
  maxWidth: number,
  fontSize: number,
  letterSpacing: number,
  maxLines?: number,
): string[] {
  const paragraphs = text
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const balanced = paragraphs.flatMap((paragraph) => {
    const wrapped = wrapTextByWidth(paragraph, maxWidth, fontSize, letterSpacing)
    return balanceWrappedLines(wrapped, maxWidth, fontSize, letterSpacing)
  })

  if (!maxLines) return balanced
  return clampWrappedLines(balanced, maxWidth, fontSize, letterSpacing, maxLines)
}

const line1Parts = computed(() => splitEmphasis(props.slide.overlayLine1, props.slide.emphasisWord))
const line2Parts = computed(() => splitEmphasis(props.slide.overlayLine2, props.slide.emphasisWord))

// ─── Headline (hook) — multi-line wrapped com emphasis inline estilo Staage ───

const HEADLINE_MAX_LINES = computed(() => (props.format === 'story' ? 5 : 4))
const HEADLINE_TARGET_LINES = computed(() => (props.format === 'story' ? 4 : 4))
const headlineBaseSize = computed(() =>
  props.format === 'story'
    ? (slideTypography.value.headlineSizeStory ?? typo.headline.sizeStory)
    : (slideTypography.value.headlineSizeSquare ?? typo.headline.sizeSquare),
)
const headlineBaseLineHeight = computed(() => slideTypography.value.headlineLineHeight ?? typo.headline.lineHeight)

const headlineLayout = computed(() => {
  const hook = (props.slide.primaryTextShort || '').trim()
  const baseSize = headlineBaseSize.value
  const minSize = props.format === 'story' ? 82 : 70
  const letterSpacing = typo.headline.letterSpacing
  const availW = headlineAvailableWidth.value
  let fallbackCandidate: { lines: string[]; size: number; letterSpacing: number; lineHeight: number } | null = null

  for (let size = baseSize; size >= minSize; size -= 2) {
    const lines = wrapBalancedText(hook, availW, size, letterSpacing)
    if (lines.length <= HEADLINE_MAX_LINES.value) {
      const maxW = Math.max(...lines.map((l) => estimateLineWidth(l, size, letterSpacing)), 0)
      if (maxW <= availW) {
        const candidate = { lines, size, letterSpacing, lineHeight: headlineBaseLineHeight.value }
        if (!fallbackCandidate) fallbackCandidate = candidate
        if (lines.length <= HEADLINE_TARGET_LINES.value) return candidate
      }
    }
  }

  if (fallbackCandidate) return fallbackCandidate

  const size = minSize
  const lines = wrapBalancedText(hook, availW, size, letterSpacing, HEADLINE_MAX_LINES.value)
  return { lines, size, letterSpacing, lineHeight: headlineBaseLineHeight.value }
})

const headlineLines = computed(() => headlineLayout.value.lines)
const headlineSize = computed(() => headlineLayout.value.size)
const headlineLetterSpacing = computed(() => headlineLayout.value.letterSpacing)
const headlineLineHeight = computed(() => headlineLayout.value.lineHeight)

/** Divide cada linha do headline em partes (emphasisWord vs resto). */
function splitHeadlineLine(line: string): TextPart[] {
  return splitEmphasis(line, props.slide.emphasisWord)
}

// Mantém compat com métricas legadas (caso necessário)
const headlineMetrics = computed(() => ({
  size: headlineSize.value,
  letterSpacing: headlineLetterSpacing.value,
}))

// ─── Body (primaryTextShort) ───

// ─── Body paragraph (description + emphasis em CAIXA ALTA estilo Staage) ───

/** Caracteres por linha estimados a partir da largura disponível e tamanho da fonte. */
/** Texto-fonte do parágrafo de apoio: usa `description` (mais sintética) do slide. */
const bodySourceText = computed(() => (props.slide.description || '').trim())

/** Palavra-chave colorida inline (ALL CAPS). Reaproveita `emphasisWord`. */
const bodyEmphasisWord = computed(() => {
  const w = (props.slide.emphasisWord || '').toLowerCase()
  const body = bodySourceText.value.toLowerCase()
  if (w && body.includes(w)) return props.slide.emphasisWord
  for (const candidate of ['venda', 'vendas', 'receita', 'atribuição', 'número']) {
    if (body.includes(candidate)) return candidate
  }
  return ''
})

/** Aplica UPPERCASE na parte de ênfase preservando o resto do texto. */
function splitBodyLine(line: string): TextPart[] {
  const parts = splitEmphasis(line, bodyEmphasisWord.value)
  return parts.map((p) => (p.isEmphasis ? { ...p, text: p.text.toLocaleUpperCase('pt-BR') } : p))
}

/** Body: até 3 linhas para não invadir a linha italic + CTA */
const bodyLines = computed(() => {
  return wrapBalancedText(
    bodySourceText.value,
    slideLayout.value.bodyMaxWidth,
    bodySize.value,
    typo.body.letterSpacing,
    3,
  )
})

const dynamicBodyY = computed(() => {
  const defaultY = fmt.value.height * slideLayout.value.bodyY
  const headlineEndY = fmt.value.height * slideLayout.value.headlineY + headlineSize.value + (headlineLines.value.length - 1) * headlineSize.value * headlineLineHeight.value
  const minGap = props.format === 'story' ? 80 : 64
  return Math.max(defaultY, headlineEndY + minGap)
})

// ─── Supporting italic line (footerMicrocopy) ───

const descLines = computed(() =>
  wrapBalancedText(
    props.slide.footerMicrocopy || '',
    slideLayout.value.bodyMaxWidth,
    descSize.value,
    typo.desc.letterSpacing,
    2,
  ),
)

// ─── Brand bars (per-slide) ───

interface ResolvedBar {
  cx: number
  cy: number
  length: number
  thickness: number
  angle: number
  fill: string
  opacity: number
}

const resolvedBars = computed<ResolvedBar[]>(() => {
  const W = fmt.value.width
  const H = fmt.value.height
  return props.slide.bars.map((b) => {
    const cxPx = (b.x / 100) * W
    const cyPx = (b.y / 100) * H
    const lenPx = (b.length / 100) * W
    const angle = b.angle ?? 135
    return {
      cx: cxPx,
      cy: cyPx,
      length: lenPx,
      thickness: b.thickness * 1.2,
      angle,
      fill: b.tone === 'green' ? colors.barGreen : colors.barBlueSoft,
      opacity: b.opacity ?? 0.28,
    }
  })
})

// ─── Brand glows (per-slide) ───

interface ResolvedGlow {
  cx: number
  cy: number
  radius: number
  rgb: string
  opacity: number
}

function glowPosition(pos: string): { x: number; y: number } {
  const W = fmt.value.width
  const H = fmt.value.height
  switch (pos) {
    case 'tl': return { x: 0, y: 0 }
    case 'tr': return { x: W, y: 0 }
    case 'bl': return { x: 0, y: H }
    case 'br': return { x: W, y: H }
    case 'center-left': return { x: 0, y: H * 0.5 }
    case 'center-right': return { x: W, y: H * 0.5 }
    case 'center': return { x: W * 0.5, y: H * 0.5 }
    default: return { x: W * 0.5, y: H * 0.5 }
  }
}

const resolvedGlows = computed<ResolvedGlow[]>(() => {
  const scale = props.format === 'story' ? 1.5 : 1
  return props.slide.glows.map((g) => {
    const pos = glowPosition(g.position)
    const rgb =
      g.color === 'green' ? colors.glowGreenRgb :
      g.color === 'blue'  ? colors.glowBlueRgb  :
      colors.glowNavyRgb
    return {
      cx: pos.x,
      cy: pos.y,
      radius: g.radius * scale,
      rgb,
      opacity: g.opacity,
    }
  })
})

// ─── Logo scaling ───

const logoScale = computed(() => {
  const targetW = fmt.value.width * slideLayout.value.logoScale
  return targetW / 123
})
const logoX = computed(() => cx.value - (123 * logoScale.value) / 2)
const logoY = computed(() => fmt.value.height * slideLayout.value.logoY - (28 * logoScale.value) / 2)

// ─── CTA ───

const ctaRect = computed(() => {
  const w = slideLayout.value.ctaWidth
  const h = slideLayout.value.ctaHeight
  const x = (fmt.value.width - w) / 2
  const y = fmt.value.height * slideLayout.value.ctaY - h / 2
  const rx = h / 2
  return { x, y, w, h, rx }
})

// ─── Unique IDs per instance ───

const uid = `svg-ad-${props.slide.number}-${props.format}`

// ─── Download ───

const svgRef = ref<SVGSVGElement | null>(null)
const FONT_STYLE =
  '<style>@import url("https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&amp;display=swap");</style>'

function downloadSvg() {
  if (!svgRef.value) return
  const serializer = new XMLSerializer()
  let s = serializer.serializeToString(svgRef.value)
  s = s.replace('<defs>', `<defs>${FONT_STYLE}`)
  const blob = new Blob([s], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `adsmagic-ad${props.slide.number}-${props.format}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

defineExpose({ downloadSvg })

// ─── Animation helpers ───

function fadeDelay(order: number) {
  return `${(order * anim.stagger) / 1000}s`
}
function fadeDur() {
  return `${anim.fadeInDuration / 1000}s`
}
</script>

<template>
  <svg
    ref="svgRef"
    :viewBox="`0 0 ${fmt.width} ${fmt.height}`"
    :width="fmt.width"
    :height="fmt.height"
    xmlns="http://www.w3.org/2000/svg"
    class="ad-svg-creative"
  >
    <defs>
      <!-- Base gradients do cover oficial da wiki -->
      <linearGradient :id="`${uid}-cover-vertical`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#09111E" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#09111E" stop-opacity="0.76" />
      </linearGradient>

      <linearGradient :id="`${uid}-cover-horizontal`" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#081120" stop-opacity="0.94" />
        <stop offset="100%" stop-color="#081120" stop-opacity="0.72" />
      </linearGradient>

      <radialGradient
        :id="`${uid}-brand-top-glow`"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(990 154) rotate(152) scale(416 286)"
      >
        <stop offset="0" stop-color="#1D4BB5" stop-opacity="0.24" />
        <stop offset="1" stop-color="#1D4BB5" stop-opacity="0" />
      </radialGradient>

      <radialGradient
        :id="`${uid}-brand-left-orb`"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(186 736) rotate(-36) scale(488 412)"
      >
        <stop offset="0" stop-color="#031C78" stop-opacity="0.92" />
        <stop offset="1" stop-color="#031C78" stop-opacity="0" />
      </radialGradient>

      <radialGradient
        :id="`${uid}-brand-right-orb`"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(888 748) rotate(-142) scale(372 316)"
      >
        <stop offset="0" stop-color="#1643A9" stop-opacity="0.58" />
        <stop offset="1" stop-color="#1643A9" stop-opacity="0" />
      </radialGradient>

      <linearGradient :id="`${uid}-brand-left-diagonal`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1D52C5" stop-opacity="0.20" />
        <stop offset="1" stop-color="#1D52C5" stop-opacity="0" />
      </linearGradient>

      <linearGradient :id="`${uid}-brand-left-top-shade`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#020A53" stop-opacity="0.34" />
        <stop offset="1" stop-color="#020A53" stop-opacity="0" />
      </linearGradient>

      <!-- Green glow for headline emphasis -->
      <filter :id="`${uid}-glow`" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- CTA pill drop-shadow -->
      <filter :id="`${uid}-cta-shadow`" x="-20%" y="-40%" width="140%" height="180%">
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.35" />
      </filter>

      <!-- Radial gradients per brand glow -->
      <radialGradient
        v-for="(g, i) in resolvedGlows"
        :key="`glow-${i}`"
        :id="`${uid}-glow-${i}`"
        cx="50%" cy="50%" r="50%"
      >
        <stop offset="0%" :stop-color="`rgb(${g.rgb})`" :stop-opacity="g.opacity" />
        <stop offset="70%" :stop-color="`rgb(${g.rgb})`" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- ═══ Layer 0: Base gradients do cover ═══ -->
    <rect x="0" y="0" :width="fmt.width" :height="fmt.height" fill="#101827" />
    <rect x="0" y="0" :width="fmt.width" :height="fmt.height" :fill="`url(#${uid}-cover-horizontal)`" />
    <rect x="0" y="0" :width="fmt.width" :height="fmt.height" :fill="`url(#${uid}-cover-vertical)`" />

    <!-- ═══ Layer 1: Hero grafismo oficial do brand system ═══ -->
    <g :transform="brandArtTransform" opacity="0.86" aria-hidden="true">
      <rect width="1052" height="768" fill="#01084F" />
      <path d="M0 0H530L278 366L0 560V0Z" :fill="`url(#${uid}-brand-left-top-shade)`" />
      <rect width="1052" height="768" :fill="`url(#${uid}-brand-top-glow)`" />

      <circle cx="1022" cy="152" r="186" fill="#133D9B" fill-opacity="0.16" />

      <g opacity="0.34" transform="translate(354 420) scale(3.98)">
        <path
          d="M77.9645 120.387C77.9645 108.106 83.0981 96.3291 92.2363 87.6457C101.374 78.9623 113.769 74.084 126.692 74.084C129.277 74.084 131.756 73.1084 133.583 71.3717C135.411 69.635 136.438 67.2796 136.438 64.8235C136.438 62.3675 135.411 60.0121 133.583 58.2754C131.756 56.5387 129.277 55.563 126.692 55.563C113.769 55.563 101.374 50.6848 92.2363 42.0014C83.0981 33.318 77.9645 21.5408 77.9645 9.26057C77.9645 6.80453 76.9377 4.44898 75.1101 2.7123C73.2825 0.975617 70.8037 0 68.219 0C65.6344 0 63.1556 0.975617 61.328 2.7123C59.5004 4.44898 58.4736 6.80453 58.4736 9.26057C58.4736 21.5408 53.3395 33.318 44.2013 42.0014C35.0631 50.6848 22.6693 55.563 9.74597 55.563C7.1613 55.563 4.68203 56.5387 2.85439 58.2754C1.02675 60.0121 0 62.3675 0 64.8235C0 67.2796 1.02675 69.635 2.85439 71.3717C4.68203 73.1084 7.1613 74.084 9.74597 74.084C22.6693 74.084 35.0631 78.9623 44.2013 87.6457C53.3395 96.3291 58.4736 108.106 58.4736 120.387C58.4736 122.843 59.5004 125.198 61.328 126.935C63.1556 128.671 65.6344 129.647 68.219 129.647C70.8037 129.647 73.2825 128.671 75.1101 126.935C76.9377 125.198 77.9645 122.843 77.9645 120.387Z"
          fill="#0F3487"
        />
      </g>

      <rect x="306" y="548" width="684" height="84" rx="42" fill="#0D2F84" fill-opacity="0.24" />
      <rect x="328" y="670" width="620" height="72" rx="36" fill="#08246E" fill-opacity="0.22" />

      <circle cx="182" cy="742" r="442" :fill="`url(#${uid}-brand-left-orb)`" />
      <circle cx="888" cy="748" r="312" :fill="`url(#${uid}-brand-right-orb)`" />

      <rect
        x="118"
        y="806"
        width="348"
        height="72"
        rx="36"
        transform="rotate(-48 118 806)"
        :fill="`url(#${uid}-brand-left-diagonal)`"
      />

      <rect width="1052" height="768" :fill="`url(#${uid}-brand-top-glow)`" />
    </g>

    <!-- ═══ Layer 2: Radial brand glows (per slide) ═══ -->
    <g class="brand-glows">
      <circle
        v-for="(g, i) in resolvedGlows"
        :key="`g-${i}`"
        :cx="g.cx"
        :cy="g.cy"
        :r="g.radius"
        :fill="`url(#${uid}-glow-${i})`"
      />
    </g>

    <!-- ═══ Layer 3: Diagonal brand bars (per slide) ═══ -->
    <g class="brand-bars">
      <rect
        v-for="(bar, i) in resolvedBars"
        :key="`bar-${i}`"
        :x="bar.cx - bar.length / 2"
        :y="bar.cy - bar.thickness / 2"
        :width="bar.length"
        :height="bar.thickness"
        :fill="bar.fill"
        :opacity="bar.opacity"
        :transform="`rotate(${bar.angle} ${bar.cx} ${bar.cy})`"
        rx="2"
      />
    </g>

    <!-- ═══ Layer 4: Logo wordmark (topo centro) ═══ -->
    <g
      :transform="`translate(${logoX}, ${logoY}) scale(${logoScale})`"
      :opacity="animated ? 0 : 1"
    >
      <path :d="LOGO_WORDMARK_PATHS.textPath" fill="#FFFFFF" />
      <path :d="LOGO_WORDMARK_PATHS.sparkleGreenPath" :fill="colors.textAccent" />
      <path :d="LOGO_WORDMARK_PATHS.sparkleWhitePath" fill="#FFFFFF" />
      <path :d="LOGO_WORDMARK_PATHS.slashGreenPath" :fill="colors.textAccent" />
      <path :d="LOGO_WORDMARK_PATHS.slashWhitePath" fill="#FFFFFF" />
      <template v-if="animated">
        <animate attributeName="opacity" from="0" to="1" :dur="fadeDur()" fill="freeze" :begin="fadeDelay(0)" />
      </template>
    </g>

    <!-- ═══ Layer 5: Kicker (oculto na hierarquia Staage) ═══ -->
    <!-- kicker removido: a hierarquia nova começa direto pelo headline gigante -->

    <!-- ═══ Layer 6: Headline (hook) — multi-line com emphasis inline ═══ -->
    <text
      :x="cx"
      :y="fmt.height * slideLayout.headlineY + headlineSize"
      text-anchor="middle"
      :font-family="typo.fontFamily"
      :font-weight="typo.headline.weight"
      :font-size="headlineSize"
      :letter-spacing="headlineLetterSpacing"
      :opacity="animated ? 0 : 1"
    >
      <tspan
        v-for="(line, li) in headlineLines"
        :key="`hl-${li}`"
        :x="cx"
        :dy="li === 0 ? 0 : headlineSize * headlineLineHeight"
      >
        <tspan
          v-for="(part, pi) in splitHeadlineLine(line)"
          :key="`hl-${li}-${pi}`"
          :fill="part.isEmphasis ? colors.textAccent : colors.textPrimary"
          :filter="part.isEmphasis ? `url(#${uid}-glow)` : undefined"
        >{{ part.text }}</tspan>
      </tspan>
      <template v-if="animated">
        <animate attributeName="opacity" from="0" to="1" :dur="fadeDur()" fill="freeze" :begin="fadeDelay(2)" />
      </template>
    </text>

    <!-- ═══ Layer 7: Body subtitle (primaryTextShort, wrap + inline emphasis) ═══ -->
    <text
      :x="cx"
      :y="dynamicBodyY"
      text-anchor="middle"
      :fill="bodyColor"
      :font-family="typo.fontFamily"
      :font-weight="typo.body.weight"
      :font-size="bodySize"
      :letter-spacing="typo.body.letterSpacing"
      :opacity="animated ? 0 : 1"
    >
      <tspan
        v-for="(line, li) in bodyLines"
        :key="`bl-${li}`"
        :x="cx"
        :dy="li === 0 ? 0 : bodySize * typo.body.lineHeight"
      >
        <tspan
          v-for="(part, pi) in splitBodyLine(line)"
          :key="`bl-${li}-${pi}`"
          :fill="bodyEmphasisOnly ? (part.isEmphasis ? colors.textAccent : bodyColor) : bodyColor"
          :font-weight="bodyEmphasisOnly && part.isEmphasis ? 700 : typo.body.weight"
        >{{ part.text }}</tspan>
      </tspan>
      <template v-if="animated">
        <animate attributeName="opacity" from="0" to="1" :dur="fadeDur()" fill="freeze" :begin="fadeDelay(4)" />
      </template>
    </text>

    <!-- ═══ Layer 8: Description (italic secondary) ═══ -->
    <text
      v-if="descLines.length"
      :x="cx"
      :y="Math.max(fmt.height * slideLayout.descY, dynamicBodyY + bodyLines.length * bodySize * typo.body.lineHeight + 40)"
      text-anchor="middle"
      :fill="descColor"
      :font-family="typo.fontFamily"
      :font-weight="typo.desc.weight"
      :font-size="descSize"
      :letter-spacing="typo.desc.letterSpacing"
      font-style="italic"
      :opacity="animated ? 0 : 1"
    >
      <tspan
        v-for="(line, li) in descLines"
        :key="`dl-${li}`"
        :x="cx"
        :dy="li === 0 ? 0 : descSize * typo.desc.lineHeight"
      >{{ line }}</tspan>
      <template v-if="animated">
        <animate attributeName="opacity" from="0" to="1" :dur="fadeDur()" fill="freeze" :begin="fadeDelay(5)" />
      </template>
    </text>

    <!-- ═══ Layer 9: CTA pill ═══ -->
    <g :opacity="animated ? 0 : 1">
      <rect
        :x="ctaRect.x"
        :y="ctaRect.y"
        :width="ctaRect.w"
        :height="ctaRect.h"
        :rx="ctaRect.rx"
        :fill="colors.ctaBg"
        :filter="`url(#${uid}-cta-shadow)`"
      />
      <text
        :x="cx"
        :y="fmt.height * slideLayout.ctaY + ctaSize * 0.35"
        text-anchor="middle"
        :fill="colors.ctaText"
        :font-family="typo.fontFamily"
        :font-weight="typo.cta.weight"
        :font-size="ctaSize"
        :letter-spacing="typo.cta.letterSpacing"
      >{{ ctaLabel }}</text>
      <template v-if="animated">
        <animate attributeName="opacity" from="0" to="1" :dur="fadeDur()" fill="freeze" :begin="fadeDelay(6)" />
      </template>
    </g>

    <!-- ═══ Layer 10: Footer microcopy (oculto — já integrado ao italic de apoio) ═══ -->
    <!-- footer removido da hierarquia Staage: footerMicrocopy agora aparece como linha italic acima do CTA -->

    <!-- ═══ Layer 11: Sparkle star accent ═══ -->
    <g
      v-if="slide.showStar"
      :transform="`translate(${fmt.width - slideLayout.marginX - 40}, ${fmt.height * slideLayout.footerY - 28}) scale(2.8)`"
      :opacity="animated ? 0 : 1"
    >
      <path
        d="M4.5 0L5.6 3.4L9 4.5L5.6 5.6L4.5 9L3.4 5.6L0 4.5L3.4 3.4Z"
        :fill="slide.starColor === 'green' ? colors.textAccent : '#FFFFFF'"
      />
      <template v-if="animated">
        <animate attributeName="opacity" from="0" to="1" :dur="fadeDur()" fill="freeze" :begin="fadeDelay(8)" />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 4.5 4.5"
          to="360 4.5 4.5"
          dur="12s"
          repeatCount="indefinite"
          additive="sum"
        />
      </template>
    </g>
  </svg>
</template>

<style scoped>
.ad-svg-creative {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
}
</style>
