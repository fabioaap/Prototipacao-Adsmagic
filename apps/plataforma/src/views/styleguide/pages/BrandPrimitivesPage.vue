<script setup lang="ts">
import { ArrowRight, Quote } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const compositions = [
  {
    label: 'Acquisition Ad',
    title: 'Headline + proof + CTA rail',
    body: 'Fluxo curto para mídia paga: promessa forte, sinal de confiança e fechamento imediato.',
    blocks: ['Headline band', 'Proof strip', 'CTA rail'],
  },
  {
    label: 'LP Hero',
    title: 'Headline + logo lockup + offer stack',
    body: 'Hero de landing usa narrativa curta com assinatura de marca e bloco de oferta visível.',
    blocks: ['Headline band', 'Logo lockup', 'Offer stack'],
  },
  {
    label: 'Deck Slide',
    title: 'Quote block + proof + CTA',
    body: 'Slides comerciais pedem ritmo editorial: argumento, evidência e chamada de próxima etapa.',
    blocks: ['Quote block', 'Proof strip', 'CTA rail'],
  },
]

const heuristics = [
  {
    title: 'Tensão primeiro',
    body: 'Toda peça começa com um primitive textual dominante. Se a abertura não segura a atenção, o resto vira decoração.',
  },
  {
    title: 'Prova sempre visível',
    body: 'Proof strip e métricas entram cedo para impedir que a mensagem pareça promessa sem lastro.',
  },
  {
    title: 'Ação sem ruído',
    body: 'CTA rail e offer stack fecham a leitura. O objetivo é converter, não multiplicar escolhas na mesma dobra.',
  },
  {
    title: 'Marca como sistema',
    body: 'Logo lockup e star mark entram como assinatura e estrutura. Quando viram ornamento, a peça perde disciplina.',
  },
]
</script>

