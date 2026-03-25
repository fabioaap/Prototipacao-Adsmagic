<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { CircleDot, GitBranch, Sparkles } from 'lucide-vue-next'

const route = useRoute()
const pageTitle = computed(() => (route.meta?.title as string) ?? 'Adsmagic')
const isHome = computed(() => route.path === '/')
</script>

<template>
  <header class="shrink-0 border-b border-zinc-900 bg-zinc-950/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">Workspace</p>
        <div class="mt-1 flex items-center gap-2">
          <h1 class="text-sm font-semibold text-zinc-100">{{ pageTitle }}</h1>
          <span
            v-if="isHome"
            class="rounded-full border border-primary-500/25 bg-primary-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-primary-300"
          >
            Home
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <div class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
          <CircleDot class="h-3.5 w-3.5 text-emerald-400" />
          <span>Dados mockados ativos</span>
        </div>
        <div class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
          <GitBranch class="h-3.5 w-3.5 text-primary-300" />
          <span>Baseline AS-IS</span>
        </div>
        <div class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
          <Sparkles class="h-3.5 w-3.5 text-amber-300" />
          <span>Exploração guiada</span>
        </div>
      </div>
    </div>
  </header>
</template>
