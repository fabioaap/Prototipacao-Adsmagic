<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const pageTitle = computed(() => (route.meta?.title as string) ?? 'Adsmagic')
const isHome = computed(() => route.path === '/')
</script>

<template>
  <header class="shrink-0 border-b border-border bg-background/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Adsmagic Workspace</p>
        <div class="mt-1 flex items-center gap-2">
          <h1 class="text-sm font-semibold text-foreground">{{ pageTitle }}</h1>
          <span
            v-if="isHome"
            class="rounded-full border border-primary-500/25 bg-primary-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-300"
          >
            Home
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
