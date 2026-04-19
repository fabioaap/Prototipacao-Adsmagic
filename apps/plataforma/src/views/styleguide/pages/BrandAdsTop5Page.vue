<script setup lang="ts">
import {computed, ref} from 'vue'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Separator} from '@/components/ui/separator'
import {adsTop5, type AdBar, type AdGlow, type AdSlide} from '@/data/ads-top5'

const activeIndex = ref(0)
const activeSlide = computed<AdSlide>(() => adsTop5.slides[activeIndex.value])

function prev() {
  if (activeIndex.value > 0) activeIndex.value--
}
function next() {
  if (activeIndex.value < adsTop5.slides.length - 1) activeIndex.value++
}
function select(i: number) {
  activeIndex.value = i
}

function glowStyle(g: AdGlow) {
  const base =
    g.color === 'green'
      ? '59, 181, 109'
      : g.color === 'blue'
        ? '37, 99, 235'
        : '0, 8, 42'
  const position: Record<
    AdGlow['position'],
    {top?: string; left?: string; right?: string; bottom?: string; transform: string}
  > = {
    tl: {top: '0%', left: '0%', transform: 'translate(-45%, -45%)'},
    tr: {top: '0%', right: '0%', transform: 'translate(45%, -45%)'},
    bl: {bottom: '0%', left: '0%', transform: 'translate(-45%, 45%)'},
    br: {bottom: '0%', right: '0%', transform: 'translate(45%, 45%)'},
    'center-left': {top: '50%', left: '0%', transform: 'translate(-50%, -50%)'},
    'center-right': {top: '50%', right: '0%', transform: 'translate(50%, -50%)'},
    center: {top: '50%', left: '50%', transform: 'translate(-50%, -50%)'},
  }
  const pos = position[g.position]
  return {
    position: 'absolute' as const,
    ...pos,
    width: `${g.radius}px`,
    height: `${g.radius}px`,
    borderRadius: '9999px',
    background: `radial-gradient(circle, rgba(${base}, ${g.opacity}) 0%, rgba(0,0,0,0) 70%)`,
    filter: 'blur(60px)',
    pointerEvents: 'none' as const,
    zIndex: 1,
  }
}

function barStyle(b: AdBar) {
  const opacity = b.opacity ?? 0.28
  const angle = b.angle ?? 135
  const gradient =
    b.tone === 'green'
      ? `linear-gradient(90deg, rgba(5,150,105,0) 0%, rgba(59,181,109,${opacity}) 35%, rgba(59,181,109,${opacity}) 65%, rgba(5,150,105,0) 100%)`
      : `linear-gradient(90deg, rgba(30,58,138,0) 0%, rgba(37,99,235,${opacity}) 35%, rgba(37,99,235,${opacity}) 65%, rgba(30,58,138,0) 100%)`
  return {
    position: 'absolute' as const,
    top: `${b.y}%`,
    left: `${b.x}%`,
    width: `${b.length}%`,
    height: `${b.thickness}px`,
    background: gradient,
    transform: `rotate(${angle}deg)`,
    transformOrigin: 'left center',
    pointerEvents: 'none' as const,
    zIndex: 2,
    borderRadius: '2px',
  }
}

/** Highlight verde para palavra(s)-chave dentro de um texto. */
function splitEmphasis(text: string, word: string) {
  if (!word) return [{t: text, emph: false}]
  const idx = text.toLowerCase().indexOf(word.toLowerCase())
  if (idx < 0) return [{t: text, emph: false}]
  return [
    {t: text.slice(0, idx), emph: false},
    {t: text.slice(idx, idx + word.length), emph: true},
    {t: text.slice(idx + word.length), emph: false},
  ]
}

/**
 * Fallback gracioso: se a imagem hero ainda não foi gerada (404),
 * simplesmente removemos o <img> para que o wireframe de barras/glows
 * continue servindo como comp intermediária.
 */
function onHeroError(e: Event) {
  const el = e.target as HTMLImageElement
  el.style.display = 'none'
}
</script>

