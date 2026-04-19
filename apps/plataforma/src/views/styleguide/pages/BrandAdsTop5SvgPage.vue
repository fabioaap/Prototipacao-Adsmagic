<script setup lang="ts">
/**
 * BrandAdsTop5SvgPage.vue
 *
 * Página do Brand OS para visualização e download dos criativos
 * SVG text-only (Top 5 anúncios Meta).
 *
 * Formatos: 1:1 (Feed) e 9:16 (Story).
 * Modos: estático e animado (SMIL).
 */
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { adsTop5, type AdSlide } from '@/data/ads-top5'
import { SVG_FORMATS, type SvgAdFormat } from '@/data/ads-top5-svg-tokens'
import AdSvgCreative from './AdSvgCreative.vue'

const format = ref<SvgAdFormat>('square')
const animated = ref(false)

const formats: { key: SvgAdFormat; label: string; ratio: string }[] = [
  { key: 'square', label: 'Feed 1:1', ratio: '1:1' },
  { key: 'story', label: 'Story 9:16', ratio: '9:16' },
]

const slides = computed(() => adsTop5.slides)

// Refs for download
const creativeRefs = ref<InstanceType<typeof AdSvgCreative>[]>([])

function downloadAll() {
  creativeRefs.value.forEach(r => r?.downloadSvg())
}

function setCreativeRef(el: any, idx: number) {
  if (el) creativeRefs.value[idx] = el
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <Card>
      <CardHeader>
        <CardTitle class="text-lg font-semibold">
          Anúncios · SVG Text-Only
        </CardTitle>
        <p class="text-sm text-muted-foreground mt-1">
          Criativos text-only com o cover oficial do brand system, tipografia editorial,
          CTA em pill e grafismos por slide vindos de bars e glows. Cada card agora
          mostra hook, legenda e copy de apoio para revisar a peça completa.
        </p>
      </CardHeader>
    </Card>

    <!-- Controls -->
    <Card>
      <CardContent class="pt-5 pb-4">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Format Switcher -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Formato</span>
            <div class="flex rounded-lg border border-border overflow-hidden">
              <button
                v-for="f in formats"
                :key="f.key"
                class="px-3 py-1.5 text-sm font-medium transition-colors"
                :class="format === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted'"
                @click="format = f.key"
              >
                {{ f.label }}
              </button>
            </div>
          </div>

          <Separator orientation="vertical" class="h-6" />

          <!-- Animation Toggle -->
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Animação</span>
            <button
              class="relative w-10 h-5 rounded-full transition-colors"
              :class="animated ? 'bg-primary-600' : 'bg-muted'"
              @click="animated = !animated"
            >
              <span
                class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                :class="animated ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
            <span class="text-sm" :class="animated ? 'text-primary-600 font-medium' : 'text-muted-foreground'">
              {{ animated ? 'SMIL ON' : 'Estático' }}
            </span>
          </label>

          <div class="ml-auto">
            <button
              class="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors"
              @click="downloadAll"
            >
              ⬇ Download Todos ({{ format === 'square' ? '1:1' : '9:16' }})
            </button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Creatives Grid -->
    <div
      class="grid gap-8"
      :class="format === 'square' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'"
    >
      <Card
        v-for="(slide, idx) in slides"
        :key="slide.number"
        class="overflow-hidden"
      >
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                :class="'bg-primary-600/10 text-primary-600'"
              >
                {{ slide.number }}
              </span>
              <span class="text-sm font-medium">{{ slide.internalName }}</span>
            </div>
            <button
              class="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-transparent hover:border-border"
              @click="() => creativeRefs[idx]?.downloadSvg()"
            >
              ⬇ SVG
            </button>
          </div>
        </CardHeader>

        <CardContent class="pt-0">
          <!-- SVG Preview -->
          <div
            class="relative bg-[#000830] rounded-lg overflow-hidden"
            :class="format === 'story' ? 'max-w-[320px] mx-auto' : ''"
          >
            <AdSvgCreative
              :ref="(el: any) => setCreativeRef(el, idx)"
              :slide="slide"
              :format="format"
              :animated="animated"
            />
          </div>

          <!-- Hook + legenda -->
          <div class="mt-4 space-y-3">
            <div class="rounded-lg border border-border/70 bg-background/70 p-3">
              <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Hook
              </p>
              <p class="mt-1 text-sm font-medium leading-5 text-foreground">
                {{ slide.primaryTextShort }}
              </p>
            </div>

            <div class="rounded-lg border border-border/70 bg-background/70 p-3">
              <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Legenda
              </p>
              <p class="mt-1 text-sm leading-6 text-muted-foreground">
                {{ slide.primaryTextLong }}
              </p>
            </div>

            <div class="grid gap-2 text-xs sm:grid-cols-2">
              <div class="rounded-lg border border-border/60 bg-background/50 p-3">
                <p class="font-semibold uppercase tracking-[0.16em] text-muted-foreground">Headline</p>
                <p class="mt-1 text-sm font-medium leading-5 text-foreground">{{ slide.headlineAd }}</p>
              </div>
              <div class="rounded-lg border border-border/60 bg-background/50 p-3">
                <p class="font-semibold uppercase tracking-[0.16em] text-muted-foreground">Description</p>
                <p class="mt-1 text-sm leading-5 text-foreground">{{ slide.description }}</p>
              </div>
            </div>

            <p class="text-xs text-muted-foreground">
              Emphasis: <span class="text-primary-500 font-semibold">{{ slide.emphasisWord }}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Token Reference -->
    <Card>
      <CardHeader>
        <CardTitle class="text-sm font-semibold">Design Tokens · Referência Rápida</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <!-- Colors -->
          <div>
            <h4 class="font-semibold text-muted-foreground uppercase tracking-wider mb-2">Background</h4>
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded" style="background: #101827" />
                <span class="font-mono">#101827</span>
                <span class="text-muted-foreground">cover base</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded" style="background: #081120" />
                <span class="font-mono">#081120</span>
                <span class="text-muted-foreground">cover overlay</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded" style="background: #01084F" />
                <span class="font-mono">#01084F</span>
                <span class="text-muted-foreground">hero grafismo</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 rounded border border-white/10" style="background: #3BB56D" />
                <span class="font-mono">#3BB56D</span>
                <span class="text-muted-foreground">accent</span>
              </div>
            </div>
          </div>

          <!-- Typography -->
          <div>
            <h4 class="font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tipografia</h4>
            <div class="space-y-1">
              <div><span class="font-medium">Headline:</span> Inter 800 · 116px (1:1) / 140px (9:16)</div>
              <div><span class="font-medium">Kicker:</span> Inter 700 · 22px · tracking 5.5px</div>
              <div><span class="font-medium">Body:</span> Inter 500 · 32px / 38px</div>
              <div><span class="font-medium">Desc + Footer:</span> Inter italic 22/26px + footer 15/17px</div>
            </div>
          </div>

          <!-- Layout -->
          <div>
            <h4 class="font-semibold text-muted-foreground uppercase tracking-wider mb-2">Canvas</h4>
            <div class="space-y-1">
              <div><span class="font-medium">Feed 1:1:</span> 1080 × 1080px</div>
              <div><span class="font-medium">Story 9:16:</span> 1080 × 1920px</div>
              <div><span class="font-medium">Margin X:</span> 80px</div>
              <div><span class="font-medium">Cover background:</span> hero grafismo da wiki embutido no SVG</div>
              <div><span class="font-medium">Grafismos dinâmicos:</span> bars e glows vindos de cada slide</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
