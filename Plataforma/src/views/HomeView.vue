<script setup lang="ts">
import { RouterLink } from 'vue-router'

const modules = [
  { to: '/dashboard', icon: '📊', title: 'Dashboard', description: 'Visão geral das métricas de atribuição, ROI e funil de vendas.' },
  { to: '/contacts', icon: '👥', title: 'Contatos', description: 'Base de leads e contatos com histórico de interações e origem.' },
  { to: '/sales', icon: '💰', title: 'Vendas', description: 'Funil de vendas Kanban com oportunidades organizadas por etapa.' },
  { to: '/campaigns', icon: '📣', title: 'Campanhas', description: 'Gestão de campanhas Meta Ads e Google Ads com métricas de CPL.' },
  { to: '/tracking', icon: '🔗', title: 'Links Rastreáveis', description: 'UTMs e links curtos para rastreamento preciso de origem de leads.' },
  { to: '/integrations', icon: '🔌', title: 'Integrações', description: 'Conexão com plataformas de anúncios: Meta, Google, WhatsApp e TikTok.' },
  { to: '/messages', icon: '💬', title: 'Mensagens', description: 'Central de comunicação e atendimento aos leads em um só lugar.' },
  { to: '/settings', icon: '⚙️', title: 'Configurações', description: 'Origens, etapas do funil, fuso horário e configurações gerais.' },
]
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Bem-vindo ao Adsmagic</h2>
      <p class="mt-1 text-gray-500">Ambiente de prototipação — selecione um módulo para explorar</p>
      <div class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-lg text-sm text-violet-700">
        <span>🧪</span>
        <span>Branch: <strong>prototypes/as-is</strong> — todos os dados são mockados</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="mod in modules"
        :key="mod.to"
        :to="mod.to"
        class="block bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all group"
      >
        <div class="text-3xl mb-3">{{ mod.icon }}</div>
        <h3 class="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {{ mod.title }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 leading-relaxed">{{ mod.description }}</p>
        <div class="mt-4 text-xs text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Abrir módulo →
        </div>
      </RouterLink>
    </div>
  </div>
</template>
