<script setup lang="ts">
import { ref } from 'vue'

type TabId = 'general' | 'origins' | 'stages'
const activeTab = ref<TabId>('general')

const tabs = [
  { id: 'general' as TabId, label: 'Geral' },
  { id: 'origins' as TabId, label: 'Origens' },
  { id: 'stages' as TabId, label: 'Etapas' },
]

const generalSettings = ref({
  projectName: 'Adsmagic',
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
})

const origins = ref([
  { id: '1', name: 'Meta Ads', active: true },
  { id: '2', name: 'Google Ads', active: true },
  { id: '3', name: 'WhatsApp', active: true },
  { id: '4', name: 'TikTok Ads', active: false },
  { id: '5', name: 'Orgânico', active: true },
  { id: '6', name: 'Email', active: false },
  { id: '7', name: 'Indicação', active: true },
])

const stages = ref([
  { id: 'lead', name: 'Lead', color: '#94A3B8' },
  { id: 'qualification', name: 'Qualificação', color: '#3B82F6' },
  { id: 'proposal', name: 'Proposta', color: '#F59E0B' },
  { id: 'negotiation', name: 'Negociação', color: '#8B5CF6' },
  { id: 'closed_won', name: 'Fechado (Ganho)', color: '#10B981' },
  { id: 'closed_lost', name: 'Fechado (Perdido)', color: '#EF4444' },
])
</script>

<template>
  <div>
    <!-- Tabs -->
    <div class="flex gap-0 border-b border-gray-200 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === tab.id
          ? 'text-primary-600 border-primary-600'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab: Geral -->
    <div v-if="activeTab === 'general'" class="bg-white rounded-xl border border-gray-200 p-6 max-w-lg space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nome do Projeto</label>
        <input
          v-model="generalSettings.projectName"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Fuso Horário</label>
        <select
          v-model="generalSettings.timezone"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
          <option value="America/Manaus">America/Manaus (UTC-4)</option>
          <option value="America/Belem">America/Belem (UTC-3)</option>
          <option value="America/Fortaleza">America/Fortaleza (UTC-3)</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Moeda</label>
        <select
          v-model="generalSettings.currency"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="BRL">BRL — Real Brasileiro</option>
          <option value="USD">USD — Dólar Americano</option>
          <option value="EUR">EUR — Euro</option>
        </select>
      </div>
      <button class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
        Salvar (mockado)
      </button>
    </div>

    <!-- Tab: Origens -->
    <div v-if="activeTab === 'origins'" class="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">Origens de Leads</h3>
      <div class="divide-y divide-gray-100">
        <label
          v-for="origin in origins"
          :key="origin.id"
          class="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
        >
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-700">{{ origin.name }}</span>
            <span
              v-if="origin.active"
              class="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full"
            >Ativa</span>
          </div>
          <input type="checkbox" v-model="origin.active" class="w-4 h-4 accent-violet-600" />
        </label>
      </div>
    </div>

    <!-- Tab: Etapas -->
    <div v-if="activeTab === 'stages'" class="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
      <h3 class="text-sm font-semibold text-gray-700 mb-4">Etapas do Funil de Vendas</h3>
      <div class="divide-y divide-gray-100">
        <div
          v-for="(stage, idx) in stages"
          :key="stage.id"
          class="flex items-center gap-3 py-3"
        >
          <span class="text-xs text-gray-400 w-4">{{ idx + 1 }}</span>
          <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: stage.color }"></div>
          <span class="text-sm text-gray-700 flex-1">{{ stage.name }}</span>
          <input
            type="color"
            v-model="stage.color"
            class="w-8 h-7 cursor-pointer rounded border border-gray-200 p-0.5"
          />
        </div>
      </div>
    </div>
  </div>
</template>
