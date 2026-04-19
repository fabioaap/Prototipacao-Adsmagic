<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  instagramCarousels,
  awarenessColors,
  accentMap,
  type InstagramCarousel,
  type CarouselSlide,
  type SlideAccent,
} from '@/data/instagram-carousels'

const activeCarouselIndex = ref(0)
const activeSlideIndex = ref(0)

const activeCarousel = computed<InstagramCarousel>(() => instagramCarousels[activeCarouselIndex.value])
const activeSlide = computed<CarouselSlide>(() => activeCarousel.value.slides[activeSlideIndex.value])

function selectCarousel(index: number) {
  activeCarouselIndex.value = index
  activeSlideIndex.value = 0
}

function prevSlide() {
  if (activeSlideIndex.value > 0) activeSlideIndex.value--
}

function nextSlide() {
  if (activeSlideIndex.value < activeCarousel.value.slides.length - 1) activeSlideIndex.value++
}

function getAccentColor(accent: SlideAccent) {
  return accentMap[accent]
}

function getAwarenessColor(awareness: string) {
  return awarenessColors[awareness] ?? '#6366f1'
}

// Gradient variants per carousel for visual variety
const gradients = [
  'linear-gradient(180deg, #000E50 0%, #001580 50%, #0043FF 100%)',
  'linear-gradient(160deg, #000E50 0%, #001070 50%, #0064E1 100%)',
  'linear-gradient(145deg, #000E50 0%, #001860 55%, #0043FF 100%)',
  'linear-gradient(170deg, #000E50 0%, #001480 50%, #0043FF 100%)',
  'linear-gradient(135deg, #000E50 0%, #002090 50%, #0064E1 100%)',
  'linear-gradient(155deg, #000E50 0%, #001280 45%, #0043FF 100%)',
  'linear-gradient(180deg, #000E50 0%, #000E50 40%, #001580 100%)',
]

function getGradient(index: number) {
  return gradients[index % gradients.length]
}
</script>

