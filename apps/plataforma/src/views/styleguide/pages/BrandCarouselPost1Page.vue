<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { post1, type Post1Slide, type GrafismoBar, type CornerGlow } from '@/data/post1-carousel'

const activeIndex = ref(0)
const activeSlide = computed<Post1Slide>(() => post1.slides[activeIndex.value])

function prev() {
  if (activeIndex.value > 0) activeIndex.value--
}
function next() {
  if (activeIndex.value < post1.slides.length - 1) activeIndex.value++
}
function select(i: number) {
  activeIndex.value = i
}

/** Tailwind-free positional math for glows (absolute, % based). */
function glowStyle(g: CornerGlow) {
  const color =
    g.color === 'green'
      ? 'rgba(59, 181, 109, ALPHA)'
      : g.color === 'blue'
        ? 'rgba(30, 58, 138, ALPHA)'
        : 'rgba(0, 8, 42, ALPHA)'
  const position: Record<CornerGlow['position'], { top?: string; left?: string; right?: string; bottom?: string; transform: string }> = {
    tl: { top: '0%', left: '0%', transform: 'translate(-45%, -45%)' },
    tr: { top: '0%', right: '0%', transform: 'translate(45%, -45%)' },
    bl: { bottom: '0%', left: '0%', transform: 'translate(-45%, 45%)' },
    br: { bottom: '0%', right: '0%', transform: 'translate(45%, 45%)' },
    'center-left': { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' },
    'center-right': { top: '50%', right: '0%', transform: 'translate(50%, -50%)' },
  }
  const pos = position[g.position]
  return {
    position: 'absolute' as const,
    ...pos,
    width: `${g.radius}px`,
    height: `${g.radius}px`,
    borderRadius: '9999px',
    background: `radial-gradient(circle, ${color.replace('ALPHA', String(g.opacity))} 0%, rgba(0,0,0,0) 70%)`,
    filter: 'blur(60px)',
    pointerEvents: 'none' as const,
    zIndex: 1,
  }
}

function barStyle(b: GrafismoBar) {
  const opacity = b.opacity ?? 0.24
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
</script>

<template>
  <Card class="overflow-hidden border-border">
    <CardHeader class="px-6 py-6">
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
            Post 1 / 9
          </span>
          <span class="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30">
            {{ post1.sb7Element }}
          </span>
          <span class="inline-flex items-center rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-medium text-zinc-300 ring-1 ring-zinc-500/30">
            {{ post1.awareness }}
          </span>
        </div>
        <CardTitle class="text-3xl font-bold tracking-tight">
          {{ post1.title }}
        </CardTitle>
        <p class="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {{ post1.description }}
        </p>
        <div class="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-wider text-emerald-400">CTA do post</p>
          <p class="mt-1 text-sm text-foreground">{{ post1.cta }}</p>
        </div>
      </div>
    </CardHeader>

    <Separator />

    <CardContent class="px-6 py-8">
      <div class="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)]">
        <!-- ─── CANVAS 1:1 ─── -->
        <div class="flex flex-col items-center gap-4">
          <div
            class="relative aspect-square w-full max-w-[640px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/5"
            style="background: linear-gradient(160deg, #000E50 0%, #00185D 55%, #000A3A 100%);"
          >
            <!-- Glows -->
            <div
              v-for="(g, i) in activeSlide.glows"
              :key="`glow-${activeSlide.number}-${i}`"
              :style="glowStyle(g)"
            />

            <!-- Diagonal bars -->
            <div
              v-for="(b, i) in activeSlide.bars"
              :key="`bar-${activeSlide.number}-${i}`"
              :style="barStyle(b)"
            />

            <!-- Decorative cross-star accents (top corners) -->
            <svg
              class="pointer-events-none absolute top-5 right-5 h-4 w-4"
              style="z-index: 3"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M10 0 L11 9 L20 10 L11 11 L10 20 L9 11 L0 10 L9 9 Z" fill="#EBF8F0" fill-opacity="0.7" />
            </svg>
            <svg
              v-if="activeSlide.number % 2 === 1"
              class="pointer-events-none absolute top-12 right-14 h-3 w-3"
              style="z-index: 3"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M10 0 L11 9 L20 10 L11 11 L10 20 L9 11 L0 10 L9 9 Z" fill="#3BB56D" fill-opacity="0.9" />
            </svg>

            <!-- Large brand sparkle (4-pointed concave star) as hero motif -->
            <svg
              v-if="activeSlide.showStar"
              class="pointer-events-none absolute"
              :style="{
                bottom: '-60px',
                right: '-60px',
                width: '320px',
                height: '320px',
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

            <!-- ─────────── COMPOSITION 1: MANIFESTO ─────────── -->
            <div
              v-if="activeSlide.composition === 'manifesto'"
              class="relative flex h-full flex-col justify-between p-10"
              style="z-index: 4"
            >
              <img src="/logo-wordmark-white.svg" alt="Adsmagic" class="h-6 w-auto opacity-95" />
              <div class="max-w-[85%]">
                <h2 class="text-[clamp(2rem,4.2vw,2.75rem)] font-bold leading-[1.08] tracking-tight text-white">
                  Se você ainda entrega <span class="text-emerald-400">lead</span> quando o cliente quer
                  <span class="text-white">receita</span>, sua agência já entra na reunião
                  <span class="relative inline-block">
                    perdendo<span class="absolute -bottom-1 left-0 h-[3px] w-full bg-emerald-400" />
                  </span>.
                </h2>
                <p class="mt-5 max-w-md text-sm leading-relaxed text-white/70">
                  {{ activeSlide.supporting }}
                </p>
              </div>
              <div class="flex items-end justify-between">
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/50">Manifesto · 01/10</span>
              </div>
            </div>

            <!-- ─────────── COMPOSITION 2: IDENTITY ─────────── -->
            <div
              v-else-if="activeSlide.composition === 'identity'"
              class="relative grid h-full grid-cols-[1.1fr_0.9fr] gap-0"
              style="z-index: 4"
            >
              <div class="flex flex-col justify-between p-10">
                <img src="/logo-wordmark-white.svg" alt="Adsmagic" class="h-6 w-auto" />
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Quem é o herói</p>
                  <h2 class="mt-3 text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-[1.1] tracking-tight text-white">
                    O Adsmagic não fala com <span class="text-emerald-400">qualquer</span> operação.
                  </h2>
                  <p class="mt-4 text-sm leading-relaxed text-white/75">
                    {{ activeSlide.supporting }}
                  </p>
                </div>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/40">02/10</span>
              </div>
              <div class="relative overflow-hidden border-l border-white/10">
                <div class="absolute inset-0 bg-gradient-to-br from-transparent via-[#000E50]/30 to-[#000A3A]/80" />
                <img
                  src="/img/brand/photo-mood-operational.svg"
                  alt="Rotina de agência"
                  class="h-full w-full object-cover"
                />
              </div>
            </div>

            <!-- ─────────── COMPOSITION 3: SPLIT-TENSION ─────────── -->
            <div
              v-else-if="activeSlide.composition === 'split-tension'"
              class="relative grid h-full grid-cols-[0.8fr_1.2fr]"
              style="z-index: 4"
            >
              <div class="relative overflow-hidden border-r border-white/10">
                <img
                  src="/img/brand/photo-mood-authority.svg"
                  alt="Reunião executiva"
                  class="h-full w-full object-cover opacity-85"
                />
                <div class="absolute inset-0 bg-gradient-to-r from-transparent to-[#000E50]/70" />
              </div>
              <div class="flex flex-col justify-between p-10">
                <img src="/logo-wordmark-white.svg" alt="Adsmagic" class="h-5 w-auto self-end opacity-70" />
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Você entrega</p>
                  <p class="mt-2 text-lg font-medium text-white/90">
                    clique · lead · CPL · volume
                  </p>
                  <div class="my-5 h-px w-full bg-gradient-to-r from-emerald-400/60 to-transparent" />
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">O cliente devolve</p>
                  <h2 class="mt-3 text-[clamp(1.8rem,3.4vw,2.5rem)] font-bold leading-[1.1] tracking-tight text-white">
                    "O que disso virou <span class="underline decoration-emerald-400 decoration-[3px] underline-offset-4">dinheiro</span>?"
                  </h2>
                </div>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/40">03/10</span>
              </div>
            </div>

            <!-- ─────────── COMPOSITION 4: BROKEN-DIAGRAM ─────────── -->
            <div
              v-else-if="activeSlide.composition === 'broken-diagram'"
              class="relative flex h-full flex-col justify-between p-10"
              style="z-index: 4"
            >
              <div class="max-w-[80%]">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">A quebra</p>
                <h2 class="mt-3 text-[clamp(1.8rem,3.6vw,2.5rem)] font-bold leading-[1.1] tracking-tight text-white">
                  O anúncio termina no lead.<br />
                  <span class="text-emerald-400">O problema do cliente não.</span>
                </h2>
              </div>
              <div class="relative flex items-center justify-center gap-0 py-6">
                <div class="flex flex-1 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-4 backdrop-blur-sm">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-blue-300">Ads</span>
                </div>
                <svg class="h-6 w-8 text-white/40" viewBox="0 0 32 24" fill="none">
                  <path d="M0 12 L24 12 M18 6 L26 12 L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <div class="flex flex-1 items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-4 backdrop-blur-sm">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-blue-300">WhatsApp</span>
                </div>
                <!-- VISIBLE GAP -->
                <div class="flex flex-1 items-center justify-center">
                  <div class="h-[2px] flex-1 border-t-2 border-dashed border-rose-400/50" />
                  <span class="mx-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">gap</span>
                  <div class="h-[2px] flex-1 border-t-2 border-dashed border-rose-400/50" />
                </div>
                <div class="flex flex-1 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-4 opacity-50">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-white/60">Fechamento</span>
                </div>
              </div>
              <div class="flex items-end justify-between">
                <p class="max-w-md text-sm leading-relaxed text-white/70">{{ activeSlide.supporting }}</p>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/40">04/10</span>
              </div>
            </div>

            <!-- ─────────── COMPOSITION 5: CATEGORY-STACK ─────────── -->
            <div
              v-else-if="activeSlide.composition === 'category-stack'"
              class="relative grid h-full grid-cols-[1fr_0.9fr] gap-8 p-10"
              style="z-index: 4"
            >
              <div class="flex flex-col justify-between">
                <div class="flex items-center gap-3">
                  <img src="/logo-icon.svg" alt="" class="h-8 w-8" />
                  <span class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Categoria</span>
                </div>
                <div>
                  <h2 class="text-[clamp(1.5rem,2.9vw,2.1rem)] font-bold leading-[1.1] tracking-tight text-white">
                    Ligamos o que o mercado insiste em <span class="text-emerald-400">separar</span>.
                  </h2>
                  <p class="mt-4 text-sm leading-relaxed text-white/70">{{ activeSlide.supporting }}</p>
                </div>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/40">05/10</span>
              </div>
              <div class="flex flex-col justify-center gap-3">
                <div class="group rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-4 backdrop-blur-sm">
                  <span class="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">01 · Aquisição</span>
                  <span class="mt-1 block text-sm font-semibold text-white">Ads</span>
                </div>
                <div class="flex justify-center">
                  <svg class="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4 L12 20 M6 14 L12 20 L18 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>
                <div class="rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-4 backdrop-blur-sm">
                  <span class="block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">02 · Conversa</span>
                  <span class="mt-1 block text-sm font-semibold text-white">WhatsApp</span>
                </div>
                <div class="flex justify-center">
                  <svg class="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4 L12 20 M6 14 L12 20 L18 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>
                <div class="rounded-xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/25 to-emerald-500/10 p-4 backdrop-blur-sm">
                  <span class="block text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">03 · Fechamento</span>
                  <span class="mt-1 block text-sm font-semibold text-white">Comercial</span>
                </div>
              </div>
            </div>

            <!-- ─────────── COMPOSITION 6: MECHANISM-ASYM ─────────── -->
            <div
              v-else-if="activeSlide.composition === 'mechanism-asym'"
              class="relative grid h-full grid-cols-[1.15fr_0.85fr] gap-6 p-10"
              style="z-index: 4"
            >
              <div class="flex flex-col justify-between">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Mecanismo</p>
                <div class="space-y-4">
                  <h2 class="text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold leading-[1.12] tracking-tight text-white">
                    Quando aquisição, conversa e fechamento contam <span class="text-rose-300">histórias diferentes</span>, a agência vira refém.
                  </h2>
                  <div class="rounded-lg border-l-2 border-emerald-400 bg-emerald-500/5 px-4 py-3">
                    <p class="text-sm font-medium text-white">
                      Quando contam a <span class="text-emerald-400">mesma história</span>, decisão volta a ter direção.
                    </p>
                  </div>
                </div>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/40">06/10</span>
              </div>
              <div class="relative flex items-center justify-center">
                <img
                  src="/img/brand/illus-data-flow.svg"
                  alt="Fluxo de dados"
                  class="h-auto w-full max-w-[220px] opacity-95"
                />
              </div>
            </div>

            <!-- ─────────── COMPOSITION 7: BENTO-SIGNALS ─────────── -->
            <div
              v-else-if="activeSlide.composition === 'bento-signals'"
              class="relative flex h-full flex-col gap-6 p-10"
              style="z-index: 4"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">O que você passa a ver</p>
                  <h2 class="mt-2 max-w-[80%] text-[clamp(1.4rem,2.7vw,2rem)] font-bold leading-[1.1] tracking-tight text-white">
                    O que <span class="text-emerald-400">pesa de verdade</span> na conta.
                  </h2>
                </div>
                <img src="/logo-wordmark-white.svg" alt="Adsmagic" class="h-5 w-auto opacity-70" />
              </div>
              <div class="grid flex-1 grid-cols-2 gap-3">
                <div class="rounded-xl border border-blue-400/25 bg-blue-500/10 p-4 backdrop-blur-sm">
                  <div class="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-400/20">
                    <span class="text-sm">👆</span>
                  </div>
                  <span class="block text-[10px] font-bold uppercase tracking-wider text-blue-300">Clique</span>
                  <span class="mt-0.5 block text-sm font-semibold text-white">Quem chegou</span>
                </div>
                <div class="rounded-xl border border-blue-400/25 bg-blue-500/10 p-4 backdrop-blur-sm">
                  <div class="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-400/20">
                    <span class="text-sm">💬</span>
                  </div>
                  <span class="block text-[10px] font-bold uppercase tracking-wider text-blue-300">Proposta</span>
                  <span class="mt-0.5 block text-sm font-semibold text-white">Quem engajou</span>
                </div>
                <div class="rounded-xl border border-emerald-400/35 bg-emerald-500/15 p-4 backdrop-blur-sm">
                  <div class="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/25">
                    <span class="text-sm">✅</span>
                  </div>
                  <span class="block text-[10px] font-bold uppercase tracking-wider text-emerald-300">Aprovado</span>
                  <span class="mt-0.5 block text-sm font-semibold text-white">Quem disse sim</span>
                </div>
                <div class="relative overflow-hidden rounded-xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500/30 to-emerald-500/15 p-4 backdrop-blur-sm">
                  <div class="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/40">
                    <img src="/img/brand/icon-pictogram-growth.svg" alt="" class="h-4 w-4" />
                  </div>
                  <span class="block text-[10px] font-bold uppercase tracking-wider text-emerald-200">Compra</span>
                  <span class="mt-0.5 block text-sm font-semibold text-white">Quem virou receita</span>
                </div>
              </div>
              <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/40">07/10</span>
            </div>

            <!-- ─────────── COMPOSITION 8: GUIDE-EDITORIAL ─────────── -->
            <div
              v-else-if="activeSlide.composition === 'guide-editorial'"
              class="relative flex h-full flex-col justify-between p-10"
              style="z-index: 4"
            >
              <img src="/logo-wordmark-white.svg" alt="Adsmagic" class="h-6 w-auto opacity-90" />
              <div class="flex items-start gap-5">
                <img src="/img/brand/icon-callout-marker.svg" alt="" class="mt-2 h-10 w-10 shrink-0" />
                <h2 class="text-[clamp(1.6rem,3.1vw,2.3rem)] font-bold leading-[1.1] tracking-tight text-white">
                  Devolver <span class="text-emerald-400">sinal certo</span> e contexto comercial. Esse é o papel do Adsmagic.
                </h2>
              </div>
              <div class="space-y-2">
                <p class="max-w-lg text-sm leading-relaxed text-white/70">{{ activeSlide.supporting }}</p>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/40">08/10 · Guia</span>
              </div>
            </div>

            <!-- ─────────── COMPOSITION 9: COMPARATIVE-STRIKES ─────────── -->
            <div
              v-else-if="activeSlide.composition === 'comparative-strikes'"
              class="relative grid h-full grid-cols-[1fr_1fr] gap-6 p-10"
              style="z-index: 4"
            >
              <div class="flex flex-col justify-between">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">O que NÃO é</p>
                <div class="space-y-3">
                  <div class="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <span class="block text-[10px] font-bold uppercase tracking-wider text-rose-300/80">— Não</span>
                    <span class="mt-1 block text-base font-medium text-white/60 line-through decoration-rose-400 decoration-2">
                      CRM para tocar operação inteira
                    </span>
                  </div>
                  <div class="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <span class="block text-[10px] font-bold uppercase tracking-wider text-rose-300/80">— Não</span>
                    <span class="mt-1 block text-base font-medium text-white/60 line-through decoration-rose-400 decoration-2">
                      Chatbot para mascarar atendimento
                    </span>
                  </div>
                  <div class="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <span class="block text-[10px] font-bold uppercase tracking-wider text-rose-300/80">— Não</span>
                    <span class="mt-1 block text-base font-medium text-white/60 line-through decoration-rose-400 decoration-2">
                      Rastreador de conversa para gerar volume vazio
                    </span>
                  </div>
                </div>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/40">09/10</span>
              </div>
              <div class="flex flex-col justify-center">
                <div class="rounded-xl border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-500/20 to-blue-500/15 p-6 backdrop-blur-sm">
                  <div class="mb-3 flex items-center gap-2">
                    <img src="/logo-icon.svg" alt="" class="h-6 w-6" />
                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">O que É</span>
                  </div>
                  <p class="text-lg font-bold leading-[1.15] text-white">
                    A camada de <span class="text-emerald-400">prova de receita</span> aplicada à mídia.
                  </p>
                </div>
              </div>
            </div>

            <!-- ─────────── COMPOSITION 10: CTA-BOOKMARK ─────────── -->
            <div
              v-else-if="activeSlide.composition === 'cta-bookmark'"
              class="relative flex h-full flex-col items-center justify-between p-10 text-center"
              style="z-index: 4"
            >
              <div class="flex items-center gap-3">
                <img src="/logo-icon.svg" alt="" class="h-8 w-8" />
                <img src="/logo-wordmark-white.svg" alt="Adsmagic" class="h-6 w-auto" />
              </div>
              <div class="max-w-[80%] space-y-5">
                <h2 class="text-[clamp(1.7rem,3.3vw,2.4rem)] font-bold leading-[1.1] tracking-tight text-white">
                  Se isso já descreve a sua conta, <span class="text-emerald-400">salva este post</span>.
                </h2>
                <p class="text-sm leading-relaxed text-white/70">
                  No próximo, a frase que muda o jogo fica explícita: pare de reportar lead e comece a provar venda.
                </p>
              </div>
              <div class="flex flex-col items-center gap-3">
                <div class="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 shadow-lg shadow-emerald-500/30">
                  <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 3 C 4 3 3 4 3 5 L 3 21 L 12 16 L 21 21 L 21 5 C 21 4 20 3 19 3 L 5 3 Z" />
                  </svg>
                  <span class="text-sm font-bold uppercase tracking-[0.15em] text-white">Salva este post</span>
                </div>
                <span class="text-xs font-medium uppercase tracking-[0.2em] text-white/40">10/10 · @adsmagic.io</span>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex w-full max-w-[640px] items-center justify-between">
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
              :disabled="activeIndex === 0"
              @click="prev"
              aria-label="Slide anterior"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18 L9 12 L15 6" />
              </svg>
            </button>
            <div class="flex items-center gap-2">
              <button
                v-for="(s, i) in post1.slides"
                :key="s.number"
                type="button"
                class="h-2 rounded-full transition-all"
                :class="i === activeIndex ? 'w-8 bg-emerald-400' : 'w-2 bg-zinc-600 hover:bg-zinc-500'"
                :aria-label="`Slide ${s.number}`"
                @click="select(i)"
              />
            </div>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
              :disabled="activeIndex === post1.slides.length - 1"
              @click="next"
              aria-label="Próximo slide"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 6 L15 12 L9 18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- ─── INFO PANEL ─── -->
        <div class="flex flex-col gap-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Slide {{ activeSlide.number }} · {{ activeSlide.composition }}
            </p>
            <h3 class="mt-2 text-xl font-bold leading-tight text-foreground">
              {{ activeSlide.objective }}
            </h3>
          </div>

          <div class="rounded-lg border border-border bg-muted/40 p-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Headline</p>
            <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">{{ activeSlide.headline }}</p>
            <template v-if="activeSlide.supporting">
              <p class="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Apoio</p>
              <p class="mt-1 text-sm leading-relaxed text-muted-foreground">{{ activeSlide.supporting }}</p>
            </template>
          </div>

          <div class="rounded-lg border border-border p-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Direção visual</p>
            <p class="mt-2 text-sm leading-relaxed text-foreground">{{ activeSlide.visualNote }}</p>
          </div>

          <div class="rounded-lg border border-border p-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assets aplicados</p>
            <ul class="mt-2 space-y-1.5">
              <li
                v-for="a in activeSlide.assets"
                :key="a"
                class="flex items-center gap-2 text-xs text-foreground"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <code class="font-mono">{{ a }}</code>
              </li>
            </ul>
          </div>

          <div class="rounded-lg border border-border p-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grafismos</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(b, i) in activeSlide.bars"
                :key="i"
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ring-1"
                :class="b.tone === 'green'
                  ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30'
                  : 'bg-blue-500/10 text-blue-300 ring-blue-500/30'"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="b.tone === 'green' ? 'bg-emerald-400' : 'bg-blue-400'" />
                barra {{ b.tone }} · {{ b.angle ?? 135 }}° · op {{ b.opacity ?? 0.24 }}
              </span>
            </div>
          </div>

          <details class="rounded-lg border border-border p-4">
            <summary class="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prompt Nano Banana (fonte)
            </summary>
            <p class="mt-3 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{{ activeSlide.nanoBananaPrompt }}</p>
          </details>
        </div>
      </div>

      <!-- ─── THUMBNAIL STRIP ─── -->
      <div class="mt-10">
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          10 slides da travessia
        </p>
        <div class="grid grid-cols-5 gap-3 lg:grid-cols-10">
          <button
            v-for="(s, i) in post1.slides"
            :key="s.number"
            type="button"
            class="group relative aspect-square overflow-hidden rounded-lg ring-1 transition-all"
            :class="i === activeIndex ? 'ring-2 ring-emerald-400' : 'ring-white/10 hover:ring-white/30'"
            style="background: linear-gradient(160deg, #000E50 0%, #00185D 55%, #000A3A 100%);"
            @click="select(i)"
          >
            <span class="absolute left-1.5 top-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white/90 backdrop-blur-sm">
              {{ String(s.number).padStart(2, '0') }}
            </span>
            <span class="absolute bottom-1.5 left-1.5 right-1.5 truncate text-[8px] font-medium uppercase tracking-wider text-white/60">
              {{ s.composition }}
            </span>
          </button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