<template>
  <Card class="overflow-hidden border-border">
    <CardHeader class="px-6 py-6">
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30"
          >
            Anúncio {{ activeSlide.number }} / {{ adsTop5.slides.length }}
          </span>
          <span
            class="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30"
          >
            Meta Feed 1:1
          </span>
          <span
            class="inline-flex items-center rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-medium text-zinc-300 ring-1 ring-zinc-500/30"
          >
            {{ activeSlide.awareness }}
          </span>
        </div>
        <CardTitle class="text-3xl font-bold tracking-tight">
          {{ adsTop5.title }}
        </CardTitle>
        <p class="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {{ adsTop5.description }}
        </p>
        <div class="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-wider text-emerald-400">
            Destino da campanha
          </p>
          <p class="mt-1 text-sm text-foreground">{{ adsTop5.destination }}</p>
        </div>
      </div>
    </CardHeader>

    <Separator />

    <CardContent class="px-6 py-8">
      <div class="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)]">
        <!-- ─── MOCKUP DE FEED META ─── -->
        <div class="flex flex-col items-center gap-4">
          <div
            class="w-full max-w-[480px] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl dark:bg-zinc-950"
          >
            <!-- Header do post -->
            <div class="flex items-center gap-3 px-4 py-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full"
                style="background: linear-gradient(135deg, #000E50, #00185D);"
              >
                <img
                  src="/logo-icon.svg"
                  alt="Adsmagic"
                  class="h-5 w-5"
                />
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-1">
                  <span class="text-sm font-semibold">Adsmagic</span>
                  <span class="text-[10px] font-semibold text-blue-500">●</span>
                </div>
                <span class="text-[11px] text-muted-foreground">Patrocinado</span>
              </div>
            </div>

            <!-- Primary text (curto) -->
            <div class="px-4 pb-3">
              <p class="text-[13px] leading-snug text-foreground">
                {{ activeSlide.primaryTextShort }}
              </p>
            </div>

            <!-- Canvas 1:1 -->
            <div
              class="relative aspect-square w-full overflow-hidden"
              style="background: linear-gradient(160deg, #000E50 0%, #00185D 55%, #000A3A 100%);"
            >
              <!-- Hero photo (Nano Banana) -->
              <img
                v-if="activeSlide.heroImage"
                :src="activeSlide.heroImage"
                :alt="`Hero ${activeSlide.internalName}`"
                class="pointer-events-none absolute inset-0 h-full w-full object-cover"
                style="z-index: 1"
                loading="lazy"
                @error="onHeroError"
              />
              <!-- Scrim para garantir legibilidade dos overlays quando há foto -->
              <div
                v-if="activeSlide.heroImage"
                class="pointer-events-none absolute inset-0"
                style="
                  z-index: 1;
                  background:
                    linear-gradient(
                      180deg,
                      rgba(0, 10, 58, 0.55) 0%,
                      rgba(0, 10, 58, 0.18) 32%,
                      rgba(0, 10, 58, 0.18) 62%,
                      rgba(0, 10, 58, 0.72) 100%
                    );
                "
              />

              <!-- Glows -->
              <div
                v-for="(g, i) in activeSlide.glows"
                :key="`glow-${activeSlide.number}-${i}`"
                :style="glowStyle(g)"
              />

              <!-- Barras -->
              <div
                v-for="(b, i) in activeSlide.bars"
                :key="`bar-${activeSlide.number}-${i}`"
                :style="barStyle(b)"
              />

              <!-- Sparkle 4pt -->
              <svg
                v-if="activeSlide.showStar"
                class="pointer-events-none absolute"
                :style="{
                  bottom: '-40px',
                  right: '-40px',
                  width: '220px',
                  height: '220px',
                  zIndex: 2,
                  opacity: 0.55,
                }"
                viewBox="0 0 200 200"
                fill="none"
              >
                <path
                  d="M100 10 C 105 80 120 95 190 100 C 120 105 105 120 100 190 C 95 120 80 105 10 100 C 80 95 95 80 100 10 Z"
                  :fill="activeSlide.starColor === 'white' ? '#FFFFFF' : '#3BB56D'"
                />
              </svg>

              <!-- Sparkle pequeno branco decorativo -->
              <svg
                class="pointer-events-none absolute top-4 right-4 h-3 w-3"
                style="z-index: 3"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10 0 L11 9 L20 10 L11 11 L10 20 L9 11 L0 10 L9 9 Z"
                  fill="#EBF8F0"
                  fill-opacity="0.7"
                />
              </svg>

              <!-- Wordmark -->
              <img
                src="/logo-wordmark-white.svg"
                alt="Adsmagic"
                class="absolute left-4 top-4 h-4 w-auto opacity-95"
                style="z-index: 4"
              />

              <!-- Overlay editorial: kicker + headline 2 linhas -->
              <div
                class="relative flex h-full flex-col justify-center px-8"
                style="z-index: 4"
              >
                <p
                  class="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60"
                >
                  {{ activeSlide.overlayKicker }}
                </p>
                <h2
                  class="mt-3 text-[clamp(1.5rem,3.2vw,2.1rem)] font-bold leading-[1.05] tracking-tight text-white"
                >
                  <span>
                    <template
                      v-for="(chunk, i) in splitEmphasis(
                        activeSlide.overlayLine1,
                        activeSlide.emphasisWord,
                      )"
                      :key="`l1-${i}`"
                    >
                      <span v-if="chunk.emph" class="text-emerald-400">{{ chunk.t }}</span>
                      <span v-else>{{ chunk.t }}</span>
                    </template>
                  </span>
                  <br />
                  <span>
                    <template
                      v-for="(chunk, i) in splitEmphasis(
                        activeSlide.overlayLine2,
                        activeSlide.emphasisWord,
                      )"
                      :key="`l2-${i}`"
                    >
                      <span v-if="chunk.emph" class="text-emerald-400">{{ chunk.t }}</span>
                      <span v-else>{{ chunk.t }}</span>
                    </template>
                  </span>
                </h2>
              </div>

              <!-- Footer microcopy -->
              <div
                v-if="activeSlide.footerMicrocopy"
                class="absolute bottom-4 left-4 right-4 text-[10px] text-white/60"
                style="z-index: 4"
              >
                {{ activeSlide.footerMicrocopy }}
              </div>
            </div>

            <!-- Rodapé do post (headline + CTA) -->
            <div
              class="flex items-center justify-between gap-4 border-t border-zinc-200/70 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div class="min-w-0">
                <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
                  adsmagic.com.br
                </p>
                <p class="truncate text-sm font-semibold text-foreground">
                  {{ activeSlide.headlineAd }}
                </p>
                <p class="truncate text-xs text-muted-foreground">
                  {{ activeSlide.description }}
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-md bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                {{ activeSlide.ctaButton }}
              </button>
            </div>
          </div>

          <!-- Navegação -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-40"
              :disabled="activeIndex === 0"
              @click="prev"
            >
              ← Anterior
            </button>
            <div class="flex items-center gap-1.5">
              <button
                v-for="(s, i) in adsTop5.slides"
                :key="s.number"
                type="button"
                class="h-2.5 w-2.5 rounded-full ring-1 ring-border transition"
                :class="
                  i === activeIndex
                    ? 'bg-emerald-500 ring-emerald-400'
                    : 'bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                "
                :aria-label="`Ir para anúncio ${s.number}`"
                @click="select(i)"
              />
            </div>
            <button
              type="button"
              class="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-40"
              :disabled="activeIndex === adsTop5.slides.length - 1"
              @click="next"
            >
              Próximo →
            </button>
          </div>
        </div>

        <!-- ─── SIDE PANEL: COPY + CRIATIVO + NANO BANANA ─── -->
        <div class="flex flex-col gap-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Anúncio {{ activeSlide.number }} · {{ activeSlide.internalName }}
            </p>
            <p class="mt-1 text-lg font-semibold text-foreground">
              Ângulo modelado: {{ activeSlide.angle }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              Ref. Tintim: {{ activeSlide.referenceAdId }}
            </p>
          </div>

          <!-- Copy Meta Ads -->
          <section class="rounded-lg border border-border bg-card/60 p-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Copy Meta Ads
            </h3>
            <dl class="mt-3 grid gap-3 text-sm">
              <div>
                <dt class="text-xs font-medium uppercase text-muted-foreground">
                  Primary Text · curto (≤125)
                </dt>
                <dd class="mt-1 text-foreground">{{ activeSlide.primaryTextShort }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase text-muted-foreground">
                  Primary Text · expandido
                </dt>
                <dd class="mt-1 whitespace-pre-line leading-relaxed text-foreground">
                  {{ activeSlide.primaryTextLong }}
                </dd>
              </div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium uppercase text-muted-foreground">
                    Headline
                  </dt>
                  <dd class="mt-1 font-semibold text-foreground">
                    {{ activeSlide.headlineAd }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase text-muted-foreground">
                    Description
                  </dt>
                  <dd class="mt-1 text-foreground">{{ activeSlide.description }}</dd>
                </div>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase text-muted-foreground">
                  CTA
                </dt>
                <dd class="mt-1 text-foreground">{{ activeSlide.ctaButton }}</dd>
              </div>
            </dl>
          </section>

          <!-- Elementos do criativo -->
          <section class="rounded-lg border border-border bg-card/60 p-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Elementos do criativo
            </h3>
            <dl class="mt-3 grid gap-2 text-sm">
              <div>
                <dt class="text-xs font-medium uppercase text-muted-foreground">
                  Atores
                </dt>
                <dd class="text-foreground">{{ activeSlide.creativeElements.actors }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase text-muted-foreground">
                  Grafismos
                </dt>
                <dd class="text-foreground">
                  {{ activeSlide.creativeElements.graphics }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase text-muted-foreground">
                  Personagens narrativos
                </dt>
                <dd class="text-foreground">
                  {{ activeSlide.creativeElements.characters }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase text-muted-foreground">
                  Assets de marca
                </dt>
                <dd class="text-foreground">
                  {{ activeSlide.creativeElements.brandAssets }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium uppercase text-muted-foreground">
                  Contraste / destaque
                </dt>
                <dd class="text-foreground">
                  {{ activeSlide.creativeElements.contrast }}
                </dd>
              </div>
            </dl>
          </section>

          <!-- Prompt Nano Banana -->
          <section class="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Prompt Nano Banana
            </h3>
            <pre
              class="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground"
              >{{ activeSlide.nanoBananaPrompt }}</pre
            >
          </section>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
