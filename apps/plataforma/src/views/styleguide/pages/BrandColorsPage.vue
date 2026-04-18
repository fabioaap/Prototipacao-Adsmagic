<script setup lang="ts">
import { ref } from 'vue'

const copiedColor = ref('')

const brandCore = [
  { name: 'Navy', hex: '#010543', usage: 'Logo principal, texto sobre fundo claro' },
  { name: 'Green', hex: '#3BB56D', usage: 'Logo (estrela + seta), CTAs, acentos positivos' },
  { name: 'Campaign BG', hex: '#000E50', usage: 'Fundos de campanha, grafismos escuros' },
]

const primaryScale = [
  { name: '50', hex: '#eef2ff' },
  { name: '100', hex: '#e0e7ff' },
  { name: '200', hex: '#c7d2fe' },
  { name: '300', hex: '#a5b4fc' },
  { name: '400', hex: '#818cf8' },
  { name: '500', hex: '#6366f1' },
  { name: '600', hex: '#4f46e5' },
  { name: '700', hex: '#4338ca' },
  { name: '800', hex: '#3730a3' },
  { name: '900', hex: '#312e81' },
]

const campaignColors = [
  { name: 'Deep Navy', hex: '#000E50' },
  { name: 'Royal Blue', hex: '#1E3A8A' },
  { name: 'Bright Blue', hex: '#2563EB' },
  { name: 'Accent Green', hex: '#3BB56D' },
  { name: 'Emerald Grad', hex: '#059669' },
  { name: 'Light Sage', hex: '#E8F0E0' },
]

const semanticColors = [
  { name: 'Success', hex: '#10b981' },
  { name: 'Warning', hex: '#f59e0b' },
  { name: 'Error', hex: '#ef4444' },
  { name: 'Info', hex: '#3b82f6' },
]

function copyHex(hex: string) {
  navigator.clipboard.writeText(hex)
  copiedColor.value = hex
  setTimeout(() => copiedColor.value = '', 1500)
}

function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#010543' : '#ffffff'
}
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 py-16 bg-white">
    <h2 class="text-3xl font-bold text-[#010543] mb-2">Cores</h2>
    <p class="text-slate-500 mb-12 max-w-xl">A paleta Adsmagic opera em dois contextos: <strong>marca/campanha</strong> (navy + green) e <strong>produto/plataforma</strong> (indigo scale).</p>

    <!-- Brand Core -->
    <h3 class="text-lg font-semibold text-[#010543] mb-4">Cores Prim├írias da Marca</h3>
    <div class="grid sm:grid-cols-3 gap-4 mb-12">
      <div
        v-for="c in brandCore" :key="c.hex"
        class="rounded-2xl p-6 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] relative group"
        :style="{ backgroundColor: c.hex }"
        @click="copyHex(c.hex)"
      >
        <p class="text-2xl font-bold mb-1" :style="{ color: contrastText(c.hex) }">{{ c.name }}</p>
        <p class="text-sm font-mono opacity-70" :style="{ color: contrastText(c.hex) }">{{ c.hex }}</p>
        <p class="text-xs mt-3 opacity-50" :style="{ color: contrastText(c.hex) }">{{ c.usage }}</p>
        <span
          v-if="copiedColor === c.hex"
          class="absolute top-3 right-3 text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full"
          :style="{ color: contrastText(c.hex) }"
        >Copiado!</span>
      </div>
    </div>

    <!-- Product Indigo Scale -->
    <h3 class="text-lg font-semibold text-[#010543] mb-4">Escala Indigo ÔÇö Produto</h3>
    <div class="flex gap-0 rounded-2xl overflow-hidden mb-12">
      <div
        v-for="c in primaryScale" :key="c.hex"
        class="flex-1 py-8 px-2 flex flex-col items-center justify-end cursor-pointer transition-all hover:flex-[1.5]"
        :style="{ backgroundColor: c.hex }"
        @click="copyHex(c.hex)"
      >
        <p class="text-[10px] font-bold mb-1" :style="{ color: contrastText(c.hex) }">{{ c.name }}</p>
        <p class="text-[9px] font-mono opacity-70" :style="{ color: contrastText(c.hex) }">{{ c.hex }}</p>
        <span
          v-if="copiedColor === c.hex"
          class="text-[9px] mt-1 bg-white/20 px-1.5 py-0.5 rounded"
          :style="{ color: contrastText(c.hex) }"
        >Ô£ô</span>
      </div>
    </div>

    <!-- Campaign Colors -->
    <h3 class="text-lg font-semibold text-[#010543] mb-4">Paleta de Campanha</h3>
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-12">
      <div
        v-for="c in campaignColors" :key="c.hex"
        class="rounded-xl p-4 cursor-pointer transition-transform hover:scale-105 active:scale-95 aspect-square flex flex-col justify-end"
        :style="{ backgroundColor: c.hex }"
        @click="copyHex(c.hex)"
      >
        <p class="text-[10px] font-semibold" :style="{ color: contrastText(c.hex) }">{{ c.name }}</p>
        <p class="text-[9px] font-mono opacity-60" :style="{ color: contrastText(c.hex) }">{{ c.hex }}</p>
      </div>
    </div>

    <!-- Semantic -->
    <h3 class="text-lg font-semibold text-[#010543] mb-4">Cores Sem├ónticas</h3>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="c in semanticColors" :key="c.hex"
        class="rounded-xl p-4 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        :style="{ backgroundColor: c.hex }"
        @click="copyHex(c.hex)"
      >
        <p class="text-sm font-semibold text-white">{{ c.name }}</p>
        <p class="text-xs font-mono text-white/60">{{ c.hex }}</p>
      </div>
    </div>
  </section>
</template>