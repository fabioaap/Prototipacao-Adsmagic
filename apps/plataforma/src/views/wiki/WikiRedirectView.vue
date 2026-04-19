<script setup lang="ts">
import { onMounted } from 'vue'

const docsPortalUrl = (import.meta.env.VITE_DOCS_PORTAL_URL || `${import.meta.env.BASE_URL}wiki`).replace(/\/$/, '')

onMounted(() => {
  window.location.assign(`${docsPortalUrl}/`)
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-950">
    <p class="text-white/50 text-sm">Redirecionando para a wiki…</p>
  </div>
</template>
