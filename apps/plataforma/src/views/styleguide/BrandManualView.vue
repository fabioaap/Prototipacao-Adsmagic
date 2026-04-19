<script setup lang="ts">
import { ref, computed } from 'vue'

const activeSection = ref('hero')
const copiedColor = ref('')

/* ÔöÇÔöÇÔöÇ Star-mark path (source: star.svg oficial) ÔöÇÔöÇÔöÇ */
const starPath = 'M77.9645 120.387C77.9645 108.106 83.0981 96.3291 92.2363 87.6457C101.374 78.9623 113.769 74.084 126.692 74.084C129.277 74.084 131.756 73.1084 133.583 71.3717C135.411 69.635 136.438 67.2796 136.438 64.8235C136.438 62.3675 135.411 60.0121 133.583 58.2754C131.756 56.5387 129.277 55.563 126.692 55.563C113.769 55.563 101.374 50.6848 92.2363 42.0014C83.0981 33.318 77.9645 21.5408 77.9645 9.26057C77.9645 6.80453 76.9377 4.44898 75.1101 2.7123C73.2825 0.975617 70.8037 0 68.219 0C65.6344 0 63.1556 0.975617 61.328 2.7123C59.5004 4.44898 58.4736 6.80453 58.4736 9.26057C58.4736 21.5408 53.3395 33.318 44.2013 42.0014C35.0631 50.6848 22.6693 55.563 9.74597 55.563C7.1613 55.563 4.68203 56.5387 2.85439 58.2754C1.02675 60.0121 0 62.3675 0 64.8235C0 67.2796 1.02675 69.635 2.85439 71.3717C4.68203 73.1084 7.1613 74.084 9.74597 74.084C22.6693 74.084 35.0631 78.9623 44.2013 87.6457C53.3395 96.3291 58.4736 108.106 58.4736 120.387C58.4736 122.843 59.5004 125.198 61.328 126.935C63.1556 128.671 65.6344 129.647 68.219 129.647C70.8037 129.647 73.2825 128.671 75.1101 126.935C76.9377 125.198 77.9645 122.843 77.9645 120.387Z'
const starVB = '0 0 137 130'

const sections = [
  { id: 'hero', label: 'Capa' },
  { id: 'logo', label: 'Logo' },
  { id: 'symbol', label: 'S├¡mbolo' },
  { id: 'colors', label: 'Cores' },
  { id: 'typography', label: 'Tipografia' },
  { id: 'grafismos', label: 'Grafismos' },
  { id: 'cards', label: 'Cards de Impacto' },
  { id: 'patterns', label: 'Padr├Áes de Uso' },
]

/* ÔöÇÔöÇÔöÇ Paleta de cores da marca ÔöÇÔöÇÔöÇ */
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