<template>
  <!-- ─── Header ─── -->
  <Card class="overflow-hidden border-border">
    <CardHeader class="px-6 py-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        Content System · StoryBrand SB7
      </p>
      <CardTitle class="mt-2 text-2xl tracking-tight">
        Instagram Carousels — Série Atribuição Real
      </CardTitle>
      <p class="mt-3 text-sm leading-6 text-muted-foreground max-w-2xl">
        7 carrosséis × 6 slides · Jornada completa de Unaware a Most Aware.
        Cada carrossel mapeia um elemento do BrandScript SB7 com humor na capa
        e seriedade na entrega.
      </p>
    </CardHeader>

    <Separator />

    <!-- ─── Carousel Selector ─── -->
    <CardContent class="p-6">
      <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        <button
          v-for="(carousel, i) in instagramCarousels"
          :key="carousel.id"
          class="shrink-0 rounded-xl border px-4 py-3 text-left transition-all duration-200 cursor-pointer min-w-[180px]"
          :class="[
            activeCarouselIndex === i
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border hover:border-primary/40 hover:bg-muted/50',
          ]"
          @click="selectCarousel(i)"
        >
          <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            C{{ carousel.number }}
          </span>
          <p class="mt-0.5 text-sm font-semibold leading-tight">{{ carousel.title }}</p>
          <span
            class="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
            :style="{ backgroundColor: getAwarenessColor(carousel.awareness) }"
          >
            {{ carousel.awareness }}
          </span>
        </button>
      </div>
    </CardContent>
  </Card>

  <!-- ─── Active Carousel Detail ─── -->
  <Card class="mt-4 overflow-hidden border-border">
    <CardHeader class="px-6 py-5">
      <div class="flex flex-wrap items-center gap-3">
        <span class="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {{ activeCarousel.sb7Element }}
        </span>
        <span class="text-xs text-muted-foreground">{{ activeCarousel.seriesTag }}</span>
      </div>
      <CardTitle class="mt-2 text-xl tracking-tight">
        C{{ activeCarousel.number }} — {{ activeCarousel.title }}
      </CardTitle>
      <p class="mt-1 text-sm text-muted-foreground">{{ activeCarousel.description }}</p>
    </CardHeader>

    <Separator />

    <CardContent class="p-6">
      <div class="grid gap-8 lg:grid-cols-[1fr_340px]">
        <!-- ── Slide Preview (1:1 Instagram Card) ── -->
        <div class="flex flex-col items-center">
          <div
            class="relative w-full max-w-[540px] overflow-hidden rounded-2xl shadow-2xl"
            style="aspect-ratio: 1 / 1"
          >
            <!-- Background -->
            <div
              class="absolute inset-0"
              :style="{ background: getGradient(activeCarouselIndex) }"
            />

            <!-- Grafismo decorations -->
            <div class="pointer-events-none absolute inset-0 overflow-hidden">
              <!-- Green diagonal bar -->
              <div
                class="absolute w-[48px] rounded-[24px] rotate-[135deg] opacity-60"
                :style="{
                  height: '340px',
                  background: 'linear-gradient(180deg, #059669 0%, #3BB56D 100%)',
                  bottom: '-100px',
                  left: '5%',
                }"
              />
              <!-- Blue diagonal bar -->
              <div
                class="absolute w-[56px] rounded-[28px] rotate-[135deg] opacity-[0.12]"
                :style="{
                  height: '400px',
                  background: 'linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%)',
                  top: '-100px',
                  right: '6%',
                }"
              />
              <!-- Subtle glow -->
              <div
                class="absolute w-[260px] h-[260px] rounded-full opacity-[0.10]"
                :style="{
                  background: `radial-gradient(circle, ${getAccentColor(activeSlide.accent)} 0%, transparent 70%)`,
                  top: '-60px',
                  right: '-60px',
                }"
              />
              <!-- Bottom glow -->
              <div
                class="absolute w-[200px] h-[200px] rounded-full opacity-[0.06]"
                style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); bottom: -50px; left: -30px"
              />
            </div>

            <!-- Slide Content -->
            <div class="relative flex h-full flex-col justify-between p-8 sm:p-10">
              <!-- Slide number indicator -->
              <div class="flex items-center justify-between">
                <span class="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60">
                  {{ activeSlide.layout }}
                </span>
                <span class="text-[11px] font-medium text-white/40">
                  {{ activeSlide.number }}/{{ activeCarousel.slides.length }}
                </span>
              </div>

              <!-- Main content area -->
              <div class="flex flex-1 flex-col justify-center py-6">
                <!-- Metric (if present) -->
                <div v-if="activeSlide.metric" class="mb-4">
                  <p
                    class="text-5xl font-extrabold leading-none sm:text-6xl"
                    :style="{ color: getAccentColor(activeSlide.accent) }"
                  >
                    {{ activeSlide.metric.value }}
                  </p>
                  <p class="mt-1 text-sm text-white/50">{{ activeSlide.metric.label }}</p>
                </div>

                <!-- Headline -->
                <h2
                  class="text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl"
                  style="white-space: pre-line"
                >
                  {{ activeSlide.headline }}
                </h2>

                <!-- Supporting text -->
                <p
                  v-if="activeSlide.supporting"
                  class="mt-3 text-base leading-relaxed sm:text-lg"
                  :style="{
                    color: activeSlide.layout === 'cta'
                      ? getAccentColor(activeSlide.accent)
                      : 'rgba(255,255,255,0.65)',
                    whiteSpace: 'pre-line',
                    fontStyle: activeSlide.layout === 'quote' ? 'italic' : 'normal',
                  }"
                >
                  {{ activeSlide.supporting }}
                </p>

                <!-- Bullets -->
                <ul v-if="activeSlide.bullets?.length" class="mt-4 space-y-2.5">
                  <li
                    v-for="(bullet, bi) in activeSlide.bullets"
                    :key="bi"
                    class="flex items-start gap-2.5 text-sm leading-relaxed text-white/80"
                  >
                    <span
                      class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      :style="{
                        backgroundColor:
                          activeSlide.layout === 'steps'
                            ? getAccentColor(activeSlide.accent)
                            : 'rgba(255,255,255,0.12)',
                        color: activeSlide.layout === 'steps' ? '#000E50' : 'rgba(255,255,255,0.7)',
                      }"
                    >
                      <template v-if="activeSlide.layout === 'steps'">{{ bi + 1 }}</template>
                      <template v-else>→</template>
                    </span>
                    <span>{{ bullet }}</span>
                  </li>
                </ul>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between">
                <!-- Emoji accent (subtle, not as icon) -->
                <span v-if="activeSlide.emoji" class="text-2xl opacity-60">
                  {{ activeSlide.emoji }}
                </span>
                <span v-else />

                <!-- Brand mark for CTA slides -->
                <div
                  v-if="activeSlide.layout === 'cta'"
                  class="flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4 text-white/60" fill="currentColor">
                    <path d="M12 0l3.09 8.26L24 9.27l-6.91 5.52L19.18 24 12 19.27 4.82 24l2.09-9.21L0 9.27l8.91-1.01z" />
                  </svg>
                  <span class="text-xs font-semibold tracking-wider text-white/50">ADSMAGIC</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Slide Navigation ── -->
          <div class="mt-5 flex items-center gap-4">
            <button
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors duration-150 cursor-pointer"
              :class="activeSlideIndex > 0 ? 'hover:bg-muted text-foreground' : 'opacity-30 cursor-default'"
              :disabled="activeSlideIndex === 0"
              @click="prevSlide"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Dot indicators -->
            <div class="flex gap-1.5">
              <button
                v-for="(slide, si) in activeCarousel.slides"
                :key="si"
                class="h-2 rounded-full transition-all duration-200 cursor-pointer"
                :class="si === activeSlideIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40'"
                @click="activeSlideIndex = si"
              />
            </div>

            <button
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors duration-150 cursor-pointer"
              :class="
                activeSlideIndex < activeCarousel.slides.length - 1
                  ? 'hover:bg-muted text-foreground'
                  : 'opacity-30 cursor-default'
              "
              :disabled="activeSlideIndex === activeCarousel.slides.length - 1"
              @click="nextSlide"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- ── Slide Info Panel ── -->
        <div class="space-y-4">
          <!-- Slide metadata -->
          <div class="rounded-xl border border-border bg-card p-5">
            <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Slide {{ activeSlide.number }} de {{ activeCarousel.slides.length }}
            </h3>
            <div class="mt-3 space-y-2.5">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Layout</span>
                <span
                  class="rounded-md bg-muted px-2 py-0.5 font-mono text-xs"
                >{{ activeSlide.layout }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Acento</span>
                <span class="flex items-center gap-1.5">
                  <span
                    class="h-3 w-3 rounded-full border border-border"
                    :style="{ backgroundColor: getAccentColor(activeSlide.accent) }"
                  />
                  <span class="font-mono text-xs">{{ activeSlide.accent }}</span>
                </span>
              </div>
              <div v-if="activeSlide.metric" class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Métrica</span>
                <span class="font-semibold">{{ activeSlide.metric.value }}</span>
              </div>
            </div>
          </div>

          <!-- Visual direction note -->
          <div class="rounded-xl border border-border bg-card p-5">
            <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Direção Visual
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
              {{ activeSlide.visualNote }}
            </p>
          </div>

          <!-- All slides thumbnail strip -->
          <div class="rounded-xl border border-border bg-card p-5">
            <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
              Todos os Slides
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="(slide, si) in activeCarousel.slides"
                :key="si"
                class="relative overflow-hidden rounded-lg transition-all duration-150 cursor-pointer"
                :class="si === activeSlideIndex ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-60 hover:opacity-90'"
                style="aspect-ratio: 1 / 1"
                @click="activeSlideIndex = si"
              >
                <div
                  class="absolute inset-0"
                  :style="{ background: getGradient(activeCarouselIndex) }"
                />
                <div class="relative flex h-full flex-col items-center justify-center p-2">
                  <span class="text-[10px] font-bold text-white/50">S{{ slide.number }}</span>
                  <p class="mt-0.5 text-center text-[9px] font-medium leading-tight text-white/80 line-clamp-3">
                    {{ slide.headline.split('\n')[0] }}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- ─── Full Series Overview ─── -->
  <Card class="mt-4 overflow-hidden border-border">
    <CardHeader class="px-6 py-5">
      <CardTitle class="text-lg tracking-tight">Visão Geral da Série</CardTitle>
      <p class="mt-1 text-sm text-muted-foreground">
        Jornada StoryBrand completa — 7 carrosséis mapeados do Character ao Success.
      </p>
    </CardHeader>

    <Separator />

    <CardContent class="p-6">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <button
          v-for="(carousel, i) in instagramCarousels"
          :key="carousel.id"
          class="group relative overflow-hidden rounded-xl text-left transition-all duration-200 cursor-pointer"
          :class="
            activeCarouselIndex === i
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              : 'hover:ring-1 hover:ring-primary/30'
          "
          @click="selectCarousel(i)"
        >
          <!-- Mini preview background -->
          <div
            class="relative overflow-hidden p-5"
            style="aspect-ratio: 4 / 3"
            :style="{ background: getGradient(i) }"
          >
            <!-- Mini grafismo -->
            <div class="pointer-events-none absolute inset-0">
              <div
                class="absolute w-[20px] rounded-[10px] rotate-[135deg] opacity-50"
                style="height: 140px; background: linear-gradient(180deg, #059669, #3BB56D); bottom: -40px; left: 8%"
              />
              <div
                class="absolute w-[24px] rounded-[12px] rotate-[135deg] opacity-[0.10]"
                style="height: 160px; background: linear-gradient(180deg, #1E3A8A, #2563EB); top: -40px; right: 8%"
              />
            </div>

            <div class="relative">
              <span class="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/50">
                C{{ carousel.number }}
              </span>
              <p class="mt-2 text-sm font-bold leading-snug text-white line-clamp-2">
                {{ carousel.slides[0].headline.split('\n')[0] }}
              </p>
            </div>
          </div>

          <!-- Card info -->
          <div class="border border-t-0 border-border bg-card px-4 py-3 rounded-b-xl">
            <p class="text-sm font-semibold leading-tight">{{ carousel.title }}</p>
            <p class="mt-0.5 text-[11px] text-muted-foreground">{{ carousel.sb7Element }}</p>
            <span
              class="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-medium text-white"
              :style="{ backgroundColor: getAwarenessColor(carousel.awareness) }"
            >
              {{ carousel.awareness }}
            </span>
          </div>
        </button>
      </div>
    </CardContent>
  </Card>
</template>
