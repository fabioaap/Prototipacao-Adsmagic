<script setup lang="ts">
import { ref } from 'vue'
import { useLegacyIcons } from '@/composables/useLegacyIcons'
import logoUrl from '@/assets/saas-logo.svg'

const sidebarCollapsed = ref(false)
const { icons } = useLegacyIcons()

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

interface MetricCard {
  label: string
  value: string
  caption: string
  badge: {
    value: string
    isPositive: boolean
  }
}

const metrics = ref<MetricCard[]>([
  {
    label: 'Gastos anúncios',
    value: 'R$ 784,21',
    caption: 'Investimento do período.',
    badge: { value: '+4,3%', isPositive: true }
  },
  {
    label: 'Receita',
    value: 'R$ 6.060,00',
    caption: 'Receita total atribuída.',
    badge: { value: '+9,8%', isPositive: true }
  },
  {
    label: 'Ticket médio',
    value: 'R$ 757,50',
    caption: 'Valor médio por venda.',
    badge: { value: '+5,2%', isPositive: true }
  },
  {
    label: 'ROI',
    value: '7,7x',
    caption: 'Retorno sobre o investimento.',
    badge: { value: '+0,7x', isPositive: true }
  },
  {
    label: 'Custo por venda',
    value: 'R$ 98,00',
    caption: 'Aquisição média por venda.',
    badge: { value: '-3,1%', isPositive: false }
  },
  {
    label: 'Contatos',
    value: '68',
    caption: 'Leads gerados no período.',
    badge: { value: '+12', isPositive: true }
  },
  {
    label: 'Vendas',
    value: '8',
    caption: 'Negócios fechados.',
    badge: { value: '+2', isPositive: true }
  },
  {
    label: 'Taxa de vendas',
    value: '11,76%',
    caption: 'Conversões sobre contatos.',
    badge: { value: '+1,6 p.p.', isPositive: true }
  }
])

const funnelStages = ref([
  {
    name: 'Agendou atendimento',
    caption: 'Leads com horário confirmado',
    count: 724,
    percentage: '58% do total',
    width: '100%',
    color: '#4f46e5',
    colorSoft: '#6366f1',
    shadow: 'rgba(99, 102, 241, 0.35)'
  },
  {
    name: 'Contato iniciado',
    caption: 'Equipe respondeu e conduziu proposta',
    count: 436,
    percentage: '35% do total',
    delta: '60% avançaram',
    width: '72%',
    color: '#2563eb',
    colorSoft: '#3b82f6',
    shadow: 'rgba(37, 99, 235, 0.35)'
  },
  {
    name: 'Serviço realizado',
    caption: 'Entrega concluída e faturada',
    count: 212,
    percentage: '17% do total',
    delta: '49% avançaram',
    width: '48%',
    color: '#0ea5e9',
    colorSoft: '#06b6d4',
    shadow: 'rgba(14, 165, 233, 0.32)'
  }
])
</script>

<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="app-sidebar hidden lg:flex" :class="{ collapsed: sidebarCollapsed }">
      <div class="app-sidebar-body">
        <div class="app-sidebar-header">
          <a v-if="!sidebarCollapsed" class="app-brand" href="/">
            <img :src="logoUrl" alt="Adsmagic logo" width="145" height="33" class="app-brand-logo" />
          </a>
          <button
            type="button"
            class="app-sidebar-toggle"
            @click="toggleSidebar"
            :aria-label="sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'"
            :aria-expanded="!sidebarCollapsed"
            v-html="icons.chevronLeft"
          />
        </div>

        <nav class="app-nav">
          <div class="app-nav-group">
            <div class="app-nav-heading">PROJETOS</div>
            <a href="/projetos" class="app-nav-link">
              <div class="app-nav-icon" v-html="icons.folder" />
              <span class="app-nav-text">Projetos</span>
            </a>
          </div>

          <div class="app-nav-group">
            <div class="app-nav-heading">PRINCIPAL</div>
            <a href="/dashboard" class="app-nav-link is-active">
              <div class="app-nav-icon" v-html="icons.layoutDashboard" />
              <span class="app-nav-text">Visão geral</span>
            </a>
            <a href="/contatos" class="app-nav-link">
              <div class="app-nav-icon" v-html="icons.users" />
              <span class="app-nav-text">Contatos</span>
            </a>
            <a href="/vendas" class="app-nav-link">
              <div class="app-nav-icon" v-html="icons.trendingUp" />
              <span class="app-nav-text">Vendas</span>
            </a>
          </div>
        </nav>
      </div>
    </aside>

    <div class="flex flex-1 flex-col">
      <!-- Header -->
      <div class="header">
        <div class="container">
          <div class="header-container">
            <button class="notification-button" v-html="icons.bell" />

            <div class="container2">
              <div class="container3">
                <div class="container4">
                  <div class="dra-letcia-lopes">Dra. Letícia Lopes</div>
                </div>
                <div class="container5">
                  <div class="marketing-consultant">Marketing Consultant</div>
                </div>
              </div>
              <div class="backgroundshadow">
                <div class="al">AL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="app-main">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 class="section-title-lg">Visão geral</h1>
            <p class="text-sm text-slate-500">Resumo das principais métricas dos últimos 30 dias.</p>
          </div>
        </div>

        <!-- Summary Grid -->
        <section class="summary-grid">
          <article
            v-for="(metric, index) in metrics"
            :key="index"
            class="summary-card"
          >
            <header class="summary-card-header">
              <p class="summary-card-label">{{ metric.label }}</p>
              <span
                class="summary-card-badge"
                :class="metric.badge.isPositive ? 'summary-card-badge--positive' : 'summary-card-badge--negative'"
              >
                {{ metric.badge.value }}
              </span>
            </header>
            <p class="summary-card-value">{{ metric.value }}</p>
            <p class="summary-card-caption">{{ metric.caption }}</p>
          </article>
        </section>

        <!-- Funil de Conversão -->
        <section class="flex flex-col gap-4">
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="section-title-sm">Funil de conversão</h2>
                <p class="text-xs text-slate-500">Distribuição dos leads por etapa</p>
              </div>
            </div>

            <div class="funnel-chart">
              <div
                v-for="(stage, index) in funnelStages"
                :key="index"
                class="funnel-stage"
                :style="{
                  '--stage-width': stage.width,
                  '--stage-color': stage.color,
                  '--stage-color-soft': stage.colorSoft,
                  '--stage-shadow': stage.shadow
                }"
              >
                <div class="funnel-stage-bar">
                  <div>
                    <p class="funnel-stage-name">{{ stage.name }}</p>
                    <p class="funnel-stage-caption">{{ stage.caption }}</p>
                  </div>
                  <div class="funnel-stage-values">
                    <p class="funnel-stage-count">{{ stage.count }}</p>
                    <p class="funnel-stage-percentage">{{ stage.percentage }}</p>
                    <span v-if="stage.delta" class="funnel-stage-delta">{{ stage.delta }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
