<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  window.location.href = import.meta.env.BASE_URL + 'wiki/'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-950">
    <p class="text-white/50 text-sm">Redirecionando para a wiki…</p>
  </div>
</template>
