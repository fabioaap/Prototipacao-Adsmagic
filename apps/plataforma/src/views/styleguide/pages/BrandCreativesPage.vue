<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const GRAFISMO_BG = 'linear-gradient(180deg, #000E50 0%, #001580 45%, #0043FF 100%)'
const GRAFISMO_BG_2 = 'linear-gradient(160deg, #000E50 0%, #001070 45%, #0064E1 100%)'
const GRAFISMO_BG_3 = 'linear-gradient(145deg, #000E50 0%, #001860 50%, #0043FF 100%)'
const GRAFISMO_BG_4 = 'linear-gradient(160deg, #000e50 0%, #001280 50%, #0064E1 100%)'
const GRAFISMO_BG_5 = 'linear-gradient(170deg, #000E50 0%, #001480 50%, #0043FF 100%)'
const GRAFISMO_BG_6 = 'linear-gradient(135deg, #000E50 0%, #002090 50%, #0064E1 100%)'

const crmRows = [
  { name: 'João S.', source: 'Meta Ads', status: 'Aberto', color: '#3BB56D' },
  { name: 'Maria L.', source: 'Google', status: 'Fechado', color: 'rgba(255,255,255,0.45)' },
  { name: 'Pedro A.', source: 'Orgânico', status: 'Follow-up', color: '#f59e0b' },
]

const journeySteps = ['Clique', 'WhatsApp', 'CRM', 'Venda']

const metrics = [
  { value: 'ROI 4×', label: 'retorno sobre investimento em mídia', wide: true },
  { value: '+109%', label: 'aumento na taxa de fechamento', wide: false },
  { value: '↓R$10', label: 'CPA médio após integração', wide: false },
  { value: '+14,29%', label: 'ganho em conversão', wide: true },
  { value: '29%', label: 'taxa de vendas via WhatsApp', wide: false },
  { value: '+20', label: 'fontes de tráfego monitoradas', wide: false },
]

const templateFamilies = [
  { title: 'Depoimento retrato único', node: '343:2043', type: 'Social proof', desc: 'Retrato dominante + citação curta + cargo' },
  { title: 'Quote editorial foto cheia', node: '343:2059', type: 'Premium', desc: 'Foto full-frame com quote grande' },
  { title: 'Prova social em trio', node: '343:2075', type: 'Credibilidade', desc: 'Três retratos com nomes e cargos' },
  { title: 'Manifesto textual', node: '343:2099', type: 'Editorial', desc: 'Frame quase só de tipografia e argumento' },
  { title: 'Testimonial longo avatar', node: '343:2113', type: 'Long-form', desc: 'Citação extensa + assinatura com avatar' },
  { title: 'Colagem de mockups', node: '343:2163', type: 'Produto', desc: 'Headline + grupo de telas sobrepostas' },
  { title: 'Testimonial sazonal', node: '343:2188', type: 'Sazonal', desc: 'Testimonial + badge circular de campanha' },
  { title: 'Bento de métricas', node: '343:2282', type: 'Prova quantitativa', desc: 'Grid de números e KPIs' },
  { title: 'Bento híbrido', node: '343:2309', type: 'Feature + KPI', desc: 'Card editorial grande + KPIs auxiliares' },
]
</script>

