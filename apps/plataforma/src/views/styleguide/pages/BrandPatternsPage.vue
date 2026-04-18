<script setup lang="ts">
/* ÔöÇÔöÇÔöÇ Star-mark path (source: star.svg oficial) ÔöÇÔöÇÔöÇ */
const starPath = 'M77.9645 120.387C77.9645 108.106 83.0981 96.3291 92.2363 87.6457C101.374 78.9623 113.769 74.084 126.692 74.084C129.277 74.084 131.756 73.1084 133.583 71.3717C135.411 69.635 136.438 67.2796 136.438 64.8235C136.438 62.3675 135.411 60.0121 133.583 58.2754C131.756 56.5387 129.277 55.563 126.692 55.563C113.769 55.563 101.374 50.6848 92.2363 42.0014C83.0981 33.318 77.9645 21.5408 77.9645 9.26057C77.9645 6.80453 76.9377 4.44898 75.1101 2.7123C73.2825 0.975617 70.8037 0 68.219 0C65.6344 0 63.1556 0.975617 61.328 2.7123C59.5004 4.44898 58.4736 6.80453 58.4736 9.26057C58.4736 21.5408 53.3395 33.318 44.2013 42.0014C35.0631 50.6848 22.6693 55.563 9.74597 55.563C7.1613 55.563 4.68203 56.5387 2.85439 58.2754C1.02675 60.0121 0 62.3675 0 64.8235C0 67.2796 1.02675 69.635 2.85439 71.3717C4.68203 73.1084 7.1613 74.084 9.74597 74.084C22.6693 74.084 35.0631 78.9623 44.2013 87.6457C53.3395 96.3291 58.4736 108.106 58.4736 120.387C58.4736 122.843 59.5004 125.198 61.328 126.935C63.1556 128.671 65.6344 129.647 68.219 129.647C70.8037 129.647 73.2825 128.671 75.1101 126.935C76.9377 125.198 77.9645 122.843 77.9645 120.387Z'
const starVB = '0 0 137 130'
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 py-16 bg-white">
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
</template>