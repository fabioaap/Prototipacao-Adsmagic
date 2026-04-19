<script setup lang="ts">
import { ArrowRight, MessageSquare, Quote, Target, Zap } from 'lucide-vue-next'
import BrandFlowSection from '@/components/brand-system/BrandFlowSection.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import BrandPricingCard from '@/components/brand-system/BrandPricingCard.vue'
import BrandTrustRibbon from '@/components/brand-system/BrandTrustRibbon.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DsShowcaseItem } from './dsContent'

interface Props {
  item: DsShowcaseItem
}

const props = defineProps<Props>()

const dsFlowSteps = [
  {
    badge: '01',
    icon: Target,
    label: 'Ads',
    description: 'Captura o clique e preserva origem, campanha, conjunto e criativo.',
  },
  {
    badge: '02',
    icon: MessageSquare,
    label: 'WhatsApp',
    description: 'Lê a conversa e identifica proposta, aprovação e venda.',
  },
  {
    badge: '03',
    icon: Zap,
    label: 'Fechamento',
    description: 'Devolve sinal qualificado para otimização e leitura do funil.',
  },
]

function isVariant(...variants: DsShowcaseItem['variant'][]) {
  return variants.includes(props.item.variant)
}

function surfaceClass(variant: DsShowcaseItem['variant']) {
  if (['headline-band', 'offer-stack', 'split-pattern', 'overlay-pattern', 'rail-pattern', 'ads-revenue', 'ads-anti-cpl', 'ads-funnel', 'lp-hero', 'lp-flow', 'lp-offer'].includes(variant)) {
    return 'bg-[linear-gradient(135deg,#010543,#0d1a74)] text-white'
  }

  if (['centered-pattern', 'series-pattern', 'lp-benefits'].includes(variant)) {
    return 'bg-[linear-gradient(135deg,#eef2ff,#dbeafe)] text-slate-950'
  }

  return 'bg-[linear-gradient(135deg,#111827,#1f2937)] text-white'
}

function buttonVariant(variant: DsShowcaseItem['variant']) {
  return ['headline-band', 'offer-stack', 'rail-pattern', 'offer-card', 'ads-revenue', 'ads-anti-cpl', 'ads-funnel', 'lp-hero', 'lp-offer'].includes(variant) ? 'secondary' : 'outline'
}

function logoSrc(variant: DsShowcaseItem['variant']) {
  return ['centered-pattern', 'series-pattern', 'lp-benefits'].includes(variant) ? '/logo-icon.svg' : '/logo-wordmark-white.svg'
}
</script>

