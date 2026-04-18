<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type TabId = 'general' | 'origins' | 'stages' | 'ai'
const activeTab = ref<TabId>('general')

const tabs = [
  { id: 'general' as TabId, label: 'Geral' },
  { id: 'origins' as TabId, label: 'Origens' },
  { id: 'stages' as TabId, label: 'Etapas' },
  { id: 'ai' as TabId, label: 'Assistente IA' },
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
  { id: 'negotiation', name: 'Negociação', color: '#6366f1' },
  { id: 'closed_won', name: 'Fechado (Ganho)', color: '#10B981' },
  { id: 'closed_lost', name: 'Fechado (Perdido)', color: '#EF4444' },
])

// --- IA Settings ---
type AuthMode = 'apikey' | 'oauth'
type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'github-copilot'
const aiAuthMode = ref<AuthMode>('apikey')
const aiProvider = ref<ProviderId>('openai')
const aiApiKey = ref('')
const aiApiKeyVisible = ref(false)
const aiConnected = ref(false)
const aiConnecting = ref(false)

const providers: Array<{ id: ProviderId; label: string; supportsOAuth: boolean; models: string[] }> = [
  {
    id: 'openai',
    label: 'OpenAI',
    supportsOAuth: false,
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    supportsOAuth: false,
    models: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-3-5'],
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    supportsOAuth: false,
    models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-pro'],
  },
  {
    id: 'github-copilot',
    label: 'GitHub Copilot',
    supportsOAuth: true,
    models: ['copilot-gpt-4o', 'copilot-claude-sonnet'],
  },
]

const activeProvider = computed(() => providers.find(p => p.id === aiProvider.value)!)
const aiModel = ref(providers[0].models[0])

watch(aiProvider, (newId) => {
  const p = providers.find(p => p.id === newId)!
  aiModel.value = p.models[0]
  if (p.supportsOAuth) aiAuthMode.value = 'oauth'
  else aiAuthMode.value = 'apikey'
  aiConnected.value = false
})

function mockConnect() {
  aiConnecting.value = true
  setTimeout(() => {
    aiConnecting.value = false
    aiConnected.value = true
  }, 1200)
}

function disconnect() {
  aiConnected.value = false
  aiApiKey.value = ''
}
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

    <!-- Tab: Assistente IA -->
    <div v-if="activeTab === 'ai'" class="max-w-lg space-y-4">

      <!-- Status banner -->
      <div
        class="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
        :class="aiConnected
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-gray-50 border-gray-200 text-gray-500'"
      >
        <span class="w-2 h-2 rounded-full shrink-0" :class="aiConnected ? 'bg-emerald-500' : 'bg-gray-300'"></span>
        {{ aiConnected ? 'Assistente conectado — ' + activeProvider.label + ' (' + aiModel + ')' : 'Nenhum provedor conectado' }}
        <button v-if="aiConnected" @click="disconnect" class="ml-auto text-xs text-red-500 hover:text-red-700 font-normal">Desconectar</button>
      </div>

      <!-- Provider -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Provedor</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="p in providers"
              :key="p.id"
              @click="aiProvider = p.id"
              class="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors"
              :class="aiProvider === p.id
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="aiProvider === p.id ? 'bg-violet-500' : 'bg-gray-300'"></span>
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Model -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Modelo</label>
          <select
            v-model="aiModel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          >
            <option v-for="m in activeProvider.models" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>

        <!-- Auth mode -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Autenticação</label>
          <div class="flex gap-2">
            <button
              @click="aiAuthMode = 'apikey'"
              :disabled="activeProvider.supportsOAuth && !activeProvider.models.length"
              class="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors"
              :class="aiAuthMode === 'apikey'
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              <span class="material-symbols-outlined text-base">key</span>
              Chave de API
            </button>
            <button
              v-if="activeProvider.supportsOAuth"
              @click="aiAuthMode = 'oauth'"
              class="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors"
              :class="aiAuthMode === 'oauth'
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              <span class="material-symbols-outlined text-base">passkey</span>
              OAuth
            </button>
            <div
              v-else
              class="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-base">passkey</span>
              OAuth (n/d)
            </div>
          </div>
        </div>

        <!-- API Key field -->
        <div v-if="aiAuthMode === 'apikey'">
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Chave de API</label>
          <div class="relative">
            <input
              v-model="aiApiKey"
              :type="aiApiKeyVisible ? 'text' : 'password'"
              placeholder="sk-..."
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              @click="aiApiKeyVisible = !aiApiKeyVisible"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span class="material-symbols-outlined text-base">
                {{ aiApiKeyVisible ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1.5">A chave é usada apenas neste dispositivo e não é enviada para servidores externos.</p>
        </div>

        <!-- OAuth flow -->
        <div v-if="aiAuthMode === 'oauth'" class="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
          <p class="mb-3">Autorize o Workspace a usar sua conta <strong>{{ activeProvider.label }}</strong> via OAuth. Nenhuma chave precisa ser informada manualmente.</p>
          <p class="text-xs text-gray-400">Funciona como o GitHub Copilot: você autoriza o acesso uma vez e o token é renovado automaticamente.</p>
        </div>

        <!-- Connect button -->
        <button
          @click="mockConnect"
          :disabled="aiConnecting || aiConnected || (aiAuthMode === 'apikey' && !aiApiKey)"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="aiConnected
            ? 'bg-gray-100 text-gray-400 cursor-default'
            : 'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed'"
        >
          <span v-if="aiConnecting" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
          <span v-else class="material-symbols-outlined text-base">{{ aiConnected ? 'check_circle' : aiAuthMode === 'oauth' ? 'passkey' : 'key' }}</span>
          {{ aiConnecting ? 'Conectando…' : aiConnected ? 'Conectado' : aiAuthMode === 'oauth' ? 'Autorizar via OAuth' : 'Conectar com chave' }}
        </button>
      </div>

      <p class="text-xs text-gray-400 px-1">Esta configuração habilita o Assistente IA na Wiki e em outros módulos do workspace. Requer <strong>PROTO-007</strong> para uso completo.</p>
    </div>
  </div>
</template>
