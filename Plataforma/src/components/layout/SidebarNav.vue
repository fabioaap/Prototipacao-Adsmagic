<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { BookOpen, LayoutGrid, Link2, PanelsTopLeft, Sparkles, Users, Target, Plug } from 'lucide-vue-next'

const route = useRoute()

const navGroups = [
  {
    title: 'Navegação',
    items: [
      { to: '/', label: 'Início', icon: LayoutGrid, exact: true },
      { to: '/rotas', label: 'Rotas', icon: Link2 },
      { to: '/kanban', label: 'Kanban', icon: PanelsTopLeft },
      { to: '/wiki', label: 'Wiki', icon: BookOpen },
      { to: '/contacts', label: 'Contatos', icon: Users },
      { to: '/campaigns', label: 'Campanhas', icon: Target },
      { to: '/integrations', label: 'Integrações', icon: Plug },
    ]
  }
]

function isActive(item: { to: string; exact?: boolean }) {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}
</script>

<template>
  <aside class="hidden min-h-screen w-72 shrink-0 border-r border-zinc-900 bg-zinc-950 xl:flex xl:flex-col">
    <div class="border-b border-zinc-900 px-6 py-6">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-400 to-cyan-400/80 shadow-[0_0_40px_rgba(124,58,237,0.18)]">
          <Sparkles class="h-5 w-5 text-white" />
        </div>
        <div>
          <div class="text-lg font-semibold tracking-tight text-zinc-100">educacross</div>
          <span class="mt-1 inline-flex rounded-full border border-primary-500/20 bg-primary-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-300">
            prototipação
          </span>
        </div>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-4 py-5">
      <div
        v-for="group in navGroups"
        :key="group.title"
        class="mb-7"
      >
        <p class="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          {{ group.title }}
        </p>
        <div class="mt-3 space-y-1.5">
          <RouterLink
            v-for="item in group.items"
            :key="item.to + item.label"
            :to="item.to"
            class="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all"
            :class="isActive(item)
              ? 'bg-primary-500/15 text-zinc-50 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.18)]'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'"
          >
            <component
              :is="item.icon"
              class="h-4.5 w-4.5 shrink-0"
              :class="isActive(item) ? 'text-primary-300' : 'text-zinc-500 group-hover:text-zinc-200'"
            />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="border-t border-zinc-900 px-6 py-5">
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
        <p class="text-xs font-medium text-zinc-300">Escopo atual</p>
        <p class="mt-1 text-xs text-zinc-500">Navegação completa: início, rotas, kanban, wiki, contatos, campanhas e integrações.</p>
      </div>
    </div>
  </aside>
</template>
