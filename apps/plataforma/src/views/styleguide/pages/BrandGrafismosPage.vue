<script setup lang="ts">
const starPath = 'M77.9645 120.387C77.9645 108.106 83.0981 96.3291 92.2363 87.6457C101.374 78.9623 113.769 74.084 126.692 74.084C129.277 74.084 131.756 73.1084 133.583 71.3717C135.411 69.635 136.438 67.2796 136.438 64.8235C136.438 62.3675 135.411 60.0121 133.583 58.2754C131.756 56.5387 129.277 55.563 126.692 55.563C113.769 55.563 101.374 50.6848 92.2363 42.0014C83.0981 33.318 77.9645 21.5408 77.9645 9.26057C77.9645 6.80453 76.9377 4.44898 75.1101 2.7123C73.2825 0.975617 70.8037 0 68.219 0C65.6344 0 63.1556 0.975617 61.328 2.7123C59.5004 4.44898 58.4736 6.80453 58.4736 9.26057C58.4736 21.5408 53.3395 33.318 44.2013 42.0014C35.0631 50.6848 22.6693 55.563 9.74597 55.563C7.1613 55.563 4.68203 56.5387 2.85439 58.2754C1.02675 60.0121 0 62.3675 0 64.8235C0 67.2796 1.02675 69.635 2.85439 71.3717C4.68203 73.1084 7.1613 74.084 9.74597 74.084C22.6693 74.084 35.0631 78.9623 44.2013 87.6457C53.3395 96.3291 58.4736 108.106 58.4736 120.387C58.4736 122.843 59.5004 125.198 61.328 126.935C63.1556 128.671 65.6344 129.647 68.219 129.647C70.8037 129.647 73.2825 128.671 75.1101 126.935C76.9377 125.198 77.9645 122.843 77.9645 120.387Z'
const starVB = '0 0 137 130'
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 py-16 bg-white">
    <h2 class="text-3xl font-bold text-[#010543] mb-2">Grafismos</h2>
    <p class="text-slate-500 mb-12 max-w-xl">Barras diagonais arredondadas em tons de azul e verde sobre fundo navy s├úo o DNA visual das campanhas Adsmagic.</p>

    <!-- Variante A -->
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

    <!-- Variante B -->
    <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Variante B ÔÇö Completo</h3>
    <div class="relative rounded-2xl overflow-hidden h-[400px] mb-8" style="background-color: #000E50">
      <div class="absolute inset-0">
        <div class="absolute w-[100px] h-[500px] rounded-[50px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -120px; left: 10%" />
        <div class="absolute w-[80px] h-[400px] rounded-[40px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1939AB 0%, #3B82F6 100%); top: 80px; left: 25%" />
        <div class="absolute w-[120px] h-[600px] rounded-[60px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -60px; right: 5%" />
        <div class="absolute w-[70px] h-[350px] rounded-[35px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); bottom: -80px; right: 25%" />
        <div class="absolute w-[90px] h-[450px] rounded-[45px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.6; bottom: -100px; left: 15%" />
        <div class="absolute w-[80px] h-[400px] rounded-[50px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.5; top: 50px; right: 12%" />
        <div class="absolute w-[600px] h-[600px] rounded-full opacity-[0.05]" style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); top: -200px; right: -150px" />
        <div class="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]" style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); bottom: -150px; left: -100px" />
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <svg class="w-20 h-20" :viewBox="starVB" fill="none"><path :d="starPath" fill="white"/></svg>
      </div>
    </div>

    <!-- Variante C -->
    <h3 class="text-sm text-slate-400 uppercase tracking-widest mb-3">Variante C ÔÇö Azul Profundo</h3>
    <div class="relative rounded-2xl overflow-hidden h-[400px] mb-12" style="background-color: #000E50">
      <div class="absolute inset-0">
        <div class="absolute w-[140px] h-[700px] rounded-[70px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #0F2068 0%, #1E40AF 100%); top: -200px; left: 0%" />
        <div class="absolute w-[130px] h-[650px] rounded-[65px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -50px; right: 8%" />
        <div class="absolute left-[15%] top-1/2 -translate-y-1/2">
          <svg class="w-52 h-52 opacity-25" :viewBox="starVB" fill="none"><path :d="starPath" fill="#2563EB"/></svg>
        </div>
        <div class="absolute w-[800px] h-[800px] rounded-full opacity-[0.06]" style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); top: -300px; right: -250px" />
        <div class="absolute w-[600px] h-[600px] rounded-full opacity-[0.04]" style="background: radial-gradient(circle, #1E3A8A 0%, transparent 70%); bottom: -200px; left: -150px" />
      </div>
      <div class="absolute bottom-6 right-8">
        <img src="/logo-wordmark.svg" alt="Adsmagic" class="h-5 brightness-0 invert opacity-60" />
      </div>
    </div>

    <!-- Regras -->
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
</template>