<template>
  <Card class="overflow-hidden border-border">
    <CardHeader class="px-6 py-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Creative System · Primitive library</p>
      <CardTitle class="mt-2 text-2xl tracking-tight">Biblioteca visual de primitives</CardTitle>
      <p class="mt-3 text-sm leading-6 text-muted-foreground">
        Esta página substitui o inventário textual por uma leitura visual do sistema. Os primitives abaixo são os blocos que realmente montam ads,
        LPs, decks e collaterals do AdsMagic.
      </p>
    </CardHeader>

    <Separator />

    <CardContent class="p-6">
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div class="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#000E50,#0043FF)] p-5 text-white shadow-sm">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Headline band</p>
          <h3 class="mt-4 max-w-[88%] text-[28px] font-semibold leading-tight">Promessa curta, tensão alta, clareza imediata.</h3>
          <div class="mt-6 flex items-center justify-between gap-3">
            <div class="flex flex-wrap gap-2">
              <span class="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/80">Manifesto</span>
              <span class="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/80">Hero</span>
            </div>
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#010543]">
              <ArrowRight class="h-4 w-4" />
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#111827,#1f2937)] p-5 text-white shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Proof strip</p>
            <img src="/logo-wordmark-white.svg" alt="AdsMagic" class="h-4 w-auto opacity-75" />
          </div>
          <div class="mt-6 text-3xl font-semibold tracking-tight">+126 campanhas</div>
          <p class="mt-2 text-sm leading-6 text-white/65">entregues com IA, tracking e operação conectados em um único fluxo.</p>
          <div class="mt-5 flex flex-wrap gap-2">
            <span class="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/70">Logos</span>
            <span class="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/70">Métricas</span>
            <span class="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/70">Trust</span>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#010543,#0d1a74)] p-5 text-white shadow-sm">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Offer stack</p>
          <div class="mt-4 flex items-end gap-2">
            <span class="text-sm font-medium text-white/55">R$</span>
            <span class="text-4xl font-semibold tracking-tight">2.9k</span>
            <span class="pb-1 text-sm text-white/55">/projeto</span>
          </div>
          <ul class="mt-4 space-y-2 text-sm text-white/75">
            <li>Setup + templates + handoff</li>
            <li>Piloto validado em sprint curta</li>
            <li>Governança de peças e ajustes</li>
          </ul>
          <Button variant="secondary" size="sm" class="mt-5 shadow-none">Quero ver</Button>
        </div>

        <div class="overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,#eef2ff,#dbeafe)] p-5 text-slate-950 shadow-sm">
          <Quote class="h-8 w-8 text-slate-400" />
          <h3 class="mt-5 max-w-[90%] text-[26px] font-semibold leading-tight">A marca precisa parecer sistema, não peça solta.</h3>
          <div class="mt-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/10 text-sm font-semibold text-slate-700">AM</div>
            <div>
              <p class="text-sm font-medium text-slate-800">AdsMagic team</p>
              <p class="text-xs text-slate-500">Quote block</p>
            </div>
          </div>
        </div>

        <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#010543,#0b1255)] p-5 text-white shadow-sm">
          <div class="absolute -right-8 top-4 h-14 w-56 rotate-[135deg] rounded-full bg-emerald-400/45 blur-2xl"></div>
          <div class="absolute left-0 bottom-8 h-12 w-56 rounded-r-full bg-[#3BB56D]/60"></div>
          <div class="relative flex h-full min-h-[220px] flex-col justify-between">
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">CTA rail</p>
            <div>
              <h3 class="max-w-[80%] text-2xl font-semibold leading-tight">Feche a peça com direção, não com mais uma explicação.</h3>
              <Button variant="secondary" size="sm" class="mt-5 shadow-none">
                Avançar
                <ArrowRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#000E50,#010543)] p-5 text-white shadow-sm">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Logo lockup</p>
          <div class="mt-8 rounded-2xl border border-dashed border-white/20 p-5">
            <div class="flex items-center gap-4">
              <img src="/logo-icon.svg" alt="AdsMagic" class="h-10 w-10" />
              <img src="/logo-wordmark-white.svg" alt="AdsMagic" class="h-5 w-auto opacity-90" />
            </div>
          </div>
          <p class="mt-5 text-sm leading-6 text-white/65">Assinatura de marca para cards, hero, collaterals e fechamentos onde o sistema precisa aparecer inteiro.</p>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card class="overflow-hidden border-border">
    <CardHeader class="px-6 py-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Composition recipes</p>
      <CardTitle class="mt-2 text-2xl tracking-tight">Como os primitives viram peças reais</CardTitle>
      <p class="mt-3 text-sm leading-6 text-muted-foreground">
        O ganho do sistema não vem do bloco isolado. Ele vem da ordem e da combinação entre os primitives para cada superfície do BrandOS.
      </p>
    </CardHeader>

    <Separator />

    <CardContent class="p-6">
      <div class="grid gap-4 xl:grid-cols-3">
        <div
          v-for="composition in compositions"
          :key="composition.label"
          class="rounded-2xl border border-border bg-muted/30 p-5"
        >
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ composition.label }}</p>
          <h3 class="mt-3 text-lg font-semibold text-card-foreground">{{ composition.title }}</h3>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ composition.body }}</p>
          <div class="mt-5 flex flex-wrap gap-2">
            <span
              v-for="block in composition.blocks"
              :key="block"
              class="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-card-foreground"
            >
              {{ block }}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card class="overflow-hidden border-border">
    <CardHeader class="px-6 py-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Primitive heuristics</p>
      <CardTitle class="mt-2 text-2xl tracking-tight">Regras para não voltar a desenhar tudo do zero</CardTitle>
    </CardHeader>

    <Separator />

    <CardContent class="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="rule in heuristics"
        :key="rule.title"
        class="rounded-2xl border border-border bg-card p-5"
      >
        <h3 class="text-base font-semibold text-card-foreground">{{ rule.title }}</h3>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ rule.body }}</p>
      </div>
    </CardContent>
  </Card>
</template>