/* ÔöÇÔöÇÔöÇ Funcionalidades cards data ÔöÇÔöÇÔöÇ */
const featureCards = [
  { metric: '+20', unit: 'fontes', desc: 'Associadas em tempo real ao n├║mero do WhatsApp' },
  { metric: '+3x', unit: 'mais r├ípido', desc: 'Algoritmo aprende com sinais 1st-party' },
  { metric: '+3x', unit: '', desc: 'Algoritmo aprende com sinais 1st-party' },
  { metric: '+100', unit: 'leads', desc: 'Criados no CRM zero copia-e-cola' },
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
  <div class="min-h-screen bg-white">
    <!-- ÔöÇÔöÇÔöÇ Sticky nav ÔöÇÔöÇÔöÇ -->
    <nav class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8 overflow-x-auto">
        <div class="flex items-center gap-2 flex-shrink-0">
          <img src="/logo-icon.svg" alt="Adsmagic" class="w-6 h-6" />
          <span class="text-sm font-semibold text-[#010543] tracking-tight">Brand System</span>
        </div>
        <div class="flex gap-1">
          <button
            v-for="s in sections"
            :key="s.id"
            @click="activeSection = s.id"
            class="px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap"
            :class="activeSection === s.id
              ? 'bg-[#010543] text-white'
              : 'text-slate-500 hover:text-[#010543] hover:bg-slate-100'"
          >
            {{ s.label }}
          </button>
        </div>
      </div>
    </nav>

    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <!-- SE├ç├âO: HERO / CAPA                         -->
    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <section v-show="activeSection === 'hero'" class="relative overflow-hidden min-h-[90vh] flex items-center justify-center" style="background-color: #000E50">
      <!-- Grafismo: barras diagonais animadas -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- Blue bars -->
        <div class="absolute w-[120px] h-[600px] rounded-[60px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -100px; left: 5%" />
        <div class="absolute w-[100px] h-[500px] rounded-[50px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1E3A8A 0%, #3B82F6 100%); top: 200px; left: 15%" />
        <div class="absolute w-[140px] h-[700px] rounded-[70px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -50px; right: 10%" />
        <div class="absolute w-[90px] h-[450px] rounded-[45px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1939AB 0%, #2563EB 100%); bottom: -100px; right: 30%" />
        <!-- Green bars -->
        <div
          class="absolute w-[110px] h-[550px] rounded-[55px] rotate-[135deg]"
          style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.6; bottom: -150px; left: 8%"
        />
        <div
          class="absolute w-[100px] h-[480px] rounded-[50px] rotate-[135deg]"
          style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.5; top: 100px; right: 15%"
        />
        <!-- Glow ellipses -->
        <div class="absolute w-[800px] h-[800px] rounded-full opacity-[0.06]" style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); top: -200px; right: -200px" />
        <div class="absolute w-[600px] h-[600px] rounded-full opacity-[0.05]" style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); bottom: -150px; left: -100px" />
      </div>

      <!-- Central content -->
      <div class="relative text-center z-10">
        <!-- 4-pointed star icon -->
        <div class="mb-10 flex justify-center">
          <svg width="96" height="91" :viewBox="starVB" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path :d="starPath" fill="white"/>
          </svg>
        </div>
        <h1 class="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
          Brand Manual
        </h1>
        <p class="text-lg text-white/50 max-w-md mx-auto font-light">
          Identidade visual, grafismos e guia de uso da marca Adsmagic
        </p>
        <div class="mt-10 flex justify-center">
          <img src="/logo-wordmark.svg" alt="Adsmagic" class="h-7 brightness-0 invert opacity-70" />
        </div>
      </div>
    </section>

    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <!-- SE├ç├âO: LOGO                                -->
    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <section v-show="activeSection === 'logo'" class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="text-3xl font-bold text-[#010543] mb-2">Logo</h2>
      <p class="text-slate-500 mb-12 max-w-xl">O logo Adsmagic combina o logotipo (wordmark) com o s├¡mbolo (star-mark). Sempre use os arquivos SVG originais.</p>

      <div class="grid md:grid-cols-2 gap-8 mb-16">
        <!-- Vers├úo sobre fundo claro -->
        <div class="bg-slate-50 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[280px] border border-slate-200">
          <p class="text-xs text-slate-400 mb-6 uppercase tracking-widest">Fundo Claro</p>
          <img src="/logo-wordmark.svg" alt="Adsmagic Wordmark" class="h-8 mb-4" />
          <img src="/logo-icon.svg" alt="Adsmagic Symbol" class="h-12 mt-4" />
        </div>
        <!-- Vers├úo sobre fundo escuro -->
        <div class="rounded-2xl p-12 flex flex-col items-center justify-center min-h-[280px]" style="background-color: #010543">
          <p class="text-xs text-white/40 mb-6 uppercase tracking-widest">Fundo Escuro</p>
          <img src="/logo-wordmark.svg" alt="Adsmagic Wordmark" class="h-8 mb-4 brightness-0 invert" />
          <img src="/logo-icon.svg" alt="Adsmagic Symbol" class="h-12 mt-4 brightness-0 invert" />
        </div>
      </div>

      <!-- Zona de prote├º├úo -->
      <h3 class="text-lg font-semibold text-[#010543] mb-4">Zona de Prote├º├úo</h3>
      <p class="text-sm text-slate-500 mb-6">Mantenha sempre um espa├ºo m├¡nimo ao redor do logo equivalente ├á metade da altura do s├¡mbolo (star-mark).</p>
      <div class="bg-slate-50 rounded-2xl p-12 flex items-center justify-center border border-dashed border-slate-300">
        <div class="border-2 border-dashed border-[#3BB56D]/40 p-8 rounded-xl">
          <img src="/logo-wordmark.svg" alt="Adsmagic" class="h-7" />
        </div>
      </div>

      <!-- Usos incorretos -->
      <h3 class="text-lg font-semibold text-[#010543] mt-12 mb-4">Usos Incorretos</h3>
      <div class="grid sm:grid-cols-3 gap-4">
        <div class="bg-red-50 rounded-xl p-6 border border-red-100">
          <div class="flex items-center justify-center h-20 mb-3">
            <img src="/logo-wordmark.svg" alt="" class="h-6 rotate-12 opacity-50" />
          </div>
          <p class="text-xs text-red-600 text-center">N├úo rotacionar</p>
        </div>
        <div class="bg-red-50 rounded-xl p-6 border border-red-100">
          <div class="flex items-center justify-center h-20 mb-3">
            <img src="/logo-wordmark.svg" alt="" class="h-6 scale-x-150 opacity-50" />
          </div>
          <p class="text-xs text-red-600 text-center">N├úo distorcer propor├º├Áes</p>
        </div>
        <div class="bg-red-50 rounded-xl p-6 border border-red-100">
          <div class="flex items-center justify-center h-20 mb-3" style="background: linear-gradient(to right, #ff6b6b, #ffd93d)">
            <img src="/logo-wordmark.svg" alt="" class="h-6 brightness-0 invert opacity-50" />
          </div>
          <p class="text-xs text-red-600 text-center">N├úo usar sobre fundos multicoloridos</p>
        </div>
      </div>
    </section>

    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <!-- SE├ç├âO: S├ìMBOLO (Star-mark)                 -->
    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <section v-show="activeSection === 'symbol'" class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="text-3xl font-bold text-[#010543] mb-2">S├¡mbolo ÔÇö Star-Mark</h2>
      <p class="text-slate-500 mb-12 max-w-xl">A estrela de 4 pontas ├® o cora├º├úo visual da marca. Representa a "magia" do Adsmagic: converg├¬ncia, foco, intelig├¬ncia.</p>

      <!-- Variantes da estrela -->
      <div class="grid sm:grid-cols-4 gap-6 mb-16">
        <!-- Brand Navy -->
        <div class="bg-slate-50 rounded-2xl p-8 flex flex-col items-center border border-slate-200">
          <svg class="w-16 h-16 mb-4" :viewBox="starVB" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path :d="starPath" fill="#010543"/>
          </svg>
          <span class="text-xs text-slate-500">Navy #010543</span>
        </div>
        <!-- Brand Green -->
        <div class="bg-slate-50 rounded-2xl p-8 flex flex-col items-center border border-slate-200">
          <svg class="w-16 h-16 mb-4" :viewBox="starVB" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path :d="starPath" fill="#3BB56D"/>
          </svg>
          <span class="text-xs text-slate-500">Green #3BB56D</span>
        </div>
        <!-- White on navy -->
        <div class="rounded-2xl p-8 flex flex-col items-center" style="background-color: #010543">
          <svg class="w-16 h-16 mb-4" :viewBox="starVB" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path :d="starPath" fill="white"/>
          </svg>
          <span class="text-xs text-white/50">White on Navy</span>
        </div>
        <!-- Indigo product -->
        <div class="bg-slate-50 rounded-2xl p-8 flex flex-col items-center border border-slate-200">
          <svg class="w-16 h-16 mb-4" :viewBox="starVB" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path :d="starPath" fill="#6366f1"/>
          </svg>
          <span class="text-xs text-slate-500">Indigo #6366F1 (produto)</span>
        </div>
      </div>

      <!-- Tamanhos m├¡nimos -->
      <h3 class="text-lg font-semibold text-[#010543] mb-4">Tamanhos M├¡nimos</h3>
      <div class="flex items-end gap-8 bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <div class="text-center">
          <svg class="w-8 h-8 mx-auto mb-2" :viewBox="starVB" fill="none"><path :d="starPath" fill="#010543"/></svg>
          <span class="text-[10px] text-slate-400">32px ÔÇö m├¡nimo digital</span>
        </div>
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-2" :viewBox="starVB" fill="none"><path :d="starPath" fill="#010543"/></svg>
          <span class="text-[10px] text-slate-400">48px ÔÇö confort├ível</span>
        </div>
        <div class="text-center">
          <svg class="w-20 h-20 mx-auto mb-2" :viewBox="starVB" fill="none"><path :d="starPath" fill="#010543"/></svg>
          <span class="text-[10px] text-slate-400">80px ÔÇö destaque</span>
        </div>
        <div class="text-center">
          <svg class="w-28 h-28 mx-auto mb-2" :viewBox="starVB" fill="none"><path :d="starPath" fill="#010543"/></svg>
          <span class="text-[10px] text-slate-400">112px ÔÇö hero</span>
        </div>
      </div>

      <!-- Anatomy -->
      <h3 class="text-lg font-semibold text-[#010543] mt-12 mb-4">Anatomia do Logo Completo</h3>
      <div class="bg-slate-50 rounded-2xl p-12 border border-slate-200">
        <div class="flex items-center justify-center gap-4">
          <div class="text-center">
            <p class="text-[10px] text-[#3BB56D] uppercase tracking-widest mb-1">Estrela superior</p>
            <p class="text-[10px] text-slate-400 mb-2">#3BB56D</p>
          </div>
          <img src="/logo-icon.svg" alt="Logo" class="h-20" />
          <div class="text-center">
            <p class="text-[10px] text-[#010543] uppercase tracking-widest mb-1">Estrela inferior / Asas</p>
            <p class="text-[10px] text-slate-400 mb-2">#010543</p>
          </div>
        </div>
        <div class="flex justify-center mt-6">
          <img src="/logo-wordmark.svg" alt="Wordmark" class="h-7" />
        </div>
        <p class="text-xs text-slate-400 text-center mt-3">Wordmark: tipografia customizada "adsmagic" + s├¡mbolo integrado</p>
      </div>
    </section>

    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <!-- SE├ç├âO: CORES                               -->
    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <section v-show="activeSection === 'colors'" class="max-w-7xl mx-auto px-6 py-16">
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

    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <!-- SE├ç├âO: TIPOGRAFIA                          -->
    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <section v-show="activeSection === 'typography'" class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="text-3xl font-bold text-[#010543] mb-2">Tipografia</h2>
      <p class="text-slate-500 mb-12 max-w-xl">A fam├¡lia <strong>Inter</strong> ├® a ├║nica fonte autorizada. Vers├ítil, limpa e otimizada para interfaces digitais.</p>

      <!-- Type specimen -->
      <div class="bg-slate-50 rounded-2xl p-12 border border-slate-200 mb-12">
        <p class="text-[10px] text-slate-400 uppercase tracking-widest mb-6">Type Specimen</p>
        <p class="text-8xl font-bold text-[#010543] tracking-tight leading-none mb-2">Aa</p>
        <p class="text-2xl text-[#010543] font-light tracking-wide mb-6">Inter ÔÇö Variable Font</p>
        <p class="text-base text-slate-500">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
        <p class="text-base text-slate-500">abcdefghijklmnopqrstuvwxyz</p>
        <p class="text-base text-slate-500">0123456789 !@#$%&*</p>
      </div>

      <!-- Weights -->
      <h3 class="text-lg font-semibold text-[#010543] mb-4">Pesos</h3>
      <div class="space-y-4 mb-12">
        <div v-for="w in [
          { weight: 300, label: 'Light', usage: 'Subt├¡tulos, textos de apoio' },
          { weight: 400, label: 'Regular', usage: 'Corpo de texto, par├ígrafos' },
          { weight: 500, label: 'Medium', usage: 'Labels, navega├º├úo, bot├Áes' },
          { weight: 600, label: 'Semibold', usage: 'T├¡tulos de se├º├úo, destaque' },
          { weight: 700, label: 'Bold', usage: 'Headlines, hero text' },
          { weight: 800, label: 'Extrabold', usage: 'M├®tricas em cards de impacto' },
        ]" :key="w.weight" class="flex items-baseline gap-6 border-b border-slate-100 pb-3">
          <span class="w-20 text-xs text-slate-400 font-mono flex-shrink-0">{{ w.weight }}</span>
          <span class="text-2xl text-[#010543] flex-1" :style="{ fontWeight: w.weight }">{{ w.label }}</span>
          <span class="text-xs text-slate-400 flex-shrink-0">{{ w.usage }}</span>
        </div>
      </div>

      <!-- Scale -->
      <h3 class="text-lg font-semibold text-[#010543] mb-4">Escala Tipogr├ífica</h3>
      <div class="space-y-3">
        <div v-for="(s, i) in [
          { size: '4xl', px: '36px', sample: 'Transforme leads em clientes fi├®is' },
          { size: '3xl', px: '30px', sample: 'Plataforma completa de marketing' },
          { size: '2xl', px: '24px', sample: 'Intelig├¬ncia artificial para an├║ncios' },
          { size: 'xl', px: '20px', sample: 'Conecte suas fontes de dados' },
          { size: 'lg', px: '18px', sample: 'Automatize seu funil de vendas' },
          { size: 'base', px: '16px', sample: 'Acompanhe m├®tricas em tempo real' },
          { size: 'sm', px: '14px', sample: 'Labels, captions, textos auxiliares' },
          { size: 'xs', px: '12px', sample: 'Timestamps, badges, metadados' },
        ]" :key="i" class="flex items-baseline gap-4">
          <span class="w-16 text-[10px] text-slate-400 font-mono flex-shrink-0 text-right">{{ s.px }}</span>
          <span class="text-[#010543]" :class="`text-${s.size} font-semibold`">{{ s.sample }}</span>
        </div>
      </div>
    </section>

    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <!-- SE├ç├âO: GRAFISMOS                           -->
    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <section v-show="activeSection === 'grafismos'" class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="text-3xl font-bold text-[#010543] mb-2">Grafismos</h2>
      <p class="text-slate-500 mb-12 max-w-xl">Barras diagonais arredondadas em tons de azul e verde sobre fundo navy s├úo o DNA visual das campanhas Adsmagic.</p>

      <!-- Variante 1: Minimalista -->
      <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Variante A ÔÇö Minimalista</h3>
      <div class="relative rounded-2xl overflow-hidden h-[400px] mb-8" style="background-color: #000E50">
        <div class="absolute inset-0">
          <div class="absolute w-[110px] h-[550px] rounded-[55px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.65; bottom: -200px; left: 5%" />
          <div class="absolute w-[800px] h-[800px] rounded-full opacity-[0.04]" style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); bottom: -300px; left: -200px" />
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-20 h-20" :viewBox="starVB" fill="none"><path :d="starPath" fill="white"/></svg>
        </div>
      </div>

      <!-- Variante 2: Completo -->
      <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Variante B ÔÇö Completo</h3>
      <div class="relative rounded-2xl overflow-hidden h-[400px] mb-8" style="background-color: #000E50">
        <div class="absolute inset-0">
          <!-- Blue bars -->
          <div class="absolute w-[100px] h-[500px] rounded-[50px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -120px; left: 10%" />
          <div class="absolute w-[80px] h-[400px] rounded-[40px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1939AB 0%, #3B82F6 100%); top: 80px; left: 25%" />
          <div class="absolute w-[120px] h-[600px] rounded-[60px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -60px; right: 5%" />
          <div class="absolute w-[70px] h-[350px] rounded-[35px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); bottom: -80px; right: 25%" />
          <!-- Green bars -->
          <div class="absolute w-[90px] h-[450px] rounded-[45px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.6; bottom: -100px; left: 15%" />
          <div class="absolute w-[80px] h-[400px] rounded-[50px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.5; top: 50px; right: 12%" />
          <!-- Glows -->
          <div class="absolute w-[600px] h-[600px] rounded-full opacity-[0.05]" style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); top: -200px; right: -150px" />
          <div class="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]" style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); bottom: -150px; left: -100px" />
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-20 h-20" :viewBox="starVB" fill="none"><path :d="starPath" fill="white"/></svg>
        </div>
      </div>

      <!-- Variante 3: Azul suave (fundo do Figma 232:114) -->
      <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Variante C ÔÇö Azul Profundo</h3>
      <div class="relative rounded-2xl overflow-hidden h-[400px] mb-12" style="background-color: #000E50">
        <div class="absolute inset-0">
          <div class="absolute w-[140px] h-[700px] rounded-[70px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #0F2068 0%, #1E40AF 100%); top: -200px; left: 0%" />
          <div class="absolute w-[130px] h-[650px] rounded-[65px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -50px; right: 8%" />
          <!-- Star mark left -->
          <div class="absolute left-[15%] top-1/2 -translate-y-1/2">
            <svg class="w-52 h-52 opacity-25" :viewBox="starVB" fill="none"><path :d="starPath" fill="#2563EB"/></svg>
          </div>
          <!-- Glow -->
          <div class="absolute w-[800px] h-[800px] rounded-full opacity-[0.06]" style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); top: -300px; right: -250px" />
          <div class="absolute w-[600px] h-[600px] rounded-full opacity-[0.04]" style="background: radial-gradient(circle, #1E3A8A 0%, transparent 70%); bottom: -200px; left: -150px" />
        </div>
        <!-- Logo bottom right -->
        <div class="absolute bottom-6 right-8">
          <img src="/logo-wordmark.svg" alt="Adsmagic" class="h-5 brightness-0 invert opacity-60" />
        </div>
      </div>

      <!-- Regras dos grafismos -->
      <h3 class="text-lg font-semibold text-[#010543] mb-4">Regras de Constru├º├úo</h3>
      <div class="grid sm:grid-cols-2 gap-6">
        <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 class="text-sm font-semibold text-[#010543] mb-2">Barras Diagonais</h4>
          <ul class="text-xs text-slate-500 space-y-1.5">
            <li>ÔÇó Rota├º├úo fixa: <strong>135┬░</strong></li>
            <li>ÔÇó Largura: 70pxÔÇô140px</li>
            <li>ÔÇó Border-radius: 50% da largura</li>
            <li>ÔÇó Sempre em gradiente (nunca cor s├│lida)</li>
          </ul>
        </div>
        <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 class="text-sm font-semibold text-[#010543] mb-2">Barras Azuis</h4>
          <ul class="text-xs text-slate-500 space-y-1.5">
            <li>ÔÇó Gradiente: #1E3A8A ÔåÆ #2563EB</li>
            <li>ÔÇó Opacidade: 15%ÔÇô25%</li>
            <li>ÔÇó Fun├º├úo: profundidade e textura</li>
            <li>ÔÇó M├¡nimo 2, m├íximo 4 por composi├º├úo</li>
          </ul>
        </div>
        <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 class="text-sm font-semibold text-[#010543] mb-2">Barras Verdes</h4>
          <ul class="text-xs text-slate-500 space-y-1.5">
            <li>ÔÇó Gradiente: #059669 ÔåÆ #3BB56D</li>
            <li>ÔÇó Opacidade: 50%ÔÇô65%</li>
            <li>ÔÇó Fun├º├úo: acento, energia, diferencia├º├úo</li>
            <li>ÔÇó M├íximo 2 por composi├º├úo</li>
          </ul>
        </div>
        <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 class="text-sm font-semibold text-[#010543] mb-2">Glow Effects</h4>
          <ul class="text-xs text-slate-500 space-y-1.5">
            <li>ÔÇó Radial gradient circular, fade para transparente</li>
            <li>ÔÇó Opacidade: 4%ÔÇô6%</li>
            <li>ÔÇó Posicionamento: bordas da composi├º├úo</li>
            <li>ÔÇó Cor: azul ou verde da paleta</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <!-- SE├ç├âO: CARDS DE IMPACTO                    -->
    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <section v-show="activeSection === 'cards'" class="max-w-7xl mx-auto px-6 py-16">
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
          <!-- Row 1 -->
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
          <!-- Row 2 -->
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

    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <!-- SE├ç├âO: PADR├òES DE USO                      -->
    <!-- ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ -->
    <section v-show="activeSection === 'patterns'" class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="text-3xl font-bold text-[#010543] mb-2">Padr├Áes de Uso</h2>
      <p class="text-slate-500 mb-12 max-w-xl">Refer├¬ncia r├ípida de como combinar os elementos visuais em diferentes contextos.</p>

      <!-- Contexts grid -->
      <div class="grid sm:grid-cols-2 gap-8">
        <!-- Campanha digital -->
        <div>
          <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">An├║ncios / Social</h3>
          <div class="relative rounded-2xl overflow-hidden aspect-[9/16] max-w-[300px]" style="background-color: #000E50">
            <div class="absolute inset-0">
              <div class="absolute w-[80px] h-[400px] rounded-[40px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.6; bottom: -100px; left: 5%" />
              <div class="absolute w-[70px] h-[350px] rounded-[35px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -80px; right: 10%" />
            </div>
            <div class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <svg class="w-12 h-12 mb-8" :viewBox="starVB" fill="none"><path :d="starPath" fill="white"/></svg>
              <p class="text-xl font-bold text-white leading-tight">Seus leads merecem<br>mais aten├º├úo</p>
              <p class="text-sm text-white/50 mt-3">CRM inteligente para ag├¬ncias</p>
            </div>
            <div class="absolute bottom-4 left-0 right-0 flex justify-center">
              <img src="/logo-wordmark.svg" alt="" class="h-4 brightness-0 invert opacity-50" />
            </div>
          </div>
        </div>

        <!-- Apresenta├º├úo / Deck -->
        <div>
          <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Slides / Deck</h3>
          <div class="relative rounded-2xl overflow-hidden aspect-video" style="background-color: #000E50">
            <div class="absolute inset-0">
              <div class="absolute w-[120px] h-[600px] rounded-[60px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -100px; right: 5%" />
              <div class="absolute w-[90px] h-[450px] rounded-[45px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.5; bottom: -120px; left: 8%" />
            </div>
            <div class="absolute inset-0 flex items-center p-10">
              <div>
                <p class="text-2xl font-bold text-white leading-tight mb-3">Plataforma de Marketing<br>Intelligence</p>
                <p class="text-sm text-white/40">Adsmagic ÔÇö Apresenta├º├úo Comercial</p>
              </div>
            </div>
            <div class="absolute bottom-4 right-6">
              <img src="/logo-wordmark.svg" alt="" class="h-4 brightness-0 invert opacity-50" />
            </div>
          </div>
        </div>

        <!-- Email -->
        <div>
          <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Header de Email</h3>
          <div class="rounded-2xl overflow-hidden border border-slate-200">
            <div class="relative h-20 flex items-center px-6" style="background-color: #010543">
              <img src="/logo-wordmark.svg" alt="" class="h-5 brightness-0 invert" />
              <div class="absolute right-0 top-0 bottom-0 w-32 overflow-hidden">
                <div class="absolute w-[60px] h-[300px] rounded-[30px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.4; top: -100px; right: 10px" />
              </div>
            </div>
            <div class="bg-white p-6">
              <p class="text-sm text-slate-600">Conte├║do do email aquiÔÇª</p>
            </div>
          </div>
        </div>

        <!-- Product UI accent -->
        <div>
          <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Acento no Produto</h3>
          <div class="rounded-2xl overflow-hidden border border-slate-200 bg-white p-6">
            <div class="flex items-center gap-3 mb-4">
              <svg class="w-8 h-8" :viewBox="starVB" fill="none"><path :d="starPath" fill="#6366f1"/></svg>
              <div>
                <p class="text-sm font-semibold text-[#010543]">Campanha otimizada com sucesso</p>
                <p class="text-xs text-slate-400">Seu ROAS aumentou 2.5x esta semana</p>
              </div>
            </div>
            <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full rounded-full w-[72%]" style="background: linear-gradient(to right, #6366f1, #818cf8)" />
            </div>
          </div>
        </div>
      </div>

      <!-- Do / Don't -->
      <h3 class="text-lg font-semibold text-[#010543] mt-16 mb-6">Do / Don't</h3>
      <div class="grid sm:grid-cols-2 gap-6">
        <div class="rounded-xl border-2 border-[#3BB56D] p-6">
          <p class="text-xs font-bold text-[#3BB56D] uppercase tracking-widest mb-3">Ô£ô Fa├ºa</p>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>Use o fundo navy #000E50 para composi├º├Áes com grafismo</li>
            <li>Mantenha as barras a 135┬░ com border-radius arredondado</li>
            <li>Combine 2-4 barras azuis + 1-2 barras verdes</li>
            <li>Use a estrela branca como ponto focal central</li>
            <li>Aplique glow effects sutis (4-6% opacidade)</li>
          </ul>
        </div>
        <div class="rounded-xl border-2 border-red-400 p-6">
          <p class="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Ô£ù Evite</p>
          <ul class="text-sm text-slate-600 space-y-2">
            <li>Barras com cores s├│lidas (sempre gradiente)</li>
            <li>├éngulos diferentes de 135┬░ nos grafismos</li>
            <li>Mais de 6 barras na mesma composi├º├úo</li>
            <li>Glow effects acima de 10% de opacidade</li>
            <li>Usar fontes diferentes de Inter</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-200 py-8 mt-8">
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <img src="/logo-wordmark.svg" alt="Adsmagic" class="h-5 opacity-40" />
        <p class="text-xs text-slate-400">Brand Manual v1.0 ÔÇö Mar├ºo 2026</p>
      </div>
    </footer>
  </div>
</template>
