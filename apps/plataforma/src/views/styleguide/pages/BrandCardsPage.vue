<script setup lang="ts">
const featureCards = [
  { metric: '+20', unit: 'fontes', desc: 'Associadas em tempo real ao n├║mero do WhatsApp' },
  { metric: '+3x', unit: 'mais r├ípido', desc: 'Algoritmo aprende com sinais 1st-party' },
  { metric: '+3x', unit: '', desc: 'Algoritmo aprende com sinais 1st-party' },
  { metric: '+100', unit: 'leads', desc: 'Criados no CRM zero copia-e-cola' },
]
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 py-16 bg-white">
    <h2 class="text-3xl font-bold text-[#010543] mb-2">Cards de Impacto</h2>
    <p class="text-slate-500 mb-12 max-w-xl">Cards de m├®tricas usados em campanhas e materiais de venda. Fundo s├│lido azul, texto branco, tipografia bold para os n├║meros.</p>

    <!-- Funcionalidades grid -->
    <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Padr├úo: Funcionalidades</h3>
    <div class="bg-[#E8F0E0] rounded-2xl p-8 mb-12">
      <div class="flex items-center gap-2 mb-6">
        <span class="w-3 h-3 rounded-full bg-[#059669]" />
        <span class="text-sm font-semibold text-[#010543]">Funcionalidades</span>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div
          v-for="(card, i) in featureCards" :key="i"
          class="rounded-2xl p-6 flex flex-col justify-end min-h-[180px]"
          style="background-color: #1E40AF"
        >
          <p class="text-4xl sm:text-5xl font-extrabold text-white leading-none">{{ card.metric }}</p>
          <p v-if="card.unit" class="text-xl sm:text-2xl font-bold text-white">{{ card.unit }}</p>
          <p class="text-sm text-white/70 mt-2">{{ card.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Bento grid social proof -->
    <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Padr├úo: Bento Grid ÔÇö Social Proof</h3>
    <div class="bg-slate-50 rounded-2xl p-8">
      <div class="grid grid-cols-4 grid-rows-3 gap-3 max-w-4xl mx-auto" style="grid-template-rows: auto auto auto;">
        <div class="col-span-1 row-span-1 rounded-xl p-5 flex flex-col justify-end min-h-[140px]" style="background-color:#2563EB">
          <p class="text-3xl font-extrabold text-white leading-none">+R$17 bi</p>
          <p class="text-xs text-white/60 mt-1">Em vendas anuais na Am├®rica Latina</p>
        </div>
        <div class="col-span-1 row-span-1 rounded-xl bg-blue-50 p-5 flex flex-col justify-end min-h-[140px]">
          <p class="text-3xl font-extrabold text-[#010543] leading-none">+4000</p>
          <p class="text-xs text-slate-500 mt-1">Parceiros para te ajudar</p>
        </div>
        <div class="col-span-1 row-span-1 rounded-xl bg-blue-50 p-5 flex flex-col justify-end min-h-[140px]">
          <p class="text-3xl font-extrabold text-[#010543] leading-none">+160 mil</p>
          <p class="text-xs text-slate-500 mt-1">Lojistas usam a plataforma</p>
        </div>
        <div class="col-span-1 row-span-1 rounded-xl p-5 flex flex-col justify-end min-h-[140px]" style="background-color:#0F172A">
          <p class="text-3xl font-extrabold text-white leading-none">3x</p>
          <p class="text-xs text-white/60 mt-1">Pr├¬mio de melhor plataforma</p>
        </div>
        <div class="col-span-2 rounded-xl p-5 flex flex-col justify-end min-h-[120px]" style="background-color:#2563EB">
          <p class="text-3xl font-extrabold text-white leading-none">+10 anos</p>
          <p class="text-xs text-white/60 mt-1">No mercado de plataformas digitais</p>
        </div>
        <div class="col-span-2 rounded-xl bg-blue-50 p-5 flex flex-col justify-end min-h-[120px]">
          <p class="text-3xl font-extrabold text-[#010543] leading-none">99.9%</p>
          <p class="text-xs text-slate-500 mt-1">Uptime garantido</p>
        </div>
      </div>
    </div>

    <!-- Card guidelines -->
    <h3 class="text-lg font-semibold text-[#010543] mt-12 mb-4">Diretrizes</h3>
    <div class="grid sm:grid-cols-3 gap-4">
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h4 class="text-sm font-semibold text-[#010543] mb-2">M├®tricas</h4>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>ÔÇó Font-weight: 800 (extrabold)</li>
          <li>ÔÇó Size: 2xlÔÇô5xl conforme destaque</li>
          <li>ÔÇó Prefixo + sempre presente</li>
        </ul>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h4 class="text-sm font-semibold text-[#010543] mb-2">Fundos</h4>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>ÔÇó Highlight: #1E40AF ou #2563EB</li>
          <li>ÔÇó Neutro: blue-50 ou slate-50</li>
          <li>ÔÇó Dark: #0F172A (navy profundo)</li>
        </ul>
      </div>
      <div class="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h4 class="text-sm font-semibold text-[#010543] mb-2">Layout</h4>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>ÔÇó Border-radius: 16px (rounded-2xl)</li>
          <li>ÔÇó Padding: 24px m├¡nimo</li>
          <li>ÔÇó Grid 2-col ou bento 4-col</li>
        </ul>
      </div>
    </div>
  </section>
</template>