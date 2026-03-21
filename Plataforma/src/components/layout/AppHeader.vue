<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const pageTitle = computed(() => (route.meta?.title as string) ?? 'Adsmagic')
</script>

<template>
  <header class="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0">
    <h1 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h1>
    <div class="ml-auto flex items-center gap-3">
      <span class="text-xs text-gray-400">Dados mockados</span>
      <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
        AM
      </div>
    </div>
  </header>
</template>
