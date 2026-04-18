<script setup lang="ts">
const starPath = 'M77.9645 120.387C77.9645 108.106 83.0981 96.3291 92.2363 87.6457C101.374 78.9623 113.769 74.084 126.692 74.084C129.277 74.084 131.756 73.1084 133.583 71.3717C135.411 69.635 136.438 67.2796 136.438 64.8235C136.438 62.3675 135.411 60.0121 133.583 58.2754C131.756 56.5387 129.277 55.563 126.692 55.563C113.769 55.563 101.374 50.6848 92.2363 42.0014C83.0981 33.318 77.9645 21.5408 77.9645 9.26057C77.9645 6.80453 76.9377 4.44898 75.1101 2.7123C73.2825 0.975617 70.8037 0 68.219 0C65.6344 0 63.1556 0.975617 61.328 2.7123C59.5004 4.44898 58.4736 6.80453 58.4736 9.26057C58.4736 21.5408 53.3395 33.318 44.2013 42.0014C35.0631 50.6848 22.6693 55.563 9.74597 55.563C7.1613 55.563 4.68203 56.5387 2.85439 58.2754C1.02675 60.0121 0 62.3675 0 64.8235C0 67.2796 1.02675 69.635 2.85439 71.3717C4.68203 73.1084 7.1613 74.084 9.74597 74.084C22.6693 74.084 35.0631 78.9623 44.2013 87.6457C53.3395 96.3291 58.4736 108.106 58.4736 120.387C58.4736 122.843 59.5004 125.198 61.328 126.935C63.1556 128.671 65.6344 129.647 68.219 129.647C70.8037 129.647 73.2825 128.671 75.1101 126.935C76.9377 125.198 77.9645 122.843 77.9645 120.387Z'
const starVB = '0 0 137 130'
</script>

<template>
  <section class="relative overflow-hidden min-h-[90vh] flex items-center justify-center" style="background-color: #000E50">
    <!-- Grafismo: barras diagonais animadas -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute w-[120px] h-[600px] rounded-[60px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -100px; left: 5%" />
      <div class="absolute w-[100px] h-[500px] rounded-[50px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1E3A8A 0%, #3B82F6 100%); top: 200px; left: 15%" />
      <div class="absolute w-[140px] h-[700px] rounded-[70px] rotate-[135deg] opacity-20" style="background: linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%); top: -50px; right: 10%" />
      <div class="absolute w-[90px] h-[450px] rounded-[45px] rotate-[135deg] opacity-15" style="background: linear-gradient(180deg, #1939AB 0%, #2563EB 100%); bottom: -100px; right: 30%" />
      <div class="absolute w-[110px] h-[550px] rounded-[55px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.6; bottom: -150px; left: 8%" />
      <div class="absolute w-[100px] h-[480px] rounded-[50px] rotate-[135deg]" style="background: linear-gradient(180deg, #059669 0%, #3BB56D 100%); opacity: 0.5; top: 100px; right: 15%" />
      <div class="absolute w-[800px] h-[800px] rounded-full opacity-[0.06]" style="background: radial-gradient(circle, #2563EB 0%, transparent 70%); top: -200px; right: -200px" />
      <div class="absolute w-[600px] h-[600px] rounded-full opacity-[0.05]" style="background: radial-gradient(circle, #3BB56D 0%, transparent 70%); bottom: -150px; left: -100px" />
    </div>

    <div class="relative text-center z-10">
      <div class="mb-10 flex justify-center">
        <svg width="96" height="91" :viewBox="starVB" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path :d="starPath" fill="white"/>
        </svg>
      </div>
      <h1 class="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">Brand Manual</h1>
      <p class="text-lg text-white/50 max-w-md mx-auto font-light">Identidade visual, grafismos e guia de uso da marca Adsmagic</p>
      <div class="mt-10 flex justify-center">
        <img src="/logo-wordmark.svg" alt="Adsmagic" class="h-7 brightness-0 invert opacity-70" />
      </div>
    </div>
  </section>
</template>