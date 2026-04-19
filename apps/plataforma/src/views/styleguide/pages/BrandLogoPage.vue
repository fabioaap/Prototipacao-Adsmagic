<template>
  <section class="max-w-7xl mx-auto px-6 py-16 bg-white">
    <h2 class="text-3xl font-bold text-[#010543] mb-2">Logo</h2>
    <p class="text-slate-500 mb-12 max-w-xl">O logo Adsmagic combina o logotipo (wordmark) com o s├¡mbolo (star-mark). Sempre use os arquivos SVG originais.</p>

    <div class="grid md:grid-cols-2 gap-8 mb-16">
      <div class="bg-slate-50 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[280px] border border-slate-200">
        <p class="text-xs text-slate-400 mb-6 uppercase tracking-widest">Fundo Claro</p>
        <img src="/logo-wordmark.svg" alt="Adsmagic Wordmark" class="h-8 mb-4" />
        <img src="/logo-icon.svg" alt="Adsmagic Symbol" class="h-12 mt-4" />
      </div>
      <div class="rounded-2xl p-12 flex flex-col items-center justify-center min-h-[280px]" style="background-color: #010543">
        <p class="text-xs text-white/40 mb-6 uppercase tracking-widest">Fundo Escuro</p>
        <img src="/logo-wordmark.svg" alt="Adsmagic Wordmark" class="h-8 mb-4 brightness-0 invert" />
        <img src="/logo-icon.svg" alt="Adsmagic Symbol" class="h-12 mt-4 brightness-0 invert" />
      </div>
    </div>

    <h3 class="text-lg font-semibold text-[#010543] mb-4">Zona de Prote├º├úo</h3>
    <p class="text-sm text-slate-500 mb-6">Mantenha sempre um espa├ºo m├¡nimo ao redor do logo equivalente ├á metade da altura do s├¡mbolo (star-mark).</p>
    <div class="bg-slate-50 rounded-2xl p-12 flex items-center justify-center border border-dashed border-slate-300">
      <div class="border-2 border-dashed border-[#3BB56D]/40 p-8 rounded-xl">
        <img src="/logo-wordmark.svg" alt="Adsmagic" class="h-7" />
      </div>
    </div>

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
</template>
