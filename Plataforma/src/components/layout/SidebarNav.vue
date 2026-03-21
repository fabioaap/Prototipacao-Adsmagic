<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/', label: 'Início', icon: '🏠', exact: true },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/contacts', label: 'Contatos', icon: '👥' },
  { to: '/sales', label: 'Vendas', icon: '💰' },
  { to: '/campaigns', label: 'Campanhas', icon: '📣' },
  { to: '/tracking', label: 'Links Rastreáveis', icon: '🔗' },
  { to: '/integrations', label: 'Integrações', icon: '🔌' },
  { to: '/messages', label: 'Mensagens', icon: '💬' },
  { to: '/settings', label: 'Configurações', icon: '⚙️' },
]

function isActive(item: { to: string; exact?: boolean }) {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}
</script>

<template>
  <aside class="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen shrink-0">
    <!-- Logo -->
    <div class="px-6 py-5 border-b border-gray-100">
      <div class="text-xl font-bold text-primary-600">Adsmagic</div>
      <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 rounded-full">
        Prototipação
      </span>
    </div>

    <!-- Nav links -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="isActive(item)
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
      >
        <span class="text-base leading-none">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
      v1.0.0 · AS-IS baseline
    </div>
  </aside>
</template>
