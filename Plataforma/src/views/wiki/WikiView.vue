<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { mockWikiSections } from '@/data/wiki'

const openItems = ref<Set<string>>(new Set())

function toggleItem(key: string) {
  if (openItems.value.has(key)) {
    openItems.value.delete(key)
  } else {
    openItems.value.add(key)
  }
}

function isOpen(sectionId: string, itemId: string) {
  return openItems.value.has(`${sectionId}::${itemId}`)
}
</script>

<template>
  <div class="space-y-8 pb-4">
    <section class="border-b border-zinc-900 pb-8">
      <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">Base de conhecimento</p>
      <h2 class="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">Wiki do protótipo</h2>
      <p class="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
        Um espaço enxuto para documentar decisões, combinados e referências do ciclo atual. Clique em um item para expandir.
      </p>
      <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-400 inline-block">
        <span class="font-semibold text-zinc-100">{{ mockWikiSections.length }}</span> seções
        · <span class="font-semibold text-zinc-100">{{ mockWikiSections.reduce((a, s) => a + s.items.length, 0) }}</span> entradas
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="section in mockWikiSections"
        :key="section.id"
        class="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{{ section.tag }}</p>
        <h3 class="mt-2 text-lg font-semibold tracking-tight text-zinc-100">{{ section.title }}</h3>
        <p class="mt-3 text-sm leading-6 text-zinc-400">{{ section.description }}</p>

        <ul class="mt-6 space-y-2">
          <li
            v-for="item in section.items"
            :key="item.id"
            class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-zinc-300 transition-colors hover:text-zinc-100"
              @click="toggleItem(`${section.id}::${item.id}`)"
            >
              <span>{{ item.title }}</span>
              <ChevronDown
                class="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200"
                :class="{ 'rotate-180': isOpen(section.id, item.id) }"
              />
            </button>
            <Transition
              enter-active-class="transition-all duration-200 ease-out overflow-hidden"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-48 opacity-100"
              leave-active-class="transition-all duration-150 ease-in overflow-hidden"
              leave-from-class="max-h-48 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div
                v-if="isOpen(section.id, item.id)"
                class="border-t border-zinc-800 px-4 pb-4 pt-3 text-sm leading-6 text-zinc-400"
              >
                {{ item.description }}
              </div>
            </Transition>
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>