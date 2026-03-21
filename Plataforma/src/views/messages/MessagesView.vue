<script setup lang="ts">
import { ref } from 'vue'

const conversations = [
  { id: '1', name: 'Maria Silva', preview: 'Olá, gostaria de saber mais sobre os planos...', time: '10:32', unread: 2, origin: 'Meta Ads' },
  { id: '2', name: 'João Santos', preview: 'Qual o prazo para implementação?', time: '09:15', unread: 0, origin: 'Google Ads' },
  { id: '3', name: 'Pedro Alves', preview: 'Perfeito! Quando posso agendar a demo?', time: 'Ontem', unread: 0, origin: 'WhatsApp' },
  { id: '4', name: 'Carlos Pereira', preview: 'Obrigado pela proposta enviada', time: 'Ontem', unread: 0, origin: 'Orgânico' },
  { id: '5', name: 'Lucas Ferreira', preview: 'Vou analisar e retorno em breve', time: 'Seg', unread: 0, origin: 'Google Ads' },
]

const mockMessages = [
  { id: '1', from: 'contact', text: 'Olá! Vi o anúncio de vocês e gostaria de saber mais sobre o Adsmagic.', time: '10:28' },
  { id: '2', from: 'me', text: 'Olá Maria! Ficamos felizes com seu contato. O Adsmagic é uma plataforma de atribuição de marketing que centraliza todos os seus leads e mostra quais campanhas geram mais resultados.', time: '10:30' },
  { id: '3', from: 'contact', text: 'Interessante! Vocês têm integração com Meta Ads e Google Ads?', time: '10:31' },
  { id: '4', from: 'me', text: 'Sim! Temos integração nativa com Meta Ads, Google Ads e WhatsApp Business. Todos os leads em um só painel com rastreamento de UTM completo.', time: '10:31' },
  { id: '5', from: 'contact', text: 'Olá, gostaria de saber mais sobre os planos disponíveis.', time: '10:32' },
]

const selected = ref(conversations[0])
const newMessage = ref('')
</script>

<template>
  <div class="flex bg-white rounded-xl border border-gray-200 overflow-hidden" style="height: calc(100vh - 9rem)">
    <!-- Conversations list -->
    <div class="w-72 border-r border-gray-200 flex flex-col shrink-0">
      <div class="px-4 py-3 border-b border-gray-100">
        <input
          type="text"
          placeholder="Buscar conversa..."
          class="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="conv in conversations"
          :key="conv.id"
          @click="selected = conv"
          class="w-full px-4 py-3 text-left border-b border-gray-50 transition-colors hover:bg-gray-50"
          :class="{ 'bg-primary-50 border-l-2 border-l-primary-500': selected.id === conv.id }"
        >
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-sm font-medium text-gray-900">{{ conv.name }}</span>
            <span class="text-xs text-gray-400">{{ conv.time }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500 truncate mr-2">{{ conv.preview }}</span>
            <span
              v-if="conv.unread > 0"
              class="shrink-0 w-4 h-4 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center"
            >
              {{ conv.unread }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Chat area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Chat header -->
      <div class="px-5 py-3 border-b border-gray-200 flex items-center gap-3 shrink-0">
        <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
          {{ selected.name[0] }}
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-900">{{ selected.name }}</p>
          <p class="text-xs text-gray-400">via {{ selected.origin }}</p>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div
          v-for="msg in mockMessages"
          :key="msg.id"
          class="flex"
          :class="msg.from === 'me' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-xs lg:max-w-sm px-3 py-2 rounded-xl text-sm"
            :class="msg.from === 'me'
              ? 'bg-primary-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'"
          >
            {{ msg.text }}
            <p
              class="text-xs mt-1 opacity-60 text-right"
              :class="msg.from === 'me' ? 'text-white' : 'text-gray-500'"
            >
              {{ msg.time }}
            </p>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="p-3 border-t border-gray-200 flex gap-2 shrink-0">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Digite uma mensagem..."
          class="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          @keydown.enter="newMessage = ''"
        />
        <button
          @click="newMessage = ''"
          class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  </div>
</template>