<template>
  <Card class="overflow-hidden border-border bg-card shadow-none">
    <div class="relative min-h-[228px] overflow-hidden border-b border-border p-4" :class="surfaceClass(props.item.variant)">
      <div class="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top_right,rgba(59,181,109,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.38),transparent_36%)]"></div>

      <div v-if="isVariant('headline-band')" class="relative flex h-full flex-col justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Creative primitive</p>
          <h3 class="mt-3 max-w-[85%] text-2xl font-semibold leading-tight">{{ props.item.headline }}</h3>
        </div>
        <div class="flex items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            <span v-for="chip in props.item.chips ?? []" :key="chip" class="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">{{ chip }}</span>
          </div>
          <Button :variant="buttonVariant(props.item.variant)" size="sm" class="shadow-none">
            Abrir
            <ArrowRight class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div v-else-if="isVariant('proof-strip')" class="relative flex h-full flex-col justify-between">
        <div class="flex flex-wrap gap-2">
          <span v-for="chip in props.item.chips ?? []" :key="chip" class="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/75">{{ chip }}</span>
        </div>
        <div>
          <div class="text-2xl font-semibold leading-tight">{{ props.item.headline }}</div>
          <BrandTrustRibbon class="mt-5" tone="dark" size="compact" />
        </div>
      </div>

      <div v-else-if="isVariant('offer-stack', 'offer-card')" class="relative flex h-full flex-col justify-between">
        <BrandPricingCard
          variant="full"
          label="Offer stack"
          name="Plano Growth"
          audience="Diagnóstico, setup e templates com foco em clareza comercial e receita rastreável."
          price="2.9k"
          period="/projeto"
          billing-info="Setup inicial + piloto validado em sprint curta"
          cta-label="Quero ver"
          :featured="props.item.variant === 'offer-card'"
          :features="[
            'Setup + templates + handoff',
            'Pilot sprint com validação',
            'Governança de peças e ajustes',
          ]"
          footnote="Oferta pensada para LP, deck e ads de conversão."
        />
      </div>

      <div v-else-if="isVariant('quote-block', 'testimonial-card')" class="relative flex h-full flex-col justify-between">
        <Quote class="h-8 w-8 text-white/35" />
        <div>
          <h3 class="max-w-[88%] text-xl font-semibold leading-tight">{{ props.item.headline }}</h3>
          <div class="mt-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">AM</div>
            <div class="text-sm text-white/70">AdsMagic team</div>
          </div>
        </div>
      </div>

      <div v-else-if="isVariant('metric-card')" class="relative flex h-full flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Metric card</span>
          <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="h-7 w-auto opacity-80" />
        </div>
        <div>
          <div class="text-5xl font-semibold tracking-tight">{{ props.item.headline }}</div>
          <div class="mt-4 grid grid-cols-6 gap-1.5">
            <span v-for="bar in [35,48,42,60,72,80]" :key="bar" class="rounded-full bg-white/15" :style="{ height: `${bar}px` }"></span>
          </div>
        </div>
      </div>

      <div v-else-if="isVariant('split-pattern')" class="relative grid h-full gap-3 md:grid-cols-[1.05fr_0.95fr]">
        <div class="rounded-xl border border-white/10 bg-white/8 p-4">
          <div class="rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <div class="mb-3 flex items-center justify-between text-xs text-white/55">
              <span>Workspace preview</span>
              <span>live</span>
            </div>
            <div class="grid gap-2">
              <div class="h-3 w-3/4 rounded-full bg-white/80"></div>
              <div class="h-3 w-2/3 rounded-full bg-white/35"></div>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <span class="block h-20 rounded-lg bg-white/10"></span>
                <span class="block h-20 rounded-lg bg-white/10"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-between py-1">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Pattern</p>
            <h3 class="mt-3 text-xl font-semibold leading-tight">{{ props.item.headline }}</h3>
          </div>
          <div class="flex items-center justify-between gap-3">
            <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="h-8 w-auto opacity-90" />
            <Button variant="secondary" size="sm" class="shadow-none">Explorar</Button>
          </div>
        </div>
      </div>

      <div v-else-if="isVariant('overlay-pattern')" class="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_26%),linear-gradient(180deg,transparent_10%,rgba(1,5,67,0.82)_100%)]"></div>
        <div class="relative flex items-center justify-between text-xs text-white/60">
          <span>Dark overlay</span>
          <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="h-7 w-auto opacity-80" />
        </div>
        <div class="relative">
          <h3 class="max-w-[80%] text-2xl font-semibold leading-tight">{{ props.item.headline }}</h3>
          <p class="mt-3 max-w-[70%] text-sm leading-6 text-white/70">{{ props.item.supporting }}</p>
        </div>
      </div>

      <div v-else-if="isVariant('stacked-pattern')" class="relative flex h-full flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Proof wall</span>
          <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="h-7 w-auto opacity-80" />
        </div>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/8 p-3">
            <div class="text-lg font-semibold">Resultados + contexto</div>
            <div class="mt-2 text-sm text-white/70">+42% clareza comercial</div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl border border-white/10 bg-white/8 p-3 text-sm text-white/75">Logo cluster</div>
            <div class="rounded-xl border border-white/10 bg-white/8 p-3 text-sm text-white/75">Depoimento</div>
          </div>
        </div>
      </div>

      <div v-else-if="isVariant('rail-pattern')" class="relative flex h-full flex-col justify-between">
        <div class="absolute -right-6 top-5 h-12 w-48 rotate-[135deg] rounded-full bg-emerald-400/45 blur-2xl"></div>
        <div class="absolute left-0 bottom-10 h-14 w-60 -rotate-6 rounded-r-full bg-primary/60"></div>
        <div class="relative flex items-center justify-between text-xs text-white/60">
          <span>CTA rail</span>
          <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="h-7 w-auto opacity-80" />
        </div>
        <div class="relative space-y-4">
          <h3 class="max-w-[78%] text-xl font-semibold leading-tight">{{ props.item.headline }}</h3>
          <Button variant="secondary" size="sm" class="shadow-none">
            Avançar
            <ArrowRight class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div v-else-if="isVariant('centered-pattern')" class="relative flex h-full flex-col items-center justify-center text-center">
        <div class="absolute inset-x-1/2 top-8 h-20 w-20 -translate-x-1/2 rounded-full bg-primary/25 blur-2xl"></div>
        <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="relative h-8 w-auto" />
        <h3 class="relative mt-5 max-w-[82%] text-2xl font-semibold leading-tight text-slate-950">{{ props.item.headline }}</h3>
        <p class="relative mt-3 max-w-[75%] text-sm leading-6 text-slate-700">{{ props.item.supporting }}</p>
      </div>

      <div v-else-if="isVariant('series-pattern')" class="relative flex h-full flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="rounded-full border border-slate-900/10 bg-white/65 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">Series</span>
          <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="h-7 w-auto opacity-90" />
        </div>
        <div>
          <div class="text-sm font-medium text-slate-600">Episódio 03</div>
          <h3 class="mt-2 max-w-[82%] text-2xl font-semibold leading-tight text-slate-950">{{ props.item.headline }}</h3>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <span class="block h-2 rounded-full bg-slate-900/80"></span>
          <span class="block h-2 rounded-full bg-slate-900/20"></span>
          <span class="block h-2 rounded-full bg-slate-900/20"></span>
          <span class="block h-2 rounded-full bg-slate-900/20"></span>
        </div>
      </div>

      <div v-else-if="isVariant('ads-revenue')" class="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4">
        <div class="flex items-center justify-between text-xs text-white/60">
          <span>Revenue ad</span>
          <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="h-7 w-auto opacity-85" />
        </div>
        <div>
          <h3 class="max-w-[88%] text-2xl font-semibold leading-tight">{{ props.item.headline }}</h3>
          <div class="mt-4 flex items-end gap-4">
            <div>
              <div class="text-4xl font-semibold tracking-tight">+31%</div>
              <div class="text-xs text-white/65">venda atribuida</div>
            </div>
            <div class="flex-1 rounded-xl border border-white/10 bg-white/8 px-3 py-3 text-sm text-white/75">
              Meta + Google + WhatsApp + CRM
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" class="w-fit shadow-none">
          Ver demo
          <ArrowRight class="h-4 w-4" />
        </Button>
      </div>

      <div v-else-if="isVariant('ads-anti-cpl')" class="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(150deg,#190c48,#010543)] p-4">
        <div class="absolute right-3 top-5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">Stop chasing CPL</div>
        <div class="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Anti-CPL</div>
        <div>
          <h3 class="max-w-[82%] text-2xl font-semibold leading-tight">{{ props.item.headline }}</h3>
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-lg border border-red-300/15 bg-red-300/10 px-3 py-2 text-red-100">CPL baixo</div>
            <div class="rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-emerald-100">Receita alta</div>
          </div>
        </div>
        <div class="text-sm text-white/70">A peça confronta a métrica errada e reposiciona o argumento para venda.</div>
      </div>

      <div v-else-if="isVariant('ads-funnel')" class="relative flex h-full flex-col justify-between rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4">
        <div class="flex items-center justify-between text-xs text-white/55">
          <span>Mechanism ad</span>
          <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="h-7 w-auto opacity-85" />
        </div>
        <div class="grid grid-cols-4 gap-2 text-center text-[11px] text-white/75">
          <div class="rounded-lg border border-white/10 bg-white/8 p-2">Clique</div>
          <div class="rounded-lg border border-white/10 bg-white/8 p-2">WhatsApp</div>
          <div class="rounded-lg border border-white/10 bg-white/8 p-2">CRM</div>
          <div class="rounded-lg border border-white/10 bg-white/8 p-2">Venda</div>
        </div>
        <div>
          <h3 class="max-w-[86%] text-xl font-semibold leading-tight">{{ props.item.headline }}</h3>
          <p class="mt-3 text-sm leading-6 text-white/70">{{ props.item.supporting }}</p>
        </div>
      </div>

      <div v-else-if="isVariant('lp-hero')" class="relative grid h-full gap-3 md:grid-cols-[1.1fr_0.9fr]">
        <div class="flex flex-col justify-between rounded-xl border border-white/10 bg-white/8 p-4">
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Hero section</div>
            <h3 class="mt-3 max-w-[88%] text-2xl font-semibold leading-tight">{{ props.item.headline }}</h3>
            <p class="mt-3 max-w-[90%] text-sm leading-6 text-white/70">{{ props.item.supporting }}</p>
          </div>
          <div class="flex items-center gap-3">
            <Button variant="secondary" size="sm" class="shadow-none">Agendar demo</Button>
            <span class="text-xs text-white/60">Meta + Google + CRM</span>
          </div>
        </div>
        <div class="rounded-xl border border-white/10 bg-slate-950/35 p-4">
          <div class="mb-3 text-xs text-white/55">Proof panel</div>
          <div class="space-y-3">
            <div class="rounded-lg border border-white/10 bg-white/8 px-3 py-3 text-sm text-white/80">Lead, conversa e venda na mesma leitura.</div>
            <div class="grid grid-cols-2 gap-2">
              <span class="block h-20 rounded-lg bg-white/10"></span>
              <span class="block h-20 rounded-lg bg-white/10"></span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="isVariant('lp-flow')" class="relative flex h-full flex-col justify-between rounded-xl border border-white/10 bg-white/8 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Flow section</div>
        <BrandFlowSection :steps="dsFlowSteps" variant="compact" tone="dark" :columns="3" />
        <h3 class="max-w-[84%] text-xl font-semibold leading-tight">{{ props.item.headline }}</h3>
      </div>

      <div v-else-if="isVariant('lp-benefits')" class="relative flex h-full flex-col justify-between rounded-xl border border-slate-900/10 bg-white/65 p-4">
        <div class="flex items-center justify-between">
          <div class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">Benefits section</div>
          <img :src="logoSrc(props.item.variant)" alt="Adsmagic" class="h-7 w-auto opacity-90" />
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-xl border border-slate-900/10 bg-white px-3 py-4 text-sm text-slate-700">Mídia otimiza por venda.</div>
          <div class="rounded-xl border border-slate-900/10 bg-white px-3 py-4 text-sm text-slate-700">Comercial recebe contexto.</div>
          <div class="rounded-xl border border-slate-900/10 bg-white px-3 py-4 text-sm text-slate-700">Operação ganha clareza.</div>
        </div>
        <h3 class="max-w-[88%] text-xl font-semibold leading-tight text-slate-950">{{ props.item.headline }}</h3>
      </div>

      <div v-else-if="isVariant('lp-offer')" class="relative flex h-full flex-col justify-between rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4">
        <BrandPricingCard
          variant="compact"
          class="max-w-none"
          label="Offer section"
          :name="undefined"
          price="2.9k"
          period="/piloto"
          billing-info="Setup, templates, tracking e revisão comercial."
          cta-label="Ver oferta"
          :featured="true"
          footnote="Bloco de fechamento para pages de oferta e LPs comerciais."
        />
      </div>
    </div>

    <CardContent class="space-y-3 p-4">
      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{{ props.item.label }}</Badge>
        <Badge v-for="chip in props.item.chips ?? []" :key="chip" variant="secondary" class="text-[10px]">
          {{ chip }}
        </Badge>
      </div>
      <p class="text-sm leading-6 text-muted-foreground">{{ props.item.supporting }}</p>
    </CardContent>
  </Card>
</template>