<script setup lang="ts">
const starPath = 'M77.9645 120.387C77.9645 108.106 83.0981 96.3291 92.2363 87.6457C101.374 78.9623 113.769 74.084 126.692 74.084C129.277 74.084 131.756 73.1084 133.583 71.3717C135.411 69.635 136.438 67.2796 136.438 64.8235C136.438 62.3675 135.411 60.0121 133.583 58.2754C131.756 56.5387 129.277 55.563 126.692 55.563C113.769 55.563 101.374 50.6848 92.2363 42.0014C83.0981 33.318 77.9645 21.5408 77.9645 9.26057C77.9645 6.80453 76.9377 4.44898 75.1101 2.7123C73.2825 0.975617 70.8037 0 68.219 0C65.6344 0 63.1556 0.975617 61.328 2.7123C59.5004 4.44898 58.4736 6.80453 58.4736 9.26057C58.4736 21.5408 53.3395 33.318 44.2013 42.0014C35.0631 50.6848 22.6693 55.563 9.74597 55.563C7.1613 55.563 4.68203 56.5387 2.85439 58.2754C1.02675 60.0121 0 62.3675 0 64.8235C0 67.2796 1.02675 69.635 2.85439 71.3717C4.68203 73.1084 7.1613 74.084 9.74597 74.084C22.6693 74.084 35.0631 78.9623 44.2013 87.6457C53.3395 96.3291 58.4736 108.106 58.4736 120.387C58.4736 122.843 59.5004 125.198 61.328 126.935C63.1556 128.671 65.6344 129.647 68.219 129.647C70.8037 129.647 73.2825 128.671 75.1101 126.935C76.9377 125.198 77.9645 122.843 77.9645 120.387Z'
const starVB = '0 0 137 130'
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 py-16 bg-white">
    <h2 class="text-3xl font-bold text-[#010543] mb-2">S├¡mbolo ÔÇö Star-Mark</h2>
    <p class="text-slate-500 mb-12 max-w-xl">A estrela de 4 pontas ├® o cora├º├úo visual da marca. Representa a "magia" do Adsmagic: converg├¬ncia, foco, intelig├¬ncia.</p>

    <!-- Variantes da estrela -->
    <div class="grid sm:grid-cols-4 gap-6 mb-16">
      <div class="bg-slate-50 rounded-2xl p-8 flex flex-col items-center border border-slate-200">
        <svg class="w-16 h-16 mb-4" :viewBox="starVB" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path :d="starPath" fill="#010543"/>
        </svg>
        <span class="text-xs text-slate-500">Navy #010543</span>
      </div>
      <div class="bg-slate-50 rounded-2xl p-8 flex flex-col items-center border border-slate-200">
        <svg class="w-16 h-16 mb-4" :viewBox="starVB" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path :d="starPath" fill="#3BB56D"/>
        </svg>
        <span class="text-xs text-slate-500">Green #3BB56D</span>
      </div>
      <div class="rounded-2xl p-8 flex flex-col items-center" style="background-color: #010543">
        <svg class="w-16 h-16 mb-4" :viewBox="starVB" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path :d="starPath" fill="white"/>
        </svg>
        <span class="text-xs text-white/50">White on Navy</span>
      </div>
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
</template>