<template>
  <!-- ─── Seção 1: Família Performance ─── -->
  <Card class="overflow-hidden border-border">
    <CardHeader class="px-6 py-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Creative System · Figma node 870:1658</p>
      <CardTitle class="mt-2 text-2xl tracking-tight">Família Performance — 6 criativos de campanha</CardTitle>
      <p class="mt-3 text-sm leading-6 text-muted-foreground">
        Todos seguem o mesmo sistema visual: fundo azul profundo, grafismos diagonais arredondados, verde #3BB56D como acento e copy de resposta direta.
        Extraídos e catalogados do Figma em 15/04/2026.
      </p>
    </CardHeader>

    <Separator />

    <CardContent class="p-6">
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        <!-- ── Creative 1: WhatsApp → Meta Ads ── -->
        <div class="flex flex-col">
          <div
            class="relative min-h-[380px] overflow-hidden rounded-2xl p-5 flex flex-col"
            :style="{ background: GRAFISMO_BG }"
          >
            <!-- Grafismos -->
            <div class="pointer-events-none absolute inset-0">
              <div class="absolute w-[52px] h-[380px] rounded-[26px] rotate-[135deg] opacity-70"
                style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); bottom: -110px; left: 4%"></div>
              <div class="absolute w-[65px] h-[430px] rounded-[33px] rotate-[135deg] opacity-15"
                style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -110px; right: 5%"></div>
              <div class="absolute w-[48px] h-[310px] rounded-[24px] rotate-[135deg] opacity-10"
                style="background: linear-gradient(180deg, #1939AB 0%, #3B82F6 100%); top: 70px; right: 19%"></div>
              <div class="absolute w-[280px] h-[280px] rounded-full opacity-[0.12]"
                style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); top: -80px; right: -60px"></div>
              <div class="absolute w-[220px] h-[220px] rounded-full opacity-[0.08]"
                style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); bottom: -60px; left: -40px"></div>
            </div>

            <!-- Content -->
            <div class="relative flex flex-col flex-1">
              <img src="/logo-wordmark-white.svg" alt="AdsMagic" class="h-4 w-auto self-start opacity-75" />
              <p class="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">WhatsApp → Meta Ads</p>
              <h3 class="mt-2 text-[17px] font-bold leading-snug text-white">
                Seu WhatsApp vira relatório para o Meta Ads
              </h3>
              <p class="mt-2 text-xs leading-relaxed" style="color: #3BB56D">
                Pare de chutar. Otimize com dados reais de conversa.
              </p>

              <!-- WhatsApp mock -->
              <div class="mt-4 flex-1 rounded-xl border border-white/10 bg-white/[0.06] p-3">
                <div class="flex items-center gap-2 mb-2">
                  <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
                    style="background: #25D366">W</div>
                  <div class="h-1.5 w-16 rounded-full bg-white/20"></div>
                  <span class="ml-auto text-[9px] text-white/30">14:23</span>
                </div>
                <div class="space-y-1.5">
                  <div class="h-1.5 w-4/5 rounded-full bg-white/15"></div>
                  <div class="h-1.5 w-3/5 rounded-full bg-white/10"></div>
                </div>
                <div class="mt-3 flex items-center gap-2">
                  <div class="rounded bg-white/10 px-2 py-1 text-[9px] text-white/50">Meta Ads</div>
                  <span class="text-[10px] text-white/30">→</span>
                  <div class="rounded px-2 py-1 text-[9px]" style="background: rgba(59,181,109,0.18); color: #3BB56D">Relatório</div>
                </div>
              </div>

              <!-- CTA circular -->
              <div class="mt-3 flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Performance</span>
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                  <svg class="h-4 w-4" style="color: #000E50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-2 px-1">
            <span class="text-sm font-medium text-card-foreground">Relatório WhatsApp</span>
            <span class="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">9:16</span>
          </div>
        </div>

        <!-- ── Creative 2: Funil Automático ── -->
        <div class="flex flex-col">
          <div
            class="relative min-h-[380px] overflow-hidden rounded-2xl p-5 flex flex-col"
            :style="{ background: GRAFISMO_BG_2 }"
          >
            <div class="pointer-events-none absolute inset-0">
              <div class="absolute w-[55px] h-[400px] rounded-[28px] rotate-[135deg] opacity-65"
                style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); bottom: -120px; right: 4%"></div>
              <div class="absolute w-[68px] h-[440px] rounded-[34px] rotate-[135deg] opacity-13"
                style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -100px; left: 5%"></div>
              <div class="absolute w-[300px] h-[300px] rounded-full opacity-[0.1]"
                style="background: radial-gradient(circle, #3B82F6 0%, transparent 70%); top: -90px; left: -70px"></div>
              <div class="absolute w-[200px] h-[200px] rounded-full opacity-[0.08]"
                style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); bottom: -50px; right: -30px"></div>
            </div>

            <div class="relative flex flex-col flex-1">
              <img src="/logo-wordmark-white.svg" alt="AdsMagic" class="h-4 w-auto self-start opacity-75" />
              <p class="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Pipeline Automático</p>
              <h3 class="mt-2 text-[17px] font-bold leading-snug text-white">
                Funil que atualiza sozinho
              </h3>
              <p class="mt-2 text-xs leading-relaxed" style="color: #3BB56D">
                Etapas, conversões e pipeline sem copia e cola.
              </p>

              <!-- Funnel mock -->
              <div class="mt-4 flex-1 flex flex-col justify-center gap-2">
                <div class="flex items-stretch gap-1.5">
                  <div class="flex flex-1 flex-col items-center rounded-lg border border-white/10 bg-white/[0.06] px-2 py-3 text-center">
                    <span class="text-[9px] text-white/40 mb-1">Lead</span>
                    <span class="text-base font-bold text-white">127</span>
                  </div>
                  <div class="flex items-center text-white/20 text-xs">›</div>
                  <div class="flex flex-1 flex-col items-center rounded-lg border border-white/10 bg-white/[0.06] px-2 py-3 text-center">
                    <span class="text-[9px] text-white/40 mb-1">Contato</span>
                    <span class="text-base font-bold text-white">89</span>
                  </div>
                  <div class="flex items-center text-white/20 text-xs">›</div>
                  <div class="flex flex-1 flex-col items-center rounded-lg border px-2 py-3 text-center"
                    style="background: rgba(59,181,109,0.12); border-color: rgba(59,181,109,0.3)">
                    <span class="text-[9px] mb-1" style="color: rgba(59,181,109,0.7)">Venda</span>
                    <span class="text-base font-bold" style="color: #3BB56D">43</span>
                  </div>
                </div>
                <div class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                  <div class="flex items-center gap-2 text-[10px] text-white/50">
                    <span class="inline-block h-1.5 w-1.5 rounded-full bg-[#3BB56D]"></span>
                    Taxa de conversão: <strong class="text-white">33,9%</strong>
                  </div>
                </div>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Automação</span>
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                  <svg class="h-4 w-4" style="color: #000E50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-2 px-1">
            <span class="text-sm font-medium text-card-foreground">Funil Automático</span>
            <span class="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">1:1</span>
          </div>
        </div>

        <!-- ── Creative 3: Jornada Completa ── -->
        <div class="flex flex-col">
          <div
            class="relative min-h-[380px] overflow-hidden rounded-2xl p-5 flex flex-col"
            :style="{ background: GRAFISMO_BG_3 }"
          >
            <div class="pointer-events-none absolute inset-0">
              <div class="absolute w-[50px] h-[370px] rounded-[25px] rotate-[135deg] opacity-60"
                style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); top: -80px; right: 8%"></div>
              <div class="absolute w-[62px] h-[420px] rounded-[31px] rotate-[135deg] opacity-12"
                style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); bottom: -100px; left: 6%"></div>
              <div class="absolute w-[260px] h-[260px] rounded-full opacity-[0.11]"
                style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); bottom: -70px; right: -50px"></div>
            </div>

            <div class="relative flex flex-col flex-1">
              <img src="/logo-wordmark-white.svg" alt="AdsMagic" class="h-4 w-auto self-start opacity-75" />
              <p class="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">CRM Timeline</p>
              <h3 class="mt-2 text-[17px] font-bold leading-snug text-white">
                Acompanhe a jornada completa
              </h3>
              <p class="mt-2 text-xs leading-relaxed" style="color: #3BB56D">
                Do clique ao fechamento em uma visão única.
              </p>

              <!-- Journey timeline mock -->
              <div class="mt-4 flex-1 flex flex-col justify-center space-y-3">
                <div
                  v-for="(step, i) in journeySteps"
                  :key="step"
                  class="flex items-center gap-3"
                >
                  <div
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold"
                    :style="i < 3
                      ? 'border-color: #3BB56D; background: rgba(59,181,109,0.2); color: #3BB56D'
                      : 'border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3)'"
                  >{{ i + 1 }}</div>
                  <div class="flex-1">
                    <div class="h-1.5 rounded-full" :style="i < 3 ? 'background: rgba(59,181,109,0.35); width:' + [90,75,80][i] + '%' : 'background: rgba(255,255,255,0.08); width: 40%'"></div>
                  </div>
                  <span
                    class="text-[10px] font-medium"
                    :style="i < 3 ? 'color: rgba(255,255,255,0.65)' : 'color: rgba(255,255,255,0.25)'"
                  >{{ step }}</span>
                </div>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Timeline</span>
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                  <svg class="h-4 w-4" style="color: #000E50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-2 px-1">
            <span class="text-sm font-medium text-card-foreground">Jornada Completa</span>
            <span class="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">4:5</span>
          </div>
        </div>

        <!-- ── Creative 4: Salve Contatos ── -->
        <div class="flex flex-col">
          <div
            class="relative min-h-[380px] overflow-hidden rounded-2xl p-5 flex flex-col"
            :style="{ background: GRAFISMO_BG_4 }"
          >
            <div class="pointer-events-none absolute inset-0">
              <div class="absolute w-[54px] h-[390px] rounded-[27px] rotate-[135deg] opacity-65"
                style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); bottom: -115px; left: 5%"></div>
              <div class="absolute w-[64px] h-[420px] rounded-[32px] rotate-[135deg] opacity-14"
                style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -100px; right: 7%"></div>
              <div class="absolute w-[240px] h-[240px] rounded-full opacity-[0.09]"
                style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); top: -60px; right: -40px"></div>
              <div class="absolute w-[260px] h-[260px] rounded-full opacity-[0.1]"
                style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); bottom: -70px; left: -50px"></div>
            </div>

            <div class="relative flex flex-col flex-1">
              <img src="/logo-wordmark-white.svg" alt="AdsMagic" class="h-4 w-auto self-start opacity-75" />
              <p class="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">CRM Automático</p>
              <h3 class="mt-2 text-[17px] font-bold leading-snug text-white">
                Salve contatos instantaneamente
              </h3>
              <p class="mt-2 text-xs leading-relaxed" style="color: #3BB56D">
                CRM automático com histórico e UTM preservados.
              </p>

              <!-- CRM table mock -->
              <div class="mt-4 flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/[0.05]">
                <div class="grid grid-cols-3 border-b border-white/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                  <span>Nome</span>
                  <span>Fonte</span>
                  <span class="text-right">Status</span>
                </div>
                <div
                  v-for="row in crmRows"
                  :key="row.name"
                  class="grid grid-cols-3 border-b border-white/[0.06] px-3 py-2 text-[10px]"
                >
                  <span class="text-white/70 font-medium">{{ row.name }}</span>
                  <span class="text-white/40">{{ row.source }}</span>
                  <span class="text-right font-semibold" :style="{ color: row.color }">{{ row.status }}</span>
                </div>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">CRM</span>
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                  <svg class="h-4 w-4" style="color: #000E50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-2 px-1">
            <span class="text-sm font-medium text-card-foreground">Salve Contatos</span>
            <span class="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">1:1</span>
          </div>
        </div>

        <!-- ── Creative 5: Rastreie cada clique ── -->
        <div class="flex flex-col">
          <div
            class="relative min-h-[380px] overflow-hidden rounded-2xl p-5 flex flex-col"
            :style="{ background: GRAFISMO_BG_5 }"
          >
            <div class="pointer-events-none absolute inset-0">
              <div class="absolute w-[58px] h-[410px] rounded-[29px] rotate-[135deg] opacity-60"
                style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); top: -90px; left: 3%"></div>
              <div class="absolute w-[70px] h-[450px] rounded-[35px] rotate-[135deg] opacity-13"
                style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); bottom: -110px; right: 4%"></div>
              <div class="absolute w-[300px] h-[300px] rounded-full opacity-[0.11]"
                style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); top: -90px; right: -70px"></div>
            </div>

            <div class="relative flex flex-col flex-1">
              <img src="/logo-wordmark-white.svg" alt="AdsMagic" class="h-4 w-auto self-start opacity-75" />
              <p class="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Multi-plataforma</p>
              <h3 class="mt-2 text-[17px] font-bold leading-snug text-white">
                Rastreie cada clique
              </h3>
              <p class="mt-2 text-xs leading-relaxed" style="color: #3BB56D">
                Meta Ads, Google e WhatsApp em uma fonte única de verdade.
              </p>

              <!-- Platform connection mock -->
              <div class="mt-4 flex-1 flex flex-col items-center justify-center">
                <div class="flex items-center gap-3">
                  <!-- Meta -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-bold" style="background: #1877F2">M</div>
                    <span class="text-[9px] text-white/50">Meta</span>
                  </div>

                  <!-- Arrows -->
                  <div class="flex flex-col gap-1.5">
                    <div class="h-0.5 w-6 rounded-full bg-white/20"></div>
                    <div class="h-0.5 w-6 rounded-full" style="background: rgba(59,181,109,0.5)"></div>
                  </div>

                  <!-- AdsMagic center -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-lg" style="border-color: rgba(59,181,109,0.6); background: #010543">
                      <img src="/logo-icon.svg" alt="AdsMagic" class="h-7 w-7" />
                    </div>
                    <span class="text-[9px] font-semibold" style="color: #3BB56D">AdsMagic</span>
                  </div>

                  <!-- Arrows -->
                  <div class="flex flex-col gap-1.5">
                    <div class="h-0.5 w-6 rounded-full" style="background: rgba(59,181,109,0.5)"></div>
                    <div class="h-0.5 w-6 rounded-full bg-white/20"></div>
                  </div>

                  <!-- WhatsApp -->
                  <div class="flex flex-col items-center gap-2">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-bold" style="background: #25D366">W</div>
                    <span class="text-[9px] text-white/50">WhatsApp</span>
                  </div>
                </div>

                <!-- Google below -->
                <div class="mt-3 flex flex-col items-center gap-1.5">
                  <div class="h-4 w-0.5 rounded-full bg-white/15"></div>
                  <div class="flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold" style="background: #EA4335">G</div>
                  <span class="text-[9px] text-white/50">Google</span>
                </div>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Integração</span>
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
                  <svg class="h-4 w-4" style="color: #000E50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-2 px-1">
            <span class="text-sm font-medium text-card-foreground">Rastreie cada clique</span>
            <span class="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">1:1</span>
          </div>
        </div>

        <!-- ── Creative 6: CTA Manifesto ── -->
        <div class="flex flex-col">
          <div
            class="relative min-h-[380px] overflow-hidden rounded-2xl p-5 flex flex-col"
            :style="{ background: GRAFISMO_BG_6 }"
          >
            <div class="pointer-events-none absolute inset-0">
              <div class="absolute w-[60px] h-[420px] rounded-[30px] rotate-[135deg] opacity-55"
                style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); top: -100px; right: 3%"></div>
              <div class="absolute w-[72px] h-[460px] rounded-[36px] rotate-[135deg] opacity-13"
                style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); bottom: -120px; left: 4%"></div>
              <div class="absolute w-[320px] h-[320px] rounded-full opacity-[0.1]"
                style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); top: -100px; left: -80px"></div>
              <div class="absolute w-[250px] h-[250px] rounded-full opacity-[0.09]"
                style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); bottom: -70px; right: -50px"></div>
            </div>

            <div class="relative flex flex-col flex-1">
              <img src="/logo-wordmark-white.svg" alt="AdsMagic" class="h-4 w-auto self-start opacity-75" />
              <p class="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Manifesto</p>
              <h3 class="mt-2 text-[17px] font-bold leading-snug text-white">
                Perca menos tempo. Gere leads realmente qualificados.
              </h3>

              <!-- Big CTA central -->
              <div class="mt-4 flex flex-1 items-center justify-center">
                <div class="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl">
                  <svg class="h-10 w-10" style="color: #000E50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <!-- Ring -->
                  <div class="absolute -inset-3 rounded-full border border-white/20"></div>
                  <div class="absolute -inset-6 rounded-full border border-white/10"></div>
                </div>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">CTA direto</span>
                <div class="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-semibold text-white/70">
                  Começar agora
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-2 px-1">
            <span class="text-sm font-medium text-card-foreground">Manifesto CTA</span>
            <span class="ml-auto rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">1:1</span>
          </div>
        </div>

      </div>
    </CardContent>
  </Card>

  <!-- ─── Seção 2: Bento de Métricas ─── -->
  <Card class="overflow-hidden border-border">
    <CardHeader class="px-6 py-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Template Library · Figma node 343:2282</p>
      <CardTitle class="mt-2 text-2xl tracking-tight">Bento de métricas — prova quantitativa</CardTitle>
      <p class="mt-3 text-sm leading-6 text-muted-foreground">
        Grid de KPIs para ads e landing pages. Cada número é resultado real de clientes usando o AdsMagic.
      </p>
    </CardHeader>

    <Separator />

    <CardContent class="p-6">
      <!-- Bento grid dark bg -->
      <div class="overflow-hidden rounded-2xl p-px" style="background: linear-gradient(135deg, rgba(59,181,109,0.3), rgba(99,102,241,0.3))">
        <div class="rounded-2xl p-6 md:p-8" style="background: linear-gradient(135deg, #000E50 0%, #010543 100%)">
          <!-- Header bento -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Resultados reais</p>
              <h3 class="mt-1 text-xl font-bold text-white">AdsMagic em números</h3>
            </div>
            <img src="/logo-wordmark-white.svg" alt="AdsMagic" class="h-5 w-auto opacity-60" />
          </div>

          <!-- Bento grid -->
          <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div
              v-for="metric in metrics"
              :key="metric.value"
              class="relative overflow-hidden rounded-xl p-4"
              :class="metric.wide ? 'md:col-span-1' : ''"
              style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)"
            >
              <!-- Accent glow -->
              <div
                class="pointer-events-none absolute -top-4 -right-4 h-16 w-16 rounded-full opacity-30"
                style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%)"
              ></div>
              <div class="relative">
                <div class="text-2xl font-bold text-white md:text-3xl">{{ metric.value }}</div>
                <div class="mt-1 text-[11px] leading-relaxed text-white/45">{{ metric.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- ─── Seção 3: Biblioteca de Templates ─── -->
  <Card class="overflow-hidden border-border">
    <CardHeader class="px-6 py-6">
      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Template Library · Figma node 370:2507</p>
      <CardTitle class="mt-2 text-2xl tracking-tight">Família de templates editoriais</CardTitle>
      <p class="mt-3 text-sm leading-6 text-muted-foreground">
        9 famílias identificadas na biblioteca Figma. Cada família é um padrão reutilizável para ads, social e landing pages.
        Referência de node para quem for produzir ou exportar assets.
      </p>
    </CardHeader>

    <Separator />

    <CardContent class="p-6">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="family in templateFamilies"
          :key="family.node"
          class="flex flex-col rounded-xl border border-border bg-muted/40 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="rounded-full border border-border bg-card px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {{ family.type }}
            </span>
            <code class="text-[9px] text-muted-foreground/60">{{ family.node }}</code>
          </div>
          <h4 class="mt-3 text-sm font-semibold text-card-foreground">{{ family.title }}</h4>
          <p class="mt-1.5 text-xs leading-5 text-muted-foreground">{{ family.desc }}</p>
        </div>
      </div>

      <!-- Grammar elements reference -->
      <div class="mt-6 rounded-xl border border-border bg-muted/30 p-5">
        <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-4">Gramática visual recorrente</p>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="element in [
              { label: 'Fundo azul profundo', note: '#000E50 → #0064E1 → #000FFD · gradient com variação por criativo' },
              { label: 'Barras diagonais', note: 'Pill shape, rotate 135°, verde #3BB56D + 1–2 azuis com baixa opacity' },
              { label: 'Glow ellipses', note: 'radial-gradient, grandes, opacity 8–12%, azul e verde em cantos opostos' },
              { label: 'CTA circular', note: 'Círculo branco, seta escura (#010543), shadow-lg — elemento de ação principal' },
              { label: 'Verde de acento', note: '#3BB56D para texto de apoio, bordas ativas e indicadores de progresso' },
              { label: 'Logo posição', note: 'Wordmark branco no canto superior esquerdo, opacity 75%' },
            ]"
            :key="element.label"
            class="flex gap-3"
          >
            <div class="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#3BB56D]"></div>
            <div>
              <span class="text-xs font-semibold text-card-foreground">{{ element.label }}</span>
              <p class="mt-0.5 text-xs leading-5 text-muted-foreground">{{ element.note }}</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
