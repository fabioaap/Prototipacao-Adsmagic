<script setup lang="ts">
interface Campaign {
  id: string
  name: string
  platform: 'meta' | 'google'
  status: 'active' | 'paused' | 'ended'
  spend: number
  leads: number
  cpl: number
  startDate: string
}

const campaigns: Campaign[] = [
  { id: '1', name: 'Brand Awareness — Março', platform: 'meta', status: 'active', spend: 3200, leads: 142, cpl: 22.5, startDate: '2026-03-01' },
  { id: '2', name: 'Search Brand — Março', platform: 'google', status: 'active', spend: 2800, leads: 98, cpl: 28.6, startDate: '2026-03-01' },
  { id: '3', name: 'Retargeting 30% OFF', platform: 'meta', status: 'active', spend: 1500, leads: 67, cpl: 22.4, startDate: '2026-03-10' },
  { id: '4', name: 'Display Remarketing', platform: 'google', status: 'paused', spend: 900, leads: 34, cpl: 26.5, startDate: '2026-02-15' },
  { id: '5', name: 'Lookalike — Clientes', platform: 'meta', status: 'active', spend: 2100, leads: 89, cpl: 23.6, startDate: '2026-03-05' },
  { id: '6', name: 'Performance Max', platform: 'google', status: 'active', spend: 1800, leads: 71, cpl: 25.4, startDate: '2026-03-08' },
  { id: '7', name: 'Video Views — Brand', platform: 'meta', status: 'ended', spend: 800, leads: 23, cpl: 34.8, startDate: '2026-02-01' },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value)
}

const statusLabels: Record<string, string> = { active: 'Ativa', paused: 'Pausada', ended: 'Encerrada' }
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  ended: 'bg-gray-100 text-gray-500',
}

const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0)
const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0)
const avgCpl = totalSpend / totalLeads
</script>

<template>
  <div class="space-y-4">
    <!-- Summary -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 font-medium uppercase">Total Investido</p>
        <p class="mt-1 text-xl font-bold text-gray-900">{{ formatCurrency(totalSpend) }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 font-medium uppercase">Total de Leads</p>
        <p class="mt-1 text-xl font-bold text-gray-900">{{ totalLeads }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <p class="text-xs text-gray-500 font-medium uppercase">CPL Médio</p>
        <p class="mt-1 text-xl font-bold text-primary-600">{{ formatCurrency(avgCpl) }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700">Campanhas</h3>
        <span class="text-xs text-gray-400">{{ campaigns.length }} campanhas</span>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plataforma</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gastos</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CPL</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="c in campaigns" :key="c.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-900">{{ c.name }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                :class="c.platform === 'meta' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'"
              >
                {{ c.platform === 'meta' ? '📘 Meta Ads' : '🔴 Google Ads' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" :class="statusColors[c.status]">
                {{ statusLabels[c.status] }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-gray-700">{{ formatCurrency(c.spend) }}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-700">{{ c.leads }}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ formatCurrency(c.cpl) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
