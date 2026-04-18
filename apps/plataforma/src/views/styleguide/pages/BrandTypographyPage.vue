<template>
  <section class="max-w-7xl mx-auto px-6 py-16 bg-white">
    <h2 class="text-3xl font-bold text-[#010543] mb-2">Tipografia</h2>
    <p class="text-slate-500 mb-12 max-w-xl">A fam├¡lia <strong>Inter</strong> ├® a ├║nica fonte autorizada. Vers├ítil, limpa e otimizada para interfaces digitais.</p>

    <!-- Type specimen -->
    <div class="bg-slate-50 rounded-2xl p-12 border border-slate-200 mb-12">
      <p class="text-[10px] text-slate-400 uppercase tracking-widest mb-6">Type Specimen</p>
      <p class="text-8xl font-bold text-[#010543] tracking-tight leading-none mb-2">Aa</p>
      <p class="text-2xl text-[#010543] font-light tracking-wide mb-6">Inter ÔÇö Variable Font</p>
      <p class="text-base text-slate-500">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
      <p class="text-base text-slate-500">abcdefghijklmnopqrstuvwxyz</p>
      <p class="text-base text-slate-500">0123456789 !@#$%&amp;*</p>
    </div>

    <!-- Weights -->
    <h3 class="text-lg font-semibold text-[#010543] mb-4">Pesos</h3>
    <div class="space-y-4 mb-12">
      <div
        v-for="w in [
          { weight: 300, label: 'Light', usage: 'Subt├¡tulos, textos de apoio' },
          { weight: 400, label: 'Regular', usage: 'Corpo de texto, par├ígrafos' },
          { weight: 500, label: 'Medium', usage: 'Labels, navega├º├úo, bot├Áes' },
          { weight: 600, label: 'Semibold', usage: 'T├¡tulos de se├º├úo, destaque' },
          { weight: 700, label: 'Bold', usage: 'Headlines, hero text' },
          { weight: 800, label: 'Extrabold', usage: 'M├®tricas em cards de impacto' },
        ]"
        :key="w.weight"
        class="flex items-baseline gap-6 border-b border-slate-100 pb-3"
      >
        <span class="w-20 text-xs text-slate-400 font-mono flex-shrink-0">{{ w.weight }}</span>
        <span class="text-2xl text-[#010543] flex-1" :style="{ fontWeight: w.weight }">{{ w.label }}</span>
        <span class="text-xs text-slate-400 flex-shrink-0">{{ w.usage }}</span>
      </div>
    </div>

    <!-- Scale -->
    <h3 class="text-lg font-semibold text-[#010543] mb-4">Escala Tipogr├ífica</h3>
    <div class="space-y-3">
      <div
        v-for="(s, i) in [
          { size: '4xl', px: '36px', sample: 'Transforme leads em clientes fi├®is' },
          { size: '3xl', px: '30px', sample: 'Plataforma completa de marketing' },
          { size: '2xl', px: '24px', sample: 'Intelig├¬ncia artificial para an├║ncios' },
          { size: 'xl', px: '20px', sample: 'Conecte suas fontes de dados' },
          { size: 'lg', px: '18px', sample: 'Automatize seu funil de vendas' },
          { size: 'base', px: '16px', sample: 'Acompanhe m├®tricas em tempo real' },
          { size: 'sm', px: '14px', sample: 'Labels, captions, textos auxiliares' },
          { size: 'xs', px: '12px', sample: 'Timestamps, badges, metadados' },
        ]"
        :key="i"
        class="flex items-baseline gap-4"
      >
        <span class="w-16 text-[10px] text-slate-400 font-mono flex-shrink-0 text-right">{{ s.px }}</span>
        <span class="text-[#010543]" :class="`text-${s.size} font-semibold`">{{ s.sample }}</span>
      </div>
    </div>
  </section>
</template>